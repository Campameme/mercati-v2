'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface NotificationContextType {
  requestPermission: () => Promise<void>
  sendNotification: (title: string, body: string, options?: NotificationOptions) => void
  permission: NotificationPermission
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export default function NotificationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const result = await Notification.requestPermission()
      setPermission(result)
    }
  }

  const sendNotification = (title: string, body: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options,
      })
    }
  }

  return (
    <NotificationContext.Provider value={{ requestPermission, sendNotification, permission }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

