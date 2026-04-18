import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const body = await request.json()
  const email = (body?.email as string | undefined)?.trim().toLowerCase()
  if (!email) return NextResponse.json({ error: 'email richiesta' }, { status: 400 })

  const { data: op } = await supabase
    .from('operators')
    .select('id, market_id, name, user_id')
    .eq('id', params.id)
    .maybeSingle()
  if (!op) return NextResponse.json({ error: 'Operatore non trovato' }, { status: 404 })
  if (op.user_id) return NextResponse.json({ error: 'Operatore già collegato a un account' }, { status: 400 })

  // Store invite record (RLS enforces market_admin/super_admin)
  const { error: invErr } = await supabase
    .from('operator_invites')
    .upsert(
      { market_id: op.market_id, operator_id: op.id, email },
      { onConflict: 'market_id,email' }
    )
  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 400 })

  const service = createServiceClient()

  // Check whether this email is already registered.
  // listUsers doesn't support filter; paginate once with a generous page size.
  const { data: usersPage } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const existing = usersPage?.users.find((u) => u.email?.toLowerCase() === email)

  if (existing) {
    return NextResponse.json({
      ok: true,
      status: 'already_registered',
      message: `L'utente ${email} è già registrato. Si collegherà automaticamente a questo operatore al prossimo login su /login.`,
    })
  }

  // New email: send signup invite via Supabase
  const origin = request.nextUrl.origin
  const { error: inviteErr } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/operator`,
    data: { operator_name: op.name },
  })

  if (inviteErr) {
    return NextResponse.json({
      ok: true,
      status: 'invite_error',
      message: `Invito registrato, ma l'email non è stata inviata: ${inviteErr.message}. Verifica le impostazioni SMTP di Supabase.`,
    })
  }

  return NextResponse.json({
    ok: true,
    status: 'email_sent',
    message: `Email di invito inviata a ${email}.`,
  })
}
