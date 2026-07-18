import { NextRequest, NextResponse } from 'next/server'
import { requireOperatorAccess } from '@/lib/auth/guard'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

// Tessera lato OPERATORE. Guardia: requireOperatorAccess (proprietario del banco
// o admin del suo mercato). Le mutazioni passano dalle funzioni atomiche del DB
// (0026): dare scala dal budget dell'operatore, riscuotere solo se il saldo c'è.
//
//  GET  ?operatorId=..            → budget punti + ultime richieste scontrino
//  POST { action:'lookup',  operatorId, token }                   → utente + saldo dal QR
//  POST { action:'request', operatorId, token, amountCents, note } → RICHIESTA punti da scontrino (in attesa di approvazione super admin)
//  POST { action:'give',    operatorId, token, points, reason }   → dà punti dal budget (promozionale)
//  POST { action:'redeem',  operatorId, token, points, reason }   → scala punti

export async function GET(request: NextRequest) {
  const operatorId = new URL(request.url).searchParams.get('operatorId') ?? ''
  const guard = await requireOperatorAccess(operatorId)
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const [{ data: bud }, { data: reqs }] = await Promise.all([
    service.from('operator_point_budgets').select('balance').eq('operator_id', operatorId).maybeSingle(),
    service.from('point_requests').select('id, amount_cents, points, status, created_at')
      .eq('operator_id', operatorId).order('created_at', { ascending: false }).limit(10),
  ])
  return NextResponse.json({ data: { budget: bud?.balance ?? 0, requests: reqs ?? [] } })
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

  // Punti da SCONTRINO: l'operatore registra l'importo, nasce una richiesta in
  // attesa dell'approvazione del super admin (1 € = 10 punti, calcolo nel DB).
  if (action === 'request') {
    const amountCents = Math.round(Number(body?.amountCents))
    if (!Number.isFinite(amountCents) || amountCents <= 0 || amountCents > 10_000_00) {
      return NextResponse.json({ error: 'Importo scontrino non valido' }, { status: 400 })
    }
    const note = String(body?.note ?? '').slice(0, 200)
    const { data, error } = await service.rpc('points_request_create', {
      p_operator: operatorId, p_token: token, p_amount_cents: amountCents, p_note: note,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const row = Array.isArray(data) ? data[0] : data
    return NextResponse.json({ ok: true, request: row })
  }

  const points = Math.round(Number(body?.points))
  const reason = String(body?.reason ?? '').slice(0, 200)
  // Cap per singola operazione: evita errori di battitura o abusi (l'operatore è
  // meno affidabile del super admin). Le RPC verificano comunque budget/saldo.
  if (!Number.isFinite(points) || points <= 0 || points > 10000) {
    return NextResponse.json({ error: 'Numero di punti non valido (1–10000)' }, { status: 400 })
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
