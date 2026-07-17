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
  // Clamp/validazione dei campi liberi (l'operatore modifica la propria scheda).
  if (typeof update.name === 'string') update.name = update.name.trim().slice(0, 200)
  if (typeof update.description === 'string') update.description = update.description.slice(0, 2000)
  if (typeof update.currency === 'string') update.currency = update.currency.slice(0, 8)
  if (Array.isArray(update.photos)) update.photos = (update.photos as unknown[]).slice(0, 20)
  if ('price' in update) {
    const p = update.price
    update.price =
      p == null || p === ''
        ? null
        : Number.isFinite(Number(p)) && Number(p) >= 0 && Number(p) <= 1_000_000
          ? Number(p)
          : null
  }
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
