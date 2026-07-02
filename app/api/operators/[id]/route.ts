import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireOperatorAccess } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('operators')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Operatore non trovato' }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Ammessi: proprietario della scheda (dashboard operatore) o admin del mercato.
  const guard = await requireOperatorAccess(params.id)
  if (!guard.ok) return guard.res
  const supabase = guard.supabase
  const body = await request.json()
  const allowed = [
    'name', 'code', 'category', 'description', 'stall_number',
    'location_lat', 'location_lng',
    'photos', 'languages', 'payment_methods', 'social_links',
    'rating',
  ]
  const update: Record<string, unknown> = {}
  for (const k of allowed) if (k in body) update[k] = body[k]

  const { data, error } = await supabase
    .from('operators')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  // L'eliminazione è riservata agli admin (l'operatore non cancella la propria scheda).
  const guard = await requireOperatorAccess(params.id)
  if (!guard.ok) return guard.res
  if (!guard.isAdmin) return NextResponse.json({ error: 'Operazione riservata agli amministratori' }, { status: 403 })
  const supabase = guard.supabase
  const { error } = await supabase.from('operators').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
