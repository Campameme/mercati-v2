import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireOperatorAccess } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

// Risale all'operatore proprietario del prodotto per applicare la guardia.
async function guardByProduct(productId: string) {
  const { data: prod } = await createClient()
    .from('products')
    .select('id, operator_id')
    .eq('id', productId)
    .maybeSingle()
  if (!prod) return { ok: false as const, res: NextResponse.json({ error: 'Prodotto non trovato' }, { status: 404 }) }
  return requireOperatorAccess(prod.operator_id)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await guardByProduct(params.id)
  if (!guard.ok) return guard.res
  const supabase = guard.supabase
  const body = await request.json()
  const allowed = ['name', 'description', 'price', 'currency', 'photos', 'is_available', 'sort_order']
  const update: Record<string, unknown> = {}
  for (const k of allowed) if (k in body) update[k] = body[k]
  update.updated_at = new Date().toISOString()
  const { data, error } = await supabase
    .from('products')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await guardByProduct(params.id)
  if (!guard.ok) return guard.res
  const supabase = guard.supabase
  const { error } = await supabase.from('products').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
