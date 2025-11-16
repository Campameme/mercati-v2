'use client'

import { useState } from 'react'
import { Lock, User, FileText, Image, Megaphone, Download } from 'lucide-react'

export default function OperatorAreaPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // In produzione: chiamata API per autenticazione
    setIsLoggedIn(true)
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
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Accedi
              </button>
            </form>

            <p className="mt-4 text-sm text-gray-500 text-center">
              Funzionalità disponibile in Fase 2
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Area Operator</h1>
        <p className="text-gray-600">
          Gestisci il tuo profilo, promozioni e documenti
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gestione Profilo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestione Profilo</h2>
          <p className="text-gray-600 mb-4">
            Aggiorna descrizione, lingue parlate e metodi di pagamento
          </p>
          <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            Modifica Profilo
          </button>
        </div>

        {/* Gestione Foto */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
            <Image className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestione Foto</h2>
          <p className="text-gray-600 mb-4">
            Carica e gestisci le foto della tua bancarella
          </p>
          <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            Carica Foto
          </button>
        </div>

        {/* Promozioni */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
            <Megaphone className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Promozioni</h2>
          <p className="text-gray-600 mb-4">
            Crea e gestisci le tue promozioni speciali
          </p>
          <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            Nuova Promozione
          </button>
        </div>

        {/* Documenti */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Documenti</h2>
          <p className="text-gray-600 mb-4">
            Scarica documenti ufficiali e comunicazioni dal Comune
          </p>
          <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            Visualizza Documenti
          </button>
        </div>

        {/* Comunicazioni */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
            <Download className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Comunicazioni</h2>
          <p className="text-gray-600 mb-4">
            Ricevi e visualizza comunicazioni amministrative
          </p>
          <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            Visualizza Comunicazioni
          </button>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>Nota:</strong> Questa funzionalità è in fase di sviluppo (Fase 2). 
          Le funzionalità complete saranno disponibili a breve.
        </p>
      </div>
    </div>
  )
}

