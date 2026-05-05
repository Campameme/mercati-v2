import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildOperatorsWorkbook, type OperatorRow, type SessionRow } from '@/lib/excel/build-workbook'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const marketSlug = searchParams.get('marketSlug')
  const all = searchParams.get('all') === '1'

  let marketId: string | null = null
  let label = 'tutta-provincia'
  if (!all && marketSlug) {
    const { data: m } = await supabase
      .from('markets')
      .select('id, slug, name')
      .ilike('slug', marketSlug)
      .maybeSingle()
    if (!m) return NextResponse.json({ error: 'Mercato non trovato' }, { status: 404 })
    marketId = m.id
    label = m.slug
  } else if (!all) {
    return NextResponse.json({ error: 'marketSlug o all=1 obbligatorio' }, { status: 400 })
  }

  let opQuery = supabase
    .from('operators')
    .select('id, code, market_id, name, category, description, stall_number, languages, payment_methods, markets(slug), operator_schedules(schedule_id, location_lat, location_lng, stall_number, market_schedules(id, comune, giorno, luogo, market_id, place_id, markets(slug)))')
  if (marketId) {
    // Includi sia operators del market sia operators con presenze in questo market
    const { data: presenceOps } = await supabase
      .from('operator_schedules')
      .select('operator_id, market_schedules!inner(market_id)')
      .eq('market_schedules.market_id', marketId)
    const presenceIds = Array.from(new Set((presenceOps ?? []).map((r: any) => r.operator_id)))
    if (presenceIds.length > 0) {
      opQuery = opQuery.or(`market_id.eq.${marketId},id.in.(${presenceIds.join(',')})`)
    } else {
      opQuery = opQuery.eq('market_id', marketId)
    }
  }
  const { data: ops, error: opErr } = await opQuery
  if (opErr) return NextResponse.json({ error: opErr.message }, { status: 500 })

  const operatorIds = (ops ?? []).map((o: any) => o.id)
  const emailByOperator = new Map<string, string>()
  if (operatorIds.length > 0) {
    const { data: invites } = await supabase
      .from('operator_invites')
      .select('operator_id, email')
      .in('operator_id', operatorIds)
    for (const inv of invites ?? []) emailByOperator.set(inv.operator_id, inv.email)
  }

  const operatorRows: OperatorRow[] = []
  for (const op of ops ?? []) {
    const presences = (op as any).operator_schedules ?? []
    const baseFor = (rowMarketSlug: string) => ({
      OperatorId: op.id,
      OperatorCode: (op as any).code ?? '',
      Nome: op.name,
      Categoria: op.category,
      Descrizione: op.description ?? '',
      Email: emailByOperator.get(op.id) ?? '',
      Lingue: (op.languages ?? []).join(', '),
      Pagamenti: (op.payment_methods ?? []).join(', '),
      MarketSlug: rowMarketSlug,
    })
    if (presences.length === 0) {
      operatorRows.push({
        ...baseFor((op as any).markets?.slug ?? ''),
        PlaceId: '',
        ScheduleId: '',
        Banco: op.stall_number ?? '',
        Lat: '',
        Lng: '',
      })
    } else {
      for (const p of presences) {
        // Per ciascuna presenza il MarketSlug è quello della sessione (cross-market)
        const sessionSlug = p.market_schedules?.markets?.slug ?? (op as any).markets?.slug ?? ''
        operatorRows.push({
          ...baseFor(sessionSlug),
          PlaceId: p.market_schedules?.place_id ?? '',
          ScheduleId: p.schedule_id,
          Banco: p.stall_number ?? '',
          Lat: p.location_lat ?? '',
          Lng: p.location_lng ?? '',
        })
      }
    }
  }

  let schQuery = supabase
    .from('market_schedules')
    .select('id, comune, giorno, orario, luogo, lat, lng, markets(slug, name)')
    .eq('is_active', true)
    .order('comune')
    .order('giorno')
  if (marketId) schQuery = schQuery.eq('market_id', marketId)
  const { data: sessions } = await schQuery

  const sessionsRows: SessionRow[] = (sessions ?? []).map((s: any) => ({
    ScheduleId: s.id,
    MarketSlug: s.markets?.slug ?? '',
    Zona: s.markets?.name ?? '',
    Comune: s.comune,
    Giorno: s.giorno,
    Orario: s.orario ?? '',
    Luogo: s.luogo ?? '',
    Lat: s.lat ?? '',
    Lng: s.lng ?? '',
  }))

  // MarketSlug list per il dropdown: i mercati pertinenti
  let marketSlugs: string[] = []
  if (marketId) {
    marketSlugs = marketSlug ? [marketSlug] : []
  } else {
    const { data: allM } = await supabase.from('markets').select('slug').eq('is_active', true).order('slug')
    marketSlugs = (allM ?? []).map((m: any) => m.slug)
  }

  const buffer = await buildOperatorsWorkbook({
    operators: operatorRows,
    sessions: sessionsRows,
    marketSlugs,
    label,
  })

  const filename = `operatori_${label}_${new Date().toISOString().slice(0, 10)}.xlsx`
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
