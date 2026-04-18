import { NextRequest, NextResponse } from 'next/server'
import { resolveMarketFromRequest } from '@/lib/markets/resolve'

export const dynamic = 'force-dynamic'

// Mapping WMO weather codes → local condition label + icon.
// https://open-meteo.com/en/docs (section "Weather variable documentation")
function mapWmoCode(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Sereno', icon: 'sunny' }
  if (code === 1) return { condition: 'Prevalentemente sereno', icon: 'sunny' }
  if (code === 2) return { condition: 'Parzialmente nuvoloso', icon: 'partly-cloudy' }
  if (code === 3) return { condition: 'Nuvoloso', icon: 'cloudy' }
  if (code === 45 || code === 48) return { condition: 'Nebbia', icon: 'cloudy' }
  if (code >= 51 && code <= 57) return { condition: 'Pioggia leggera', icon: 'rainy' }
  if (code >= 61 && code <= 65) return { condition: 'Pioggia', icon: 'rainy' }
  if (code >= 66 && code <= 67) return { condition: 'Pioggia gelata', icon: 'rainy' }
  if (code >= 71 && code <= 77) return { condition: 'Neve', icon: 'cloudy' }
  if (code >= 80 && code <= 82) return { condition: 'Rovesci', icon: 'rainy' }
  if (code >= 85 && code <= 86) return { condition: 'Neve a rovesci', icon: 'cloudy' }
  if (code >= 95 && code <= 99) return { condition: 'Temporale', icon: 'rainy' }
  return { condition: 'Parzialmente nuvoloso', icon: 'partly-cloudy' }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const resolved = await resolveMarketFromRequest(searchParams)
  if (resolved.kind === 'not_found') {
    return NextResponse.json({ success: false, error: 'Mercato non trovato' }, { status: 404 })
  }
  const lat = resolved.kind === 'market' ? resolved.market.center_lat : resolved.lat
  const lng = resolved.kind === 'market' ? resolved.market.center_lng : resolved.lng
  const location = resolved.kind === 'market' ? resolved.market.city : resolved.city
  const coords = { lat, lng }

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.set('latitude', lat.toString())
    url.searchParams.set('longitude', lng.toString())
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code')
    url.searchParams.set('hourly', 'temperature_2m,weather_code,precipitation')
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum')
    url.searchParams.set('timezone', 'Europe/Rome')
    url.searchParams.set('forecast_days', '3')

    const res = await fetch(url.toString(), { next: { revalidate: 300 } })
    if (!res.ok) throw new Error('Open-Meteo error')
    const d = await res.json()
    if (!d.current) throw new Error('Dati current mancanti')

    const cur = mapWmoCode(d.current.weather_code)

    // Hourly: solo le prossime 12 ore dall'ora corrente
    const nowTs = Date.now()
    const hourly: any[] = []
    const hTimes: string[] = d.hourly?.time ?? []
    const hTemps: number[] = d.hourly?.temperature_2m ?? []
    const hCodes: number[] = d.hourly?.weather_code ?? []
    const hPrec: number[] = d.hourly?.precipitation ?? []
    for (let i = 0; i < hTimes.length && hourly.length < 12; i++) {
      const ts = new Date(hTimes[i]).getTime()
      if (ts < nowTs - 3600_000) continue
      const m = mapWmoCode(hCodes[i])
      hourly.push({
        time: new Date(hTimes[i]).toISOString(),
        temperature: Math.round(hTemps[i] * 10) / 10,
        condition: m.condition,
        icon: m.icon,
        precipitation: hPrec[i] ?? 0,
      })
    }

    const daily = (d.daily?.time ?? []).slice(0, 3).map((t: string, i: number) => {
      const m = mapWmoCode(d.daily.weather_code[i])
      return {
        date: new Date(t).toISOString(),
        maxTemp: Math.round(d.daily.temperature_2m_max[i] * 10) / 10,
        minTemp: Math.round(d.daily.temperature_2m_min[i] * 10) / 10,
        condition: m.condition,
        icon: m.icon,
        precipitation: Math.round((d.daily.precipitation_sum[i] ?? 0) * 10) / 10,
      }
    })

    const temp = Math.round(d.current.temperature_2m * 10) / 10
    const alerts: any[] = []
    if (temp < 5) alerts.push({ type: 'wind', severity: 'severe', message: `Temperature molto basse: ${Math.round(temp)}°C.` })
    else if (temp > 30) alerts.push({ type: 'storm', severity: 'severe', message: `Temperature molto alte: ${Math.round(temp)}°C.` })

    return NextResponse.json({
      success: true,
      location,
      owmName: location,
      coords,
      source: 'open-meteo',
      lastUpdated: new Date().toISOString(),
      data: {
        current: {
          temperature: temp,
          condition: cur.condition,
          icon: cur.icon,
          humidity: Math.round(d.current.relative_humidity_2m ?? 0),
          windSpeed: Math.round(d.current.wind_speed_10m ?? 0),
        },
        hourly,
        daily,
        alerts,
      },
    })
  } catch (err) {
    console.warn('Open-Meteo failed:', err)
    return NextResponse.json({
      success: false,
      error: 'Errore caricamento meteo',
      details: err instanceof Error ? err.message : 'unknown',
      coords,
    }, { status: 502 })
  }
}
