import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guard'
import { createServiceClient } from '@/lib/supabase/service'
import { IMPERIA_ZONE_SLUGS } from '@/lib/markets/zones'

export const dynamic = 'force-dynamic'

// Area gestione operatori (super admin). Gli operatori si creano QUI e si
// assegnano a uno o più mercati (zone della provincia di Imperia), ciascuno con
// la sua posizione sulla mappa. `operators.market_id` = mercato principale.

interface MarketAssign { marketId: string; lat: number | null; lng: number | null; stall: string | null }

function parseMarkets(raw: unknown): MarketAssign[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((m: any) => ({
      marketId: String(m?.marketId ?? ''),
      lat: m?.lat != null ? Number(m.lat) : null,
      lng: m?.lng != null ? Number(m.lng) : null,
      stall: m?.stall ? String(m.stall) : null,
    }))
    .filter((m) => m.marketId)
}

export async function GET() {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()

  const [{ data: markets }, { data: operators }, { data: links }] = await Promise.all([
    service.from('markets').select('id, slug, name, city, center_lat, center_lng, default_zoom').in('slug', IMPERIA_ZONE_SLUGS as unknown as string[]).order('name'),
    service.from('operators').select('id, name, category, description, email, user_id, market_id, photos').order('name'),
    service.from('operator_markets').select('operator_id, market_id, location_lat, location_lng, stall_number'),
  ])

  const byOperator = new Map<string, any[]>()
  for (const l of links ?? []) {
    if (!byOperator.has(l.operator_id)) byOperator.set(l.operator_id, [])
    byOperator.get(l.operator_id)!.push({ marketId: l.market_id, lat: l.location_lat, lng: l.location_lng, stall: l.stall_number })
  }

  const shaped = (operators ?? []).map((o) => ({
    id: o.id,
    name: o.name,
    category: o.category,
    description: o.description ?? '',
    email: o.email ?? '',
    linked: !!o.user_id,
    hasPhoto: (o.photos ?? []).length > 0,
    markets: byOperator.get(o.id) ?? [],
  }))

  return NextResponse.json({ data: { markets: markets ?? [], operators: shaped } })
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const body = await request.json().catch(() => ({}))

  const name = String(body?.name ?? '').trim()
  const category = String(body?.category ?? '').trim()
  const description = body?.description ? String(body.description).trim() : null
  const email = body?.email ? String(body.email).trim().toLowerCase() : null
  const markets = parseMarkets(body?.markets)
  if (!name || !category) return NextResponse.json({ error: 'Nome e categoria richiesti' }, { status: 400 })
  if (markets.length === 0) return NextResponse.json({ error: 'Assegna almeno un mercato' }, { status: 400 })

  const primary = markets[0]
  const { data: op, error } = await service
    .from('operators')
    .insert({
      market_id: primary.marketId,
      name, category, description, email,
      location_lat: primary.lat, location_lng: primary.lng, stall_number: primary.stall,
    })
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const rows = markets.map((m) => ({
    operator_id: op.id, market_id: m.marketId,
    location_lat: m.lat, location_lng: m.lng, stall_number: m.stall,
  }))
  const { error: mErr } = await service.from('operator_markets').insert(rows)
  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 400 })

  return NextResponse.json({ ok: true, id: op.id })
}

export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const body = await request.json().catch(() => ({}))
  const id = String(body?.id ?? '')
  if (!id) return NextResponse.json({ error: 'id richiesto' }, { status: 400 })

  const markets = parseMarkets(body?.markets)
  if (markets.length === 0) return NextResponse.json({ error: 'Assegna almeno un mercato' }, { status: 400 })
  const primary = markets[0]

  const { error } = await service
    .from('operators')
    .update({
      name: String(body?.name ?? '').trim(),
      category: String(body?.category ?? '').trim(),
      description: body?.description ? String(body.description).trim() : null,
      email: body?.email ? String(body.email).trim().toLowerCase() : null,
      market_id: primary.marketId,
      location_lat: primary.lat, location_lng: primary.lng, stall_number: primary.stall,
    })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Rimpiazza le assegnazioni: cancella e reinserisci (semplice e coerente).
  await service.from('operator_markets').delete().eq('operator_id', id)
  const rows = markets.map((m) => ({
    operator_id: id, market_id: m.marketId,
    location_lat: m.lat, location_lng: m.lng, stall_number: m.stall,
  }))
  const { error: mErr } = await service.from('operator_markets').insert(rows)
  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id richiesto' }, { status: 400 })
  const { error } = await service.from('operators').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
