import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Lista i luoghi (places) di un market con le sessioni associate.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('market_places')
    .select('id, comune, luogo, lat, lng, polygon_geojson, market_schedules(id, giorno, orario)')
    .eq('market_id', params.id)
    .order('comune', { ascending: true })
    .order('luogo', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const shaped = (data ?? []).map((p: any) => ({
    id: p.id,
    comune: p.comune,
    luogo: p.luogo,
    lat: p.lat,
    lng: p.lng,
    polygon_geojson: p.polygon_geojson ?? null,
    schedules: (p.market_schedules ?? []).map((s: any) => ({
      id: s.id,
      giorno: s.giorno,
      orario: s.orario,
    })),
  }))
  return NextResponse.json({ data: shaped })
}
