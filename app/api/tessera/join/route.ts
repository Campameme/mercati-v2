import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { qrSvg } from '@/lib/tessera/qr'

export const dynamic = 'force-dynamic'

// Adesione alla tessera (consenso GDPR esplicito): crea la carta col token del
// QR. Idempotente — se la carta esiste già, restituisce quella.
export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const service = createServiceClient()
  const { data: existing } = await service.from('tessera_cards').select('token').eq('user_id', user.id).maybeSingle()
  let token = existing?.token as string | undefined
  if (!token) {
    const { data, error } = await service
      .from('tessera_cards')
      .insert({ user_id: user.id })
      .select('token')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    token = data.token
  }
  return NextResponse.json({ ok: true, token, qrSvg: await qrSvg(token!) })
}
