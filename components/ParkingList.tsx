'use client'

import { useState, useEffect } from 'react'
import ParkingCard from './ParkingCard'
import { Parking } from '@/types/parking'
import { Filter } from 'lucide-react'

interface ParkingListProps {
  onSelectParking: (id: string | null) => void
}

export default function ParkingList({
  onSelectParking,
}: ParkingListProps) {
  const [filter, setFilter] = useState<'all' | 'municipal' | 'private' | 'free'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [parkings, setParkings] = useState<Parking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carica parcheggi da API (OpenStreetMap)
  useEffect(() => {
    const loadParkings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/parking')
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
  }, [])

  const filteredParkings = parkings.filter((p) => {
    if (filter === 'all') return true
    if (filter === 'free') return !p.paid
    return p.type === filter
  })

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
        <p className="mt-4 text-gray-600">Caricamento parcheggi di Ventimiglia...</p>
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
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Parcheggi ({filteredParkings.length})
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 w-full"
        >
          <Filter className="w-4 h-4" />
          <span>Filtri</span>
        </button>
      </div>

      {showFilters && (
        <div className="mb-4 bg-white p-3 rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-2">
            {(['all', 'municipal', 'private', 'free'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Tutti' : f === 'municipal' ? 'Comunali' : f === 'private' ? 'Privati' : 'Gratuiti'}
              </button>
            ))}
          </div>
        </div>
      )}

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

