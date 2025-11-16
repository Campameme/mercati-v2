'use client'

import { useState, useEffect } from 'react'
import CalendarComponent from '@/components/CalendarComponent'
import EventFilters from '@/components/EventFilters'
import UpcomingEvents from '@/components/UpcomingEvents'
import { MarketEvent, EventFilters as EventFiltersType } from '@/types/event'
import { Calendar } from 'lucide-react'

export default function CalendarPage() {
  const [events, setEvents] = useState<MarketEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<MarketEvent[]>([])
  const [filters, setFilters] = useState<EventFiltersType>({
    comune: '', // Non più necessario, filtriamo direttamente nei dati
    categoria: '',
    tipo: '',
  })
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Carica preferiti da localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('eventFavorites')
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
    }
  }, [])

  // Carica eventi da Google Sheets
  useEffect(() => {
    loadEvents()
  }, [])

  // Applica filtri (solo categoria e tipo, comune già filtrato nei dati)
  // Filtra solo eventi futuri
  useEffect(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Reset ore per confronto solo date

    let filtered = events.filter((e) => {
      // Mostra solo eventi futuri o in corso oggi
      if (!e.start) return false
      const eventDate = new Date(e.start)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate >= now
    })

    if (filters.categoria) {
      filtered = filtered.filter((e) =>
        e.tipologia.toLowerCase().includes(filters.categoria.toLowerCase())
      )
    }

    if (filters.tipo) {
      filtered = filtered.filter((e) =>
        e.tipologia.toLowerCase().includes(filters.tipo.toLowerCase())
      )
    }

    setFilteredEvents(filtered)
  }, [events, filters])

  const loadEvents = async () => {
    try {
      setLoading(true)
      // URL Google Sheets dal repository originale
      const GOOGLE_SHEETS_URL =
        'https://docs.google.com/spreadsheets/d/1BCCgGLKYZOz3SdWZx199kbp1PV387N_qzM3oTuRVESU/gviz/tq?tqx=out:csv&sheet=Foglio1'

      const response = await fetch(GOOGLE_SHEETS_URL)
      const csvText = await response.text()

      // Usa PapaParse per parsare CSV
      const Papa = (await import('papaparse')).default
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      })

      const processedEvents = processEvents(parsed.data as any[])
      console.log('Dati CSV parsati:', parsed.data)
      console.log('Eventi processati:', processedEvents.length)
      setEvents(processedEvents)
    } catch (error) {
      console.error('Errore nel caricamento eventi:', error)
      // In caso di errore, mostra un messaggio all'utente
      alert('Errore nel caricamento degli eventi. Controlla la console per i dettagli.')
    } finally {
      setLoading(false)
    }
  }

  // Eventi reali del Comune di Ventimiglia (dal sito ufficiale)
  const getVentimigliaEvents = (): MarketEvent[] => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const events: MarketEvent[] = []

    // Eventi 2024-2025 basati sul sito del comune
    const comuneEvents = [
      {
        evento: 'Fiera di San Giuseppe',
        tipologia: 'Manifestazione',
        dataInizio: '17/03',
        dataFine: '17/03',
        orario: 'Tutto il giorno',
        luogo: 'Centro storico Ventimiglia',
        organizzatore: 'Comune di Ventimiglia',
      },
      {
        evento: 'Teatro Comunale - Delirio a due',
        tipologia: 'Spettacolo',
        dataInizio: '03/03',
        dataFine: '03/03',
        orario: '21:00',
        luogo: 'Teatro Comunale Ventimiglia',
        organizzatore: 'Teatro Comunale',
      },
      {
        evento: 'Il Mago di Oz nel paese delle Meraviglie',
        tipologia: 'Spettacolo',
        dataInizio: '07/04',
        dataFine: '07/04',
        orario: '16:00',
        luogo: 'Teatro Comunale Ventimiglia',
        organizzatore: 'Teatro Comunale',
      },
      {
        evento: 'La Passione di Maria',
        tipologia: 'Manifestazione',
        dataInizio: '11/05',
        dataFine: '11/05',
        orario: '21:00',
        luogo: 'Centro Polivalente San Francesco - Ventimiglia Alta',
        organizzatore: 'Giorgia Brusco',
      },
      {
        evento: 'Concerto - Festeggiamo la mamma',
        tipologia: 'Concerto',
        dataInizio: '11/05',
        dataFine: '11/05',
        orario: '21:00',
        luogo: 'Teatro Comunale Ventimiglia',
        organizzatore: 'Orchestra Filarmonica Giovanile Città di Ventimiglia',
      },
      {
        evento: 'Amore, c\'è un morto in salotto',
        tipologia: 'Spettacolo',
        dataInizio: '18/05',
        dataFine: '18/05',
        orario: '21:00',
        luogo: 'Teatro Comunale Ventimiglia',
        organizzatore: 'Teatro Comunale',
      },
      {
        evento: 'Conoscere e sapere - Storia, Arte, Racconti',
        tipologia: 'Manifestazione',
        dataInizio: '06/07',
        dataFine: '06/07',
        orario: '21:00',
        luogo: 'Ventimiglia',
        organizzatore: 'Comune di Ventimiglia',
      },
      {
        evento: 'Musica nei Castelli di Liguria - NAPO canta DE ANDRÈ',
        tipologia: 'Concerto',
        dataInizio: '10/07',
        dataFine: '10/07',
        orario: '21:15',
        luogo: 'Teatro Romano - Area Archeologica di Nervia',
        organizzatore: 'Teatro Pubblico Ligure',
      },
      {
        evento: 'Concerto "Note di Mare"',
        tipologia: 'Concerto',
        dataInizio: '11/07',
        dataFine: '11/07',
        orario: '21:00',
        luogo: 'Porto di Ventimiglia',
        organizzatore: 'Comune di Ventimiglia',
      },
      {
        evento: 'Festival "albintimilium theatrum fest" 2024',
        tipologia: 'Spettacolo teatrale',
        dataInizio: '11/07',
        dataFine: '11/07',
        orario: '21:00',
        luogo: 'Teatro Romano di Ventimiglia',
        organizzatore: 'Teatro Pubblico Ligure',
      },
      {
        evento: 'Pasta & Basta Street Basket',
        tipologia: 'Manifestazione',
        dataInizio: '13/07',
        dataFine: '13/07',
        orario: 'Tutto il giorno',
        luogo: 'Porto di Cala del Forte',
        organizzatore: 'Comune di Ventimiglia',
      },
      {
        evento: 'Melodie dal Piccolo Schermo',
        tipologia: 'Concerto',
        dataInizio: '18/07',
        dataFine: '18/07',
        orario: '21:00',
        luogo: 'Piazza della Cattedrale - Ventimiglia Alta',
        organizzatore: 'Banda Musicale "Città di Ventimiglia"',
      },
      {
        evento: 'Sulle orme del Corsaro Nero',
        tipologia: 'Manifestazione',
        dataInizio: '20/07',
        dataFine: '20/07',
        orario: '17:00-24:00',
        luogo: 'Centro storico di Ventimiglia',
        organizzatore: 'Comune di Ventimiglia',
      },
      {
        evento: 'Giovani Solisti in Concerto',
        tipologia: 'Concerto',
        dataInizio: '22/07',
        dataFine: '22/07',
        orario: '21:00',
        luogo: 'Chiostro di Sant\'Agostino - Ventimiglia',
        organizzatore: 'Giovane orchestra note libere',
      },
      {
        evento: 'Massimo Wertmuller - IL VIAGGIO DI ENEA',
        tipologia: 'Spettacolo teatrale',
        dataInizio: '07/08',
        dataFine: '07/08',
        orario: '21:00',
        luogo: 'Teatro Romano di Ventimiglia',
        organizzatore: 'Teatro Pubblico Ligure',
      },
      {
        evento: 'Siamo tutti cittadini del mondo',
        tipologia: 'Conferenza',
        dataInizio: '04/10',
        dataFine: '04/10',
        orario: 'TBD',
        luogo: 'Ventimiglia',
        organizzatore: 'Comune di Ventimiglia',
      },
      {
        evento: 'Gran Gala\' dell\'Operetta',
        tipologia: 'Spettacolo',
        dataInizio: '24/11',
        dataFine: '24/11',
        orario: '17:30',
        luogo: 'Teatro Comunale Ventimiglia',
        organizzatore: 'Teatro Comunale',
      },
      {
        evento: 'Luci',
        tipologia: 'Spettacolo',
        dataInizio: '15/12',
        dataFine: '15/12',
        orario: 'TBD',
        luogo: 'Teatro Comunale Ventimiglia',
        organizzatore: 'Tetrao Comunale - Comune di Ventimiglia',
      },
    ]

    comuneEvents.forEach((eventData, index) => {
      const [day, month] = eventData.dataInizio.split('/')
      const eventDate = new Date(currentYear, parseInt(month) - 1, parseInt(day))
      
      // Se l'evento è già passato quest'anno, spostalo all'anno prossimo
      if (eventDate < now) {
        eventDate.setFullYear(currentYear + 1)
      }

      const endDate = new Date(eventDate)
      if (eventData.dataFine && eventData.dataFine !== eventData.dataInizio) {
        const [endDay, endMonth] = eventData.dataFine.split('/')
        endDate.setMonth(parseInt(endMonth) - 1)
        endDate.setDate(parseInt(endDay))
      }

      events.push({
        id: `ventimiglia-${index}`,
        comune: 'Ventimiglia',
        evento: eventData.evento,
        tipologia: eventData.tipologia,
        dataInizio: eventData.dataInizio,
        dataFine: eventData.dataFine,
        orario: eventData.orario,
        luogo: eventData.luogo,
        organizzatore: eventData.organizzatore,
        start: eventDate,
        end: endDate,
        allDay: !eventData.orario || eventData.orario === 'Tutto il giorno',
      })
    })

    return events
  }

  const processEvents = (data: any[]): MarketEvent[] => {
    const processed: MarketEvent[] = []
    const now = new Date()

    // Aggiungi eventi hardcoded del comune
    const comuneEvents = getVentimigliaEvents()
    processed.push(...comuneEvents)

    data.forEach((row, index) => {
      // Normalizza i nomi delle colonne (potrebbero avere spazi o maiuscole/minuscole diverse)
      let comune = row.Comune || row.comune || ''
      const evento = row.Evento || row.evento || ''
      const tipologia = row.Tipologia || row.tipologia || ''
      const giorno = row['Giorno ricorrente'] || row['Giorno'] || row.giorno || ''
      const dataInizio = row['Data inizio'] || row['Data Inizio'] || row['data inizio'] || ''
      const dataFine = row['Data fine'] || row['Data Fine'] || row['data fine'] || ''
      const mese = row.Mese || row.mese || ''
      const orario = row.Orario || row.orario || ''
      const luogo = row.Luogo || row.luogo || ''
      const organizzatore = row.Organizzatore || row.organizzatore || ''
      const settoriMerceologici = row['Settori merceologici'] || row['Settori Merceologici'] || ''

      // Normalizza il nome del comune (rimuovi spazi extra, standardizza maiuscole/minuscole)
      comune = comune.trim()
      // Standardizza "Ventimiglia" (gestisce variazioni come "VENTIMIGLIA", "ventimiglia", ecc.)
      if (comune.toLowerCase() === 'ventimiglia') {
        comune = 'Ventimiglia'
      }

      // FILTRO: Mostra solo eventi di Ventimiglia
      if (comune.toLowerCase() !== 'ventimiglia') {
        return
      }

      // Salta righe vuote o senza dati essenziali
      if (!comune && !evento) {
        return
      }

      // Rimuovi "00" o "0" all'inizio del nome evento (gestisce sia "00 Mercatino" che "0 Gran Gala")
      const cleanEventName = (name: string): string => {
        return name.replace(/^0+\s*/, '').trim()
      }

      const event: MarketEvent = {
        id: `event-${index}`,
        comune,
        evento: cleanEventName(evento || tipologia || 'Evento senza nome'),
        tipologia,
        giorno,
        dataInizio,
        dataFine,
        mese,
        orario,
        luogo,
        organizzatore,
        settoriMerceologici,
      }

      // Genera date per eventi ricorrenti o specifici
      const dates = generateEventDates(event, now)
      dates.forEach((dateRange) => {
        processed.push({
          ...event,
          id: `${event.id}-${dateRange.start.getTime()}`,
          start: dateRange.start,
          end: dateRange.end,
          allDay: !event.orario,
        })
      })
    })

    console.log('Eventi processati:', processed.length, processed)
    return processed
  }

  const generateEventDates = (
    event: MarketEvent,
    startDate: Date
  ): Array<{ start: Date; end: Date }> => {
    const dates: Array<{ start: Date; end: Date }> = []
    const monthsToGenerate = 12

    // Se c'è un giorno ricorrente, genera eventi ricorrenti
    if (event.giorno && event.giorno.trim() !== '') {
      const giornoText = event.giorno.toLowerCase().trim()
      
      // Evento ricorrente settimanale (es: ogni domenica, ogni sabato)
      const dayNames = [
        'domenica',
        'lunedì',
        'martedì',
        'mercoledì',
        'giovedì',
        'venerdì',
        'sabato',
      ]
      const dayNamesShort = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']
      
      // Estrai occorrenze specifiche (es: "2° e 4° sabato", "ogni 2° e 4° sabato", "2° e 4° sabato del mese")
      // NOTA: Google Sheets può salvare "°" come "^", quindi cerchiamo entrambi
      // Cerca TUTTI i numeri seguiti da "°" o "^" nel testo (es: "2°", "4°", "2^", "4^")
      const allMatches = Array.from(giornoText.matchAll(/(\d+)\s*[°^]/gi))
      const occurrences: number[] = []
      
      // Se troviamo almeno un numero con "°" o "^", significa che ci sono occorrenze specifiche
      const hasSpecificOccurrences = allMatches.length > 0
      
      if (hasSpecificOccurrences) {
        // Estrai tutti i numeri trovati
        allMatches.forEach((match) => {
          if (match[1]) {
            const num = parseInt(match[1])
            if (num > 0 && num <= 5) { // Limita a 5 (massimo 5 sabati in un mese)
              occurrences.push(num)
            }
          }
        })
        // Rimuovi duplicati e ordina
        const uniqueOccurrences = [...new Set(occurrences)].sort((a, b) => a - b)
        occurrences.length = 0
        occurrences.push(...uniqueOccurrences)
      }
      
      console.log(`Giorno: "${giornoText}", Occorrenze trovate:`, occurrences, 'hasSpecificOccurrences:', hasSpecificOccurrences)
      
      // Trova il giorno della settimana
      let targetDay = -1
      for (const dayName of dayNames) {
        if (giornoText.includes(dayName)) {
          targetDay = dayNames.indexOf(dayName)
          break
        }
      }
      if (targetDay === -1) {
        for (const dayNameShort of dayNamesShort) {
          if (giornoText.includes(dayNameShort)) {
            targetDay = dayNamesShort.indexOf(dayNameShort)
            break
          }
        }
      }

      if (targetDay !== -1) {
        // Genera per i prossimi N mesi
        for (let monthOffset = 0; monthOffset < monthsToGenerate; monthOffset++) {
          const currentMonth = new Date(
            startDate.getFullYear(),
            startDate.getMonth() + monthOffset,
            1
          )
          
          // Trova tutte le occorrenze del giorno nel mese
          const daysInMonth = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            0
          ).getDate()

          const monthOccurrences: Date[] = []
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            )
            if (date.getDay() === targetDay) {
              monthOccurrences.push(date)
            }
          }
          
          // Se ci sono occorrenze specifiche (es: 2° e 4°), filtra SOLO quelle
          if (hasSpecificOccurrences && occurrences.length > 0) {
            occurrences.forEach((occ) => {
              // occ è 1-based (1° = primo, 2° = secondo, ecc.)
              // monthOccurrences[0] = primo sabato, monthOccurrences[1] = secondo sabato, ecc.
              const index = occ - 1
              if (index >= 0 && index < monthOccurrences.length) {
                const date = monthOccurrences[index]
                if (date >= startDate) {
                  dates.push({
                    start: new Date(date),
                    end: new Date(date),
                  })
                }
              }
            })
          } else {
            // Altrimenti aggiungi tutte le occorrenze del giorno (solo se NON ci sono occorrenze specifiche)
            // Questo è il caso di "sabato" senza numeri
            monthOccurrences.forEach((date) => {
              if (date >= startDate) {
                dates.push({
                  start: new Date(date),
                  end: new Date(date),
                })
              }
            })
          }
        }
      }
    }

    // Se ci sono date specifiche, aggiungi anche quelle
    if (event.dataInizio && event.dataInizio.trim() !== '' && event.dataInizio !== 'ricorrente') {
      const startParts = event.dataInizio.trim().split('/')
      const endParts = event.dataFine && event.dataFine.trim() !== '' 
        ? event.dataFine.trim().split('/')
        : startParts

      if (startParts.length >= 2) {
        const startDay = parseInt(startParts[0])
        const startMonth = parseInt(startParts[1]) - 1
        const startYear = startParts.length === 3 
          ? parseInt(startParts[2]) 
          : startDate.getFullYear()

        let endDay = startDay
        let endMonth = startMonth
        let endYear = startYear

        if (endParts.length >= 2) {
          endDay = parseInt(endParts[0])
          endMonth = parseInt(endParts[1]) - 1
          endYear = endParts.length === 3 
            ? parseInt(endParts[2]) 
            : startYear
        }

        const eventStart = new Date(startYear, startMonth, startDay)
        const eventEnd = new Date(endYear, endMonth, endDay)

        // Aggiungi solo se l'evento è nel futuro o in corso
        if (eventEnd >= startDate) {
          dates.push({
            start: eventStart,
            end: eventEnd,
          })
        }
      }
    }

    return dates
  }

  const toggleFavorite = (eventId: string) => {
    const newFavorites = favorites.includes(eventId)
      ? favorites.filter((id) => id !== eventId)
      : [...favorites, eventId]

    setFavorites(newFavorites)
    if (typeof window !== 'undefined') {
      localStorage.setItem('eventFavorites', JSON.stringify(newFavorites))
    }
  }

  const favoriteEvents = filteredEvents.filter((e) => favorites.includes(e.id))
  const upcomingEvents = filteredEvents
    .filter((e) => e.start && e.start >= new Date())
    .sort((a, b) => (a.start!.getTime() - b.start!.getTime()))
    .slice(0, 5)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Calendar className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Calendario Eventi Ventimiglia</h1>
        </div>
        <p className="text-gray-600">
          Eventi ufficiali del Comune di Ventimiglia - Filtra per categoria
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Caricamento eventi...</p>
        </div>
      ) : (
        <>
          <EventFilters
            events={events}
            filters={filters}
            onFiltersChange={setFilters}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <CalendarComponent
                events={filteredEvents}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            </div>
            <div className="space-y-6">
              <UpcomingEvents events={upcomingEvents} />
              {favoriteEvents.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Preferiti ({favoriteEvents.length})
                  </h2>
                  <div className="space-y-2">
                    {favoriteEvents.slice(0, 5).map((event) => (
                      <div
                        key={event.id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900 text-sm">{event.evento}</h3>
                        <p className="text-xs text-gray-600">{event.comune}</p>
                        {event.start && (
                          <p className="text-xs text-gray-500 mt-1">
                            {event.start.toLocaleDateString('it-IT')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

