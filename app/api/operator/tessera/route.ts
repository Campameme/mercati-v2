import { NextRequest, NextResponse } from 'next/server'
import { requireOperatorAccess } from '@/lib/auth/guard'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

// Tessera lato OPERATORE. Guardia: requireOperatorAccess (proprietario del banco
// o admin del suo mercato). Le mutazioni passano dalle funzioni atomiche del DB
// (0026): dare scala dal budget dell'operatore, riscuotere solo se il saldo c'è.
//
//  GET  ?operatorId=..            → budget punti dell'operatore
//  POST { action:'lookup', operatorId, token }            → utente + saldo dal QR
//  POST { action:'give',   operatorId, token, points, reason }  → dà punti
//  POST { action:'redeem', operatorId, token, points, reason }  → scala punti

export async function GET(request: NextRequest) {
  const operatorId = new URL(request.url).searchParams.get('operatorId') ?? ''
  const guard = await requireOperatorAccess(operatorId)
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const { data } = await service.from('operator_point_budgets').select('balance').eq('operator_id', operatorId).maybeSingle()
  return NextResponse.json({ data: { budget: data?.balance ?? 0 } })
}

async function resolveToken(service: ReturnType<typeof createServiceClient>, token: string) {
  const { data, error } = await service.rpc('tessera_card_lookup', { p_token: token })
  if (error) throw new Error(error.message)
  const row = Array.isArray(data) ? data[0] : data
  return row as { user_id: string; balance: number } | undefined
}

const ERR_MSG: Record<string, string> = {
  points_positive: 'I punti devono essere maggiori di zero.',
  operator_no_budget: 'Questo banco non ha ancora un budget punti.',
  operator_insufficient_budget: 'Budget punti del banco insufficiente.',
  user_insufficient_balance: 'La tessera non ha abbastanza punti.',
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const operatorId = String(body?.operatorId ?? '')
  const guard = await requireOperatorAccess(operatorId)
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const action = String(body?.action ?? '')
  const token = String(body?.token ?? '').trim()
  if (!token) return NextResponse.json({ error: 'Tessera (token) richiesta' }, { status: 400 })

  let card
  try { card = await resolveToken(service, token) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }) }
  if (!card) return NextResponse.json({ error: 'Tessera non trovata' }, { status: 404 })

  if (action === 'lookup') {
    return NextResponse.json({ data: { balance: card.balance } })
  }

  const points = Math.round(Number(body?.points))
  const reason = String(body?.reason ?? '')
  if (!Number.isFinite(points) || points <= 0) {
    return NextResponse.json({ error: 'Numero di punti non valido' }, { status: 400 })
  }

  const fn = action === 'give' ? 'tessera_give' : action === 'redeem' ? 'tessera_redeem' : null
  if (!fn) return NextResponse.json({ error: 'Azione non valida' }, { status: 400 })

  const { data, error } = await service.rpc(fn, {
    p_operator: operatorId, p_user: card.user_id, p_points: points, p_reason: reason,
  })
  if (error) {
    const key = Object.keys(ERR_MSG).find((k) => error.message.includes(k))
    return NextResponse.json({ error: key ? ERR_MSG[key] : error.message }, { status: 400 })
  }
  return NextResponse.json({ ok: true, balance: data })
}
