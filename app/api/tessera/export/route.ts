import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GDPR — diritto alla portabilità: l'utente scarica TUTTI i propri dati della
// tessera in JSON. Legge col client dell'utente (RLS: solo le proprie righe).
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const [{ data: events }, { data: coupons }, { data: card }] = await Promise.all([
    supabase.from('point_events').select('*').order('created_at', { ascending: true }),
    supabase.from('coupons').select('*').order('created_at', { ascending: true }),
    supabase.from('tessera_cards').select('token, consent_at, created_at').maybeSingle(),
  ])

  const payload = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email },
    tessera: card ?? null,
    point_events: events ?? [],
    coupons: coupons ?? [],
  }
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="tessera-mercati.json"',
    },
  })
}
