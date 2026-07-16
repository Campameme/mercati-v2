'use client'

import Navigation from '@/components/Navigation'
import NotificationProvider from '@/components/NotificationProvider'
import WeatherWidget from '@/components/WeatherWidget'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <NotificationProvider>
      <Navigation />
      {children}
      {/* Il meteo vive in basso a sinistra, su tutte le pagine */}
      <WeatherWidget />
    </NotificationProvider>
  )
}

