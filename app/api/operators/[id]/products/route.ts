import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireOperatorAccess } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('operator_id', params.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // Ammessi: proprietario della scheda operatore o admin del suo mercato.
  const guard = await requireOperatorAccess(params.id)
  if (!guard.ok) return guard.res
  const supabase = guard.supabase
  const body = await request.json()
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : ''
  if (!name) return NextResponse.json({ error: 'name obbligatorio' }, { status: 400 })
  // Prezzo: numero finito e non negativo, altrimenti null (campo opzionale).
  const price =
    body.price == null || body.price === ''
      ? null
      : Number.isFinite(Number(body.price)) && Number(body.price) >= 0 && Number(body.price) <= 1_000_000
        ? Number(body.price)
        : null
  const insert = {
    operator_id: params.id,
    name,
    description: typeof body.description === 'string' ? body.description.slice(0, 2000) : null,
    price,
    currency: typeof body.currency === 'string' ? body.currency.slice(0, 8) : 'EUR',
    photos: Array.isArray(body.photos) ? body.photos.slice(0, 20) : [],
    is_available: body.is_available ?? true,
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
  }
  const { data, error } = await supabase.from('products').insert(insert).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
