import { NextRequest, NextResponse } from 'next/server'

// Forza rendering dinamico (non statico) perché usiamo nextUrl.origin
export const dynamic = 'force-dynamic'

// Importa direttamente la logica da nearby invece di fare una chiamata HTTP
// Questo evita problemi con le chiamate interne su Netlify
async function getParkingFromGooglePlaces(lat: number, lng: number, radius: number) {
  // Usa una chiave API separata per le chiamate server-side (senza restrizioni referer)
  // Se non disponibile, usa quella pubblica come fallback
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error('Google Places API key non configurata. Configura GOOGLE_PLACES_API_KEY per le chiamate server-side.')
  }

  console.log(`[API] Ricerca parcheggi: lat=${lat}, lng=${lng}, radius=${radius}`)

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
    console.log(`[API] Text Search: ${query}`)
    return fetch(textSearchUrl.toString())
  })
  
  // Anche Nearby Search per tipo "parking"
  const nearbySearchUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
  nearbySearchUrl.searchParams.set('location', `${lat},${lng}`)
  nearbySearchUrl.searchParams.set('radius', Math.min(radius, 2000).toString())
  nearbySearchUrl.searchParams.set('type', 'parking')
  nearbySearchUrl.searchParams.set('key', apiKey)
  console.log(`[API] Nearby Search: type=parking`)
  
  // Esegui tutte le ricerche in parallelo
  let textSearchResponses: Response[]
  let nearbySearchResponse: Response
  
  try {
    [textSearchResponses, nearbySearchResponse] = await Promise.all([
      Promise.all(textSearchPromises),
      fetch(nearbySearchUrl.toString()),
    ])
  } catch (fetchError) {
    console.error('[API] Errore nelle chiamate Google Places:', fetchError)
    throw fetchError
  }
  
  const textSearchDataArray = await Promise.all(
    textSearchResponses.map(async (r, index) => {
      const data = await r.json()
      console.log(`[API] Text Search ${index + 1} (${queries[index]}): status=${data.status}, results=${data.results?.length || 0}`)
      if (data.status !== 'OK' && data.error_message) {
        console.error(`[API] Text Search ${index + 1} error:`, data.error_message)
      }
      return data
    })
  )
  
  const nearbySearchData = await nearbySearchResponse.json()
  console.log(`[API] Nearby Search: status=${nearbySearchData.status}, results=${nearbySearchData.results?.length || 0}`)
  if (nearbySearchData.status !== 'OK' && nearbySearchData.error_message) {
    console.error('[API] Nearby Search error:', nearbySearchData.error_message)
  }
  
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

  console.log(`[API] Totale risultati Google Places: ${allResults.length}`)

  // Calcola moltiplicatore traffico una volta per tutti i parcheggi
  const trafficMultiplier = calculateTrafficMultiplier()
  
  // Converti i risultati in formato Parking
  const parkings = allResults.map((place: any) => {
    if (!place.geometry || !place.geometry.location) {
      console.warn('[API] Place senza geometry:', place)
      return null
    }
    
    const distance = calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
    const isPaid = place.rating ? place.rating > 3 : undefined
    
    // Determina tipo di parcheggio (se possibile dal nome o rating)
    let parkingType: 'municipal' | 'private' = 'private'
    const placeName = place.name?.toLowerCase() || ''
    if (placeName.includes('comunale') || placeName.includes('municipal') || placeName.includes('comune')) {
      parkingType = 'municipal'
    }
    
    // Calcola pricing
    const pricing = calculateParkingPricing(parkingType, isPaid, trafficMultiplier)
    
    // Formatta fee string in base al pricing
    let feeString = 'Indefinito'
    if (isPaid === false) {
      feeString = 'Gratuito'
    } else if (pricing) {
      // Mostra il costo attuale se disponibile
      feeString = `${pricing.currentHourlyRate.toFixed(2)}€/h`
      if (pricing.trafficMultiplier > 1.0) {
        feeString += ` (alta domanda)`
      }
    }
    
    return {
      id: `google_${place.place_id}`,
      name: place.name,
      address: place.formatted_address || place.vicinity || 'Indirizzo non disponibile',
      type: parkingType,
      paid: isPaid,
      fee: feeString,
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
      pricing, // Aggiungi informazioni dettagliate sui costi
    }
  }).filter((p: any) => p !== null) // Rimuovi null

  console.log(`[API] Parcheggi convertiti: ${parkings.length}`)
  return parkings
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

/**
 * Calcola il moltiplicatore del traffico basato su ora del giorno e giorno della settimana
 * Venerdì = mercato = traffico molto alto
 */
