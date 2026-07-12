'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Sun, Cloud, CloudRain, X } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale/it'
import { useMarketSlug } from '@/lib/markets/useMarketSlug'

interface WeatherData {
  current: {
    temperature: number
    condition: string
    icon: string
    humidity: number
    windSpeed: number
  }
  hourly: Array<{
    time: Date
    temperature: number
    condition: string
    icon: string
    precipitation: number
  }>
  daily: Array<{
    date: Date
    maxTemp: number
    minTemp: number
    condition: string
    icon: string
    precipitation: number
  }>
  alerts: Array<{
    type: 'wind' | 'rain' | 'storm'
    severity: 'moderate' | 'severe'
    message: string
  }>
}

// Mappa condizioni meteo a icone
const getWeatherIcon = (condition: string, icon: string) => {
  const cond = condition.toLowerCase()
  const iconType = icon.toLowerCase()

  if (cond.includes('pioggia') || cond.includes('rain') || iconType.includes('rain')) {
    return <CloudRain className="w-6 h-6 text-alga-600" />
  }
  if (cond.includes('nuvoloso') || cond.includes('cloudy') || iconType.includes('cloud')) {
    if (cond.includes('parzialmente') || iconType.includes('partly')) {
      return <Cloud className="w-6 h-6 text-ink-muted" />
    }
    return <Cloud className="w-6 h-6 text-ink-muted" />
  }
  if (cond.includes('sereno') || cond.includes('clear') || cond.includes('sunny') || iconType.includes('sun')) {
    return <Sun className="w-6 h-6 text-terracotta" />
  }
  // Default: parzialmente nuvoloso
  return <Cloud className="w-6 h-6 text-ink-muted" />
}

