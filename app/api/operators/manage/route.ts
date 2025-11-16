import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Operator } from '@/types/operator'

// Forza rendering dinamico
export const dynamic = 'force-dynamic'

// Dati operatori - in produzione verrà da database
// Per ora usiamo un array in memoria (in produzione sarà un database)
let operatorsData: Operator[] = [
  {
    id: '1',
    name: 'Frutti e Verdura di Maria',
    category: 'food',
    description: 'Frutta e verdura fresca di stagione, prodotti locali e biologici',
    photos: [],
    languages: ['it', 'fr'],
    paymentMethods: ['cash', 'card'],
    socialLinks: {},
    location: {
      lat: 43.7888,
      lng: 7.6068,
      stallNumber: 'A01',
    },
    isOpen: true,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Pesce Fresco del Golfo',
    category: 'food',
    description: 'Pesce fresco del giorno, crostacei e frutti di mare',
    photos: [],
    languages: ['it', 'fr'],
    paymentMethods: ['cash', 'card'],
    socialLinks: {},
    location: {
      lat: 43.7886,
      lng: 7.6065,
      stallNumber: 'A05',
    },
    isOpen: true,
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Formaggi e Salumi Liguri',
    category: 'food',
    description: 'Formaggi locali, salumi artigianali e specialità liguri',
    photos: [],
    languages: ['it'],
    paymentMethods: ['cash', 'card'],
    socialLinks: {},
    location: {
      lat: 43.7885,
      lng: 7.6062,
      stallNumber: 'A10',
    },
    isOpen: true,
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Moda & Accessori',
    category: 'clothing',
    description: 'Abbigliamento, borse e accessori moda',
    photos: [],
    languages: ['it', 'fr', 'en'],
    paymentMethods: ['cash', 'card', 'digital'],
    socialLinks: {
      instagram: '@modaventimiglia',
    },
    location: {
      lat: 43.7883,
      lng: 7.6059,
      stallNumber: 'B03',
    },
    isOpen: true,
    rating: 4.5,
  },
  {
    id: '5',
    name: 'Fiori e Piante',
    category: 'flowers',
    description: 'Fiori freschi, piante da giardino e da appartamento',
    photos: [],
    languages: ['it', 'fr'],
    paymentMethods: ['cash', 'card'],
    socialLinks: {},
    location: {
      lat: 43.7882,
      lng: 7.6060,
      stallNumber: 'C02',
    },
    isOpen: true,
    rating: 4.6,
  },
]

/**
 * Verifica autenticazione
 */
async function checkAuth(): Promise<boolean> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('operator_session')
    
    if (!sessionToken) {
      return false
    }
    
    const sessionData = JSON.parse(sessionToken.value)
    const now = Date.now()
    
    if (now > sessionData.expires) {
      cookieStore.delete('operator_session')
      return false
    }
    
    return true
  } catch (error) {
    return false
  }
}

/**
 * GET - Lista tutti gli operatori (protetto)
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Non autenticato' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: operatorsData,
      count: operatorsData.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Errore nel caricamento operatori' },
      { status: 500 }
    )
  }
}

/**
 * POST - Crea nuovo operatore (protetto)
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
    const newOperator: Operator = body
    
    // Valida dati
    if (!newOperator.name || !newOperator.category) {
      return NextResponse.json(
        { success: false, error: 'Nome e categoria sono obbligatori' },
        { status: 400 }
      )
    }
    
    // Genera ID univoco
    const newId = String(Math.max(...operatorsData.map(op => parseInt(op.id) || 0)) + 1)
    newOperator.id = newId
    
    // Valori di default
    if (!newOperator.photos) newOperator.photos = []
    if (!newOperator.languages) newOperator.languages = ['it']
    if (!newOperator.paymentMethods) newOperator.paymentMethods = ['cash']
    if (!newOperator.socialLinks) newOperator.socialLinks = {}
    if (newOperator.isOpen === undefined) newOperator.isOpen = true
    
    operatorsData.push(newOperator)
    
    return NextResponse.json({
      success: true,
      data: newOperator,
      message: 'Operatore creato con successo',
    })
  } catch (error) {
    console.error('Errore nella creazione operatore:', error)
    return NextResponse.json(
      { success: false, error: 'Errore nella creazione operatore' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Aggiorna operatore esistente (protetto)
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
        { success: false, error: 'ID operatore richiesto' },
        { status: 400 }
      )
    }
    
    const operatorIndex = operatorsData.findIndex(op => op.id === id)
    
    if (operatorIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Operatore non trovato' },
        { status: 404 }
      )
    }
    
    // Aggiorna operatore
    operatorsData[operatorIndex] = {
      ...operatorsData[operatorIndex],
      ...updateData,
      id, // Mantieni l'ID originale
    }
    
    return NextResponse.json({
      success: true,
      data: operatorsData[operatorIndex],
      message: 'Operatore aggiornato con successo',
    })
  } catch (error) {
    console.error('Errore nell\'aggiornamento operatore:', error)
    return NextResponse.json(
      { success: false, error: 'Errore nell\'aggiornamento operatore' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Elimina operatore (protetto)
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
        { success: false, error: 'ID operatore richiesto' },
        { status: 400 }
      )
    }
    
    const operatorIndex = operatorsData.findIndex(op => op.id === id)
    
    if (operatorIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Operatore non trovato' },
        { status: 404 }
      )
    }
    
    operatorsData.splice(operatorIndex, 1)
    
    return NextResponse.json({
      success: true,
      message: 'Operatore eliminato con successo',
    })
  } catch (error) {
    console.error('Errore nell\'eliminazione operatore:', error)
    return NextResponse.json(
      { success: false, error: 'Errore nell\'eliminazione operatore' },
      { status: 500 }
    )
  }
}

