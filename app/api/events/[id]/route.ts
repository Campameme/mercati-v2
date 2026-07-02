import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, type Guard } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

// Guardia sull'evento esistente: serve essere admin del suo mercato.
async function guardByEvent(eventId: string): Promise<Guard> {
  const { data: existing } = await createClient()
    .from('events')
    .select('id, market_id')
    .eq('id', eventId)
    .maybeSingle()
  if (!existing) return { ok: false, res: NextResponse.json({ error: 'Evento non trovato' }, { status: 404 }) }
  return requireAdmin({ marketId: existing.market_id })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await guardByEvent(params.id)
  if (!guard.ok) return guard.res
  const supabase = guard.supabase
  const body = await request.json()
  const allowed = ['title', 'description', 'category', 'location', 'start_at', 'end_at', 'is_recurring', 'recurrence_rule']
  const update: Record<string, unknown> = {}
  for (const k of allowed) if (k in body) update[k] = body[k]
  const { data, error } = await supabase.from('events').update(update).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await guardByEvent(params.id)
  if (!guard.ok) return guard.res
  const supabase = guard.supabase
  const { error } = await supabase.from('events').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
