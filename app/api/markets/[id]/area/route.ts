import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function haversineKm(a: [number, number], b: [number, number]): number {
  const [lat1, lng1] = a, [lat2, lng2] = b
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('market_areas')
    .select('*')
    .eq('market_id', params.id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const body = await request.json()
  const { polygon_geojson, style } = body

  if (!polygon_geojson || polygon_geojson.type !== 'Feature' || polygon_geojson.geometry?.type !== 'Polygon') {
    return NextResponse.json({ error: 'polygon_geojson deve essere un Feature<Polygon>' }, { status: 400 })
  }
  const ring = polygon_geojson.geometry.coordinates?.[0]
  if (!Array.isArray(ring) || ring.length < 4) {
    return NextResponse.json({ error: 'Il poligono deve avere almeno 3 vertici (4 punti chiusi)' }, { status: 400 })
  }

  const { data: market, error: marketErr } = await supabase
    .from('markets')
    .select('center_lat, center_lng')
    .eq('id', params.id)
    .single()
  if (marketErr || !market) {
    return NextResponse.json({ error: 'Mercato non trovato' }, { status: 404 })
  }
  const center: [number, number] = [market.center_lat, market.center_lng]
  for (const [lng, lat] of ring) {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Coordinate non valide' }, { status: 400 })
    }
    if (haversineKm(center, [lat, lng]) > 5) {
      return NextResponse.json({ error: 'Poligono troppo distante dal centro del mercato (>5km)' }, { status: 400 })
    }
  }

  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('market_areas')
    .upsert({
      market_id: params.id,
      polygon_geojson,
      style: style ?? undefined,
      updated_by: user?.id ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { error } = await supabase.from('market_areas').delete().eq('market_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
