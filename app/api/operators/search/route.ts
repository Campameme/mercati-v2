import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Cerca operatori in TUTTI i mercati per assegnarli a sessioni di altri mercati.
// Query: ?q=<text>  (cerca su name, code, description, stall_number)
//        ?excludeMarketId=<uuid>  (opzionale: escludi quelli del market corrente)
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim()
  const excludeMarketId = searchParams.get('excludeMarketId')
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10))

  let query = supabase
    .from('operators')
    .select('id, code, name, category, description, stall_number, market_id, markets(slug, name)')
    .limit(limit)

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,code.ilike.%${q}%,description.ilike.%${q}%,stall_number.ilike.%${q}%`,
    )
  }
  if (excludeMarketId) query = query.neq('market_id', excludeMarketId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const shaped = (data ?? []).map((o: any) => ({
    id: o.id,
    code: o.code ?? null,
    name: o.name,
    category: o.category,
    description: o.description ?? null,
    stallNumber: o.stall_number ?? null,
    marketId: o.market_id,
    marketSlug: o.markets?.slug ?? null,
    marketName: o.markets?.name ?? null,
  }))
  return NextResponse.json({ data: shaped })
}
