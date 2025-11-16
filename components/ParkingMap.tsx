'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import ParkingCard from './ParkingCard'
import { Parking } from '@/types/parking'

// Rimuoviamo le zone inventate - useremo solo i parcheggi reali

const mapContainerStyle = {
  width: '100%',
  height: '600px',
}

const defaultCenter = {
  lat: 43.7885,
  lng: 7.6060,
}

interface ParkingMapProps {
  onSelectParking: (id: string | null) => void
}

export default function ParkingMap({ onSelectParking }: ParkingMapProps) {
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null)
  const [selectedParkingId, setSelectedParkingId] = useState<string | null>(null)
  const [center, setCenter] = useState(defaultCenter)
  const [parkings, setParkings] = useState<Parking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('satellite')
  const mapRef = useRef<google.maps.Map | null>(null)

  // Carica parcheggi
  useEffect(() => {
    const loadParkings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/parking')
        const result = await response.json()
        
        if (result.success && result.data && Array.isArray(result.data)) {
          // Mostra tutti i parcheggi senza deduplicazione eccessiva
          // La deduplicazione è già fatta nel backend
          const validParkings = result.data.filter((p: Parking) => 
            p.location && p.location.lat && p.location.lng && 
            !isNaN(p.location.lat) && !isNaN(p.location.lng)
          )
          console.log(`ParkingMap: ${validParkings.length} parcheggi validi caricati`)
          setParkings(validParkings)
          
          // Centra mappa sulla media delle posizioni
          if (validParkings.length > 0) {
            const lats = validParkings.map((p: Parking) => p.location?.lat).filter((lat: any) => lat && !isNaN(lat))
            const lngs = validParkings.map((p: Parking) => p.location?.lng).filter((lng: any) => lng && !isNaN(lng))
            
            if (lats.length > 0 && lngs.length > 0) {
              setCenter({
                lat: lats.reduce((a: number, b: number) => a + b, 0) / lats.length,
                lng: lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length,
              })
            } else {
              setCenter(defaultCenter)
            }
          } else {
            setCenter(defaultCenter)
          }
        } else {
          setError('Errore nel caricamento dei parcheggi')
        }
      } catch (err) {
        setError('Errore nel caricamento dei parcheggi')
      } finally {
        setLoading(false)
      }
    }

    loadParkings()
  }, [])

  // Sincronizza selezione dalla lista
  useEffect(() => {
    if (selectedParkingId && parkings.length > 0) {
      const parking = parkings.find(p => p.id === selectedParkingId)
      if (parking) {
        setSelectedParking(parking)
        setCenter(parking.location)
      }
    } else {
      setSelectedParking(null)
    }
  }, [selectedParkingId, parkings])

  // Espone funzione globale per selezione
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).selectParkingOnMap = (parkingId: string | null) => {
        setSelectedParkingId(parkingId)
        onSelectParking(parkingId)
      }
    }
  }, [onSelectParking])

  const handleParkingClick = useCallback((parking: Parking) => {
    setSelectedParking(parking)
    setSelectedParkingId(parking.id)
    onSelectParking(parking.id)
  }, [onSelectParking])

  const handleNavigate = useCallback((parking: Parking) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${parking.location.lat},${parking.location.lng}`
    window.open(url, '_blank')
  }, [])

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const toggleMapType = useCallback(() => {
    setMapType((prev) => prev === 'satellite' ? 'roadmap' : 'satellite')
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Caricamento parcheggi...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-semibold mb-2">⚠️ Errore</p>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Controllo tipo mappa */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleMapType}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-sm font-medium transition-colors"
        >
          {mapType === 'satellite' ? '🛰️ Satellite' : '🛣️ Stradale'}
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        onLoad={handleMapLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          mapTypeId: mapType,
          // Stile custom per roadmap
          styles: mapType === 'roadmap' ? [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#e0f2fe' }],
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f9fafb' }],
            },
          ] : undefined,
        }}
      >
        {parkings
          .filter((parking) => {
            return parking.location && parking.location.lat && parking.location.lng && 
                   !isNaN(parking.location.lat) && !isNaN(parking.location.lng)
          })
          .map((parking) => {
          const position = { lat: parking.location.lat, lng: parking.location.lng }
          const isPaid = parking.paid
          const nearRiver = parking.nearRiver || false
          
          // Colore marker basato su tipo: blu per a pagamento, verde per gratuito, rosso/amber per altri
          let markerColor: string
          if (nearRiver) {
            markerColor = '#3b82f6' // Blu per parcheggi vicini al fiume Roja
          } else {
            markerColor = isPaid ? '#ef4444' : '#f59e0b' // Rosso o Amber
          }
          const borderColor = '#ffffff'
          const borderWidth = nearRiver ? 3 : 2

          // Crea icona SVG personalizzata con "P" di parcheggio
          const svgIcon = {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="${nearRiver ? '15' : '14'}" fill="${markerColor}" stroke="${borderColor}" stroke-width="${borderWidth}"/>
                <text x="18" y="24" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">P</text>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(nearRiver ? 36 : 32, nearRiver ? 36 : 32),
            anchor: new google.maps.Point(nearRiver ? 18 : 16, nearRiver ? 18 : 16),
          }

          return (
            <Marker
              key={`parking-marker-${parking.id}`}
              position={position}
              onClick={() => handleParkingClick(parking)}
              icon={svgIcon}
            >
              {selectedParking?.id === parking.id && (
                <InfoWindow onCloseClick={() => setSelectedParking(null)}>
                  <div className="text-sm">
                    <div className="font-semibold">{parking.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {nearRiver && <span className="text-blue-600 font-medium">🌊 Vicino al fiume Roja</span>}
                      {nearRiver && (isPaid !== undefined) && <span className="mx-1">•</span>}
                      {isPaid !== undefined && (isPaid ? '💰 A pagamento' : '🆓 Gratuito')}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          )
        })}
        
      </GoogleMap>

      {selectedParking && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-[1000]">
          <ParkingCard parking={selectedParking} onNavigate={handleNavigate} />
        </div>
      )}
    </div>
  )
}