export default function WeatherWidget() {
  const marketSlug = useMarketSlug()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [location, setLocation] = useState<string>('')
  const [owmName, setOwmName] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [source, setSource] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try { if (localStorage.getItem('imk:weatherDismissed') === '1') setDismissed(true) } catch {}
  }, [])
  const dismiss = () => {
    setDismissed(true)
    setShowModal(false)
    try { localStorage.setItem('imk:weatherDismissed', '1') } catch {}
  }
  const forecastUrl = coords
    ? `https://open-meteo.com/en/forecast?latitude=${coords.lat}&longitude=${coords.lng}`
    : `https://www.ilmeteo.it/meteo/${encodeURIComponent(owmName || location || 'Imperia')}`

  useEffect(() => {
    loadWeather()
    const interval = setInterval(loadWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketSlug])

  const loadWeather = async () => {
    try {
      setLoading(true)
      const qs = marketSlug ? `?marketSlug=${encodeURIComponent(marketSlug)}` : ''
      const response = await fetch(`/api/weather${qs}`)
      const result = await response.json()

      if (result.success && result.data) {
        // Converti le date da stringhe ISO a oggetti Date
        const weatherData: WeatherData = {
          ...result.data,
          hourly: result.data.hourly.map((h: any) => ({
            ...h,
            time: new Date(h.time),
          })),
          daily: result.data.daily.map((d: any) => ({
            ...d,
            date: new Date(d.date),
          })),
        }

        setWeather(weatherData)
        if (result.location) setLocation(result.location)
        setOwmName(result.owmName ?? null)
        setCoords(result.coords ?? null)
        setSource(result.source ?? '')
      } else {
        throw new Error('Errore nel caricamento dati meteo')
      }
    } catch (error) {
      console.error('Errore nel caricamento meteo:', error)
    } finally {
      setLoading(false)
    }
  }

  // Icona più piccola per il widget
  const getWidgetIcon = (condition: string, icon: string) => {
    const cond = condition.toLowerCase()
    const iconType = icon.toLowerCase()

    if (cond.includes('pioggia') || cond.includes('rain') || iconType.includes('rain')) {
      return <CloudRain className="w-5 h-5 text-alga-600" />
    }
    if (cond.includes('nuvoloso') || cond.includes('cloudy') || iconType.includes('cloud')) {
      if (cond.includes('parzialmente') || iconType.includes('partly')) {
        return <Cloud className="w-5 h-5 text-ink-muted" />
      }
      return <Cloud className="w-5 h-5 text-ink-muted" />
    }
    if (cond.includes('sereno') || cond.includes('clear') || cond.includes('sunny') || iconType.includes('sun')) {
      return <Sun className="w-5 h-5 text-terracotta" />
    }
    return <Cloud className="w-5 h-5 text-ink-muted" />
  }

  if (dismissed) return null

  if (loading || !weather) {
    return (
      <div className="flex items-center gap-1 rounded-full border-2 border-ink/10 bg-white pl-2.5 pr-1 py-1">
        <Cloud className="w-4 h-4 text-ink-muted animate-pulse" />
        <span className="text-xs text-ink-muted tabular-nums">--°</span>
        <button onClick={dismiss} aria-label="Nascondi meteo" className="grid place-items-center w-5 h-5 rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Widget Icona */}
      <div className="flex items-center gap-0.5 rounded-full border-2 border-ink/10 bg-white pr-1">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full hover:bg-crema-2/50 transition-colors"
          title={`Meteo ${owmName || location || 'Mercato'} — previsioni indicative`}
        >
          {getWidgetIcon(weather.current.condition, weather.current.icon)}
          <span className="text-sm font-semibold text-ink tabular-nums">
            {Math.round(weather.current.temperature)}°
          </span>
        </button>
        <button onClick={dismiss} aria-label="Nascondi meteo" className="grid place-items-center w-6 h-6 rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal Dettagli Meteo — via PORTAL su document.body: dentro la nav il
          backdrop-blur crea un containing block e il fixed verrebbe ritagliato
          all'altezza della barra (il "popup tagliato"). */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto overscroll-contain imk-scroll" data-lenis-prevent>
            {/* Header */}
            <div className="bg-gradient-to-r from-alga to-alga-600 text-white p-6 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Meteo {owmName || location || 'Mercato'}</h2>
                  {owmName && location && owmName.toLowerCase() !== location.toLowerCase() && (
                    <p className="text-crema-2 text-xs">(area {location})</p>
                  )}
                  {coords && (
                    <p className="text-crema-2 text-xs">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}{source.startsWith('mock') ? ' · dati demo' : ''}</p>
                  )}
                  <p className="text-crema-2 text-sm">
                    Previsioni indicative. Verifica quelle effettive su{' '}
                    <a href={forecastUrl} target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-white">
                      open-meteo ↗
                    </a>
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Condizioni Attuali */}
              <div className="bg-gradient-to-br from-crema-2/50 to-crema-2 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-4 mb-2">
                      {getWeatherIcon(weather.current.condition, weather.current.icon)}
                      <div>
                        <div className="text-5xl font-bold text-ink">
                          {Math.round(weather.current.temperature)}°
                        </div>
                        <div className="text-lg text-ink-soft">{weather.current.condition}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-ink-muted mt-4">
                      <div className="flex items-center space-x-1">
                        <CloudRain className="w-4 h-4" />
                        <span>Umidità: {weather.current.humidity}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Sun className="w-4 h-4" />
                        <span>Vento: {weather.current.windSpeed} km/h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Previsioni 24h */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-ink mb-4">Previsioni 24 Ore</h3>
                <div className="overflow-x-auto">
                  <div className="flex space-x-4 pb-2">
                    {weather.hourly.slice(0, 12).map((hour, index) => (
                      <div key={index} className="flex-shrink-0 text-center bg-crema-2/40 rounded-lg p-3 min-w-[80px]">
                        <div className="text-xs text-ink-muted mb-2">
                          {format(hour.time, 'HH:mm')}
                        </div>
                        <div className="flex justify-center mb-2">
                          {getWeatherIcon(hour.condition, hour.icon)}
                        </div>
                        <div className="text-lg font-semibold text-ink mb-1">
                          {Math.round(hour.temperature)}°
                        </div>
                        {hour.precipitation > 0 && (
                          <div className="text-xs text-alga-600">
                            {hour.precipitation.toFixed(1)}mm
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Previsioni 3 giorni */}
              <div>
                <h3 className="text-xl font-semibold text-ink mb-4">Previsioni 3 Giorni</h3>
                <div className="space-y-3">
                  {weather.daily.map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-crema-2/40 rounded-lg hover:bg-crema-2/60 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-32">
                          <div className="font-semibold text-ink">
                            {index === 0 ? 'Oggi' : format(day.date, 'EEEE', { locale: it })}
                          </div>
                          <div className="text-sm text-ink-muted">
                            {format(day.date, 'dd MMMM', { locale: it })}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getWeatherIcon(day.condition, day.icon)}
                          <div className="text-ink-soft">{day.condition}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {day.precipitation > 0 && (
                          <div className="text-sm text-alga-600 flex items-center space-x-1">
                            <CloudRain className="w-4 h-4" />
                            <span>{day.precipitation}mm</span>
                          </div>
                        )}
                        <div className="text-right">
                          <div className="font-semibold text-ink">{Math.round(day.maxTemp)}°</div>
                          <div className="text-sm text-ink-muted">{Math.round(day.minTemp)}°</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

