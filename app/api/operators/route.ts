import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveMarketFromRequest } from '@/lib/markets/resolve'
import { requireAdmin } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

// I filtri PostgREST usano , ( ) come sintassi: via i caratteri speciali
// dall'input utente prima di comporre la stringa .or() (filter-injection).
function cleanSearch(s: string): string {
  return s.replace(/[,()"'\\%]/g, ' ').trim()
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { market_id, name, category } = body
  if (!market_id || !name || !category) {
    return NextResponse.json({ error: 'market_id, name, category obbligatori' }, { status: 400 })
  }
  const guard = await requireAdmin({ marketId: market_id })
  if (!guard.ok) return guard.res
  const supabase = guard.supabase
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
  }
  const { data, error } = await supabase.from('operators').insert(insert).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Se schedule_id fornito, crea anche la riga in operator_schedules (nuovo modello M:N)
  if (body.schedule_id) {
    await supabase.from('operator_schedules').upsert({
      operator_id: data.id,
      schedule_id: body.schedule_id,
      location_lat: body.location_lat ?? null,
      location_lng: body.location_lng ?? null,
      stall_number: body.stall_number ?? null,
    })
  }

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
      .select('id, name, category, description, stall_number, location_lat, location_lng, photos, languages, payment_methods, social_links, rating, market_id, schedule_id, markets!operators_market_id_fkey(slug, name, city), operator_schedules(schedule_id, location_lat, location_lng, stall_number, market_schedules(id, comune, giorno, luogo, market_id)), products(name)')
    if (category && category !== 'all') q = q.eq('category', category)
    const s = search ? cleanSearch(search) : ''
    if (s) q = q.or(`name.ilike.%${s}%,description.ilike.%${s}%,stall_number.ilike.%${s}%`)
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
      rating: op.rating ?? undefined,
      products: (op.products ?? []).map((p: any) => p.name).filter(Boolean),
      market: op.markets ? { id: op.market_id, slug: op.markets.slug, name: op.markets.name, city: op.markets.city } : null,
      schedules: (op.operator_schedules ?? []).map((os: any) => ({
        scheduleId: os.schedule_id,
        lat: os.location_lat,
        lng: os.location_lng,
        stallNumber: os.stall_number,
        comune: os.market_schedules?.comune ?? null,
        giorno: os.market_schedules?.giorno ?? null,
        luogo: os.market_schedules?.luogo ?? null,
      })),
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

  // Se filtro per scheduleId, uso la tabella M:N per avere posizione per-sessione
  if (scheduleId) {
    const { data: links, error: linkErr } = await supabase
      .from('operator_schedules')
      .select('operator_id, location_lat, location_lng, stall_number, operators(id, name, category, description, photos, languages, payment_methods, social_links, rating, market_id)')
      .eq('schedule_id', scheduleId)
    if (linkErr) return NextResponse.json({ success: false, error: linkErr.message }, { status: 500 })

    let shaped = (links ?? [])
      .filter((l: any) => l.operators && l.operators.market_id === resolved.market.id)
      .map((l: any) => ({
        id: l.operators.id,
        name: l.operators.name,
        category: l.operators.category,
        description: l.operators.description ?? '',
        photos: l.operators.photos ?? [],
        languages: l.operators.languages ?? [],
        paymentMethods: l.operators.payment_methods ?? [],
        socialLinks: l.operators.social_links ?? {},
        location: {
          lat: l.location_lat ?? 0,
          lng: l.location_lng ?? 0,
          stallNumber: l.stall_number ?? '',
        },
        rating: l.operators.rating ?? undefined,
      }))

    // Fallback legacy: includi anche operators.schedule_id = scheduleId non ancora migrati
    const { data: legacy } = await supabase
      .from('operators')
      .select('id, name, category, description, stall_number, location_lat, location_lng, photos, languages, payment_methods, social_links, rating')
      .eq('market_id', resolved.market.id)
      .eq('schedule_id', scheduleId)
    const already = new Set(shaped.map((s) => s.id))
    for (const op of legacy ?? []) {
      if (already.has(op.id)) continue
      shaped.push({
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
        rating: op.rating ?? undefined,
      })
    }

    if (category && category !== 'all') shaped = shaped.filter((o) => o.category === category)
    if (search) {
      const q = search.toLowerCase()
      shaped = shaped.filter((o) =>
        o.name.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        (o.location.stallNumber ?? '').toLowerCase().includes(q),
      )
    }

    return NextResponse.json({
      success: true,
      data: shaped,
      city: resolved.market.city,
      market: { id: resolved.market.id, slug: resolved.market.slug, name: resolved.market.name },
      lastUpdated: new Date().toISOString(),
    })
  }

  let query = supabase
    .from('operators')
    .select('id, name, category, description, stall_number, location_lat, location_lng, photos, languages, payment_methods, social_links, rating, schedule_id')
    .eq('market_id', resolved.market.id)

  if (category && category !== 'all') query = query.eq('category', category)
  const s2 = search ? cleanSearch(search) : ''
  if (s2) query = query.or(`name.ilike.%${s2}%,description.ilike.%${s2}%,stall_number.ilike.%${s2}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

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
