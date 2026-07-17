import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

// Lo shop dei premi (a PUNTI, nessun pagamento reale).
//  GET   → catalogo premi attivi + saldo dell'utente (se loggato)
//  POST { rewardId }  → acquista: scala i punti ed emette un coupon (RPC atomica)

export async function GET() {
  const supabase = createClient()
  const { data: rewards } = await supabase
    .from('shop_rewards')
    .select('id, label, description, cost_points, stock, market_id, markets(name, city)')
    .eq('is_active', true)
    .order('cost_points', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()
  let balance: number | null = null
  if (user) {
    const { data: events } = await supabase.from('point_events').select('points')
    balance = (events ?? []).reduce((s, e) => s + (e.points ?? 0), 0)
  }
  return NextResponse.json({ data: { rewards: rewards ?? [], balance, loggedIn: !!user } })
}

const ERR_MSG: Record<string, string> = {
  reward_not_found: 'Premio non trovato.',
  reward_inactive: 'Premio non più disponibile.',
  reward_out_of_stock: 'Premio esaurito.',
  insufficient_balance: 'Non hai abbastanza punti.',
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Devi accedere per usare i punti.' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const rewardId = String(body?.rewardId ?? '')
  if (!rewardId) return NextResponse.json({ error: 'rewardId richiesto' }, { status: 400 })

  const service = createServiceClient()
  const { data, error } = await service.rpc('shop_purchase', { p_user: user.id, p_reward: rewardId })
  if (error) {
    const key = Object.keys(ERR_MSG).find((k) => error.message.includes(k))
    return NextResponse.json({ error: key ? ERR_MSG[key] : error.message }, { status: 400 })
  }
  const row = Array.isArray(data) ? data[0] : data
  return NextResponse.json({ ok: true, balance: row?.new_balance, code: row?.coupon_code })
}
