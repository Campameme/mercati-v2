'use client'

import { useState, useEffect } from 'react'
import ParkingCard from './ParkingCard'
import { Parking } from '@/types/parking'
import { useMarketSlug } from '@/lib/markets/useMarketSlug'
import { matchesFilter, type ParkingFilter } from './ParkingFilters'

interface ParkingListProps {
  onSelectParking: (id: string | null) => void
  filter: ParkingFilter
  coordsOverride?: { lat: number; lng: number; city?: string }
}

export default function ParkingList({
  onSelectParking,
  filter,
  coordsOverride,
}: ParkingListProps) {
  const autoSlug = useMarketSlug()
  const marketSlug = coordsOverride ? undefined : autoSlug
  const [parkings, setParkings] = useState<Parking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadParkings = async () => {
      try {
        setLoading(true)
        let qs = ''
        if (coordsOverride) {
          const p = new URLSearchParams()
          p.set('lat', String(coordsOverride.lat))
          p.set('lng', String(coordsOverride.lng))
          if (coordsOverride.city) p.set('city', coordsOverride.city)
          qs = `?${p.toString()}`
        } else if (marketSlug) {
          qs = `?marketSlug=${encodeURIComponent(marketSlug)}`
        }
        const response = await fetch(`/api/parking${qs}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setParkings(result.data)
        } else {
          setError('Errore nel caricamento dei parcheggi')
        }
      } catch (err) {
        console.error('Errore nel caricamento parcheggi:', err)
        setError('Errore nel caricamento dei parcheggi')
      } finally {
        setLoading(false)
      }
    }

    loadParkings()
  }, [marketSlug, coordsOverride?.lat, coordsOverride?.lng, coordsOverride?.city])

  const filteredParkings = parkings.filter((p) => matchesFilter(p, filter))

  const handleNavigate = (parking: Parking) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${parking.location.lat},${parking.location.lng}`
    window.open(url, '_blank')
  }

  const handleSelectParking = (parkingId: string | null) => {
    onSelectParking(parkingId)
    // Sincronizza con la mappa se la funzione è disponibile
    if (typeof window !== 'undefined' && (window as any).selectParkingOnMap) {
      (window as any).selectParkingOnMap(parkingId)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Caricamento parcheggi…</p>
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
    <div className="h-full overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Parcheggi ({filteredParkings.length})
      </h2>

      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {filteredParkings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nessun parcheggio trovato</p>
          </div>
        ) : (
          filteredParkings.map((parking) => (
            <ParkingCard
              key={parking.id}
              parking={parking}
              onNavigate={handleNavigate}
              onSelect={() => handleSelectParking(parking.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

