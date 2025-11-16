'use client'

import { useState, useMemo } from 'react'
import { Search, Store, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Operator } from '@/types/operator'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - in produzione verrà da API
  const operators: Operator[] = [
    {
      id: '1',
      name: 'Frutti Freschi di Mario',
      category: 'food',
      description: 'Frutta e verdura fresca di stagione',
      photos: [],
      languages: ['it', 'fr'],
      paymentMethods: ['cash', 'card'],
      location: {
        lat: 45.4642,
        lng: 9.1900,
        stallNumber: 'A12',
      },
      isOpen: true,
    },
    {
      id: '2',
      name: 'Moda & Stile',
      category: 'clothing',
      description: 'Abbigliamento trendy e accessori moda',
      photos: [],
      languages: ['it', 'en'],
      paymentMethods: ['cash', 'card', 'digital'],
      location: {
        lat: 45.4650,
        lng: 9.1910,
        stallNumber: 'B05',
      },
      isOpen: true,
    },
    {
      id: '3',
      name: 'Libri Usati',
      category: 'books',
      description: 'Libri usati e rari, fumetti e riviste',
      photos: [],
      languages: ['it'],
      paymentMethods: ['cash'],
      location: {
        lat: 45.4630,
        lng: 9.1890,
        stallNumber: 'C18',
      },
      isOpen: false,
    },
  ]

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return []
    }

    const query = searchQuery.toLowerCase()
    return operators.filter(
      (op) =>
        op.name.toLowerCase().includes(query) ||
        op.description.toLowerCase().includes(query) ||
        op.category.toLowerCase().includes(query) ||
        op.location.stallNumber.toLowerCase().includes(query)
    )
  }, [searchQuery, operators])

  const categories = useMemo(() => {
    const uniqueCategories = new Set(operators.map((op) => op.category))
    return Array.from(uniqueCategories)
  }, [operators])

  const categoryResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return []
    }
    const query = searchQuery.toLowerCase()
    return categories.filter((cat) => cat.toLowerCase().includes(query))
  }, [searchQuery, categories])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ricerca</h1>
        <p className="text-gray-600">
          Cerca operatori, categorie o prodotti (ricerca prodotti in Fase 2)
        </p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            id="search-query"
            name="search-query"
            placeholder="Cerca per nome operatore, categoria o parola chiave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {searchQuery.trim() && (
        <div>
          {searchResults.length > 0 || categoryResults.length > 0 ? (
            <div className="space-y-6">
              {/* Risultati operatori */}
              {searchResults.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Operator ({searchResults.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((operator) => (
                      <Link
                        key={operator.id}
                        href={`/operators?operator=${operator.id}`}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {operator.name}
                            </h3>
                            <div className="flex items-center text-gray-600 text-sm mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>Bancarella {operator.location.stallNumber}</span>
                            </div>
                            <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                              {operator.category}
                            </span>
                          </div>
                          {operator.isOpen ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                              Aperto
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                              Chiuso
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {operator.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Risultati categorie */}
              {categoryResults.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Categorie ({categoryResults.length})
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {categoryResults.map((category) => (
                      <Link
                        key={category}
                        href={`/operators?category=${category}`}
                        className="flex items-center space-x-2 px-4 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      >
                        <Store className="w-5 h-5 text-primary-600" />
                        <span className="font-medium text-gray-900 capitalize">{category}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">Nessun risultato trovato</p>
              <p className="text-gray-500">
                Prova a cercare con parole chiave diverse o esplora le categorie
              </p>
            </div>
          )}
        </div>
      )}

      {!searchQuery.trim() && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2">Inizia a cercare</p>
          <p className="text-gray-500">
            Digita il nome di un operatore, una categoria o una parola chiave
          </p>
        </div>
      )}
    </div>
  )
}

