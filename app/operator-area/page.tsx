'use client'

import { useState, useEffect } from 'react'
import { Lock, User, FileText, Image, Megaphone, Download, LogOut, Plus, Edit, Trash2, Save, X, MapPin, CreditCard, Globe } from 'lucide-react'
import { Operator } from '@/types/operator'

export default function OperatorAreaPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [operators, setOperators] = useState<Operator[]>([])
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newOperator, setNewOperator] = useState<Partial<Operator>>({
    name: '',
    category: 'food',
    description: '',
    photos: [],
    languages: ['it'],
    paymentMethods: ['cash'],
    socialLinks: {},
    location: {
      lat: 43.7885,
      lng: 7.6060,
      stallNumber: '',
    },
    isOpen: true,
  })

  // Verifica autenticazione al caricamento
  useEffect(() => {
    checkAuth()
  }, [])

  // Carica operatori quando loggato
  useEffect(() => {
    if (isLoggedIn) {
      loadOperators()
    }
  }, [isLoggedIn])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/operators/auth')
      const data = await response.json()
      setIsLoggedIn(data.authenticated)
    } catch (error) {
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  const loadOperators = async () => {
    try {
      const response = await fetch('/api/operators/manage')
      const result = await response.json()
      if (result.success) {
        setOperators(result.data || [])
      }
    } catch (error) {
      console.error('Errore nel caricamento operatori:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      const response = await fetch('/api/operators/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsLoggedIn(true)
        setEmail('')
        setPassword('')
      } else {
        setError(data.error || 'Credenziali non corrette')
      }
    } catch (error) {
      setError('Errore nel login')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/operators/auth', {
        method: 'DELETE',
      })
      setIsLoggedIn(false)
      setOperators([])
      setEditingOperator(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Errore nel logout:', error)
    }
  }

  const handleDeleteOperator = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo operatore?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/operators/manage?id=${id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      if (result.success) {
        loadOperators()
      } else {
        alert(result.error || 'Errore nell\'eliminazione')
      }
    } catch (error) {
      alert('Errore nell\'eliminazione')
    }
  }

  const handleSaveOperator = async () => {
    try {
      if (editingOperator) {
        // Aggiorna operatore esistente
        const response = await fetch('/api/operators/manage', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingOperator),
        })
        
        const result = await response.json()
        if (result.success) {
          setEditingOperator(null)
          loadOperators()
        } else {
          alert(result.error || 'Errore nell\'aggiornamento')
        }
      } else if (isCreating) {
        // Crea nuovo operatore
        const response = await fetch('/api/operators/manage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newOperator),
        })
        
        const result = await response.json()
        if (result.success) {
          setIsCreating(false)
          setNewOperator({
            name: '',
            category: 'food',
            description: '',
            photos: [],
            languages: ['it'],
            paymentMethods: ['cash'],
            socialLinks: {},
            location: {
              lat: 43.7885,
              lng: 7.6060,
              stallNumber: '',
            },
            isOpen: true,
          })
          loadOperators()
        } else {
          alert(result.error || 'Errore nella creazione')
        }
      }
    } catch (error) {
      alert('Errore nel salvataggio')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Area Operator
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Accedi al portale privato per operatori
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Inserisci la tua email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Inserisci la password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Accedi
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestione Operator</h1>
          <p className="text-gray-600">
            Gestisci gli operatori del mercato di Ventimiglia
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Pulsante Crea Nuovo Operatore */}
      {!isCreating && !editingOperator && (
        <div className="mb-6">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Operatore</span>
          </button>
        </div>
      )}

      {/* Form Crea/Modifica Operatore */}
      {(isCreating || editingOperator) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingOperator ? 'Modifica Operatore' : 'Nuovo Operatore'}
            </h2>
            <button
              onClick={() => {
                setIsCreating(false)
                setEditingOperator(null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={editingOperator?.name || newOperator.name || ''}
                onChange={(e) => {
                  if (editingOperator) {
                    setEditingOperator({ ...editingOperator, name: e.target.value })
                  } else {
                    setNewOperator({ ...newOperator, name: e.target.value })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                value={editingOperator?.category || newOperator.category || 'food'}
                onChange={(e) => {
                  if (editingOperator) {
                    setEditingOperator({ ...editingOperator, category: e.target.value })
                  } else {
                    setNewOperator({ ...newOperator, category: e.target.value })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="food">Cibo</option>
                <option value="clothing">Abbigliamento</option>
                <option value="accessories">Accessori</option>
                <option value="electronics">Elettronica</option>
                <option value="home">Casa</option>
                <option value="books">Libri</option>
                <option value="flowers">Fiori</option>
                <option value="other">Altro</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione
              </label>
              <textarea
                value={editingOperator?.description || newOperator.description || ''}
                onChange={(e) => {
                  if (editingOperator) {
                    setEditingOperator({ ...editingOperator, description: e.target.value })
                  } else {
                    setNewOperator({ ...newOperator, description: e.target.value })
                  }
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numero Bancarella
              </label>
              <input
                type="text"
                value={editingOperator?.location.stallNumber || newOperator.location?.stallNumber || ''}
                onChange={(e) => {
                  if (editingOperator) {
                    setEditingOperator({
                      ...editingOperator,
                      location: { ...editingOperator.location, stallNumber: e.target.value },
                    })
                  } else {
                    setNewOperator({
                      ...newOperator,
                      location: { ...newOperator.location!, stallNumber: e.target.value },
                    })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aperto
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingOperator?.isOpen ?? newOperator.isOpen ?? true}
                  onChange={(e) => {
                    if (editingOperator) {
                      setEditingOperator({ ...editingOperator, isOpen: e.target.checked })
                    } else {
                      setNewOperator({ ...newOperator, isOpen: e.target.checked })
                    }
                  }}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Operatore aperto</span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsCreating(false)
                setEditingOperator(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              onClick={handleSaveOperator}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Save className="w-4 h-4" />
              <span>Salva</span>
            </button>
          </div>
        </div>
      )}

      {/* Lista Operator */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Operator ({operators.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {operators.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Nessun operatore trovato. Crea il primo operatore.
            </div>
          ) : (
            operators.map((operator) => (
              <div key={operator.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{operator.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        operator.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {operator.isOpen ? 'Aperto' : 'Chiuso'}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {operator.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{operator.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>Bancarella: {operator.location.stallNumber}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>Lingue: {operator.languages.join(', ')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="w-3 h-3" />
                        <span>Pagamenti: {operator.paymentMethods.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingOperator(operator)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Modifica"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteOperator(operator.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Elimina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
