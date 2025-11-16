import { NextRequest, NextResponse } from 'next/server'

interface GooglePlaceResult {
  place_id: string
  name: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  vicinity?: string
  formatted_address?: string
  rating?: number
  user_ratings_total?: number
  types?: string[]
  business_status?: string
}

interface GooglePlacesResponse {
  results: GooglePlaceResult[]
  status: string
  error_message?: string
  next_page_token?: string
}

/**
 * Converte un risultato Google Places in un oggetto Parking
 */
function convertGooglePlaceToParking(
  place: GooglePlaceResult,
  searchLocation?: { lat: number; lng: number }
): any {
  // Calcola la distanza se abbiamo la posizione di ricerca
  let distance: number | undefined
  if (searchLocation) {
    distance = calculateDistance(
      searchLocation.lat,
      searchLocation.lng,
      place.geometry.location.lat,
      place.geometry.location.lng
    )
  }

  // Determina se è a pagamento (basato su tipi o rating)
  // In genere i parcheggi pubblici hanno rating più bassi
  // Se non siamo certi, consideriamo come indefinito
  const isPaid = place.rating ? place.rating > 3 : undefined
  
  // Determina tipo di parcheggio (se possibile dal nome)
  let parkingType: 'municipal' | 'private' = 'private'
  const placeName = place.name?.toLowerCase() || ''
  if (placeName.includes('comunale') || placeName.includes('municipal') || placeName.includes('comune')) {
    parkingType = 'municipal'
  }
  
  // Calcola moltiplicatore traffico
  const trafficMultiplier = calculateTrafficMultiplier()
  
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
  
  // Stima disponibilità basata su traffico
  const availability = estimateAvailability()
  
  // Verifica se è vicino al fiume Roja
  const nearRiver = isNearRojaRiver(
    place.geometry.location.lat,
    place.geometry.location.lng
  )

  return {
    id: `google_${place.place_id}`,
    name: place.name,
    address: place.formatted_address || place.vicinity || 'Indirizzo non disponibile',
    type: parkingType,
    paid: isPaid,
    fee: feeString,
    hours: 'Orari da verificare',
    availableSpots: availability.availableSpots,
    totalSpots: availability.totalSpots,
    location: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    },
    accessible: false, // Da verificare manualmente o con Place Details API
    hasRestrooms: false,
    placeId: place.place_id,
    rating: place.rating,
    userRatingsTotal: place.user_ratingsTotal,
    distance,
    nearRiver, // Flag per parcheggi vicini al fiume Roja
    source: 'google' as const,
    pricing, // Aggiungi informazioni dettagliate sui costi
  }
}

/**
 * Centro di Ventimiglia (mercato del venerdì)
 */
const VENTIMIGLIA_CENTER = {
  lat: 43.7885,
  lng: 7.6060,
}

/**
 * Area del fiume Roja a Ventimiglia
 * Il fiume Roja passa attraverso Ventimiglia, vicino al centro storico
 * Coordinate approssimative del corso del fiume nella zona del mercato
 */
const ROJA_RIVER_BOUNDS = {
  // Area lungo il fiume Roja (approssimativa)
  minLat: 43.785,
  maxLat: 43.792,
  minLng: 7.605,
  maxLng: 7.615,
}

/**
 * Verifica se un parcheggio è vicino al fiume Roja
 */
function isNearRojaRiver(lat: number, lng: number): boolean {
  // Verifica se è nell'area del fiume Roja
  if (lat >= ROJA_RIVER_BOUNDS.minLat && lat <= ROJA_RIVER_BOUNDS.maxLat &&
      lng >= ROJA_RIVER_BOUNDS.minLng && lng <= ROJA_RIVER_BOUNDS.maxLng) {
    return true
  }
  return false
}

/**
 * Raggio massimo per considerare una posizione "vicina" a Ventimiglia (10km)
 */
const MAX_DISTANCE_FROM_VENTIMIGLIA = 10000 // 10km in metri

/**
 * Calcola la distanza tra due punti in metri usando la formula di Haversine
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Raggio della Terra in metri
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Verifica se una posizione è vicina a Ventimiglia
 */
function isNearVentimiglia(lat: number, lng: number): boolean {
  const distance = calculateDistance(
    lat,
    lng,
    VENTIMIGLIA_CENTER.lat,
    VENTIMIGLIA_CENTER.lng
  )
  return distance <= MAX_DISTANCE_FROM_VENTIMIGLIA
}

/**
 * Verifica se una posizione è probabilmente in acqua (troppo vicina alla costa)
 * Ventimiglia è sulla costa, quindi latitudini troppo basse sono probabilmente in mare
 * RILASSATO: esclude solo posizioni chiaramente in mare aperto
 */
