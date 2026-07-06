import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guard'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

// Gestione punti e coupon (solo super admin). Un'unica route con azioni:
//  GET                         → elenco utenti con saldo e coupon attivi
//  POST { action:'points' }    → assegna/sottrae punti a un utente
//  POST { action:'coupon' }    → emette un coupon per un utente
//  PATCH { couponId, status }  → segna un coupon usato/annullato

export async function GET() {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()

  const [{ data: usersPage }, { data: events }, { data: coupons }] = await Promise.all([
    service.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    service.from('point_events').select('user_id, points'),
    service.from('coupons').select('id, user_id, code, label, status, created_at'),
  ])

  const balance = new Map<string, number>()
  for (const e of events ?? []) balance.set(e.user_id, (balance.get(e.user_id) ?? 0) + (e.points ?? 0))
  const activeCoupons = new Map<string, number>()
  for (const c of coupons ?? []) if (c.status === 'active') activeCoupons.set(c.user_id, (activeCoupons.get(c.user_id) ?? 0) + 1)

  const users = (usersPage?.users ?? [])
    .filter((u) => u.email)
    .map((u) => ({
      id: u.id,
      email: u.email!,
      balance: balance.get(u.id) ?? 0,
      activeCoupons: activeCoupons.get(u.id) ?? 0,
      createdAt: u.created_at,
    }))
    .sort((a, b) => b.balance - a.balance)

  return NextResponse.json({ data: { users, coupons: coupons ?? [] } })
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const body = await request.json().catch(() => ({}))
  const action = body?.action as string

  if (action === 'points') {
    const userId = String(body?.userId ?? '')
    const points = Number(body?.points)
    const reason = String(body?.reason ?? '').trim() || 'Punti dal mercato'
    if (!userId || !Number.isFinite(points) || points === 0) {
      return NextResponse.json({ error: 'userId e points (≠0) richiesti' }, { status: 400 })
    }
    const { error } = await service.from('point_events').insert({
      user_id: userId, points: Math.round(points), reason, created_by: guard.user.id,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'coupon') {
    const userId = String(body?.userId ?? '')
    const label = String(body?.label ?? '').trim()
    if (!userId || !label) return NextResponse.json({ error: 'userId e label richiesti' }, { status: 400 })
    const code = (String(body?.code ?? '').trim() || randomCode()).toUpperCase()
    const { error } = await service.from('coupons').insert({
      user_id: userId, code, label, kind: 'manual',
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, code })
  }

  return NextResponse.json({ error: 'azione non valida' }, { status: 400 })
}

export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const body = await request.json().catch(() => ({}))
  const couponId = String(body?.couponId ?? '')
  const status = String(body?.status ?? '')
  if (!couponId || !['used', 'void', 'active'].includes(status)) {
    return NextResponse.json({ error: 'couponId e status validi richiesti' }, { status: 400 })
  }
  const patch: Record<string, unknown> =
    status === 'used' ? { status, used_at: new Date().toISOString(), used_by: guard.user.id } : { status, used_at: null, used_by: null }
  const { error } = await service.from('coupons').update(patch).eq('id', couponId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

// Codice leggibile evitando caratteri ambigui (0/O, 1/I).
function randomCode(): string {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)]
  return s
}
