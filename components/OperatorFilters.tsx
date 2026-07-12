'use client'

import { Search, Filter } from 'lucide-react'
import { OperatorCategory } from '@/types/operator'

interface OperatorFiltersProps {
  selectedCategory: OperatorCategory | 'all'
  onCategoryChange: (category: OperatorCategory | 'all') => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const categories: { value: OperatorCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'Tutti', icon: '🏪' },
  { value: 'food', label: 'Cibo', icon: '🍕' },
  { value: 'clothing', label: 'Abbigliamento', icon: '👕' },
  { value: 'accessories', label: 'Accessori', icon: '💍' },
  { value: 'electronics', label: 'Elettronica', icon: '📱' },
  { value: 'home', label: 'Casa', icon: '🏠' },
  { value: 'books', label: 'Libri', icon: '📚' },
  { value: 'flowers', label: 'Fiori', icon: '🌸' },
  { value: 'other', label: 'Altro', icon: '📦' },
]

export default function OperatorFilters({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: OperatorFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e0d7c1] shadow-[0_12px_26px_-18px_rgba(38,36,30,0.35)] p-4 mb-6">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted w-5 h-5" aria-hidden="true" />
          <input
            type="text"
            id="operator-search"
            name="operator-search"
            placeholder="Cerca per nome operatore o prodotto..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e0d7c1] rounded-xl text-sm focus:outline-none focus:border-alga"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-ink-muted" aria-hidden="true" />
          <h3 className="font-alt font-semibold text-ink">Filtra per categoria</h3>
        </div>
        {/* Chips di categoria: bordo alga, attiva piena alga (come le chips dei giorni) */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              aria-pressed={selectedCategory === cat.value}
              className={`inline-flex items-center gap-2 font-alt text-sm font-semibold px-4 py-2 rounded-full border-[1.5px] transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-alga text-crema border-alga'
                  : 'bg-white text-alga-600 border-alga/60 hover:bg-alga hover:text-crema hover:border-alga'
              }`}
            >
              <span aria-hidden="true">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