function calculateTrafficMultiplier(): number {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay() // 0 = Domenica, 5 = Venerdì
  const isFriday = dayOfWeek === 5
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  let multiplier = 1.0 // Base: traffico normale
  
  // Fattore orario: picchi di traffico
  if (hour >= 7 && hour <= 9) {
    // Mattina: traffico alto
    multiplier = 1.3
  } else if (hour >= 12 && hour <= 14) {
    // Pranzo: traffico medio-alto
    multiplier = 1.2
  } else if (hour >= 17 && hour <= 19) {
    // Sera: traffico alto
    multiplier = 1.4
  } else if (hour >= 22 || hour <= 6) {
    // Notte: traffico basso
    multiplier = 0.9
  }
  
  // Venerdì = mercato = traffico molto alto
  if (isFriday && hour >= 6 && hour <= 14) {
    multiplier *= 1.5 // Aumenta ulteriormente durante il mercato
  }
  
  // Weekend: traffico medio-alto
  if (isWeekend && hour >= 10 && hour <= 18) {
    multiplier = Math.max(multiplier, 1.2)
  }
  
  return Math.round(multiplier * 100) / 100 // Arrotonda a 2 decimali
}

/**
 * Calcola i costi del parcheggio in base al tipo e al traffico
 */
function calculateParkingPricing(
  type: 'municipal' | 'private',
  isPaid: boolean | undefined,
  trafficMultiplier: number
): {
  hourlyRate: number
  dailyRate: number
  currentHourlyRate: number
  currentDailyRate: number
  trafficMultiplier: number
  lastUpdated: string
} | undefined {
  // Se non è a pagamento, non restituire pricing
  if (isPaid === false) {
    return undefined
  }
  
  // Costi base per tipo di parcheggio (in euro)
  // Basati su tariffe tipiche italiane per parcheggi
  let baseHourlyRate: number
  let baseDailyRate: number
  
  if (type === 'municipal') {
    // Parcheggi comunali: generalmente più economici
    baseHourlyRate = 1.5
    baseDailyRate = 10
  } else {
    // Parcheggi privati: generalmente più costosi
    baseHourlyRate = 2.0
    baseDailyRate = 12
  }
  
  // Calcola costi attuali in base al traffico
  // Il moltiplicatore può aumentare i prezzi fino al 50% in caso di alto traffico
  const currentHourlyRate = Math.round(baseHourlyRate * trafficMultiplier * 100) / 100
  const currentDailyRate = Math.round(baseDailyRate * trafficMultiplier * 100) / 100
  
  return {
    hourlyRate: baseHourlyRate,
    dailyRate: baseDailyRate,
    currentHourlyRate,
    currentDailyRate,
    trafficMultiplier,
    lastUpdated: new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    // SOLO Google Places - fonte affidabile con nomi reali
    const MARKET_CENTER = {
      lat: 43.7885,
      lng: 7.6060,
    }
    
    const MAX_DISTANCE_FROM_MARKET = 2000 // metri - parcheggi vicini al mercato (2km max)
    
    // Usa una chiave API separata per le chiamate server-side (senza restrizioni referer)
    // Se non disponibile, usa quella pubblica come fallback
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!googleApiKey) {
      console.error('GOOGLE_PLACES_API_KEY o NEXT_PUBLIC_GOOGLE_MAPS_API_KEY non configurata')
      return NextResponse.json({
        success: false,
        error: 'Google Places API key non configurata',
        message: 'Aggiungi GOOGLE_PLACES_API_KEY (senza restrizioni referer) alle variabili d\'ambiente su Netlify per le chiamate server-side',
      }, { status: 500 })
    }

    // Chiama direttamente la funzione invece di fare una chiamata HTTP
    console.log('[API] Inizio ricerca parcheggi Google Places...')
    const allParkings = await getParkingFromGooglePlaces(
      MARKET_CENTER.lat,
      MARKET_CENTER.lng,
      MAX_DISTANCE_FROM_MARKET
    )
    console.log(`[API] Parcheggi ricevuti da Google Places: ${allParkings.length}`)

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
      if (!p.location || !p.location.lat || !p.location.lng) {
        console.warn('[API] Parcheggio senza location valida:', p)
        return
      }
      
      const distance = p.distance || calculateDistance(
        MARKET_CENTER.lat,
        MARKET_CENTER.lng,
        p.location.lat,
        p.location.lng
      )
      
      if (distance > MAX_DISTANCE_FROM_MARKET) {
        console.log(`[API] Parcheggio ${p.name} troppo lontano: ${distance.toFixed(0)}m > ${MAX_DISTANCE_FROM_MARKET}m`)
        return
      }
      
      if (isDuplicate(p.location.lat, p.location.lng)) {
        console.log(`[API] Parcheggio ${p.name} duplicato`)
        return
      }
      
      p.distance = distance
      filteredParkings.push(p)
      seenPositions.push({ lat: p.location.lat, lng: p.location.lng, parking: p })
    })
    
    // Ordina per distanza dal mercato
    filteredParkings.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0))
    
    console.log(`[API] ✅ ${filteredParkings.length} parcheggi Google Places trovati vicino al mercato (su ${allParkings.length} totali)`)
    
    if (filteredParkings.length === 0 && allParkings.length > 0) {
      console.warn(`[API] ⚠️ Tutti i ${allParkings.length} parcheggi sono stati filtrati!`)
      console.warn('[API] Primi 3 parcheggi raw:', allParkings.slice(0, 3).map((p: any) => ({
        name: p.name,
        location: p.location,
        distance: p.distance,
      })))
    }

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
