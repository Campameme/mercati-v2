/**
 * Crowding score per parking lot.
 *
 * Data sources:
 * - Google Distance Matrix API with traffic_model=best_guess → ratio
 *   duration_in_traffic / duration ≈ road congestion near the lot right now
 * - Time-of-day / weekday heuristic (market day peaks)
 *
 * Output: 1 (empty) → 5 (full), with a transparent factor breakdown.
 *
 * NB: this is NOT actual parking occupancy (which Google does not expose).
 * It is a proxy that correlates with how busy driving to the lot feels.
 */

export interface CrowdingFactors {
  trafficRatio?: number
  timeOfDay: number
  isMarketDay: boolean
}

export interface CrowdingResult {
  score: 1 | 2 | 3 | 4 | 5
  level: 'empty' | 'low' | 'medium' | 'high' | 'full'
  factors: CrowdingFactors
  lastUpdated: string
}

const LEVELS: Record<CrowdingResult['score'], CrowdingResult['level']> = {
  1: 'empty',
  2: 'low',
  3: 'medium',
  4: 'high',
  5: 'full',
}

export function timeOfDayHeuristic(marketDays: number[] | null): number {
  const now = new Date()
  const hour = now.getHours()
  const dow = now.getDay()
  let m = 1.0
  if (hour >= 7 && hour <= 9) m = 1.3
  else if (hour >= 12 && hour <= 14) m = 1.2
  else if (hour >= 17 && hour <= 19) m = 1.4
  else if (hour >= 22 || hour <= 6) m = 0.9
  const isMarketToday = !!marketDays?.includes(dow)
  if (isMarketToday && hour >= 6 && hour <= 14) m *= 1.5
  if ((dow === 0 || dow === 6) && hour >= 10 && hour <= 18) m = Math.max(m, 1.2)
  return Math.round(m * 100) / 100
}

function trafficRatioToBand(ratio: number): number {
  if (ratio < 1.1) return 1
  if (ratio < 1.3) return 2
  if (ratio < 1.5) return 3
  if (ratio < 1.8) return 4
  return 5
}

function timeFactorToBand(factor: number): number {
  if (factor <= 1.0) return 1
  if (factor < 1.2) return 2
  if (factor < 1.5) return 3
  if (factor < 1.8) return 4
  return 5
}

export function computeCrowding(
  trafficRatio: number | undefined,
  marketDays: number[] | null
): CrowdingResult {
  const timeOfDay = timeOfDayHeuristic(marketDays)
  const now = new Date()
  const isMarketDay = !!marketDays?.includes(now.getDay())

  const timeBand = timeFactorToBand(timeOfDay)
  const trafficBand = trafficRatio !== undefined ? trafficRatioToBand(trafficRatio) : timeBand
  const combined = trafficBand * 0.6 + timeBand * 0.4
  const score = Math.max(1, Math.min(5, Math.round(combined))) as CrowdingResult['score']

  return {
    score,
    level: LEVELS[score],
    factors: { trafficRatio, timeOfDay, isMarketDay },
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Batched Google Distance Matrix call:
 * 1 origin (market center) × N destinations (parking lots).
 * Returns a list of { duration, duration_in_traffic } aligned with destinations.
 */
export async function fetchTrafficRatios(
  origin: { lat: number; lng: number },
  destinations: Array<{ lat: number; lng: number }>
): Promise<Array<number | undefined>> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey || destinations.length === 0) return destinations.map(() => undefined)

  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
  url.searchParams.set('origins', `${origin.lat},${origin.lng}`)
  url.searchParams.set(
    'destinations',
    destinations.map((d) => `${d.lat},${d.lng}`).join('|')
  )
  url.searchParams.set('mode', 'driving')
  url.searchParams.set('departure_time', 'now')
  url.searchParams.set('traffic_model', 'best_guess')
  url.searchParams.set('key', apiKey)

  try {
    const res = await fetch(url.toString())
    if (!res.ok) return destinations.map(() => undefined)
    const data = await res.json()
    const row = data.rows?.[0]?.elements ?? []
    return destinations.map((_, i) => {
      const e = row[i]
      if (!e || e.status !== 'OK') return undefined
      const dur = e.duration?.value
      const durTraffic = e.duration_in_traffic?.value ?? dur
      if (!dur || dur === 0) return undefined
      return durTraffic / dur
    })
  } catch {
    return destinations.map(() => undefined)
  }
}

// 5-min server-side cache keyed by "slug-or-coords:5minBucket"
type CacheEntry = { ts: number; ratios: Array<number | undefined> }
const cache = new Map<string, CacheEntry>()
const TTL_MS = 5 * 60 * 1000

export async function getTrafficRatiosCached(
  key: string,
  origin: { lat: number; lng: number },
  destinations: Array<{ lat: number; lng: number }>
): Promise<Array<number | undefined>> {
  const now = Date.now()
  const hit = cache.get(key)
  if (hit && now - hit.ts < TTL_MS && hit.ratios.length === destinations.length) {
    return hit.ratios
  }
  const ratios = await fetchTrafficRatios(origin, destinations)
  cache.set(key, { ts: now, ratios })
  return ratios
}
