'use client'

import { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Polygon } from 'react-leaflet'
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
// Il mercato si svolge lungo il LUNGOMARE: Passeggiata Oberdan, Passeggiata Cavallotti, Via Milite Ignoto
// Queste strade costeggiano il mare, quindi sono più a sud rispetto al centro città
const defaultCenter: [number, number] = [43.7885, 7.6065]

// Percorso del mercato del venerdì lungo il LUNGOMARE
// Il mercato si estende lungo Passeggiata Oberdan, Passeggiata Cavallotti e Via Milite Ignoto
// Queste strade corrono parallele al mare, da ovest a est
// Coordinate basate sul lungomare di Ventimiglia (più vicino al mare, lat ~43.788)
const marketPath: [number, number][] = [
  [43.7880, 7.6040], // Inizio - Passeggiata Oberdan (ovest, vicino al porto)
  [43.7882, 7.6045], // Passeggiata Oberdan
  [43.7884, 7.6050], // Passeggiata Oberdan
  [43.7885, 7.6055], // Passeggiata Oberdan / Passeggiata Cavallotti (centro)
  [43.7886, 7.6060], // Passeggiata Cavallotti
  [43.7887, 7.6065], // Passeggiata Cavallotti
  [43.7888, 7.6070], // Passeggiata Cavallotti / Via Milite Ignoto
  [43.7889, 7.6075], // Via Milite Ignoto
  [43.7890, 7.6080], // Via Milite Ignoto
  [43.7891, 7.6085], // Fine - Via Milite Ignoto (est)
]

// Mercato coperto Ventimiglia - forma rettangolare corretta
// Piazza della Libertà, 18039 Ventimiglia
// Il mercato coperto si trova nel centro città, non sul lungomare
// Coordinate centro: 43.7912, 7.6080 (Piazza della Libertà)
// Forma rettangolare dell'edificio (circa 50m x 30m)
const coveredMarketArea: [number, number][] = [
  [43.7910, 7.6078], // Nord-ovest
  [43.7914, 7.6082], // Nord-est
  [43.7913, 7.6085], // Sud-est
  [43.7909, 7.6081], // Sud-ovest
]

/**
 * Distribuisce gli operatori lungo il percorso del mercato
 */
function distributeOperatorsAlongPath(operators: Operator[], path: [number, number][]): Operator[] {
  if (operators.length === 0 || path.length < 2) return operators
  
  // Calcola la lunghezza totale del percorso
  const pathLength = path.reduce((total, point, index) => {
    if (index === 0) return 0
    const prevPoint = path[index - 1]
    const dx = point[1] - prevPoint[1]
    const dy = point[0] - prevPoint[0]
    return total + Math.sqrt(dx * dx + dy * dy)
  }, 0)
  
  // Distribuisci gli operatori lungo il percorso
  return operators.map((operator, index) => {
    // Posizione lungo il percorso (0 = inizio, 1 = fine)
    const position = operators.length > 1 ? index / (operators.length - 1) : 0.5
    
    // Trova il punto corrispondente lungo il percorso
    let accumulatedLength = 0
    let targetLength = position * pathLength
    
    for (let i = 1; i < path.length; i++) {
      const prevPoint = path[i - 1]
      const currentPoint = path[i]
      const dx = currentPoint[1] - prevPoint[1]
      const dy = currentPoint[0] - prevPoint[0]
      const segmentLength = Math.sqrt(dx * dx + dy * dy)
      
      if (accumulatedLength + segmentLength >= targetLength) {
        // Interpola tra i due punti
        const t = (targetLength - accumulatedLength) / segmentLength
        const lat = prevPoint[0] + dy * t
        const lng = prevPoint[1] + dx * t
        
        return {
          ...operator,
          location: {
            ...operator.location,
            lat,
            lng,
          },
        }
      }
      
      accumulatedLength += segmentLength
    }
    
    // Se non trovato, usa l'ultimo punto
    const lastPoint = path[path.length - 1]
    return {
      ...operator,
      location: {
        ...operator.location,
        lat: lastPoint[0],
        lng: lastPoint[1],
      },
    }
  })
}


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
          // Distribuisci gli operatori lungo il percorso del mercato
          const distributedOperators = distributeOperatorsAlongPath(result.data, marketPath)
          console.log('Operatori distribuiti lungo il percorso:', distributedOperators.length)
          console.log('Percorso mercato:', marketPath)
          setOperators(distributedOperators)
          setMarketInfo(result.location)
          // Imposta il centro dell'area mercato
          if (result.location?.center) {
            setCenter([result.location.center.lat, result.location.center.lng])
          } else {
            // Usa il centro predefinito se non disponibile
            setCenter(defaultCenter)
          }
        } else {
          setError('Errore nel caricamento degli operatori')
          // Imposta comunque il centro predefinito
          setCenter(defaultCenter)
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
        
        {/* Percorso del mercato del venerdì - evidenziato */}
        <Polyline
          positions={marketPath}
          pathOptions={{
            color: '#f59e0b',
            weight: 8,
            opacity: 0.9,
            dashArray: '15, 10',
          }}
        />
        
        {/* Mercato coperto - evidenziato */}
        <Polygon
          positions={coveredMarketArea}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.4,
            weight: 4,
          }}
        />
        
        {/* Marker per il mercato coperto - posizionato al centro dell'area */}
        <Marker position={[43.7912, 7.6080]}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold text-blue-600">🏛️ Mercato Coperto</div>
              <div className="text-gray-600">Piazza della Libertà, Ventimiglia</div>
              <div className="text-xs text-gray-500 mt-1">Orari: Lun-Gio 7-13:30, Ven-Sab 7-19</div>
            </div>
          </Popup>
        </Marker>
        
        {operators.map((operator, index) => {
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
              key={`operator-${operator.id}-${index}`}
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
                  <div className="text-xs text-gray-500 mt-1">
                    {operator.location.lat.toFixed(4)}, {operator.location.lng.toFixed(4)}
                  </div>
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
