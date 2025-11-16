'use client'

import { Parking } from '@/types/parking'
import { MapPin, Clock, Euro, Car, Accessibility, Building2, Navigation, Star, Route } from 'lucide-react'

interface ParkingCardProps {
  parking: Parking
  onNavigate: (parking: Parking) => void
  onSelect?: () => void
}

export default function ParkingCard({ parking, onNavigate, onSelect }: ParkingCardProps) {
  // Formatta la distanza
  const formatDistance = (meters?: number) => {
    if (!meters) return null
    if (meters < 1000) return `${Math.round(meters)}m`
    return `${(meters / 1000).toFixed(1)}km`
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-base font-semibold text-gray-900 leading-tight">{parking.name}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {parking.source === 'google' && (
                <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 flex-shrink-0">
                  Google
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center text-gray-600 text-xs mb-2">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="line-clamp-1">{parking.address}</span>
          </div>
          
          {/* Distanza e Rating */}
          <div className="flex items-center gap-2 mb-2 text-xs">
            {parking.distance && (
              <div className="flex items-center text-gray-600">
                <Route className="w-3 h-3 mr-1" />
                <span>{formatDistance(parking.distance)}</span>
              </div>
            )}
            {parking.rating && (
              <div className="flex items-center text-yellow-600">
                <Star className="w-3 h-3 mr-0.5 fill-current" />
                <span className="font-medium">{parking.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              parking.type === 'municipal'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {parking.type === 'municipal' ? 'Comunale' : 'Privato'}
            </span>
            {parking.accessible && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 flex items-center">
                <Accessibility className="w-3 h-3 mr-1" />
                Accessibile
              </span>
            )}
            {parking.hasRestrooms && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 flex items-center">
                <Building2 className="w-3 h-3 mr-1" />
                Bagni
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center text-gray-700">
          <Euro className="w-4 h-4 mr-1.5 text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Tariffa</p>
            {parking.pricing ? (
              <div>
                <p className={`text-sm font-semibold ${
                  parking.pricing.trafficMultiplier && parking.pricing.trafficMultiplier > 1.0 
                    ? 'text-orange-600' 
                    : 'text-gray-900'
                }`}>
                  {parking.pricing.currentHourlyRate.toFixed(2)}€/h
                </p>
                {parking.pricing.trafficMultiplier && parking.pricing.trafficMultiplier > 1.0 && (
                  <p className="text-xs text-orange-600 font-medium">
                    Alta domanda (+{Math.round((parking.pricing.trafficMultiplier - 1) * 100)}%)
                  </p>
                )}
                {parking.pricing.dailyRate && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {parking.pricing.currentDailyRate.toFixed(2)}€/giorno
                  </p>
                )}
              </div>
            ) : (
              <p className={`text-sm font-semibold ${
                parking.fee === 'Indefinito' ? 'text-gray-500 italic' : 
                parking.fee.toLowerCase().includes('gratuito') ? 'text-green-600' : ''
              }`}>
                {parking.fee}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center text-gray-700">
          <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Orari</p>
            <p className="text-sm font-semibold">{parking.hours}</p>
          </div>
        </div>
      </div>

      {parking.totalSpots > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-700">
              <Car className="w-4 h-4 mr-1.5 text-gray-400" />
              <span className="text-xs font-medium">Disponibilità totale</span>
            </div>
            <span className="text-xs font-semibold text-gray-900">
              {parking.totalSpots} posti
            </span>
          </div>
          <p className="text-xs text-gray-500 italic mt-1">Stima basata su traffico</p>
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation()
          onNavigate(parking)
        }}
        className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
      >
        <Navigation className="w-4 h-4" />
        <span>Naviga</span>
      </button>
    </div>
  )
}

