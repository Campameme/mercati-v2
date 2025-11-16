'use client'

import { useState, useMemo } from 'react'
import OperatorMap from '@/components/OperatorMap'
import OperatorFilters from '@/components/OperatorFilters'
import { OperatorCategory } from '@/types/operator'

export default function OperatorsPage() {
  const [selectedCategory, setSelectedCategory] = useState<OperatorCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mercato Venerdì Ventimiglia</h1>
        <p className="text-gray-600">
          Esplora le bancarelle del mercato del venerdì, filtra per categoria e naviga verso i tuoi operatori preferiti
        </p>
      </div>

      <OperatorFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <OperatorMap category={selectedCategory} searchQuery={searchQuery} />
    </div>
  )
}

