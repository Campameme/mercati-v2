import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

// Consenso al trattamento dei dati per finalità di marketing dell'utente
// loggato. Scritto in `profiles.marketing_consent` (+ `marketing_consent_at`)
// via service-role, così l'aggiornamento non dipende dalle policy RLS.

// GET: stato corrente del consenso marketing.
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const service = createServiceClient()
  const { data, error } = await service
    .from('profiles')
    .select('marketing_consent, marketing_consent_at')
    .eq('id', user.id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({
    data: {
      marketing: data?.marketing_consent ?? false,
      marketing_at: data?.marketing_consent_at ?? null,
    },
  })
}

// POST { marketing: boolean } — registra/aggiorna il consenso marketing.
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body non valido' }, { status: 400 })
  }

  const marketing = (body as { marketing?: unknown } | null)?.marketing
  if (typeof marketing !== 'boolean') {
    return NextResponse.json({ error: 'Campo "marketing" (boolean) richiesto' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service
    .from('profiles')
    .update({
      marketing_consent: marketing,
      marketing_consent_at: new Date().toISOString(),
    })
    .eq('id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true, marketing })
}
