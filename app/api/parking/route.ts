import { NextRequest, NextResponse } from 'next/server'

// Funzione per calcolare distanza in metri usando formula Haversine
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000 // Raggio Terra in metri
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: NextRequest) {
  try {
    // SOLO Google Places - fonte affidabile con nomi reali
    const MARKET_CENTER = {
      lat: 43.7885,
      lng: 7.6060,
    }
    
    const MAX_DISTANCE_FROM_MARKET = 2000 // metri - parcheggi vicini al mercato (2km max come richiesto)
    
    const baseUrl = request.nextUrl.origin
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!googleApiKey) {
      return NextResponse.json({
        success: false,
        error: 'Google Maps API key non configurata',
        message: 'Aggiungi NEXT_PUBLIC_GOOGLE_MAPS_API_KEY al file .env.local',
      }, { status: 500 })
    }

    // Fetch da Google Places
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 secondi timeout
    
    let googleResponse: Response
    try {
      googleResponse = await fetch(`${baseUrl}/api/parking/nearby?lat=${MARKET_CENTER.lat}&lng=${MARKET_CENTER.lng}&radius=${MAX_DISTANCE_FROM_MARKET}`, {
        cache: 'no-store',
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          success: true,
          data: [],
          city: 'Ventimiglia',
          source: 'Google Places',
          lastUpdated: new Date().toISOString(),
          count: 0,
          warning: 'Timeout nel caricamento parcheggi',
        })
      }
      throw fetchError
    }
    
    if (!googleResponse.ok) {
      return NextResponse.json({
        success: true,
        data: [],
        city: 'Ventimiglia',
        source: 'Google Places',
        lastUpdated: new Date().toISOString(),
        count: 0,
        warning: `Errore HTTP: ${googleResponse.status}`,
      })
    }
    
    const googleData = await googleResponse.json()
    
    if (!googleData || !Array.isArray(googleData.data)) {
      return NextResponse.json({
        success: true,
        data: [],
        city: 'Ventimiglia',
        source: 'Google Places',
        lastUpdated: new Date().toISOString(),
        count: 0,
        warning: 'Formato dati non valido',
      })
    }

    // Filtra solo parcheggi vicini al mercato e deduplica
    const allParkings: any[] = []
    const seenPositions: Array<{ lat: number; lng: number; parking: any }> = []
    const DUPLICATE_THRESHOLD = 30 // metri - se due parcheggi sono a meno di 30m, sono duplicati
    
    // Funzione per verificare se un parcheggio è duplicato
    const isDuplicate = (lat: number, lng: number): { isDuplicate: boolean; existing?: any } => {
      for (const seen of seenPositions) {
        const distance = calculateDistance(lat, lng, seen.lat, seen.lng)
        if (distance < DUPLICATE_THRESHOLD) {
          return { isDuplicate: true, existing: seen.parking }
        }
      }
      return { isDuplicate: false }
    }
    
    googleData.data.forEach((p: any) => {
      if (!p.location || !p.location.lat || !p.location.lng) return
      
      const distance = calculateDistance(
        MARKET_CENTER.lat,
        MARKET_CENTER.lng,
        p.location.lat,
        p.location.lng
      )
      
      if (distance <= MAX_DISTANCE_FROM_MARKET) {
        const duplicate = isDuplicate(p.location.lat, p.location.lng)
        
        if (!duplicate.isDuplicate) {
          p.distance = distance
          p.source = 'google'
          allParkings.push(p)
          seenPositions.push({ lat: p.location.lat, lng: p.location.lng, parking: p })
        }
      }
    })
    
    // Ordina per distanza dal mercato
    allParkings.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0))
    
    console.log(`API: ✅ ${allParkings.length} parcheggi Google Places trovati vicino al mercato`)

    return NextResponse.json({
      success: true,
      data: allParkings,
      city: 'Ventimiglia',
      source: 'Google Places',
      lastUpdated: new Date().toISOString(),
      count: allParkings.length,
      marketCenter: MARKET_CENTER,
      maxDistance: MAX_DISTANCE_FROM_MARKET,
      message: allParkings.length === 0 
        ? 'Nessun parcheggio trovato vicino al mercato'
        : `${allParkings.length} parcheggi trovati vicino al mercato`,
    })
  } catch (error) {
    console.error('Errore nel caricamento parcheggi:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel caricamento parcheggi',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
