import { NextRequest, NextResponse } from 'next/server'

// Forza rendering dinamico
export const dynamic = 'force-dynamic'

// Coordinate Ventimiglia
const VENTIMIGLIA_LAT = 43.7885
const VENTIMIGLIA_LNG = 7.6060

/**
 * GET - Ottiene dati meteo reali da OpenWeatherMap
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY
    
    if (!apiKey) {
      // Se non c'è API key, restituisci dati mock variabili
      const baseTemp = 12 + Math.random() * 8
      const hour = new Date().getHours()
      const isDaytime = hour >= 6 && hour < 20
      
      return NextResponse.json({
        success: true,
        data: {
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
              time: hourTime.toISOString(),
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
              date: dayDate.toISOString(),
              maxTemp: Math.round(maxTemp * 10) / 10,
              minTemp: Math.round(minTemp * 10) / 10,
              condition: i === 0 ? 'Vento forte' : i === 1 ? 'Pioggia' : 'Sereno',
              icon: i === 0 ? 'windy' : i === 1 ? 'rainy' : 'sunny',
              precipitation: i === 1 ? Math.round(15 + Math.random() * 10) : 0,
            }
          }),
          alerts: [],
        },
        source: 'mock',
      })
    }

    // Chiama OpenWeatherMap API
    try {
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${VENTIMIGLIA_LAT}&lon=${VENTIMIGLIA_LNG}&appid=${apiKey}&units=metric&lang=it`
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${VENTIMIGLIA_LAT}&lon=${VENTIMIGLIA_LNG}&appid=${apiKey}&units=metric&lang=it`

      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(currentWeatherUrl),
        fetch(forecastUrl),
      ])

      if (!currentResponse.ok || !forecastResponse.ok) {
        // Se l'API fallisce, usa dati mock
        console.warn('OpenWeatherMap API non disponibile, uso dati mock')
        throw new Error('API non disponibile')
      }

      const currentData = await currentResponse.json()
      const forecastData = await forecastResponse.json()

      // Verifica che i dati siano validi
      if (!currentData || !currentData.weather || !currentData.weather[0] || !forecastData || !forecastData.list) {
        throw new Error('Dati API non validi')
      }

    // Mappa condizioni OpenWeatherMap a condizioni locali
    const mapWeatherCondition = (weatherMain: string, weatherDescription: string): { condition: string; icon: string } => {
      const desc = weatherDescription.toLowerCase()
      if (desc.includes('pioggia') || desc.includes('rain') || weatherMain === 'Rain') {
        return { condition: 'Pioggia', icon: 'rainy' }
      }
      if (desc.includes('nuvoloso') || desc.includes('cloud') || weatherMain === 'Clouds') {
        if (desc.includes('poco') || desc.includes('few') || desc.includes('scattered')) {
          return { condition: 'Parzialmente nuvoloso', icon: 'partly-cloudy' }
        }
        return { condition: 'Nuvoloso', icon: 'cloudy' }
      }
      if (desc.includes('sereno') || desc.includes('clear') || weatherMain === 'Clear') {
        return { condition: 'Sereno', icon: 'sunny' }
      }
      if (desc.includes('vento') || desc.includes('wind') || weatherMain === 'Wind') {
        return { condition: 'Vento forte', icon: 'windy' }
      }
      return { condition: 'Parzialmente nuvoloso', icon: 'partly-cloudy' }
    }

    const currentCondition = mapWeatherCondition(currentData.weather[0].main, currentData.weather[0].description)

    // Prepara dati orari (prossime 24 ore)
    const hourly = forecastData.list.slice(0, 8).map((item: any) => {
      const condition = mapWeatherCondition(item.weather[0].main, item.weather[0].description)
      return {
        time: new Date(item.dt * 1000).toISOString(),
        temperature: Math.round(item.main.temp * 10) / 10,
        condition: condition.condition,
        icon: condition.icon,
        precipitation: item.rain?.['3h'] || 0,
      }
    })

    // Prepara dati giornalieri (prossimi 3 giorni)
    const daily = forecastData.list
      .filter((item: any, index: number) => index % 8 === 0) // Un dato ogni 24h (ogni 8 previsioni da 3h)
      .slice(0, 3)
      .map((item: any) => {
        const condition = mapWeatherCondition(item.weather[0].main, item.weather[0].description)
        return {
          date: new Date(item.dt * 1000).toISOString(),
          maxTemp: Math.round(item.main.temp_max * 10) / 10,
          minTemp: Math.round(item.main.temp_min * 10) / 10,
          condition: condition.condition,
          icon: condition.icon,
          precipitation: item.rain?.['3h'] || 0,
        }
      })

    // Genera alert se necessario
    const alerts: any[] = []
    if (currentData.main.temp < 5) {
      alerts.push({
        type: 'wind',
        severity: 'severe',
        message: `Temperature molto basse previste: ${Math.round(currentData.main.temp)}°C. Si consiglia di coprire le bancarelle.`,
      })
    } else if (currentData.main.temp > 30) {
      alerts.push({
        type: 'storm',
        severity: 'severe',
        message: `Temperature molto alte previste: ${Math.round(currentData.main.temp)}°C. Si consiglia di idratarsi e cercare ombra.`,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        current: {
          temperature: Math.round(currentData.main.temp * 10) / 10,
          condition: currentCondition.condition,
          icon: currentCondition.icon,
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6), // Converti m/s a km/h
        },
        hourly,
        daily,
        alerts,
      },
      source: 'openweathermap',
      lastUpdated: new Date().toISOString(),
    })
    } catch (apiError) {
      // Se l'API fallisce, restituisci dati mock invece di errore
      console.warn('Errore chiamata OpenWeatherMap, uso dati mock:', apiError)
      const baseTemp = 12 + Math.random() * 8
      const hour = new Date().getHours()
      const isDaytime = hour >= 6 && hour < 20
      
      return NextResponse.json({
        success: true,
        data: {
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
              time: hourTime.toISOString(),
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
              date: dayDate.toISOString(),
              maxTemp: Math.round(maxTemp * 10) / 10,
              minTemp: Math.round(minTemp * 10) / 10,
              condition: i === 0 ? 'Vento forte' : i === 1 ? 'Pioggia' : 'Sereno',
              icon: i === 0 ? 'windy' : i === 1 ? 'rainy' : 'sunny',
              precipitation: i === 1 ? Math.round(15 + Math.random() * 10) : 0,
            }
          }),
          alerts: [],
        },
        source: 'mock-fallback',
        lastUpdated: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('Errore nel caricamento meteo:', error)
    // In caso di errore generale, restituisci sempre dati mock invece di errore 500
    const baseTemp = 12 + Math.random() * 8
    const hour = new Date().getHours()
    const isDaytime = hour >= 6 && hour < 20
    
    return NextResponse.json({
      success: true,
      data: {
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
            time: hourTime.toISOString(),
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
            date: dayDate.toISOString(),
            maxTemp: Math.round(maxTemp * 10) / 10,
            minTemp: Math.round(minTemp * 10) / 10,
            condition: i === 0 ? 'Vento forte' : i === 1 ? 'Pioggia' : 'Sereno',
            icon: i === 0 ? 'windy' : i === 1 ? 'rainy' : 'sunny',
            precipitation: i === 1 ? Math.round(15 + Math.random() * 10) : 0,
          }
        }),
        alerts: [],
      },
      source: 'mock-error',
      lastUpdated: new Date().toISOString(),
    })
  }
}

