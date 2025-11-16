'use client'

import { useState, useEffect } from 'react'
import { Sun, Cloud, CloudRain, X } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale/it'

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
    return <CloudRain className="w-6 h-6 text-blue-600" />
  }
  if (cond.includes('nuvoloso') || cond.includes('cloudy') || iconType.includes('cloud')) {
    if (cond.includes('parzialmente') || iconType.includes('partly')) {
      return <Cloud className="w-6 h-6 text-gray-500" />
    }
    return <Cloud className="w-6 h-6 text-gray-600" />
  }
  if (cond.includes('sereno') || cond.includes('clear') || cond.includes('sunny') || iconType.includes('sun')) {
    return <Sun className="w-6 h-6 text-yellow-500" />
  }
  // Default: parzialmente nuvoloso
  return <Cloud className="w-6 h-6 text-gray-500" />
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadWeather()
    // Aggiorna ogni 30 minuti
    const interval = setInterval(loadWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadWeather = async () => {
    try {
      setLoading(true)
      
      // Chiama API meteo
      const response = await fetch('/api/weather')
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
      return <CloudRain className="w-5 h-5 text-blue-600" />
    }
    if (cond.includes('nuvoloso') || cond.includes('cloudy') || iconType.includes('cloud')) {
      if (cond.includes('parzialmente') || iconType.includes('partly')) {
        return <Cloud className="w-5 h-5 text-gray-500" />
      }
      return <Cloud className="w-5 h-5 text-gray-600" />
    }
    if (cond.includes('sereno') || cond.includes('clear') || cond.includes('sunny') || iconType.includes('sun')) {
      return <Sun className="w-5 h-5 text-yellow-500" />
    }
    return <Cloud className="w-5 h-5 text-gray-500" />
  }

  if (loading || !weather) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
        <Cloud className="w-5 h-5 text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-600">--°</span>
      </div>
    )
  }

  return (
    <>
      {/* Widget Icona */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
        title={`Meteo Ventimiglia: ${weather.current.temperature}° - ${weather.current.condition}`}
      >
        {getWidgetIcon(weather.current.condition, weather.current.icon)}
        <span className="text-sm font-semibold text-gray-900">
          {Math.round(weather.current.temperature)}°
        </span>
      </button>

      {/* Modal Dettagli Meteo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Meteo Ventimiglia</h2>
                  <p className="text-blue-100">Previsioni aggiornate in tempo reale</p>
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
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-4 mb-2">
                      {getWeatherIcon(weather.current.condition, weather.current.icon)}
                      <div>
                        <div className="text-5xl font-bold text-gray-900">
                          {Math.round(weather.current.temperature)}°
                        </div>
                        <div className="text-lg text-gray-700">{weather.current.condition}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mt-4">
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Previsioni 24 Ore</h3>
                <div className="overflow-x-auto">
                  <div className="flex space-x-4 pb-2">
                    {weather.hourly.slice(0, 12).map((hour, index) => (
                      <div key={index} className="flex-shrink-0 text-center bg-gray-50 rounded-lg p-3 min-w-[80px]">
                        <div className="text-xs text-gray-600 mb-2">
                          {format(hour.time, 'HH:mm')}
                        </div>
                        <div className="flex justify-center mb-2">
                          {getWeatherIcon(hour.condition, hour.icon)}
                        </div>
                        <div className="text-lg font-semibold text-gray-900 mb-1">
                          {Math.round(hour.temperature)}°
                        </div>
                        {hour.precipitation > 0 && (
                          <div className="text-xs text-blue-600">
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Previsioni 3 Giorni</h3>
                <div className="space-y-3">
                  {weather.daily.map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-32">
                          <div className="font-semibold text-gray-900">
                            {index === 0 ? 'Oggi' : format(day.date, 'EEEE', { locale: it })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {format(day.date, 'dd MMMM', { locale: it })}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getWeatherIcon(day.condition, day.icon)}
                          <div className="text-gray-700">{day.condition}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {day.precipitation > 0 && (
                          <div className="text-sm text-blue-600 flex items-center space-x-1">
                            <CloudRain className="w-4 h-4" />
                            <span>{day.precipitation}mm</span>
                          </div>
                        )}
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{Math.round(day.maxTemp)}°</div>
                          <div className="text-sm text-gray-600">{Math.round(day.minTemp)}°</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

