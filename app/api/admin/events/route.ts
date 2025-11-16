import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { MarketEvent } from '@/types/event'

// Forza rendering dinamico
export const dynamic = 'force-dynamic'

// Dati eventi - in produzione verrà da database
let eventsData: MarketEvent[] = [
  {
    id: '1',
    comune: 'Ventimiglia',
    evento: 'Mercato del Venerdì',
    tipologia: 'Mercato settimanale',
    giorno: 'venerdì',
    dataInizio: 'ricorrente',
    dataFine: 'ricorrente',
    orario: '8:00 - 14:00',
    luogo: 'Area Mercato, Ventimiglia',
  },
  {
    id: '2',
    comune: 'Ventimiglia',
    evento: 'Mercato del Gusto',
    tipologia: 'Evento speciale',
    dataInizio: '20/01',
    dataFine: '20/01',
    orario: '10:00 - 18:00',
    luogo: 'Area Mercato, Ventimiglia',
  },
]

/**
 * Verifica autenticazione admin
 */
async function checkAuth(): Promise<boolean> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('admin_session')
    
    if (!sessionToken) {
      return false
    }
    
    const sessionData = JSON.parse(sessionToken.value)
    const now = Date.now()
    
    if (now > sessionData.expires) {
      cookieStore.delete('admin_session')
      return false
    }
    
    return true
  } catch (error) {
    return false
  }
}

/**
 * GET - Lista tutti gli eventi (pubblico)
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: eventsData,
      count: eventsData.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Errore nel caricamento eventi' },
      { status: 500 }
    )
  }
}

/**
 * POST - Crea nuovo evento (protetto)
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Non autenticato' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const newEvent: Omit<MarketEvent, 'id'> = body
    
    // Valida dati
    if (!newEvent.comune || !newEvent.evento || !newEvent.tipologia) {
      return NextResponse.json(
        { success: false, error: 'Comune, evento e tipologia sono obbligatori' },
        { status: 400 }
      )
    }
    
    // Genera ID univoco
    const newId = String(Math.max(...eventsData.map(e => parseInt(e.id) || 0)) + 1)
    const event: MarketEvent = {
      id: newId,
      ...newEvent,
    }
    
    eventsData.push(event)
    
    return NextResponse.json({
      success: true,
      data: event,
      message: 'Evento creato con successo',
    })
  } catch (error) {
    console.error('Errore nella creazione evento:', error)
    return NextResponse.json(
      { success: false, error: 'Errore nella creazione evento' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Aggiorna evento esistente (protetto)
 */
export async function PUT(request: NextRequest) {
  try {
    // Verifica autenticazione
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Non autenticato' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID evento richiesto' },
        { status: 400 }
      )
    }
    
    const eventIndex = eventsData.findIndex(e => e.id === id)
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Evento non trovato' },
        { status: 404 }
      )
    }
    
    // Aggiorna evento
    eventsData[eventIndex] = {
      ...eventsData[eventIndex],
      ...updateData,
      id, // Mantieni l'ID originale
    }
    
    return NextResponse.json({
      success: true,
      data: eventsData[eventIndex],
      message: 'Evento aggiornato con successo',
    })
  } catch (error) {
    console.error('Errore nell\'aggiornamento evento:', error)
    return NextResponse.json(
      { success: false, error: 'Errore nell\'aggiornamento evento' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Elimina evento (protetto)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verifica autenticazione
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Non autenticato' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID evento richiesto' },
        { status: 400 }
      )
    }
    
    const eventIndex = eventsData.findIndex(e => e.id === id)
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Evento non trovato' },
        { status: 404 }
      )
    }
    
    eventsData.splice(eventIndex, 1)
    
    return NextResponse.json({
      success: true,
      message: 'Evento eliminato con successo',
    })
  } catch (error) {
    console.error('Errore nell\'eliminazione evento:', error)
    return NextResponse.json(
      { success: false, error: 'Errore nell\'eliminazione evento' },
      { status: 500 }
    )
  }
}

