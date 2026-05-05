'use client'

import Navigation from '@/components/Navigation'
import NotificationProvider from '@/components/NotificationProvider'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <NotificationProvider>
      <Navigation />
      {children}
    </NotificationProvider>
  )
}

