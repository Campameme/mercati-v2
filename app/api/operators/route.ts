import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveMarketFromRequest } from '@/lib/markets/resolve'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const body = await request.json()
  const { market_id, name, category } = body
  if (!market_id || !name || !category) {
    return NextResponse.json({ error: 'market_id, name, category obbligatori' }, { status: 400 })
  }
  const insert = {
    market_id,
    schedule_id: body.schedule_id ?? null,
    name,
    category,
    description: body.description ?? null,
    stall_number: body.stall_number ?? null,
    location_lat: body.location_lat ?? null,
    location_lng: body.location_lng ?? null,
    languages: body.languages ?? [],
    payment_methods: body.payment_methods ?? [],
    is_open: body.is_open ?? true,
  }
  const { data, error } = await supabase.from('operators').insert(insert).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const wantsAll = searchParams.get('all') === '1'
  const scheduleId = searchParams.get('scheduleId')

  if (wantsAll) {
    let q = supabase
      .from('operators')
      .select('id, name, category, description, stall_number, location_lat, location_lng, photos, languages, payment_methods, social_links, is_open, rating, market_id, schedule_id, markets(slug, name, city)')
    if (category && category !== 'all') q = q.eq('category', category)
    if (search) q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%,stall_number.ilike.%${search}%`)
    const { data, error } = await q
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    const shaped = (data ?? []).map((op: any) => ({
      id: op.id,
      name: op.name,
      category: op.category,
      description: op.description ?? '',
      photos: op.photos ?? [],
      languages: op.languages ?? [],
      paymentMethods: op.payment_methods ?? [],
      socialLinks: op.social_links ?? {},
      location: {
        lat: op.location_lat ?? 0,
        lng: op.location_lng ?? 0,
        stallNumber: op.stall_number ?? '',
      },
      isOpen: op.is_open ?? true,
      rating: op.rating ?? undefined,
      market: op.markets ? { id: op.market_id, slug: op.markets.slug, name: op.markets.name, city: op.markets.city } : null,
    }))
    return NextResponse.json({ success: true, data: shaped, lastUpdated: new Date().toISOString() })
  }

  const resolved = await resolveMarketFromRequest(searchParams)
  if (resolved.kind === 'not_found') {
    return NextResponse.json({ success: false, error: 'Mercato non trovato' }, { status: 404 })
  }
  if (resolved.kind === 'coords') {
    return NextResponse.json({ success: true, data: [], message: 'Operatori disponibili solo per mercati registrati' })
  }

  let query = supabase
    .from('operators')
    .select('id, name, category, description, stall_number, location_lat, location_lng, photos, languages, payment_methods, social_links, is_open, rating, schedule_id')
    .eq('market_id', resolved.market.id)

  if (scheduleId) query = query.eq('schedule_id', scheduleId)
  if (category && category !== 'all') query = query.eq('category', category)
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,stall_number.ilike.%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  // Shape for backward-compat with existing UI types
  const shaped = (data ?? []).map((op) => ({
    id: op.id,
    name: op.name,
    category: op.category,
    description: op.description ?? '',
    photos: op.photos ?? [],
    languages: op.languages ?? [],
    paymentMethods: op.payment_methods ?? [],
    socialLinks: op.social_links ?? {},
    location: {
      lat: op.location_lat ?? 0,
      lng: op.location_lng ?? 0,
      stallNumber: op.stall_number ?? '',
    },
    isOpen: op.is_open ?? true,
    rating: op.rating ?? undefined,
  }))

  return NextResponse.json({
    success: true,
    data: shaped,
    city: resolved.market.city,
    market: { id: resolved.market.id, slug: resolved.market.slug, name: resolved.market.name },
    lastUpdated: new Date().toISOString(),
  })
}
