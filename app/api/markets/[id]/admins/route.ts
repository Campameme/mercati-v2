import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: assignments, error } = await supabase
    .from('market_admins')
    .select('user_id, created_at')
    .eq('market_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const userIds = (assignments ?? []).map((a) => a.user_id)
  let profilesById: Record<string, { full_name: string | null; role: string } | null> = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('id', userIds)
    profilesById = Object.fromEntries((profiles ?? []).map((p) => [p.id, { full_name: p.full_name, role: p.role }]))
  }

  const data = (assignments ?? []).map((a) => ({
    user_id: a.user_id,
    created_at: a.created_at,
    profiles: profilesById[a.user_id] ?? null,
  }))
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const body = await request.json()
  const { email } = body as { email?: string }
  if (!email) return NextResponse.json({ error: 'email richiesta' }, { status: 400 })

  // Service-role client needed to look up users by email (auth.users is not exposed via anon)
  const service = createServiceClient()
  const { data: usersPage, error: listErr } = await service.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 })
  const target = usersPage?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  if (!target) return NextResponse.json({ error: 'Utente non trovato. Chiedi all\'utente di registrarsi prima.' }, { status: 404 })

  // Insert assignment + promote profile role to market_admin (if currently citizen)
  const { error: assignErr } = await supabase
    .from('market_admins')
    .insert({ market_id: params.id, user_id: target.id })
  if (assignErr && !assignErr.message.includes('duplicate')) {
    return NextResponse.json({ error: assignErr.message }, { status: 400 })
  }

  await service
    .from('profiles')
    .update({ role: 'market_admin' })
    .eq('id', target.id)
    .eq('role', 'citizen')

  return NextResponse.json({ ok: true, user_id: target.id })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'user_id richiesto' }, { status: 400 })

  const { error } = await supabase
    .from('market_admins')
    .delete()
    .eq('market_id', params.id)
    .eq('user_id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
