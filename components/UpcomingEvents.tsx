'use client'

import { MarketEvent } from '@/types/event'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale/it'

interface UpcomingEventsProps {
  events: MarketEvent[]
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Prossimi Eventi</h2>
      </div>
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-primary-500"
          >
            <h3 className="font-semibold text-gray-900 mb-1">{event.evento.replace(/^0+\s*/, '').trim()}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              {event.start && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(event.start, 'dd MMMM yyyy', { locale: it })}
                    {event.end && event.end.getTime() !== event.start.getTime() && (
                      <> - {format(event.end, 'dd MMMM yyyy', { locale: it })}</>
                    )}
                  </span>
                </div>
              )}
              {event.comune && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{event.comune}</span>
                </div>
              )}
              {event.orario && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{event.orario}</span>
                </div>
              )}
              {event.tipologia && (
                <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded mt-2">
                  {event.tipologia}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

