import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

// Invia all'operatore il link di accesso alla sua area. Nuovo utente → invito
// Supabase (crea l'account); utente già esistente → magic link. In entrambi i
// casi al primo accesso l'operatore viene collegato alla sua scheda.
export async function POST(request: NextRequest) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res

  const body = await request.json().catch(() => ({}))
  const operatorId = String(body?.operatorId ?? '')
  if (!operatorId) return NextResponse.json({ error: 'operatorId richiesto' }, { status: 400 })

  const service = createServiceClient()
  const { data: op } = await service
    .from('operators')
    .select('id, name, email, market_id, user_id')
    .eq('id', operatorId)
    .maybeSingle()
  if (!op) return NextResponse.json({ error: 'Operatore non trovato' }, { status: 404 })
  const email = op.email?.trim().toLowerCase()
  if (!email) return NextResponse.json({ error: 'Aggiungi prima un’email a questo operatore' }, { status: 400 })

  const origin = request.nextUrl.origin

  // Traccia l'invito così l'auto-collegamento al primo login funziona comunque.
  await service.from('operator_invites').upsert(
    { market_id: op.market_id, operator_id: op.id, email },
    { onConflict: 'market_id,email' },
  )

  const { data: usersPage } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const existing = usersPage?.users.find((u) => u.email?.toLowerCase() === email)

  if (!existing) {
    const { error } = await service.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origin}/operator`,
      data: { operator_name: op.name },
    })
    if (error) return NextResponse.json({ error: `Invito non inviato: ${error.message}` }, { status: 400 })
    return NextResponse.json({ ok: true, status: 'invited', message: `Invito inviato a ${email}.` })
  }

  // Utente già esistente: collega subito la scheda e manda un magic link.
  if (!op.user_id) {
    await service.from('operators').update({ user_id: existing.id }).eq('id', op.id).is('user_id', null)
    await service.from('profiles').update({ role: 'operator' }).eq('id', existing.id).eq('role', 'citizen')
  }
  const anon = createClient()
  const { error } = await anon.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${origin}/operator` },
  })
  if (error) return NextResponse.json({ error: `Link non inviato: ${error.message}` }, { status: 400 })
  return NextResponse.json({ ok: true, status: 'magiclink', message: `Link di accesso inviato a ${email}.` })
}
