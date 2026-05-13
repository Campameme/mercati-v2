import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .eq('id', params.id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const body = await request.json()
  const allowed = ['slug', 'name', 'city', 'description', 'center_lat', 'center_lng', 'default_zoom', 'default_zoom_operators', 'market_days', 'timezone', 'is_active']
  const update: Record<string, unknown> = {}
  for (const k of allowed) if (k in body) update[k] = body[k]

  const { data, error } = await supabase
    .from('markets')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Cascade fisico: se cambia is_active sulla zona, propaga lo stesso
  // valore a tutte le market_schedules figlie. Garantisce che spegnere/riaccendere
  // una zona modifichi anche fisicamente lo stato delle sessioni (più intuitivo
  // di un filtro virtuale: l'admin vede subito coerenza tra zona e sessioni).
  let sessionsUpdated = 0
  if ('is_active' in update) {
    const { data: cascaded, error: cascadeErr } = await supabase
      .from('market_schedules')
      .update({ is_active: update.is_active })
      .eq('market_id', params.id)
      .select('id')
    if (cascadeErr) {
      // non bloccante: la zona è già stata aggiornata
      console.warn('Cascade is_active to schedules failed:', cascadeErr)
    } else {
      sessionsUpdated = (cascaded ?? []).length
    }
  }

  return NextResponse.json({ data, sessionsUpdated })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { error } = await supabase.from('markets').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
