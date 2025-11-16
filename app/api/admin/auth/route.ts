import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Forza rendering dinamico
export const dynamic = 'force-dynamic'

// Password di accesso per admin
const ADMIN_PASSWORD = 'ADMIN123'

// Durata sessione: 24 ore
const SESSION_DURATION = 24 * 60 * 60 * 1000

/**
 * Verifica se l'admin è autenticato
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('admin_session')
    
    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }
    
    // Verifica che il token sia valido (non scaduto)
    const sessionData = JSON.parse(sessionToken.value)
    const now = Date.now()
    
    if (now > sessionData.expires) {
      // Sessione scaduta
      cookieStore.delete('admin_session')
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }
    
    return NextResponse.json({ authenticated: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}

/**
 * Login admin
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email e password richieste' },
        { status: 400 }
      )
    }
    
    // Verifica password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Password non corretta' },
        { status: 401 }
      )
    }
    
    // Crea sessione
    const cookieStore = cookies()
    const sessionData = {
      authenticated: true,
      email,
      expires: Date.now() + SESSION_DURATION,
      createdAt: Date.now(),
    }
    
    cookieStore.set('admin_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000, // in secondi
      path: '/',
    })
    
    return NextResponse.json({
      success: true,
      message: 'Accesso effettuato con successo',
    })
  } catch (error) {
    console.error('Errore nel login admin:', error)
    return NextResponse.json(
      { success: false, error: 'Errore nel login' },
      { status: 500 }
    )
  }
}

/**
 * Logout admin
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()
    cookieStore.delete('admin_session')
    
    return NextResponse.json({
      success: true,
      message: 'Logout effettuato con successo',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Errore nel logout' },
      { status: 500 }
    )
  }
}

