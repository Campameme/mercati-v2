'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { MarketEvent } from '@/types/event'
import { X, Calendar, Clock, MapPin, Users, Heart, HeartOff } from 'lucide-react'

// Import dinamico per evitare problemi SSR
const FullCalendar = dynamic(() => import('@fullcalendar/react').then((mod) => mod.default), {
  ssr: false,
})

// Import plugin
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import itLocale from '@fullcalendar/core/locales/it'

interface CalendarComponentProps {
  events: MarketEvent[]
  favorites: string[]
  onToggleFavorite: (eventId: string) => void
}

export default function CalendarComponent({
  events,
  favorites,
  onToggleFavorite,
}: CalendarComponentProps) {
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null)

  // Rimuovi orario dal nome evento se presente e "00" all'inizio
  const cleanEventTitle = (title: string, orario?: string): string => {
    if (!title) return title
    
    // Converti in stringa e rimuovi "00" o "0" all'inizio (gestisce sia "00 Mercatino" che "0 Gran Gala")
    // Prova diverse varianti: "00 ", "00", "0 ", "0" all'inizio
    let cleaned = String(title)
      .replace(/^00\s+/, '')  // Rimuovi "00 " all'inizio
      .replace(/^00/, '')      // Rimuovi "00" all'inizio (senza spazio)
      .replace(/^0\s+/, '')    // Rimuovi "0 " all'inizio
      .replace(/^0/, '')       // Rimuovi "0" all'inizio (senza spazio)
      .trim()
    
    // Se dopo la rimozione è vuoto, mantieni il titolo originale
    if (!cleaned) cleaned = String(title)
    
    if (!orario) return cleaned
    // Rimuovi pattern comuni di orario dal titolo (es: "21:00 - Evento", "Evento - 21:00")
    cleaned = cleaned
      .replace(new RegExp(`\\s*-?\\s*${orario.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*-?\\s*`, 'gi'), '')
      .replace(/^\s*-\s*|\s*-\s*$/g, '') // Rimuovi trattini rimasti agli estremi
      .trim()
    return cleaned || String(title)
  }

  // Converti eventi in formato FullCalendar
  const calendarEvents = events.map((event) => {
    // Pulisci il titolo rimuovendo "00" o "0" all'inizio
    const cleanedTitle = cleanEventTitle(event.evento, event.orario)
    
    // Debug: log per verificare la pulizia
    if (event.evento && event.evento.startsWith('00')) {
      console.log(`Pulito titolo: "${event.evento}" -> "${cleanedTitle}"`)
    }
    
    return {
      id: event.id,
      title: cleanedTitle,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      extendedProps: {
        comune: event.comune,
        tipologia: event.tipologia,
        orario: event.orario,
        luogo: event.luogo,
        organizzatore: event.organizzatore,
        evento: cleanedTitle, // Usa anche qui il nome pulito
      },
      className: favorites.includes(event.id) ? 'favorite-event' : '',
    }
  })

  const formatDate = (date?: Date): string => {
    if (!date) return ''
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek',
        }}
        events={calendarEvents}
        locale={itLocale}
        firstDay={1} // Lunedì come primo giorno
        eventClick={(info) => {
          // Mostra dettagli evento
          const event = events.find((e) => e.id === info.event.id)
          if (event) {
            setSelectedEvent(event)
          }
        }}
        height="auto"
        eventDisplay="block"
        eventTextColor="#fff"
        eventBackgroundColor="#0ea5e9"
        eventBorderColor="#0284c7"
      />
      <style jsx global>{`
        /* FullCalendar Base Styles */
        .fc {
          font-family: inherit;
        }
        .fc-header-toolbar {
          margin-bottom: 1.5em;
        }
        .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }
        .fc-button {
          background-color: #0ea5e9;
          border-color: #0284c7;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .fc-button:hover {
          background-color: #0284c7;
          border-color: #0369a1;
        }
        .fc-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.3);
        }
        .fc-button-active {
          background-color: #0369a1;
          border-color: #075985;
        }
        .fc-daygrid-day {
          border-color: #e5e7eb;
        }
        .fc-daygrid-day-number {
          color: #374151;
          font-weight: 500;
        }
        .fc-day-today {
          background-color: #eff6ff;
        }
        .fc-event {
          border-radius: 0.25rem;
          padding: 0.25rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .fc-event:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }
        /* Nascondi l'orario degli eventi (fc-event-time) che mostra "00" o "0" */
        .fc-event-time {
          display: none !important;
        }
        .fc-event-title {
          font-weight: 500;
          padding: 0.125rem 0.25rem;
        }
        .favorite-event {
          background-color: #fbbf24 !important;
          border-color: #f59e0b !important;
        }
        .fc-daygrid-event {
          margin: 0.125rem 0;
        }
        .fc-col-header-cell {
          background-color: #f9fafb;
          padding: 0.75rem 0;
          font-weight: 600;
          color: #374151;
        }
        .fc-timegrid-slot {
          border-color: #e5e7eb;
        }
        .fc-list-day-cushion {
          background-color: #f9fafb;
          padding: 0.5rem 1rem;
          font-weight: 600;
        }
      `}</style>
      </div>

      {/* Modal Dettagli Evento */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{cleanEventTitle(selectedEvent.evento, selectedEvent.orario)}</h2>
                  <div className="flex items-center space-x-2 text-primary-100">
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                      {selectedEvent.tipologia}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Data */}
              {selectedEvent.start && (
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Data</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedEvent.start)}</p>
                    {selectedEvent.end && selectedEvent.end.getTime() !== selectedEvent.start.getTime() && (
                      <p className="text-sm text-gray-600 mt-1">
                        fino al {formatDate(selectedEvent.end)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Orario */}
              {selectedEvent.orario && (
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Orario</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.orario}</p>
                  </div>
                </div>
              )}

              {/* Luogo */}
              {selectedEvent.luogo && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Luogo</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.luogo}</p>
                  </div>
                </div>
              )}

              {/* Organizzatore */}
              {selectedEvent.organizzatore && (
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Organizzatore</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.organizzatore}</p>
                  </div>
                </div>
              )}

              {/* Comune */}
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Comune</p>
                  <p className="font-semibold text-gray-900">{selectedEvent.comune}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 flex items-center justify-between">
              <button
                onClick={() => {
                  onToggleFavorite(selectedEvent.id)
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  favorites.includes(selectedEvent.id)
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {favorites.includes(selectedEvent.id) ? (
                  <>
                    <Heart className="w-5 h-5 fill-current" />
                    <span>Rimuovi dai preferiti</span>
                  </>
                ) : (
                  <>
                    <HeartOff className="w-5 h-5" />
                    <span>Aggiungi ai preferiti</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

