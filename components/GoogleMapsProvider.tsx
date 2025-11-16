'use client'

import { useJsApiLoader } from '@react-google-maps/api'
import { ReactNode } from 'react'

// Costante fuori dal componente per evitare ricaricamenti
const GOOGLE_MAPS_LIBRARIES: ('marker')[] = ['marker']

interface GoogleMapsProviderProps {
  children: ReactNode
}

export default function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  // Mostra un messaggio se la chiave non è configurata
  if (!apiKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
        <p className="text-yellow-800 font-semibold mb-2">
          ⚠️ Chiave API Google Maps non configurata
        </p>
        <p className="text-yellow-700 text-sm mb-2">
          Aggiungi NEXT_PUBLIC_GOOGLE_MAPS_API_KEY al file .env.local e riavvia il server di sviluppo.
        </p>
        <p className="text-yellow-600 text-xs">
          Comando: Riavvia con <code className="bg-yellow-100 px-1 rounded">npm run dev</code>
        </p>
      </div>
    )
  }

  // Mostra un loading se Google Maps non è ancora caricato
  if (!isLoaded) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Caricamento Google Maps...</p>
      </div>
    )
  }

  return <>{children}</>
}

