import { NextRequest, NextResponse } from 'next/server'
import { resolveMarketFromRequest } from '@/lib/markets/resolve'
import { computeCrowding, getTrafficRatiosCached } from '@/lib/parking/crowding'

export const dynamic = 'force-dynamic'

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// NB: non stimiamo tariffe. Google Places non fornisce dati di prezzo affidabili.
// Restituiamo solo Gratuito / A pagamento / Sconosciuto in base a segnali nel nome.

async function getParkingFromGooglePlaces(lat: number, lng: number, radius: number, city: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) throw new Error('Google Places API key non configurata')

  const queries = [`parcheggio ${city}`, `parking ${city}`]
  const textSearchPromises = queries.map((query) => {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    url.searchParams.set('query', query)
    url.searchParams.set('location', `${lat},${lng}`)
    url.searchParams.set('radius', Math.min(radius, 2000).toString())
    url.searchParams.set('key', apiKey)
    return fetch(url.toString())
  })

  const nearbyUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
  nearbyUrl.searchParams.set('location', `${lat},${lng}`)
  nearbyUrl.searchParams.set('radius', Math.min(radius, 2000).toString())
  nearbyUrl.searchParams.set('type', 'parking')
  nearbyUrl.searchParams.set('key', apiKey)

  const [textResponses, nearbyResponse] = await Promise.all([
    Promise.all(textSearchPromises),
    fetch(nearbyUrl.toString()),
  ])
  const textDataArray = await Promise.all(textResponses.map((r) => r.json()))
  const nearbyData = await nearbyResponse.json()

  const seen = new Set<string>()
  const allResults: any[] = []
  for (const d of textDataArray) {
    if (d.status === 'OK' && d.results) {
      for (const r of d.results) if (!seen.has(r.place_id)) { allResults.push(r); seen.add(r.place_id) }
    }
  }
  if (nearbyData.status === 'OK' && nearbyData.results) {
    for (const r of nearbyData.results) if (!seen.has(r.place_id)) { allResults.push(r); seen.add(r.place_id) }
  }

  return allResults.map((place: any) => {
    if (!place.geometry?.location) return null
    const distance = calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
    const placeName = (place.name ?? '').toLowerCase()
    const parkingType: 'municipal' | 'private' =
      placeName.includes('comunale') || placeName.includes('municipal') || placeName.includes('comune') ? 'municipal' : 'private'

    // Heuristics only from NAME. Unknown by default.
    let paid: boolean | undefined
    if (/\b(gratuito|gratis|libero|free)\b/.test(placeName)) paid = false
    else if (/\b(a pagamento|paid|blu|strisce blu|pay)\b/.test(placeName)) paid = true

    const feeString = paid === false ? 'Gratuito' : paid === true ? 'A pagamento' : 'Tariffa da verificare'

    return {
      id: `google_${place.place_id}`,
      name: place.name,
      address: place.formatted_address || place.vicinity || 'Indirizzo non disponibile',
      type: parkingType,
      paid,
      fee: feeString,
      hours: 'Orari da verificare',
      availableSpots: 30,
      totalSpots: 50,
      location: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
      accessible: false,
      hasRestrooms: false,
      placeId: place.place_id,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      distance,
      source: 'google' as const,
    }
  }).filter((p) => p !== null)
}