function isLikelyInWater(lat: number, lng: number): boolean {
  // Area marina chiara: lat < 43.785 e lng < 7.600 (mare aperto)
  if (lat < 43.785 && lng < 7.600) return true
  
  // Area portuale/marina: coordinate specifiche nel mare
  // Escludi area marina a sud-ovest di Ventimiglia (mare aperto)
  if (lat < 43.786 && lng < 7.595) return true
  
  // Escludi area marina a sud-est (mare aperto)
  if (lat < 43.780 && lng > 7.620) return true
  
  return false
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

/**
 * Stima la disponibilità di parcheggio basandosi su traffico e ora
 * Suggerimento basato su dati di traffico Google Maps
 */
function estimateAvailability(): { availableSpots: number; totalSpots: number } {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay() // 0 = Domenica, 5 = Venerdì
  
  // Base: stima un parcheggio medio con 50 posti
  let baseTotal = 50
  let baseAvailable = 30
  
  // Fattore giorno: Venerdì = mercato = più traffico
  const isFriday = dayOfWeek === 5
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  // Fattore orario: picchi di traffico
  let trafficFactor = 1.0
  if (hour >= 7 && hour <= 9) {
    // Mattina: traffico alto
    trafficFactor = 0.6
  } else if (hour >= 12 && hour <= 14) {
    // Pranzo: traffico medio-alto
    trafficFactor = 0.7
  } else if (hour >= 17 && hour <= 19) {
    // Sera: traffico alto
    trafficFactor = 0.5
  } else if (hour >= 22 || hour <= 6) {
    // Notte: traffico basso
    trafficFactor = 0.9
  }
  
  // Venerdì = mercato = traffico molto alto
  if (isFriday && hour >= 6 && hour <= 14) {
    trafficFactor *= 0.4 // Riduce ancora di più la disponibilità
  }
  
  // Calcola disponibilità stimata
  const estimatedAvailable = Math.max(0, Math.floor(baseAvailable * trafficFactor))
  
  return {
    availableSpots: estimatedAvailable,
    totalSpots: baseTotal,
  }
}

// Forza rendering dinamico (non statico) perché usiamo searchParams
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') || '1000' // default 1km

    // Validazione parametri
    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Parametri lat e lng sono richiesti' },
        { status: 400 }
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)
    const radiusMeters = parseInt(radius)

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
      return NextResponse.json(
        { success: false, error: 'Parametri non validi' },
        { status: 400 }
      )
    }

    // Verifica che la posizione sia vicina a Ventimiglia
    if (!isNearVentimiglia(latitude, longitude)) {
      return NextResponse.json(
        {
          success: false,
          error: 'La ricerca è limitata solo all\'area di Ventimiglia',
        },
        { status: 400 }
      )
    }

    // Forza sempre l'uso del centro di Ventimiglia per la ricerca
    // Questo garantisce che i risultati siano sempre relativi a Ventimiglia
    const searchLat = VENTIMIGLIA_CENTER.lat
    const searchLng = VENTIMIGLIA_CENTER.lng

    // Verifica che la chiave API sia configurata
    // Usa una chiave API separata per le chiamate server-side (senza restrizioni referer)
    // Se non disponibile, usa quella pubblica come fallback
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Chiave API Google Places non configurata',
          message: 'Configura GOOGLE_PLACES_API_KEY (senza restrizioni referer) per le chiamate server-side'
        },
        { status: 500 }
      )
    }

    // Usa Text Search API per cercare "parcheggio" e "porto" a Ventimiglia
    // Questo trova più risultati rispetto a Nearby Search con type="parking"
    const queries = [
      'parcheggio Ventimiglia',
      'porto Ventimiglia',
      'parking Ventimiglia',
    ]
    
    // Esegui ricerche testuali multiple
    const textSearchPromises = queries.map(query => {
      const textSearchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
      textSearchUrl.searchParams.set('query', query)
      textSearchUrl.searchParams.set('location', `${searchLat},${searchLng}`)
      textSearchUrl.searchParams.set('radius', Math.min(radiusMeters, 2000).toString()) // Max 2km dal mercato
      textSearchUrl.searchParams.set('key', apiKey)
      return fetch(textSearchUrl.toString())
    })
    
    // Anche Nearby Search per tipo "parking" per avere più risultati
    const nearbySearchUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    nearbySearchUrl.searchParams.set('location', `${searchLat},${searchLng}`)
    nearbySearchUrl.searchParams.set('radius', Math.min(radiusMeters, 2000).toString()) // Max 2km dal mercato
    nearbySearchUrl.searchParams.set('type', 'parking')
    nearbySearchUrl.searchParams.set('key', apiKey)
    
    // Esegui tutte le ricerche in parallelo
    const [textSearchResponses, nearbySearchResponse] = await Promise.all([
      Promise.all(textSearchPromises),
      fetch(nearbySearchUrl.toString()),
    ])
    
    const textSearchDataArray: GooglePlacesResponse[] = await Promise.all(
      textSearchResponses.map(r => r.json())
    )
    const nearbySearchData: GooglePlacesResponse = await nearbySearchResponse.json()
    
    // Combina i risultati da tutte le ricerche
    let allResults: GooglePlaceResult[] = []
    const seenPlaceIds = new Set<string>()
    
    // Aggiungi risultati da tutte le Text Search
    textSearchDataArray.forEach((textSearchData) => {
      if (textSearchData.status === 'OK' && textSearchData.results) {
        textSearchData.results.forEach((result) => {
          if (!seenPlaceIds.has(result.place_id)) {
            allResults.push(result)
            seenPlaceIds.add(result.place_id)
          }
        })
      }
    })
    
    // Aggiungi risultati da Nearby Search
    if (nearbySearchData.status === 'OK' && nearbySearchData.results) {
      nearbySearchData.results.forEach((result) => {
        if (!seenPlaceIds.has(result.place_id)) {
          allResults.push(result)
          seenPlaceIds.add(result.place_id)
        }
      })
    }
    
    // Pagination per la prima Text Search se disponibile (solo per "parcheggio Ventimiglia")
    const firstTextSearchData = textSearchDataArray[0]
    let nextPageToken = firstTextSearchData?.next_page_token
    let pageCount = 0
    const maxPages = 1 // Limita a 1 pagina aggiuntiva per non superare i limiti
    
    while (nextPageToken && pageCount < maxPages) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Delay richiesto da Google
      
      const pageUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
      pageUrl.searchParams.set('pagetoken', nextPageToken)
      pageUrl.searchParams.set('key', apiKey)
      
      const pageResponse = await fetch(pageUrl.toString())
      const pageData: GooglePlacesResponse = await pageResponse.json()
      
      if (pageData.status === 'OK' && pageData.results) {
        pageData.results.forEach((result) => {
          if (!seenPlaceIds.has(result.place_id)) {
            allResults.push(result)
            seenPlaceIds.add(result.place_id)
          }
        })
        nextPageToken = pageData.next_page_token
        pageCount++
      } else {
        break
      }
    }
    
    // Usa tutti i risultati invece di solo data.results
    const data: GooglePlacesResponse = {
      results: allResults,
      status: allResults.length > 0 ? 'OK' : 'ZERO_RESULTS',
    }

    // Converti i risultati in formato Parking
    // Usa il centro di Ventimiglia per calcolare le distanze
    const searchLocation = { lat: searchLat, lng: searchLng }
    
    // Parole da escludere nei nomi (banche, negozi, etc.)
    const excludedKeywords = [
      'banca', 'bank', 'banco', 'bper', 'intesa', 'unicredit', 'credito',
      'negozio', 'shop', 'store', 'supermercato', 'supermarket',
      'ristorante', 'restaurant', 'bar', 'caffè', 'cafe',
      'hotel', 'albergo', 'b&b', 'bed and breakfast',
      'farmacia', 'pharmacy', 'ospedale', 'hospital',
      'scuola', 'school', 'chiesa', 'church', 'cattedrale',
      'museo', 'museum', 'teatro', 'theater', 'cinema',
      'ufficio', 'office', 'agenzia', 'agency',
      'stazione', 'station', 'fermata', 'stop',
      'marina', 'yacht', // Non escludere "porto" e "port" - sono parcheggi validi
      'spiaggia', 'beach', 'lido', 'bagno',
      'trasbordo', 'transit', 'transfer', // Escludi aree di trasbordo
      'cala del forte', // Escludi specificamente questo (spiaggia/marina)
      'alex car', // Escludi specificamente questo (concessionario)
    ]
    
    // Tipi validi per parcheggi (solo quelli che sono chiaramente parcheggi)
    const validParkingTypes = [
      'parking', 'parking_lot', 'parking_garage', 'parking_space',
    ]
    
    // Tipi da escludere sempre (non sono parcheggi)
    // NOTA: Non escludiamo 'establishment' e 'point_of_interest' perché Google li usa anche per i parcheggi
    const excludedTypes = [
      'bank', 'atm', 'finance', 'accounting',
      'store', 'shopping_mall', 'supermarket', 'grocery_or_supermarket',
      'restaurant', 'food', 'cafe', 'bar',
      'lodging', 'hotel', 'bed_and_breakfast',
      'pharmacy', 'hospital', 'doctor',
      'school', 'university', 'church', 'place_of_worship',
      'museum', 'tourist_attraction', 'amusement_park',
      'train_station', 'transit_station', 'bus_station',
      'marina', 'harbor', // Non escludere "port" - potrebbe essere un parcheggio del porto
      'beach', 'natural_feature',
      'car_rental', 'car_repair', 'car_wash', // Escludi solo questi, non car_dealer (potrebbe essere parcheggio)
    ]
    
    let filteredCount = 0
    const parkings = data.results
      .filter((place) => {
        const placeLat = place.geometry.location.lat
        const placeLng = place.geometry.location.lng
        const placeName = place.name.toLowerCase()
        
        // 1. Verifica coordinate valide
        if (isNaN(placeLat) || isNaN(placeLng)) {
          filteredCount++
          return false
        }
        
        // 2. Filtra posizioni in acqua (solo quelle chiaramente in mare aperto)
        // Rilassato: escludi solo se è chiaramente in mare aperto
        if (isLikelyInWater(placeLat, placeLng)) {
          console.log(`Filtrato (acqua): ${place.name} (${placeLat}, ${placeLng})`)
          filteredCount++
          return false
        }
        
        // 3. Escludi se è oltre 2km dal mercato del venerdì
        const distance = calculateDistance(
          VENTIMIGLIA_CENTER.lat,
          VENTIMIGLIA_CENTER.lng,
          placeLat,
          placeLng
        )
        if (distance > 2000) {
          console.log(`Filtrato (troppo lontano dal mercato): ${place.name} (${distance.toFixed(0)}m)`)
          filteredCount++
          return false
        }
        
        // 3b. Verifica che sia nell'area di Ventimiglia (bounds ristretti intorno al mercato)
        // Bounds per area mercato del venerdì (2km di raggio)
        // Lat: 43.775-43.800, Lng: 7.590-7.625
        if (placeLat < 43.775 || placeLat > 43.800 || placeLng < 7.590 || placeLng > 7.625) {
          console.log(`Filtrato (fuori bounds mercato): ${place.name} (${placeLat}, ${placeLng})`)
          filteredCount++
          return false
        }
        
        // 4. Filtra per tipi - escludi solo tipi chiaramente non validi (banche, negozi, etc.)
        if (place.types && place.types.length > 0) {
          const hasExcludedType = place.types.some(type => 
            excludedTypes.some(excludedType => type.includes(excludedType))
          )
          if (hasExcludedType) {
            console.log(`Filtrato (tipo non valido): ${place.name} (types: ${place.types.join(', ')})`)
            filteredCount++
            return false
          }
        }
        
        // 5. Escludi se il nome contiene parole escluse (banche, negozi, etc.)
        // MA solo se non contiene anche "parking" o "parcheggio"
        const hasExcludedKeyword = excludedKeywords.some(keyword => 
          placeName.includes(keyword)
        )
        const hasParkingKeyword = placeName.includes('parking') || placeName.includes('parcheggio')
        
        if (hasExcludedKeyword && !hasParkingKeyword) {
          console.log(`Filtrato (parola esclusa): ${place.name}`)
          filteredCount++
          return false
        }
        
        // 6. Escludi "Cala del Forte" e "Alex car" specificamente (non sono parcheggi)
        if (placeName.includes('cala del forte') || placeName.includes('alex car')) {
          console.log(`Filtrato (nome specifico): ${place.name}`)
          filteredCount++
          return false
        }
        
        // 7. Escludi banche specificamente (anche se hanno "parking" nel nome, non sono parcheggi)
        if (placeName.includes('bper') || placeName.includes('banca popolare') || 
            placeName.includes('intesa') || placeName.includes('unicredit') ||
            placeName.includes('credito')) {
          console.log(`Filtrato (banca): ${place.name}`)
          filteredCount++
          return false
        }
        
        return true
      })
      .map((place) => convertGooglePlaceToParking(place, searchLocation))
    
    console.log(`Google Places: ${data.results.length} risultati, ${filteredCount} filtrati, ${parkings.length} parcheggi validi`)

    // Ordina per distanza (più vicini prima)
    parkings.sort((a, b) => {
      const distA = a.distance || Infinity
      const distB = b.distance || Infinity
      return distA - distB
    })

    return NextResponse.json({
      success: true,
      data: parkings,
      count: parkings.length,
      searchLocation: { lat: searchLat, lng: searchLng },
      radius: Math.min(radiusMeters, 5000),
    })
  } catch (error) {
    console.error('Errore nella ricerca parcheggi:', error)
    return NextResponse.json(
      { success: false, error: 'Errore nel caricamento parcheggi' },
      { status: 500 }
    )
  }
}

