import { createClient } from '@/lib/supabase/server'

export interface ResolvedMarket {
  id: string
  slug: string
  name: string
  city: string
  center_lat: number
  center_lng: number
  market_days: number[]
}

/**
 * Resolve a market from query params: ?marketSlug=foo OR ?lat=..&lng=..
 * Falls back to Ventimiglia (slug='ventimiglia') if neither provided.
 * Returns null if a specific slug was given but not found.
 */
export async function resolveMarketFromRequest(searchParams: URLSearchParams): Promise<
  | { kind: 'market'; market: ResolvedMarket }
  | { kind: 'coords'; lat: number; lng: number; city: string }
  | { kind: 'not_found' }
> {
  const slug = searchParams.get('marketSlug')
  const latStr = searchParams.get('lat')
  const lngStr = searchParams.get('lng')
  const city = searchParams.get('city') ?? 'Italia'

  if (latStr && lngStr) {
    const lat = parseFloat(latStr)
    const lng = parseFloat(lngStr)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { kind: 'coords', lat, lng, city }
    }
  }

  const supabase = createClient()
  const targetSlug = (slug ?? 'ventimiglia').trim()
  const { data } = await supabase
    .from('markets')
    .select('id, slug, name, city, center_lat, center_lng, market_days')
    .ilike('slug', targetSlug)
    .maybeSingle()

  if (!data) return { kind: 'not_found' }
  return { kind: 'market', market: data as ResolvedMarket }
}
