'use client'

import { useState, useEffect, useMemo } from 'react'
import { Cloud, Droplet, Wind, Sun, AlertTriangle, RefreshCw, MapPin } from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'
import { format } from 'date-fns'
import { it } from 'date-fns/locale/it'
import { useParams } from 'next/navigation'

interface WeatherData {
  current: { temperature: number; condition: string; icon: string; humidity: number; windSpeed: number }
  hourly: Array<{ time: Date; temperature: number; condition: string; icon: string; precipitation: number }>
  daily: Array<{ date: Date; maxTemp: number; minTemp: number; condition: string; icon: string; precipitation: number }>
  alerts: Array<{ type: 'wind' | 'rain' | 'storm'; severity: 'moderate' | 'severe'; message: string }>
}

interface ComuneOption {
  comune: string
  lat: number
  lng: number
}

export default function WeatherPage() {
  const params = useParams<{ marketSlug: string }>()
  const marketSlug = params?.marketSlug
  const { sendNotification, permission } = useNotifications()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [comuni, setComuni] = useState<ComuneOption[]>([])
  const [selectedComune, setSelectedComune] = useState<string>('')
  const [marketName, setMarketName] = useState<string>('')

  // Carica i comuni della zona (con lat/lng)
  useEffect(() => {
    if (!marketSlug) return
    ;(async () => {
      const res = await fetch(`/api/schedules/list?marketSlug=${encodeURIComponent(marketSlug)}`)
      const j = await res.json()
      const sessions = (j.data ?? []) as Array<{ comune: string; lat: number | null; lng: number | null; marketName: string | null }>
      if (sessions[0]?.marketName) setMarketName(sessions[0].marketName)
      const map = new Map<string, ComuneOption>()
      for (const s of sessions) {
        if (!s.lat || !s.lng) continue
        if (!map.has(s.comune)) map.set(s.comune, { comune: s.comune, lat: s.lat, lng: s.lng })
      }
      const list = Array.from(map.values()).sort((a, b) => a.comune.localeCompare(b.comune, 'it'))
      setComuni(list)
      if (list[0]) setSelectedComune(list[0].comune)
    })()
  }, [marketSlug])

  const currentComune = useMemo(
    () => comuni.find((c) => c.comune === selectedComune) ?? null,
    [comuni, selectedComune],
  )

  async function loadWeather(showLoading = true) {
    if (!currentComune && !marketSlug) return
    try {
      if (showLoading) setLoading(true)
      else setIsRefreshing(true)

      const qs = currentComune
        ? `?lat=${currentComune.lat}&lng=${currentComune.lng}&city=${encodeURIComponent(currentComune.comune)}`
        : `?marketSlug=${encodeURIComponent(marketSlug ?? '')}`
      const response = await fetch(`/api/weather${qs}`)
      const result = await response.json()

      if (result.success && result.data) {
        const weatherData: WeatherData = {
          ...result.data,
          hourly: result.data.hourly.map((h: any) => ({ ...h, time: new Date(h.time) })),
          daily: result.data.daily.map((d: any) => ({ ...d, date: new Date(d.date) })),
        }
        setWeather(weatherData)
        setLastUpdate(new Date())

        if (permission === 'granted' && weatherData.alerts.length > 0) {
          weatherData.alerts.forEach((alert) => {
            if (alert.severity === 'severe') sendNotification('Allerta Meteo', alert.message)
          })
        }
      }
    } catch (e) {
      console.error('Errore meteo:', e)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (!currentComune) return
    loadWeather()
    const interval = setInterval(() => loadWeather(false), 30 * 60 * 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentComune?.comune])

  if (loading && !weather) {
    return <div className="container mx-auto px-4 py-8 text-ink-muted">Caricamento meteo…</div>
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-1">{marketName || 'Meteo'}</p>
          <h1 className="font-serif text-3xl md:text-4xl text-ink">Meteo per {selectedComune || 'comune'}</h1>
          {lastUpdate && (
            <p className="text-xs text-ink-muted mt-1">
              Aggiornato alle {format(lastUpdate, 'HH:mm', { locale: it })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {comuni.length > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-olive-500" />
              <select
                value={selectedComune}
                onChange={(e) => setSelectedComune(e.target.value)}
                className="px-3 py-2 border border-cream-300 rounded-sm bg-cream-50 text-sm focus:outline-none focus:border-olive-500"
              >
                {comuni.map((c) => (
                  <option key={c.comune} value={c.comune}>{c.comune}</option>
                ))}
              </select>
            </label>
          )}
          <button
            onClick={() => loadWeather(false)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-2 bg-ink text-cream-100 rounded-full text-xs hover:bg-ink/90 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Aggiornamento…' : 'Aggiorna'}</span>
          </button>
        </div>
      </div>

      {!weather ? (
        <p className="text-ink-muted">Dati meteo non disponibili.</p>
      ) : (
        <>
          {weather.alerts.length > 0 && (
            <div className="mb-6 space-y-3">
              {weather.alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`border rounded-sm p-4 flex items-start gap-3 ${
                    alert.severity === 'severe'
                      ? 'bg-terra-100/40 border-terra-500/40'
                      : 'bg-cream-50 border-cream-300'
                  }`}
                >
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alert.severity === 'severe' ? 'text-terra-600' : 'text-olive-600'}`} />
                  <div>
                    <h3 className="font-medium text-ink mb-0.5">
                      Allerta {alert.type === 'wind' ? 'Vento' : alert.type === 'rain' ? 'Pioggia' : 'Temporale'}
                    </h3>
                    <p className="text-sm text-ink-soft">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-cream-50 border border-cream-300 rounded-sm p-6 mb-6">
            <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-2">Adesso</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <div className="font-serif text-5xl text-ink tabular-nums">{weather.current.temperature}°</div>
                <div className="text-sm text-ink-soft mt-1">{weather.current.condition}</div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-ink-soft">
                <div className="flex items-center gap-2"><Droplet className="w-4 h-4 text-sea-500" /> {weather.current.humidity}%</div>
                <div className="flex items-center gap-2"><Wind className="w-4 h-4 text-ink-muted" /> {weather.current.windSpeed} km/h</div>
              </div>
            </div>
          </div>

          <div className="bg-cream-50 border border-cream-300 rounded-sm p-6 mb-6">
            <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-3">Prossime ore</p>
            <div className="overflow-x-auto">
              <div className="flex gap-5 min-w-fit">
                {weather.hourly.slice(0, 12).map((h, i) => (
                  <div key={i} className="flex-shrink-0 text-center">
                    <div className="text-xs text-ink-muted mb-1">{format(h.time, 'HH:mm')}</div>
                    <div className="font-serif text-xl text-ink tabular-nums">{Math.round(h.temperature)}°</div>
                    {h.precipitation > 0 && <div className="text-[10px] text-sea-600 mt-0.5">{h.precipitation.toFixed(1)}mm</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-cream-50 border border-cream-300 rounded-sm p-6">
            <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-3">Prossimi giorni</p>
            <div className="space-y-2">
              {weather.daily.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-cream-300 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-24">
                      <div className="text-sm text-ink">{i === 0 ? 'Oggi' : format(d.date, 'EEEE', { locale: it })}</div>
                      <div className="text-xs text-ink-muted">{format(d.date, 'dd MMMM', { locale: it })}</div>
                    </div>
                    {d.icon === 'sunny' && <Sun className="w-5 h-5 text-amber-500" />}
                    {d.icon === 'cloudy' && <Cloud className="w-5 h-5 text-ink-muted" />}
                    {d.icon === 'rainy' && <Droplet className="w-5 h-5 text-sea-500" />}
                    {d.icon === 'windy' && <Wind className="w-5 h-5 text-ink-muted" />}
                    <div className="text-sm text-ink-soft">{d.condition}</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm tabular-nums">
                    {d.precipitation > 0 && <span className="text-sea-600">{d.precipitation}mm</span>}
                    <span className="font-medium text-ink">{Math.round(d.maxTemp)}°</span>
                    <span className="text-ink-muted">{Math.round(d.minTemp)}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
