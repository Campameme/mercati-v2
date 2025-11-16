'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import OperatorFilters from '@/components/OperatorFilters'
import { OperatorCategory } from '@/types/operator'

// Import dinamico per evitare problemi di SSR con Leaflet
const OperatorMap = dynamic(() => import('@/components/OperatorMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p className="mt-4 text-gray-600">Caricamento mappa...</p>
    </div>
  ),
})

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

