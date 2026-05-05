import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Lista piatta delle sessioni mercato (market_schedules), con info del market parent.
// Query params:
//   ?marketId=<uuid>  → filtra per mercato
//   ?marketSlug=<s>   → filtra per slug mercato
//   ?all=1            → tutte le sessioni della provincia
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const marketId = searchParams.get('marketId')
  const marketSlug = searchParams.get('marketSlug')

  let query = supabase
    .from('market_schedules')
    .select('id, market_id, place_id, comune, giorno, orario, luogo, settori, lat, lng, polygon_geojson, area_style, is_active, markets(slug, name, city), market_places(polygon_geojson)')
    .eq('is_active', true)
    .order('comune', { ascending: true })
    .order('giorno', { ascending: true })

  if (marketId) query = query.eq('market_id', marketId)
  if (marketSlug) {
    const { data: m } = await supabase.from('markets').select('id').ilike('slug', marketSlug).maybeSingle()
    if (!m) return NextResponse.json({ data: [] })
    query = query.eq('market_id', m.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const shaped = (data ?? []).map((s: any) => {
    const placePolygon = s.market_places?.polygon_geojson ?? null
    return {
      id: s.id,
      marketId: s.market_id,
      marketSlug: s.markets?.slug ?? null,
      marketName: s.markets?.name ?? null,
      marketCity: s.markets?.city ?? null,
      placeId: s.place_id ?? null,
      comune: s.comune,
      giorno: s.giorno,
      orario: s.orario,
      luogo: s.luogo,
      settori: s.settori,
      lat: s.lat,
      lng: s.lng,
      polygon: placePolygon ?? s.polygon_geojson ?? null,
      placePolygon,
      style: s.area_style ?? null,
    }
  })
  return NextResponse.json({ data: shaped })
}
