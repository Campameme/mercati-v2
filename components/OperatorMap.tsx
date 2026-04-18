'use client'

import { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import OperatorCard from './OperatorCard'
import { Operator, OperatorCategory } from '@/types/operator'
import L from 'leaflet'
import Link from 'next/link'
import { useMarketSlug } from '@/lib/markets/useMarketSlug'

// Fix per i marker di Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Centro provincia di Imperia (fallback prima che arrivino le coord del mercato)
const defaultCenter: [number, number] = [43.9, 7.85]

// Applica reattivamente center + zoom (MapContainer legge i prop solo al mount)
function ApplyView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

interface OperatorMapProps {
  category: OperatorCategory | 'all'
  searchQuery: string
}

export default function OperatorMap({ category, searchQuery }: OperatorMapProps) {
  const marketSlug = useMarketSlug()
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null)
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [marketInfo, setMarketInfo] = useState<any>(null)
  const [center, setCenter] = useState<[number, number]>(defaultCenter)
  const [zoom, setZoom] = useState<number>(16)
  const [areaPositions, setAreaPositions] = useState<[number, number][] | null>(null)
  const [areaStyle, setAreaStyle] = useState<{ color: string; fillOpacity: number }>({ color: '#f97316', fillOpacity: 0.2 })

  useEffect(() => {
    if (!marketSlug) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/markets/by-slug/${encodeURIComponent(marketSlug)}`)
        if (!res.ok) return
        const { data } = await res.json()
        if (cancelled || !data) return
        if (data.market) {
          setCenter([data.market.center_lat, data.market.center_lng])
          setZoom(data.market.default_zoom_operators ?? data.market.default_zoom ?? 17)
        }
        const ring = data.area?.polygon_geojson?.geometry?.coordinates?.[0]
        if (Array.isArray(ring)) {
          setAreaPositions(ring.map((c: number[]) => [c[1], c[0]] as [number, number]))
          if (data.area?.style) {
            setAreaStyle({
              color: data.area.style.color ?? '#f97316',
              fillOpacity: data.area.style.fillOpacity ?? 0.2,
            })
          }
        } else {
          setAreaPositions(null)
        }
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [marketSlug])

  useEffect(() => {
    const loadOperators = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (category && category !== 'all') params.append('category', category)
        if (searchQuery) params.append('search', searchQuery)
        if (marketSlug) params.append('marketSlug', marketSlug)

        const response = await fetch(`/api/operators?${params.toString()}`)
        const result = await response.json()

        if (result.success && result.data) {
          setOperators(result.data)
          setMarketInfo(result.market)
        } else {
          setError('Errore nel caricamento degli operatori')
        }
      } catch (err) {
        console.error('Errore nel caricamento operatori:', err)
        setError('Errore nel caricamento degli operatori')
      } finally {
        setLoading(false)
      }
    }
    loadOperators()
  }, [category, searchQuery, marketSlug])

  const handleNavigate = useCallback((operator: Operator) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${operator.location.lat},${operator.location.lng}`
    window.open(url, '_blank')
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Caricamento operatori…</p>
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
    <div className="space-y-6">
      {/* Mappa con percorso evidenziato */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '600px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <ApplyView center={center} zoom={zoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {areaPositions && (
            <Polygon
              positions={areaPositions}
              pathOptions={{
                color: areaStyle.color,
                fillColor: areaStyle.color,
                fillOpacity: areaStyle.fillOpacity,
                weight: 2,
                opacity: 0.9,
              }}
            />
          )}
          {operators
            .filter((op) => op.location?.lat && op.location?.lng)
            .map((op) => (
              <Marker
                key={op.id}
                position={[op.location.lat, op.location.lng]}
                eventHandlers={{ click: () => setSelectedOperator(op) }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <div className="font-semibold text-gray-900">{op.name}</div>
                    {op.location.stallNumber && (
                      <div className="text-xs text-gray-500">Bancarella {op.location.stallNumber}</div>
                    )}
                    {marketSlug && (
                      <Link href={`/${marketSlug}/operators/${op.id}`} className="text-xs text-primary-600 hover:underline block mt-1">
                        Vedi dettagli →
                      </Link>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      {/* Lista operatori */}
      {(() => {
        const filteredOperators = operators.filter((op) => {
          if (category && category !== 'all' && op.category !== category) return false
          if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
              op.name.toLowerCase().includes(query) ||
              op.description.toLowerCase().includes(query) ||
              op.location.stallNumber.toLowerCase().includes(query)
            )
          }
          return true
        })

        return filteredOperators.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🏪 Operatori del Mercato ({filteredOperators.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOperators.map((operator) => (
                <div
                  key={operator.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <Link href={marketSlug ? `/${marketSlug}/operators/${operator.id}` : '#'} className="block">
                    <div className="font-semibold text-gray-900 hover:text-primary-600">{operator.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{operator.description}</div>
                    {operator.location?.stallNumber && (
                      <div className="text-xs text-gray-500 mt-2">Bancarella {operator.location.stallNumber}</div>
                    )}
                  </Link>
                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <button
                      onClick={() => setSelectedOperator(operator)}
                      className="text-gray-600 hover:text-gray-800 font-medium"
                    >Mostra sulla mappa</button>
                    <button
                      onClick={() => handleNavigate(operator)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >📍 Indicazioni</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      })()}

      {/* Card operatore selezionato */}
      {selectedOperator && (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:w-96 z-[1000]">
          <OperatorCard operator={selectedOperator} onNavigate={handleNavigate} />
          <button
            onClick={() => setSelectedOperator(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
