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
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            id="operator-search"
            name="operator-search"
            placeholder="Cerca per nome operatore o prodotto..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtra per categoria</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

