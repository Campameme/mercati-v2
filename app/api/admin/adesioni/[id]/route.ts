import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

const ALLOWED_STATI = new Set(['nuovo', 'in_contatto', 'aderito', 'scartato'])

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const supabase = guard.supabase
  const body = await request.json()
  const update: Record<string, unknown> = {}
  if (typeof body.stato === 'string' && ALLOWED_STATI.has(body.stato)) update.stato = body.stato
  if (typeof body.note_admin === 'string') update.note_admin = body.note_admin.slice(0, 2000)
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nessun campo valido' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('adesioni_operatori')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const supabase = guard.supabase
  const { error } = await supabase.from('adesioni_operatori').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
