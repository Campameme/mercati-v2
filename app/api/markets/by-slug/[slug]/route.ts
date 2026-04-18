import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: market, error: marketErr } = await supabase
    .from('markets')
    .select('*')
    .ilike('slug', params.slug)
    .maybeSingle()
  if (marketErr) return NextResponse.json({ error: marketErr.message }, { status: 500 })
  if (!market) return NextResponse.json({ error: 'Mercato non trovato' }, { status: 404 })

  const { data: area } = await supabase
    .from('market_areas')
    .select('*')
    .eq('market_id', market.id)
    .maybeSingle()

  return NextResponse.json({ data: { market, area } })
}
