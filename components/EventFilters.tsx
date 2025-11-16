'use client'

import { useState, useMemo } from 'react'
import { Filter, X } from 'lucide-react'
import { MarketEvent, EventFilters } from '@/types/event'

interface EventFiltersProps {
  events: MarketEvent[]
  filters: EventFilters
  onFiltersChange: (filters: EventFilters) => void
}

export default function EventFiltersComponent({
  events,
  filters,
  onFiltersChange,
}: EventFiltersProps) {
  const [showFilters, setShowFilters] = useState(true)

  // Categorie ufficiali del Comune di Ventimiglia
  const categorieUfficiali = [
    'Concerto',
    'Manifestazione',
    'Spettacolo',
    'Spettacolo teatrale',
    'Conferenza',
    'Giornata informativa',
    'Commemorazione - Ricorrenza',
  ]

  const categorie = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    // Filtra solo eventi futuri
    const futureEvents = events.filter((e) => {
      if (!e.start) return false
      const eventDate = new Date(e.start)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate >= now
    })

    // Estrai categorie solo da eventi futuri
    const fromEvents = Array.from(
      new Set(futureEvents.map((e) => e.tipologia).filter(Boolean))
    )
    
    // Combina con categorie ufficiali, ma mantieni solo quelle che hanno eventi futuri
    const combined = [...new Set([...categorieUfficiali, ...fromEvents])]
      .filter((cat) => {
        // Mantieni solo categorie che hanno almeno un evento futuro
        return futureEvents.some((e) => 
          e.tipologia.toLowerCase().includes(cat.toLowerCase()) ||
          cat.toLowerCase().includes(e.tipologia.toLowerCase())
        )
      })
    
    return combined.sort()
  }, [events])

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      comune: '',
      categoria: '',
      tipo: '',
    })
  }

  const hasActiveFilters = filters.categoria || filters.tipo

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Filtri</h2>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              <span>Pulisci filtri</span>
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-600 hover:text-gray-900"
          >
            {showFilters ? 'Nascondi' : 'Mostra'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              id="categoria"
              value={filters.categoria}
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Tutte le categorie</option>
              {categorie.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo Evento
            </label>
            <select
              id="tipo"
              value={filters.tipo}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Tutti i tipi</option>
              <option value="concerto">Concerto</option>
              <option value="manifestazione">Manifestazione</option>
              <option value="spettacolo">Spettacolo</option>
              <option value="spettacolo teatrale">Spettacolo teatrale</option>
              <option value="conferenza">Conferenza</option>
              <option value="giornata informativa">Giornata informativa</option>
              <option value="commemorazione">Commemorazione - Ricorrenza</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

