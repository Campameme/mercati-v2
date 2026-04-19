'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Locate, MapPin } from 'lucide-react'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false })

interface Props {
  center: [number, number]
  zoom?: number
  lat: number | null
  lng: number | null
  onChange: (lat: number | null, lng: number | null) => void
  areaPositions?: [number, number][] | null
  /** Se true mostra anche la mappa cliccabile (drag marker). Default true. */
  showPicker?: boolean
  label?: string
  helperText?: string
}

/**
 * Campi coordinate riutilizzabili: due input numerici + pulsante "Sono qui" che usa
 * la Geolocation API del browser + LocationPicker Leaflet cliccabile/trascinabile.
 */
export default function LocationFields({
  center,
  zoom = 17,
  lat,
  lng,
  onChange,
  areaPositions,
  showPicker = true,
  label = 'Posizione sulla mappa',
  helperText = 'Clicca sulla mappa, trascina il marker o usa “Sono qui”.',
}: Props) {
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function useCurrentLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocalizzazione non disponibile su questo browser.')
      return
    }
    setLocating(true); setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude)
        setLocating(false)
      },
      (err) => {
        setError(err.code === err.PERMISSION_DENIED
          ? 'Permesso di geolocalizzazione negato.'
          : 'Impossibile ottenere la posizione.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-cream-100 rounded-full text-xs hover:bg-ink/90 disabled:opacity-50 transition-colors"
        >
          <Locate className="w-3.5 h-3.5" />
          {locating ? 'Cerco…' : 'Sono qui'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs text-gray-500">Latitudine</span>
          <input
            type="number"
            step="0.000001"
            value={lat ?? ''}
            onChange={(e) => {
              const v = e.target.value
              onChange(v === '' ? null : parseFloat(v), lng)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md tabular-nums text-sm"
            placeholder="43.7903"
          />
        </label>
        <label className="block">
          <span className="text-xs text-gray-500">Longitudine</span>
          <input
            type="number"
            step="0.000001"
            value={lng ?? ''}
            onChange={(e) => {
              const v = e.target.value
              onChange(lat, v === '' ? null : parseFloat(v))
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md tabular-nums text-sm"
            placeholder="7.6084"
          />
        </label>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {helperText && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {helperText}</p>}

      {showPicker && (
        <LocationPicker
          center={center}
          zoom={zoom}
          value={lat != null && lng != null ? [lat, lng] : null}
          onChange={([la, ln]) => onChange(la, ln)}
          areaPositions={areaPositions ?? undefined}
        />
      )}
    </div>
  )
}
