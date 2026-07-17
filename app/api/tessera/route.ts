import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { qrSvg } from '@/lib/tessera/qr'

export const dynamic = 'force-dynamic'

const WELCOME_POINTS = 100

// La tessera dell'utente loggato: saldo, movimenti, coupon e — se ha aderito —
// la sua carta col QR. Alla prima chiamata assegna (una volta sola) il bonus di
// benvenuto: l'indice unico su reason='welcome' rende l'operazione idempotente.
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const service = createServiceClient()
  await service
    .from('point_events')
    .insert({ user_id: user.id, points: WELCOME_POINTS, reason: 'welcome', kind: 'welcome' })
    .then(() => {}, () => {}) // se esiste già, l'indice unico rifiuta: ignoriamo

  const [{ data: events }, { data: coupons }, { data: card }] = await Promise.all([
    supabase.from('point_events').select('id, points, reason, kind, created_at').order('created_at', { ascending: false }),
    supabase.from('coupons').select('id, code, label, status, created_at, used_at, cost_points').order('created_at', { ascending: false }),
    supabase.from('tessera_cards').select('token, consent_at').maybeSingle(),
  ])

  const balance = (events ?? []).reduce((sum, e) => sum + (e.points ?? 0), 0)

  let cardOut: { token: string; qrSvg: string } | null = null
  if (card?.token) cardOut = { token: card.token, qrSvg: await qrSvg(card.token) }

  return NextResponse.json({
    data: { email: user.email, balance, events: events ?? [], coupons: coupons ?? [], card: cardOut },
  })
}

// GDPR — diritto all'oblio: cancella TUTTA la tessera dell'utente (punti, coupon, carta).
export async function DELETE() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  const service = createServiceClient()
  const { error } = await service.rpc('tessera_erase', { p_user: user.id })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
