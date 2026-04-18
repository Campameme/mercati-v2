import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
  const supabase = createClient()
  const body = await request.json()
  const { name } = body
  if (!name) return NextResponse.json({ error: 'name obbligatorio' }, { status: 400 })
  const insert = {
    operator_id: params.id,
    name,
    description: body.description ?? null,
    price: body.price ?? null,
    currency: body.currency ?? 'EUR',
    photos: body.photos ?? [],
    is_available: body.is_available ?? true,
    sort_order: body.sort_order ?? 0,
  }
  const { data, error } = await supabase.from('products').insert(insert).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
