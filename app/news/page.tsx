'use client'

import { useState, useEffect } from 'react'
import { Newspaper, Calendar, AlertCircle, Bell, BellOff } from 'lucide-react'
import { useNotifications } from '@/components/NotificationProvider'
import { format } from 'date-fns'
import { it } from 'date-fns/locale/it'

interface NewsItem {
  id: string
  title: string
  content: string
  date: Date
  type: 'schedule' | 'notice' | 'event' | 'emergency'
  priority: 'low' | 'medium' | 'high'
}

export default function NewsPage() {
  const { requestPermission, sendNotification, permission } = useNotifications()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  // Mock data - in produzione verrà da API
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Cambio orario mercato domenicale',
      content: 'A partire da domenica prossima, il mercato aprirà alle 7:00 invece delle 8:00. La chiusura rimane invariata alle 14:00.',
      date: new Date('2024-01-15'),
      type: 'schedule',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Evento speciale: Mercato del Gusto',
      content: 'Sabato 20 gennaio, dalle 10:00 alle 18:00, si terrà il Mercato del Gusto con degustazioni e prodotti locali.',
      date: new Date('2024-01-18'),
      type: 'event',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Avviso: Lavori in corso',
      content: 'Si informa che dal 22 al 25 gennaio saranno effettuati lavori di manutenzione nell\'area nord del mercato. Alcune bancarelle saranno temporaneamente spostate.',
      date: new Date('2024-01-20'),
      type: 'notice',
      priority: 'medium',
    },
    {
      id: '4',
      title: 'Allerta meteo: Vento forte previsto',
      content: 'Mercoledì 24 gennaio è previsto vento forte. Si consiglia agli operatori di assicurare le proprie bancarelle.',
      date: new Date('2024-01-22'),
      type: 'emergency',
      priority: 'high',
    },
  ]

  useEffect(() => {
    if (permission === 'granted' && notificationsEnabled) {
      // Simula invio notifiche per news importanti
      const highPriorityNews = newsItems.filter(
        (item) => item.priority === 'high' && item.type === 'emergency'
      )
      highPriorityNews.forEach((item) => {
        sendNotification(item.title, item.content)
      })
    }
  }, [notificationsEnabled, permission, newsItems, sendNotification])

  const handleToggleNotifications = async () => {
    if (permission !== 'granted') {
      await requestPermission()
    }
    setNotificationsEnabled(!notificationsEnabled)
  }

  const getTypeIcon = (type: NewsItem['type']) => {
    switch (type) {
      case 'schedule':
        return <Calendar className="w-5 h-5" />
      case 'event':
        return <Newspaper className="w-5 h-5" />
      case 'emergency':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Newspaper className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: NewsItem['type']) => {
    switch (type) {
      case 'schedule':
        return 'bg-blue-100 text-blue-800'
      case 'event':
        return 'bg-green-100 text-green-800'
      case 'emergency':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: NewsItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500'
      case 'medium':
        return 'border-l-4 border-yellow-500'
      default:
        return 'border-l-4 border-gray-300'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notizie</h1>
          <p className="text-gray-600">
            Avvisi comunali, eventi speciali e comunicazioni ufficiali
          </p>
        </div>

        <button
          onClick={handleToggleNotifications}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            notificationsEnabled && permission === 'granted'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {notificationsEnabled && permission === 'granted' ? (
            <Bell className="w-5 h-5" />
          ) : (
            <BellOff className="w-5 h-5" />
          )}
          <span className="hidden md:inline">
            {notificationsEnabled && permission === 'granted'
              ? 'Notifiche attive'
              : 'Attiva notifiche'}
          </span>
        </button>
      </div>

      <div className="space-y-4">
        {newsItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-lg shadow-md p-6 ${getPriorityColor(item.priority)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getTypeColor(item.type)}`}>
                  {getTypeIcon(item.type)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{item.title}</h2>
                  <p className="text-sm text-gray-500">
                    {format(item.date, 'dd MMMM yyyy', { locale: it })}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(item.type)}`}
              >
                {item.type === 'schedule'
                  ? 'Orari'
                  : item.type === 'event'
                  ? 'Evento'
                  : item.type === 'emergency'
                  ? 'Emergenza'
                  : 'Avviso'}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

