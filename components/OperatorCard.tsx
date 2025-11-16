'use client'

import { Operator } from '@/types/operator'
import { MapPin, Globe, CreditCard, Banknote, Smartphone, Navigation, Star, X } from 'lucide-react'

interface OperatorCardProps {
  operator: Operator
  onNavigate: (operator: Operator) => void
}

export default function OperatorCard({ operator, onNavigate }: OperatorCardProps) {
  const paymentIcons = {
    cash: Banknote,
    card: CreditCard,
    digital: Smartphone,
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{operator.name}</h3>
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
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span>Bancarella {operator.location.stallNumber}</span>
          </div>
          {operator.rating && (
            <div className="flex items-center space-x-1 mb-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-gray-700">{operator.rating}</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-700 mb-4">{operator.description}</p>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Lingue parlate:</p>
        <div className="flex flex-wrap gap-2">
          {operator.languages.map((lang) => (
            <span
              key={lang}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
            >
              {lang.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Metodi di pagamento:</p>
        <div className="flex flex-wrap gap-2">
          {operator.paymentMethods.map((method) => {
            const Icon = paymentIcons[method]
            return (
              <div
                key={method}
                className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                <Icon className="w-3 h-3" />
                <span>
                  {method === 'cash' ? 'Contanti' : method === 'card' ? 'Carta' : 'Digitale'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {operator.socialLinks && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Social:</p>
          <div className="flex space-x-3">
            {operator.socialLinks.facebook && (
              <a
                href={`https://facebook.com/${operator.socialLinks.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Facebook
              </a>
            )}
            {operator.socialLinks.instagram && (
              <a
                href={`https://instagram.com/${operator.socialLinks.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-800 text-sm"
              >
                Instagram
              </a>
            )}
            {operator.socialLinks.website && (
              <a
                href={operator.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm"
              >
                <Globe className="w-4 h-4" />
                <span>Sito web</span>
              </a>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => onNavigate(operator)}
        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
      >
        <Navigation className="w-5 h-5" />
        <span>Portami alla bancarella</span>
      </button>
    </div>
  )
}

