'use client'

import { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
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

// Centro area mercato venerdì Ventimiglia - lungo il lungomare
const defaultCenter: [number, number] = [43.7885, 7.6065]

// Percorso del mercato del venerdì lungo il LUNGOMARE
// Passeggiata Oberdan, Passeggiata Cavallotti, Via Milite Ignoto
// Coordinate basate sul lungomare di Ventimiglia
const marketPath: [number, number][] = [
  [43.7880, 7.6040], // Inizio - Passeggiata Oberdan (ovest)
  [43.7882, 7.6045], // Passeggiata Oberdan
  [43.7884, 7.6050], // Passeggiata Oberdan
  [43.7885, 7.6055], // Passeggiata Oberdan / Passeggiata Cavallotti
  [43.7886, 7.6060], // Passeggiata Cavallotti
  [43.7887, 7.6065], // Passeggiata Cavallotti
  [43.7888, 7.6070], // Passeggiata Cavallotti / Via Milite Ignoto
  [43.7889, 7.6075], // Via Milite Ignoto
  [43.7890, 7.6080], // Via Milite Ignoto
  [43.7891, 7.6085], // Fine - Via Milite Ignoto (est)
]

// Componente per centrare la mappa
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

interface OperatorMapProps {
  category: OperatorCategory | 'all'
  searchQuery: string
}

export default function OperatorMap({ category, searchQuery }: OperatorMapProps) {
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null)
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

  const handleNavigate = useCallback((operator: Operator) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${operator.location.lat},${operator.location.lng}`
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
    <div className="space-y-6">
      {/* Mappa con percorso evidenziato */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <MapContainer
          center={defaultCenter}
          zoom={16}
          style={{ height: '600px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <MapCenter center={defaultCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {/* Percorso del mercato del venerdì - evidenziato */}
          <Polyline
            positions={marketPath}
            pathOptions={{
              color: '#f59e0b',
              weight: 10,
              opacity: 0.9,
              dashArray: '20, 15',
            }}
          />
        </MapContainer>
      </div>

      {/* Indicazioni per raggiungere il mercato */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Come raggiungere il Mercato del Venerdì</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">🚗 In Auto</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Parcheggi disponibili lungo il lungomare e nelle zone limitrofe</li>
              <li>• Durante il mercato (venerdì 8:00-17:00) alcune strade sono chiuse al traffico</li>
              <li>• Si consiglia di parcheggiare nelle aree indicate nella mappa</li>
              <li>• Accesso da: Autostrada A10, uscita Ventimiglia</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">🚶 A Piedi / 🚲 In Bicicletta</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Il mercato si svolge lungo il lungomare (Passeggiata Oberdan, Cavallotti, Via Milite Ignoto)</li>
              <li>• Facilmente raggiungibile dal centro città (circa 5-10 minuti a piedi)</li>
              <li>• Percorso pedonale sicuro e accessibile</li>
              <li>• Parcheggio bici disponibile nelle zone limitrofe</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">🚌 Con i Mezzi Pubblici</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Linee bus locali fermano vicino al lungomare</li>
              <li>• Stazione ferroviaria Ventimiglia: 15 minuti a piedi</li>
              <li>• Servizio navetta disponibile durante il mercato</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">⏰ Orari Mercato</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Venerdì:</strong> 8:00 - 17:00 (ora legale) / 8:00 - 16:00 (ora solare)</li>
              <li>• Chiusura strade al traffico durante gli orari del mercato</li>
              <li>• Mercato coperto: Lun-Gio 7-13:30, Ven-Sab 7-19</li>
            </ul>
          </div>
        </div>
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
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedOperator(operator)}
                >
                  <div className="font-semibold text-gray-900">{operator.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{operator.description}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Bancarella {operator.location.stallNumber}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNavigate(operator)
                    }}
                    className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    📍 Ottieni indicazioni
                  </button>
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
