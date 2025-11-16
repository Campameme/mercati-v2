import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Forza rendering dinamico
export const dynamic = 'force-dynamic'

// Interfaccia NewsItem
interface NewsItem {
  id: string
  title: string
  content: string
  date: string // ISO string
  type: 'schedule' | 'notice' | 'event' | 'emergency'
  priority: 'low' | 'medium' | 'high'
}

// Dati notizie - in produzione verrà da database
let newsData: NewsItem[] = [
  {
    id: '1',
    title: 'Cambio orario mercato domenicale',
    content: 'A partire da domenica prossima, il mercato aprirà alle 7:00 invece delle 8:00. La chiusura rimane invariata alle 14:00.',
    date: new Date('2024-01-15').toISOString(),
    type: 'schedule',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Evento speciale: Mercato del Gusto',
    content: 'Sabato 20 gennaio, dalle 10:00 alle 18:00, si terrà il Mercato del Gusto con degustazioni e prodotti locali.',
    date: new Date('2024-01-18').toISOString(),
    type: 'event',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Avviso: Lavori in corso',
    content: 'Si informa che dal 22 al 25 gennaio saranno effettuati lavori di manutenzione nell\'area nord del mercato. Alcune bancarelle saranno temporaneamente spostate.',
    date: new Date('2024-01-20').toISOString(),
    type: 'notice',
    priority: 'medium',
  },
  {
    id: '4',
    title: 'Allerta meteo: Vento forte previsto',
    content: 'Mercoledì 24 gennaio è previsto vento forte. Si consiglia agli operatori di assicurare le proprie bancarelle.',
    date: new Date('2024-01-22').toISOString(),
    type: 'emergency',
    priority: 'high',
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
 * GET - Lista tutte le notizie (pubblico)
 */
export async function GET(request: NextRequest) {
  try {
    // Ordina per data (più recenti prima)
    const sortedNews = [...newsData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    return NextResponse.json({
      success: true,
      data: sortedNews,
      count: sortedNews.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Errore nel caricamento notizie' },
      { status: 500 }
    )
  }
}

/**
 * POST - Crea nuova notizia (protetto)
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
    const newNews: Omit<NewsItem, 'id'> = body
    
    // Valida dati
    if (!newNews.title || !newNews.content || !newNews.type || !newNews.priority) {
      return NextResponse.json(
        { success: false, error: 'Titolo, contenuto, tipo e priorità sono obbligatori' },
        { status: 400 }
      )
    }
    
    // Genera ID univoco
    const newId = String(Math.max(...newsData.map(n => parseInt(n.id) || 0)) + 1)
    const newsItem: NewsItem = {
      id: newId,
      ...newNews,
      date: newNews.date || new Date().toISOString(),
    }
    
    newsData.push(newsItem)
    
    return NextResponse.json({
      success: true,
      data: newsItem,
      message: 'Notizia creata con successo',
    })
  } catch (error) {
    console.error('Errore nella creazione notizia:', error)
    return NextResponse.json(
      { success: false, error: 'Errore nella creazione notizia' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Aggiorna notizia esistente (protetto)
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
        { success: false, error: 'ID notizia richiesto' },
        { status: 400 }
      )
    }
    
    const newsIndex = newsData.findIndex(n => n.id === id)
    
    if (newsIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Notizia non trovata' },
        { status: 404 }
      )
    }
    
    // Aggiorna notizia
    newsData[newsIndex] = {
      ...newsData[newsIndex],
      ...updateData,
      id, // Mantieni l'ID originale
    }
    
    return NextResponse.json({
      success: true,
      data: newsData[newsIndex],
      message: 'Notizia aggiornata con successo',
    })
  } catch (error) {
    console.error('Errore nell\'aggiornamento notizia:', error)
    return NextResponse.json(
      { success: false, error: 'Errore nell\'aggiornamento notizia' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Elimina notizia (protetto)
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
        { success: false, error: 'ID notizia richiesto' },
        { status: 400 }
      )
    }
    
    const newsIndex = newsData.findIndex(n => n.id === id)
    
    if (newsIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Notizia non trovata' },
        { status: 404 }
      )
    }
    
    newsData.splice(newsIndex, 1)
    
    return NextResponse.json({
      success: true,
      message: 'Notizia eliminata con successo',
    })
  } catch (error) {
    console.error('Errore nell\'eliminazione notizia:', error)
    return NextResponse.json(
      { success: false, error: 'Errore nell\'eliminazione notizia' },
      { status: 500 }
    )
  }
}

