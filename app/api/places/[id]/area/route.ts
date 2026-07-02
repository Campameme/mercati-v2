import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('market_places')
    .select('id, market_id, comune, luogo, lat, lng, polygon_geojson, area_style')
    .eq('id', params.id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Luogo non trovato' }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Disegnare l'area è un'operazione admin, scopata sul mercato del luogo.
  const { data: place } = await createClient()
    .from('market_places')
    .select('id, market_id')
    .eq('id', params.id)
    .maybeSingle()
  if (!place) return NextResponse.json({ error: 'Luogo non trovato' }, { status: 404 })
  const guard = await requireAdmin({ marketId: place.market_id })
  if (!guard.ok) return guard.res
  const supabase = guard.supabase

  const body = await request.json()
  const polygon = body.polygon_geojson ?? null
  const style = body.style ?? null

  const update: Record<string, unknown> = {
    polygon_geojson: polygon,
    updated_at: new Date().toISOString(),
  }
  if (style) update.area_style = style

  const { data, error } = await supabase
    .from('market_places')
    .update(update)
    .eq('id', params.id)
    .select('id, polygon_geojson, area_style')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
