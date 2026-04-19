import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildOperatorsWorkbook, type SessionRow } from '@/lib/excel/build-workbook'

export const dynamic = 'force-dynamic'

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

  let marketSlugs: string[] = []
  if (marketSlug) marketSlugs = [marketSlug]
  else {
    const { data: allM } = await supabase.from('markets').select('slug').eq('is_active', true).order('slug')
    marketSlugs = (allM ?? []).map((m: any) => m.slug)
  }

  const buffer = await buildOperatorsWorkbook({
    operators: [],
    sessions: sessionsRows,
    marketSlugs,
    label,
  })

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="template_operatori_${label}.xlsx"`,
    },
  })
}