// Parsing: ?points=lat1,lng1|lat2,lng2|... (max 12 punti per evitare quote esplosive)
function parsePoints(s: string | null): Array<{ lat: number; lng: number }> {
  if (!s) return []
  return s
    .split('|')
    .map((seg) => {
      const [latStr, lngStr] = seg.split(',')
      const lat = parseFloat(latStr)
      const lng = parseFloat(lngStr)
      return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
    })
    .filter((x): x is { lat: number; lng: number } => x !== null)
    .slice(0, 12)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const MAX_DISTANCE = 1500
    const DUP = 30
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Google Places API key non configurata' }, { status: 500 })
    }

    // === Modalità multi-punto (preferita per zone con più mercati) ===========
    const pointsParam = searchParams.get('points')
    const cityParam = searchParams.get('city') ?? ''
    if (pointsParam) {
      const points = parsePoints(pointsParam)
      if (points.length === 0) {
        return NextResponse.json({ success: false, error: 'points malformato' }, { status: 400 })
      }
      // Lancia in serie per evitare rate-limit Google Places (parallelo causa errori OVER_QUERY_LIMIT
      // con risultati vuoti silenziosi per le chiamate successive).
      const lists: any[][] = []
      for (const p of points) {
        try {
          const list = await getParkingFromGooglePlaces(p.lat, p.lng, MAX_DISTANCE, cityParam || 'Liguria')
          lists.push(list)
        } catch (e) {
          console.warn('Parking fetch failed for point', p, e)
          lists.push([])
        }
      }
      const merged: any[] = []
      const seen: Array<{ lat: number; lng: number }> = []
      for (const list of lists) {
        for (const p of list) {
          if (!p?.location) continue
          // calcola la distanza al pin più vicino (per il filtro 1.5km e per il popup)
          let minDist = Infinity
          for (const pt of points) {
            const d = calculateDistance(pt.lat, pt.lng, p.location.lat, p.location.lng)
            if (d < minDist) minDist = d
          }
          if (minDist > MAX_DISTANCE) continue
          const dup = seen.some((s) => calculateDistance(s.lat, s.lng, p.location.lat, p.location.lng) < DUP)
          if (dup) continue
          p.distance = minDist
          merged.push(p)
          seen.push({ lat: p.location.lat, lng: p.location.lng })
        }
      }
      merged.sort((a, b) => (a.distance || 0) - (b.distance || 0))
      return NextResponse.json({
        success: true,
        data: merged,
        source: 'Google Places (multi-point)',
        points,
        maxDistance: MAX_DISTANCE,
        count: merged.length,
        lastUpdated: new Date().toISOString(),
      })
    }

    // === Modalità single-point (legacy) ======================================
    const resolved = await resolveMarketFromRequest(searchParams)
    if (resolved.kind === 'not_found') {
      return NextResponse.json({ success: false, error: 'Mercato non trovato' }, { status: 404 })
    }
    const lat = resolved.kind === 'market' ? resolved.market.center_lat : resolved.lat
    const lng = resolved.kind === 'market' ? resolved.market.center_lng : resolved.lng
    const city = resolved.kind === 'market' ? resolved.market.city : resolved.city
    const marketDays = resolved.kind === 'market' ? (resolved.market.market_days ?? []) : null

    const allParkings = await getParkingFromGooglePlaces(lat, lng, MAX_DISTANCE, city)
    const filtered: any[] = []
    const seenPositions: Array<{ lat: number; lng: number }> = []

    for (const p of allParkings) {
      if (!p || !p.location) continue
      const distance = p.distance ?? calculateDistance(lat, lng, p.location.lat, p.location.lng)
      if (distance > MAX_DISTANCE) continue
      const dup = seenPositions.some((s) => calculateDistance(s.lat, s.lng, p.location.lat, p.location.lng) < DUP)
      if (dup) continue
      p.distance = distance
      filtered.push(p)
      seenPositions.push({ lat: p.location.lat, lng: p.location.lng })
    }
    filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0))

    try {
      const key = resolved.kind === 'market' ? `slug:${resolved.market.slug}` : `coords:${lat.toFixed(3)},${lng.toFixed(3)}`
      const fiveMinBucket = Math.floor(Date.now() / (5 * 60 * 1000))
      const ratios = await getTrafficRatiosCached(
        `${key}:${fiveMinBucket}`,
        { lat, lng },
        filtered.map((p) => ({ lat: p.location.lat, lng: p.location.lng }))
      )
      filtered.forEach((p, i) => {
        p.crowding = computeCrowding(ratios[i], marketDays)
      })
    } catch (e) {
      console.warn('Crowding enrichment failed:', e)
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      city,
      source: 'Google Places',
      marketCenter: { lat, lng },
      maxDistance: MAX_DISTANCE,
      count: filtered.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Errore nel caricamento parcheggi', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
