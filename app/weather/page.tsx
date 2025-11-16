'use client'

import { useState, useEffect } from 'react'
import { Cloud, Droplet, Wind, Sun, AlertTriangle } from 'lucide-react'
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

  useEffect(() => {
    // Mock data - in produzione verrà da API meteo
    const mockWeather: WeatherData = {
      current: {
        temperature: 15,
        condition: 'Parzialmente nuvoloso',
        icon: 'partly-cloudy',
        humidity: 65,
        windSpeed: 12,
      },
      hourly: Array.from({ length: 24 }, (_, i) => ({
        time: new Date(Date.now() + i * 60 * 60 * 1000),
        temperature: 12 + Math.random() * 8,
        condition: i < 6 ? 'Sereno' : i < 12 ? 'Nuvoloso' : 'Pioggia leggera',
        icon: i < 6 ? 'sunny' : i < 12 ? 'cloudy' : 'rainy',
        precipitation: i < 12 ? 0 : Math.random() * 5,
      })),
      daily: Array.from({ length: 3 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        maxTemp: 18 + Math.random() * 5,
        minTemp: 8 + Math.random() * 5,
        condition: i === 0 ? 'Vento forte' : i === 1 ? 'Pioggia' : 'Sereno',
        icon: i === 0 ? 'windy' : i === 1 ? 'rainy' : 'sunny',
        precipitation: i === 1 ? 15 : 0,
      })),
      alerts: [
        {
          type: 'wind',
          severity: 'severe',
          message: 'Vento forte previsto mercoledì 24 gennaio con raffiche fino a 60 km/h',
        },
      ],
    }

    setTimeout(() => {
      setWeather(mockWeather)
      setLoading(false)
    }, 500)

    // Invia notifiche per alert critici
    if (permission === 'granted' && mockWeather.alerts.length > 0) {
      mockWeather.alerts.forEach((alert) => {
        if (alert.severity === 'severe') {
          sendNotification('Allerta Meteo', alert.message)
        }
      })
    }
  }, [sendNotification, permission])

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meteo</h1>
        <p className="text-gray-600">
          Previsioni meteo 24 ore e 3 giorni con alert per condizioni critiche
        </p>
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

