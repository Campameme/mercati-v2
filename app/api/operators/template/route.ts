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

// Template vuoto: stesso formato dell'export ma senza righe operatori.
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const marketSlug = searchParams.get('marketSlug')

  let marketId: string | null = null
  let label = 'tutta-provincia'
  if (marketSlug) {
    const { data: m } = await supabase
      .from('markets')
      .select('id, slug')
      .ilike('slug', marketSlug)
      .maybeSingle()
    if (m) { marketId = m.id; label = m.slug }
  }

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

  const wb = XLSX.utils.book_new()
  const wsOp = XLSX.utils.json_to_sheet([], { header: OPERATORS_COLUMNS as unknown as string[] })
  XLSX.utils.book_append_sheet(wb, wsOp, OPERATORS_SHEET_NAME)
  const wsSes = XLSX.utils.json_to_sheet(sessionsRows)
  XLSX.utils.book_append_sheet(wb, wsSes, SESSIONS_SHEET_NAME)
  const wsInstr = XLSX.utils.aoa_to_sheet(INSTRUCTIONS_ROWS)
  XLSX.utils.book_append_sheet(wb, wsInstr, INSTRUCTIONS_SHEET_NAME)

  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="template_operatori_${label}.xlsx"`,
    },
  })
}
