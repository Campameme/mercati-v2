import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { expandAllOccurrences, type ScheduleRow } from '@/lib/schedules/occurrences'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)

  const fromStr = searchParams.get('from')
  const toStr = searchParams.get('to')
  // Finestra di default: da 1 mese fa a 13 mesi avanti (14 mesi totali) — permette
  // di visualizzare tutte le ricorrenze mensili (es. "2^ domenica del mese") per un anno intero.
  const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 24 * 3600 * 1000)
  const to = toStr ? new Date(toStr) : new Date(Date.now() + 395 * 24 * 3600 * 1000)

  const { data, error } = await supabase
    .from('market_schedules')
    .select('id, market_id, comune, giorno, orario, luogo, settori, is_active, markets(slug, name)')
    .eq('is_active', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows: ScheduleRow[] = (data ?? []).map((s: any) => ({
    id: s.id,
    market_id: s.market_id,
    market_slug: s.markets?.slug ?? '',
    market_name: s.markets?.name ?? '',
    comune: s.comune,
    giorno: s.giorno,
    orario: s.orario,
    luogo: s.luogo,
    settori: s.settori,
  }))

  const occs = expandAllOccurrences(rows, from, to)
  return NextResponse.json({
    data: occs.map((o) => ({
      ...o,
      start: o.start.toISOString(),
      end: o.end ? o.end.toISOString() : null,
    })),
  })
}
