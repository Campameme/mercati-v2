import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Endpoint admin: ritorna TUTTE le sessioni (incluse is_active=false), per la
// dashboard di toggle. Protezione affidata al middleware (/admin/** richiede super_admin).
export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('market_schedules')
    .select('id, market_id, comune, giorno, orario, luogo, is_active, markets(slug, name, city)')
    .order('comune', { ascending: true })
    .order('giorno', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const shaped = (data ?? []).map((s: any) => ({
    id: s.id,
    marketId: s.market_id,
    marketSlug: s.markets?.slug ?? null,
    marketName: s.markets?.name ?? null,
    marketCity: s.markets?.city ?? null,
    comune: s.comune,
    giorno: s.giorno,
    orario: s.orario,
    luogo: s.luogo,
    isActive: !!s.is_active,
  }))
  return NextResponse.json({ data: shaped })
}
