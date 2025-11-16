'use client'

import { useState, useEffect } from 'react'
import { Lock, LogOut, Plus, Edit, Trash2, Save, X, Newspaper, Calendar, AlertCircle, Bell } from 'lucide-react'
import { MarketEvent } from '@/types/event'

interface NewsItem {
  id: string
  title: string
  content: string
  date: string
  type: 'schedule' | 'notice' | 'event' | 'emergency'
  priority: 'low' | 'medium' | 'high'
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'news' | 'events'>('news')
  
  // News state
  const [news, setNews] = useState<NewsItem[]>([])
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [isCreatingNews, setIsCreatingNews] = useState(false)
  const [newNews, setNewNews] = useState<Partial<NewsItem>>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    type: 'notice',
    priority: 'medium',
  })
  
  // Events state
  const [events, setEvents] = useState<MarketEvent[]>([])
  const [editingEvent, setEditingEvent] = useState<MarketEvent | null>(null)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<MarketEvent>>({
    comune: 'Ventimiglia',
    evento: '',
    tipologia: '',
    giorno: '',
    dataInizio: '',
    dataFine: '',
    orario: '',
    luogo: '',
    organizzatore: '',
    settoriMerceologici: '',
  })

  // Verifica autenticazione al caricamento
  useEffect(() => {
    checkAuth()
  }, [])

  // Carica dati quando loggato
  useEffect(() => {
    if (isLoggedIn) {
      loadNews()
      loadEvents()
    }
  }, [isLoggedIn])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth')
      const data = await response.json()
      setIsLoggedIn(data.authenticated)
    } catch (error) {
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  const loadNews = async () => {
    try {
      const response = await fetch('/api/admin/news')
      const result = await response.json()
      if (result.success) {
        setNews(result.data || [])
      }
    } catch (error) {
      console.error('Errore nel caricamento notizie:', error)
    }
  }

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/admin/events')
      const result = await response.json()
      if (result.success) {
        setEvents(result.data || [])
      }
    } catch (error) {
      console.error('Errore nel caricamento eventi:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      const response = await fetch('/api/admin/auth', {
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
      await fetch('/api/admin/auth', {
        method: 'DELETE',
      })
      setIsLoggedIn(false)
      setNews([])
      setEvents([])
      setEditingNews(null)
      setEditingEvent(null)
      setIsCreatingNews(false)
      setIsCreatingEvent(false)
    } catch (error) {
      console.error('Errore nel logout:', error)
    }
  }

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa notizia?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/news?id=${id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      if (result.success) {
        loadNews()
      } else {
        alert(result.error || 'Errore nell\'eliminazione')
      }
    } catch (error) {
      alert('Errore nell\'eliminazione')
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo evento?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/events?id=${id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      if (result.success) {
        loadEvents()
      } else {
        alert(result.error || 'Errore nell\'eliminazione')
      }
    } catch (error) {
      alert('Errore nell\'eliminazione')
    }
  }

  const handleSaveNews = async () => {
    try {
      if (editingNews) {
        const response = await fetch('/api/admin/news', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingNews),
        })
        
        const result = await response.json()
        if (result.success) {
          setEditingNews(null)
          loadNews()
        } else {
          alert(result.error || 'Errore nell\'aggiornamento')
        }
      } else if (isCreatingNews) {
        const newsToSave = {
          ...newNews,
          date: newNews.date ? new Date(newNews.date).toISOString() : new Date().toISOString(),
        }
        
        const response = await fetch('/api/admin/news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newsToSave),
        })
        
        const result = await response.json()
        if (result.success) {
          setIsCreatingNews(false)
          setNewNews({
            title: '',
            content: '',
            date: new Date().toISOString().split('T')[0],
            type: 'notice',
            priority: 'medium',
          })
          loadNews()
        } else {
          alert(result.error || 'Errore nella creazione')
        }
      }
    } catch (error) {
      alert('Errore nel salvataggio')
    }
  }

  const handleSaveEvent = async () => {
    try {
      if (editingEvent) {
        const response = await fetch('/api/admin/events', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingEvent),
        })
        
        const result = await response.json()
        if (result.success) {
          setEditingEvent(null)
          loadEvents()
        } else {
          alert(result.error || 'Errore nell\'aggiornamento')
        }
      } else if (isCreatingEvent) {
        const response = await fetch('/api/admin/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newEvent),
        })
        
        const result = await response.json()
        if (result.success) {
          setIsCreatingEvent(false)
          setNewEvent({
            comune: 'Ventimiglia',
            evento: '',
            tipologia: '',
            giorno: '',
            dataInizio: '',
            dataFine: '',
            orario: '',
            luogo: '',
            organizzatore: '',
            settoriMerceologici: '',
          })
          loadEvents()
        } else {
          alert(result.error || 'Errore nella creazione')
        }
      }
    } catch (error) {
      alert('Errore nel salvataggio')
    }
  }

  const getTypeIcon = (type: NewsItem['type']) => {
    switch (type) {
      case 'schedule':
        return <Calendar className="w-4 h-4" />
      case 'event':
        return <Bell className="w-4 h-4" />
      case 'emergency':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Newspaper className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: NewsItem['type']) => {
    switch (type) {
      case 'schedule':
        return 'bg-blue-100 text-blue-800'
      case 'event':
        return 'bg-green-100 text-green-800'
      case 'emergency':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
              Area Admin
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Accedi per gestire notizie ed eventi
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Area Admin</h1>
          <p className="text-gray-600">
            Gestisci notizie ed eventi del mercato
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

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('news')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'news'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Notizie ({news.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'events'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Eventi ({events.length})
          </button>
        </div>
      </div>

      {/* Tab Notizie */}
      {activeTab === 'news' && (
        <div>
          {!isCreatingNews && !editingNews && (
            <div className="mb-6">
              <button
                onClick={() => setIsCreatingNews(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nuova Notizia</span>
              </button>
            </div>
          )}

          {(isCreatingNews || editingNews) && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingNews ? 'Modifica Notizia' : 'Nuova Notizia'}
                </h2>
                <button
                  onClick={() => {
                    setIsCreatingNews(false)
                    setEditingNews(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titolo *
                  </label>
                  <input
                    type="text"
                    value={editingNews?.title || newNews.title || ''}
                    onChange={(e) => {
                      if (editingNews) {
                        setEditingNews({ ...editingNews, title: e.target.value })
                      } else {
                        setNewNews({ ...newNews, title: e.target.value })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenuto *
                  </label>
                  <textarea
                    value={editingNews?.content || newNews.content || ''}
                    onChange={(e) => {
                      if (editingNews) {
                        setEditingNews({ ...editingNews, content: e.target.value })
                      } else {
                        setNewNews({ ...newNews, content: e.target.value })
                      }
                    }}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo *
                    </label>
                    <select
                      value={editingNews?.type || newNews.type || 'notice'}
                      onChange={(e) => {
                        if (editingNews) {
                          setEditingNews({ ...editingNews, type: e.target.value as NewsItem['type'] })
                        } else {
                          setNewNews({ ...newNews, type: e.target.value as NewsItem['type'] })
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="schedule">Orari</option>
                      <option value="notice">Avviso</option>
                      <option value="event">Evento</option>
                      <option value="emergency">Emergenza</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priorità *
                    </label>
                    <select
                      value={editingNews?.priority || newNews.priority || 'medium'}
                      onChange={(e) => {
                        if (editingNews) {
                          setEditingNews({ ...editingNews, priority: e.target.value as NewsItem['priority'] })
                        } else {
                          setNewNews({ ...newNews, priority: e.target.value as NewsItem['priority'] })
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="low">Bassa</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={editingNews?.date ? new Date(editingNews.date).toISOString().split('T')[0] : newNews.date || ''}
                    onChange={(e) => {
                      if (editingNews) {
                        setEditingNews({ ...editingNews, date: new Date(e.target.value).toISOString() })
                      } else {
                        setNewNews({ ...newNews, date: e.target.value })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsCreatingNews(false)
                    setEditingNews(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSaveNews}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Salva</span>
                </button>
              </div>
            </div>
          )}

          {/* Lista Notizie */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Notizie Pubblicate
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {news.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Nessuna notizia pubblicata. Crea la prima notizia.
                </div>
              ) : (
                news.map((item) => (
                  <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`p-1.5 rounded ${getTypeColor(item.type)}`}>
                            {getTypeIcon(item.type)}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(item.type)}`}>
                            {item.type === 'schedule' ? 'Orari' : item.type === 'event' ? 'Evento' : item.type === 'emergency' ? 'Emergenza' : 'Avviso'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.priority === 'high' ? 'bg-red-100 text-red-800' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Media' : 'Bassa'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.content}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setEditingNews(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Modifica"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(item.id)}
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
      )}

      {/* Tab Eventi */}
      {activeTab === 'events' && (
        <div>
          {!isCreatingEvent && !editingEvent && (
            <div className="mb-6">
              <button
                onClick={() => setIsCreatingEvent(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nuovo Evento</span>
              </button>
            </div>
          )}

          {(isCreatingEvent || editingEvent) && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEvent ? 'Modifica Evento' : 'Nuovo Evento'}
                </h2>
                <button
                  onClick={() => {
                    setIsCreatingEvent(false)
                    setEditingEvent(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comune *
                  </label>
                  <input
                    type="text"
                    value={editingEvent?.comune || newEvent.comune || ''}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, comune: e.target.value })
                      } else {
                        setNewEvent({ ...newEvent, comune: e.target.value })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evento *
                  </label>
                  <input
                    type="text"
                    value={editingEvent?.evento || newEvent.evento || ''}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, evento: e.target.value })
                      } else {
                        setNewEvent({ ...newEvent, evento: e.target.value })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipologia *
                  </label>
                  <input
                    type="text"
                    value={editingEvent?.tipologia || newEvent.tipologia || ''}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, tipologia: e.target.value })
                      } else {
                        setNewEvent({ ...newEvent, tipologia: e.target.value })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giorno ricorrente
                  </label>
                  <input
                    type="text"
                    value={editingEvent?.giorno || newEvent.giorno || ''}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, giorno: e.target.value })
                      } else {
                        setNewEvent({ ...newEvent, giorno: e.target.value })
                      }
                    }}
                    placeholder="es: venerdì"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Inizio
                  </label>
                  <input
                    type="text"
                    value={editingEvent?.dataInizio || newEvent.dataInizio || ''}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, dataInizio: e.target.value })
                      } else {
                        setNewEvent({ ...newEvent, dataInizio: e.target.value })
                      }
                    }}
                    placeholder="es: ricorrente o DD/MM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fine
                  </label>
                  <input
                    type="text"
                    value={editingEvent?.dataFine || newEvent.dataFine || ''}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, dataFine: e.target.value })
                      } else {
                        setNewEvent({ ...newEvent, dataFine: e.target.value })
                      }
                    }}
                    placeholder="es: ricorrente o DD/MM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orario
                  </label>
                  <input
                    type="text"
                    value={editingEvent?.orario || newEvent.orario || ''}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, orario: e.target.value })
                      } else {
                        setNewEvent({ ...newEvent, orario: e.target.value })
                      }
                    }}
                    placeholder="es: 8:00 - 14:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Luogo
                  </label>
                  <input
                    type="text"
                    value={editingEvent?.luogo || newEvent.luogo || ''}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, luogo: e.target.value })
                      } else {
                        setNewEvent({ ...newEvent, luogo: e.target.value })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organizzatore
                  </label>
                  <input
                    type="text"
                    value={editingEvent?.organizzatore || newEvent.organizzatore || ''}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, organizzatore: e.target.value })
                      } else {
                        setNewEvent({ ...newEvent, organizzatore: e.target.value })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Settori Merceologici
                  </label>
                  <input
                    type="text"
                    value={editingEvent?.settoriMerceologici || newEvent.settoriMerceologici || ''}
                    onChange={(e) => {
                      if (editingEvent) {
                        setEditingEvent({ ...editingEvent, settoriMerceologici: e.target.value })
                      } else {
                        setNewEvent({ ...newEvent, settoriMerceologici: e.target.value })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsCreatingEvent(false)
                    setEditingEvent(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSaveEvent}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Salva</span>
                </button>
              </div>
            </div>
          )}

          {/* Lista Eventi */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Eventi Pubblicati
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {events.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Nessun evento pubblicato. Crea il primo evento.
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.evento}</h3>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {event.tipologia}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Comune:</strong> {event.comune}</p>
                          {event.giorno && <p><strong>Giorno:</strong> {event.giorno}</p>}
                          {event.dataInizio && <p><strong>Data Inizio:</strong> {event.dataInizio}</p>}
                          {event.dataFine && <p><strong>Data Fine:</strong> {event.dataFine}</p>}
                          {event.orario && <p><strong>Orario:</strong> {event.orario}</p>}
                          {event.luogo && <p><strong>Luogo:</strong> {event.luogo}</p>}
                          {event.organizzatore && <p><strong>Organizzatore:</strong> {event.organizzatore}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Modifica"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
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
      )}
    </div>
  )
}

