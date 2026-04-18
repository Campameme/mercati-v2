import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveMarketFromRequest } from '@/lib/markets/resolve'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)

  if (searchParams.get('all') === '1') {
    const { data, error } = await supabase
      .from('events')
      .select('*, markets(slug, name, city)')
      .order('start_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  const resolved = await resolveMarketFromRequest(searchParams)
  if (resolved.kind !== 'market') return NextResponse.json({ error: 'Mercato non trovato' }, { status: 404 })

  const { data, error } = await supabase
    .from('events')
    .select('*, markets(slug, name, city)')
    .eq('market_id', resolved.market.id)
    .order('start_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const body = await request.json()
  const { market_id, title, start_at } = body
  if (!market_id || !title || !start_at) {
    return NextResponse.json({ error: 'market_id, title, start_at obbligatori' }, { status: 400 })
  }
  const insert = {
    market_id,
    title,
    description: body.description ?? null,
    category: body.category ?? 'other',
    location: body.location ?? null,
    start_at,
    end_at: body.end_at ?? null,
    is_recurring: body.is_recurring ?? false,
    recurrence_rule: body.recurrence_rule ?? null,
  }
  const { data, error } = await supabase.from('events').insert(insert).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
