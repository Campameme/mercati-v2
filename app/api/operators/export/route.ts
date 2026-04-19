import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/server'
import {
  OPERATORS_SHEET_NAME,
  OPERATORS_COLUMNS,
  INSTRUCTIONS_SHEET_NAME,
  INSTRUCTIONS_ROWS,
  SESSIONS_SHEET_NAME,
} from '@/lib/excel/operators'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const marketSlug = searchParams.get('marketSlug')
  const all = searchParams.get('all') === '1'

  let marketId: string | null = null
  let marketName = 'tutta-provincia'
  if (!all && marketSlug) {
    const { data: m } = await supabase
      .from('markets')
      .select('id, slug, name')
      .ilike('slug', marketSlug)
      .maybeSingle()
    if (!m) return NextResponse.json({ error: 'Mercato non trovato' }, { status: 404 })
    marketId = m.id
    marketName = m.slug
  } else if (!all) {
    return NextResponse.json({ error: 'marketSlug o all=1 obbligatorio' }, { status: 400 })
  }

  // Operatori + schedules
  let opQuery = supabase
    .from('operators')
    .select('id, market_id, name, category, description, stall_number, languages, payment_methods, markets(slug), operator_schedules(schedule_id, location_lat, location_lng, stall_number, market_schedules(id, comune, giorno, luogo))')
  if (marketId) opQuery = opQuery.eq('market_id', marketId)
  const { data: ops, error: opErr } = await opQuery
  if (opErr) return NextResponse.json({ error: opErr.message }, { status: 500 })

  // Mail degli account collegati (via operator_invites)
  const operatorIds = (ops ?? []).map((o: any) => o.id)
  const emailByOperator = new Map<string, string>()
  if (operatorIds.length > 0) {
    const { data: invites } = await supabase
      .from('operator_invites')
      .select('operator_id, email')
      .in('operator_id', operatorIds)
    for (const inv of invites ?? []) emailByOperator.set(inv.operator_id, inv.email)
  }

  const rows: Record<string, unknown>[] = []
  for (const op of ops ?? []) {
    const presences = (op as any).operator_schedules ?? []
    const baseRow = {
      OperatorId: op.id,
      Nome: op.name,
      Categoria: op.category,
      Descrizione: op.description ?? '',
      Email: emailByOperator.get(op.id) ?? '',
      Lingue: (op.languages ?? []).join(', '),
      Pagamenti: (op.payment_methods ?? []).join(', '),
      MarketSlug: (op as any).markets?.slug ?? '',
    }
    if (presences.length === 0) {
      rows.push({
        ...baseRow,
        ScheduleId: '',
        Comune: '',
        Giorno: '',
        Luogo: '',
        Banco: op.stall_number ?? '',
        Lat: '',
        Lng: '',
      })
    } else {
      for (const p of presences) {
        rows.push({
          ...baseRow,
          ScheduleId: p.schedule_id,
          Comune: p.market_schedules?.comune ?? '',
          Giorno: p.market_schedules?.giorno ?? '',
          Luogo: p.market_schedules?.luogo ?? '',
          Banco: p.stall_number ?? '',
          Lat: p.location_lat ?? '',
          Lng: p.location_lng ?? '',
        })
      }
    }
  }

  // Foglio sessioni di riferimento
  let schQuery = supabase
    .from('market_schedules')
    .select('id, comune, giorno, orario, luogo, lat, lng, markets(slug, name)')
    .eq('is_active', true)
    .order('comune')
    .order('giorno')
  if (marketId) schQuery = schQuery.eq('market_id', marketId)
  const { data: sessions } = await schQuery

  const sessionsRows = (sessions ?? []).map((s: any) => ({
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

  // Build workbook
  const wb = XLSX.utils.book_new()
  const wsOp = XLSX.utils.json_to_sheet(rows, { header: OPERATORS_COLUMNS as unknown as string[] })
  XLSX.utils.book_append_sheet(wb, wsOp, OPERATORS_SHEET_NAME)
  const wsSes = XLSX.utils.json_to_sheet(sessionsRows)
  XLSX.utils.book_append_sheet(wb, wsSes, SESSIONS_SHEET_NAME)
  const wsInstr = XLSX.utils.aoa_to_sheet(INSTRUCTIONS_ROWS)
  XLSX.utils.book_append_sheet(wb, wsInstr, INSTRUCTIONS_SHEET_NAME)

  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
  const filename = `operatori_${marketName}_${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
