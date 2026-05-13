import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('market_schedules')
    .select('id, market_id, place_id, comune, giorno, orario, luogo, settori, lat, lng, is_active, polygon_geojson')
    .eq('id', params.id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Sessione non trovata' }, { status: 404 })
  return NextResponse.json({ data })
}

// PATCH per toggle is_active + altri campi editabili.
// L'autenticazione/authorization è già garantita da middleware (admin only) + RLS.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const body = await request.json()
  const allowed = ['is_active', 'orario', 'settori', 'giorno', 'luogo']
  const update: Record<string, unknown> = {}
  for (const k of allowed) if (k in body) update[k] = body[k]
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('market_schedules')
    .update(update)
    .eq('id', params.id)
    .select('id, is_active')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
