import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

const WELCOME_POINTS = 100

// La tessera dell'utente loggato: saldo, movimenti e coupon.
// Alla prima chiamata assegna (una volta sola) il bonus di benvenuto — l'indice
// unico su reason='welcome' rende l'operazione idempotente anche in concorrenza.
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const service = createServiceClient()
  await service
    .from('point_events')
    .insert({ user_id: user.id, points: WELCOME_POINTS, reason: 'welcome' })
    .then(() => {}, () => {}) // se esiste già, l'indice unico rifiuta: ignoriamo

  const [{ data: events }, { data: coupons }] = await Promise.all([
    supabase.from('point_events').select('id, points, reason, created_at').order('created_at', { ascending: false }),
    supabase.from('coupons').select('id, code, label, status, created_at, used_at').order('created_at', { ascending: false }),
  ])

  const balance = (events ?? []).reduce((sum, e) => sum + (e.points ?? 0), 0)

  return NextResponse.json({
    data: {
      email: user.email,
      balance,
      events: events ?? [],
      coupons: coupons ?? [],
    },
  })
}
