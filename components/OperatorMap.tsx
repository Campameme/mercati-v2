'use client'

import { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import OperatorCard from './OperatorCard'
import { Operator, OperatorCategory } from '@/types/operator'
import L from 'leaflet'

// Fix per i marker di Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Centro area mercato venerdì Ventimiglia
const defaultCenter: [number, number] = [43.7885, 7.6060]

interface OperatorMapProps {
  category: OperatorCategory | 'all'
  searchQuery: string
}

// Componente per centrare la mappa quando cambia il centro
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export default function OperatorMap({ category, searchQuery }: OperatorMapProps) {
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null)
  const [center, setCenter] = useState<[number, number]>(defaultCenter)
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [marketInfo, setMarketInfo] = useState<any>(null)

  // Carica operatori da API
  useEffect(() => {
    const loadOperators = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (category && category !== 'all') {
          params.append('category', category)
        }
        if (searchQuery) {
          params.append('search', searchQuery)
        }
        
        const response = await fetch(`/api/operators?${params.toString()}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setOperators(result.data)
          setMarketInfo(result.location)
          // Imposta il centro dell'area mercato
          if (result.location?.center) {
            setCenter([result.location.center.lat, result.location.center.lng])
          }
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
  }, [category, searchQuery])

  const handleMarkerClick = useCallback((operator: Operator) => {
    setSelectedOperator(operator)
  }, [])

  const handleNavigate = useCallback((operator: Operator) => {
    const url = `https://www.openstreetmap.org/directions?to=${operator.location.lat},${operator.location.lng}`
    window.open(url, '_blank')
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Caricamento operatori mercato venerdì Ventimiglia...</p>
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
      {marketInfo && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold text-gray-900 mb-1">{marketInfo.name}</h3>
          <p className="text-sm text-gray-600">{marketInfo.address}</p>
          <p className="text-xs text-gray-500 mt-1">Mercato del Venerdì</p>
        </div>
      )}
      
      <MapContainer
        center={center}
        zoom={16}
        style={{ height: '600px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapCenter center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {operators.map((operator) => {
          // Marker personalizzato con stile in linea con il design (amber/orange)
          const customIcon = L.divIcon({
            className: 'custom-operator-marker',
            html: `<div style="
              background: #f59e0b;
              border: 3px solid white;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            ">🏪</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })

          return (
            <Marker
              key={operator.id}
              position={[operator.location.lat, operator.location.lng]}
              icon={customIcon}
              eventHandlers={{
                click: () => handleMarkerClick(operator),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{operator.name}</div>
                  <div className="text-gray-600">Bancarella {operator.location.stallNumber}</div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {selectedOperator && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-[1000]">
          <OperatorCard operator={selectedOperator} onNavigate={handleNavigate} />
        </div>
      )}
    </div>
  )
}
