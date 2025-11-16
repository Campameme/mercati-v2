'use client'

import { useState, useEffect } from 'react'
import { Cloud, Droplet, Wind, Sun, AlertTriangle, RefreshCw } from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'
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

export default function WeatherPage() {
  const { sendNotification, permission } = useNotifications()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadWeather = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      } else {
        setIsRefreshing(true)
      }

      // Simula variazione dei dati meteo (in produzione verrà da API meteo)
      const baseTemp = 12 + Math.random() * 8
      const hour = new Date().getHours()
      const isDaytime = hour >= 6 && hour < 20
      
      const mockWeather: WeatherData = {
        current: {
          temperature: Math.round(baseTemp * 10) / 10,
          condition: isDaytime 
            ? (baseTemp > 18 ? 'Sereno' : baseTemp > 15 ? 'Parzialmente nuvoloso' : 'Nuvoloso')
            : 'Sereno',
          icon: isDaytime 
            ? (baseTemp > 18 ? 'sunny' : baseTemp > 15 ? 'partly-cloudy' : 'cloudy')
            : 'clear-night',
          humidity: Math.round(50 + Math.random() * 30),
          windSpeed: Math.round(5 + Math.random() * 20),
        },
        hourly: Array.from({ length: 24 }, (_, i) => {
          const hourTime = new Date(Date.now() + i * 60 * 60 * 1000)
          const hourOfDay = hourTime.getHours()
          const isDay = hourOfDay >= 6 && hourOfDay < 20
          const temp = isDay 
            ? (12 + Math.random() * 8 + (hourOfDay >= 12 && hourOfDay < 16 ? 3 : 0))
            : (10 + Math.random() * 4)
          
          return {
            time: hourTime,
            temperature: Math.round(temp * 10) / 10,
            condition: isDay 
              ? (temp > 18 ? 'Sereno' : temp > 15 ? 'Nuvoloso' : 'Pioggia leggera')
              : 'Sereno',
            icon: isDay 
              ? (temp > 18 ? 'sunny' : temp > 15 ? 'cloudy' : 'rainy')
              : 'clear-night',
            precipitation: i >= 12 && i < 18 ? Math.random() * 5 : 0,
          }
        }),
        daily: Array.from({ length: 3 }, (_, i) => {
          const dayDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000)
          const maxTemp = 15 + Math.random() * 8
          const minTemp = maxTemp - 5 - Math.random() * 3
          
          return {
            date: dayDate,
            maxTemp: Math.round(maxTemp * 10) / 10,
            minTemp: Math.round(minTemp * 10) / 10,
            condition: i === 0 ? 'Vento forte' : i === 1 ? 'Pioggia' : 'Sereno',
            icon: i === 0 ? 'windy' : i === 1 ? 'rainy' : 'sunny',
            precipitation: i === 1 ? Math.round(15 + Math.random() * 10) : 0,
          }
        }),
        alerts: baseTemp < 5 || baseTemp > 30 ? [
          {
            type: baseTemp < 5 ? 'wind' : 'storm',
            severity: 'severe',
            message: baseTemp < 5 
              ? `Temperature molto basse previste: ${Math.round(baseTemp)}°C. Si consiglia di coprire le bancarelle.`
              : `Temperature molto alte previste: ${Math.round(baseTemp)}°C. Si consiglia di idratarsi e cercare ombra.`,
          },
        ] : [],
      }

      setTimeout(() => {
        setWeather(mockWeather)
        setLastUpdate(new Date())
        setLoading(false)
        setIsRefreshing(false)
      }, 300)

      // Invia notifiche per alert critici
      if (permission === 'granted' && mockWeather.alerts.length > 0) {
        mockWeather.alerts.forEach((alert) => {
          if (alert.severity === 'severe') {
            sendNotification('Allerta Meteo', alert.message)
          }
        })
      }
    } catch (error) {
      console.error('Errore nel caricamento meteo:', error)
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadWeather()
    // Aggiorna ogni 30 minuti
    const interval = setInterval(() => loadWeather(false), 30 * 60 * 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Caricamento dati meteo...</div>
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Errore nel caricamento dei dati meteo</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meteo</h1>
          <p className="text-gray-600">
            Previsioni meteo 24 ore e 3 giorni con alert per condizioni critiche
          </p>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-1">
              Ultimo aggiornamento: {format(lastUpdate, 'HH:mm:ss', { locale: it })}
            </p>
          )}
        </div>
        <button
          onClick={() => loadWeather(false)}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Aggiornamento...' : 'Aggiorna'}</span>
        </button>
      </div>

      {/* Alert critici */}
      {weather.alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {weather.alerts.map((alert, index) => (
            <div
              key={index}
              className={`bg-${
                alert.severity === 'severe' ? 'red' : 'yellow'
              }-50 border border-${
                alert.severity === 'severe' ? 'red' : 'yellow'
              }-200 rounded-lg p-4 flex items-start space-x-3`}
            >
              <AlertTriangle
                className={`w-6 h-6 text-${
                  alert.severity === 'severe' ? 'red' : 'yellow'
                }-600 flex-shrink-0 mt-0.5`}
              />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Allerta {alert.type === 'wind' ? 'Vento' : alert.type === 'rain' ? 'Pioggia' : 'Temporale'}
                </h3>
                <p className="text-gray-700">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Condizioni attuali */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Condizioni Attuali</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {weather.current.temperature}°
            </div>
            <div className="text-gray-600">{weather.current.condition}</div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <Droplet className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">{weather.current.humidity}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">{weather.current.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Previsioni 24h */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Previsioni 24 Ore</h2>
        <div className="overflow-x-auto">
          <div className="flex space-x-4">
            {weather.hourly.slice(0, 12).map((hour, index) => (
              <div key={index} className="flex-shrink-0 text-center">
                <div className="text-sm text-gray-600 mb-2">
                  {format(hour.time, 'HH:mm')}
                </div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">
                  {Math.round(hour.temperature)}°
                </div>
                {hour.precipitation > 0 && (
                  <div className="text-xs text-blue-600">{hour.precipitation.toFixed(1)}mm</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Previsioni 3 giorni */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Previsioni 3 Giorni</h2>
        <div className="space-y-4">
          {weather.daily.map((day, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-24">
                  <div className="font-semibold text-gray-900">
                    {index === 0 ? 'Oggi' : format(day.date, 'EEEE', { locale: it })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {format(day.date, 'dd MMMM', { locale: it })}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {day.icon === 'sunny' && <Sun className="w-8 h-8 text-yellow-500" />}
                  {day.icon === 'cloudy' && <Cloud className="w-8 h-8 text-gray-500" />}
                  {day.icon === 'rainy' && <Droplet className="w-8 h-8 text-blue-500" />}
                  {day.icon === 'windy' && <Wind className="w-8 h-8 text-gray-600" />}
                </div>
                <div className="text-gray-700">{day.condition}</div>
              </div>
              <div className="flex items-center space-x-4">
                {day.precipitation > 0 && (
                  <div className="text-sm text-blue-600">
                    <Droplet className="w-4 h-4 inline mr-1" />
                    {day.precipitation}mm
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
  )
}

