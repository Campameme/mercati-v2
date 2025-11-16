import { NextRequest, NextResponse } from 'next/server'

// Forza rendering dinamico (non statico) perché usiamo nextUrl.origin
export const dynamic = 'force-dynamic'

// Importa direttamente la logica da nearby invece di fare una chiamata HTTP
// Questo evita problemi con le chiamate interne su Netlify
async function getParkingFromGooglePlaces(lat: number, lng: number, radius: number) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error('Google Maps API key non configurata')
  }

  // Usa Text Search API per cercare "parcheggio" e "porto" a Ventimiglia
  const queries = [
    'parcheggio Ventimiglia',
    'porto Ventimiglia',
    'parking Ventimiglia',
  ]
  
  // Esegui ricerche testuali multiple
  const textSearchPromises = queries.map(query => {
    const textSearchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    textSearchUrl.searchParams.set('query', query)
    textSearchUrl.searchParams.set('location', `${lat},${lng}`)
    textSearchUrl.searchParams.set('radius', Math.min(radius, 2000).toString())
    textSearchUrl.searchParams.set('key', apiKey)
    return fetch(textSearchUrl.toString())
  })
  
  // Anche Nearby Search per tipo "parking"
  const nearbySearchUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
  nearbySearchUrl.searchParams.set('location', `${lat},${lng}`)
  nearbySearchUrl.searchParams.set('radius', Math.min(radius, 2000).toString())
  nearbySearchUrl.searchParams.set('type', 'parking')
  nearbySearchUrl.searchParams.set('key', apiKey)
  
  // Esegui tutte le ricerche in parallelo
  const [textSearchResponses, nearbySearchResponse] = await Promise.all([
    Promise.all(textSearchPromises),
    fetch(nearbySearchUrl.toString()),
  ])
  
  const textSearchDataArray = await Promise.all(
    textSearchResponses.map(r => r.json())
  )
  const nearbySearchData = await nearbySearchResponse.json()
  
  // Combina i risultati
  let allResults: any[] = []
  const seenPlaceIds = new Set<string>()
  
  textSearchDataArray.forEach((textSearchData: any) => {
    if (textSearchData.status === 'OK' && textSearchData.results) {
      textSearchData.results.forEach((result: any) => {
        if (!seenPlaceIds.has(result.place_id)) {
          allResults.push(result)
          seenPlaceIds.add(result.place_id)
        }
      })
    }
  })
  
  if (nearbySearchData.status === 'OK' && nearbySearchData.results) {
    nearbySearchData.results.forEach((result: any) => {
      if (!seenPlaceIds.has(result.place_id)) {
        allResults.push(result)
        seenPlaceIds.add(result.place_id)
      }
    })
  }

  // Converti i risultati in formato Parking
  return allResults.map((place: any) => {
    const distance = calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
    const isPaid = place.rating ? place.rating > 3 : undefined
    
    return {
      id: `google_${place.place_id}`,
      name: place.name,
      address: place.formatted_address || place.vicinity || 'Indirizzo non disponibile',
      type: 'private' as const,
      paid: isPaid,
      fee: isPaid === undefined ? 'Indefinito' : (isPaid ? 'Indefinito' : 'Gratuito'),
      hours: 'Orari da verificare',
      availableSpots: 30,
      totalSpots: 50,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      accessible: false,
      hasRestrooms: false,
      placeId: place.place_id,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      distance,
      source: 'google' as const,
    }
  })
}

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
    
    const MAX_DISTANCE_FROM_MARKET = 2000 // metri - parcheggi vicini al mercato (2km max)
    
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!googleApiKey) {
      console.error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY non configurata')
      return NextResponse.json({
        success: false,
        error: 'Google Maps API key non configurata',
        message: 'Aggiungi NEXT_PUBLIC_GOOGLE_MAPS_API_KEY alle variabili d\'ambiente su Netlify',
      }, { status: 500 })
    }

    // Chiama direttamente la funzione invece di fare una chiamata HTTP
    const allParkings = await getParkingFromGooglePlaces(
      MARKET_CENTER.lat,
      MARKET_CENTER.lng,
      MAX_DISTANCE_FROM_MARKET
    )

    // Filtra solo parcheggi vicini al mercato e deduplica
    const filteredParkings: any[] = []
    const seenPositions: Array<{ lat: number; lng: number; parking: any }> = []
    const DUPLICATE_THRESHOLD = 30 // metri
    
    const isDuplicate = (lat: number, lng: number): boolean => {
      for (const seen of seenPositions) {
        const distance = calculateDistance(lat, lng, seen.lat, seen.lng)
        if (distance < DUPLICATE_THRESHOLD) {
          return true
        }
      }
      return false
    }
    
    allParkings.forEach((p: any) => {
      if (!p.location || !p.location.lat || !p.location.lng) return
      
      const distance = p.distance || calculateDistance(
        MARKET_CENTER.lat,
        MARKET_CENTER.lng,
        p.location.lat,
        p.location.lng
      )
      
      if (distance <= MAX_DISTANCE_FROM_MARKET && !isDuplicate(p.location.lat, p.location.lng)) {
        p.distance = distance
        filteredParkings.push(p)
        seenPositions.push({ lat: p.location.lat, lng: p.location.lng, parking: p })
      }
    })
    
    // Ordina per distanza dal mercato
    filteredParkings.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0))
    
    console.log(`API: ✅ ${filteredParkings.length} parcheggi Google Places trovati vicino al mercato`)

    return NextResponse.json({
      success: true,
      data: filteredParkings,
      city: 'Ventimiglia',
      source: 'Google Places',
      lastUpdated: new Date().toISOString(),
      count: filteredParkings.length,
      marketCenter: MARKET_CENTER,
      maxDistance: MAX_DISTANCE_FROM_MARKET,
      message: filteredParkings.length === 0 
        ? 'Nessun parcheggio trovato vicino al mercato'
        : `${filteredParkings.length} parcheggi trovati vicino al mercato`,
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
