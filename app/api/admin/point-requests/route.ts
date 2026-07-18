import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guard'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

// Richieste punti da scontrino (solo super admin):
//  GET  ?status=pending|all   → elenco con email cliente e nome banco
//  POST { requestId, approve } → approva/rifiuta (RPC atomica points_request_decide)

export async function GET(request: NextRequest) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const status = new URL(request.url).searchParams.get('status') ?? 'pending'

  let q = service
    .from('point_requests')
    .select('id, user_id, operator_id, amount_cents, points, note, status, created_at, operators(name)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (status !== 'all') q = q.eq('status', status)
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Email dei clienti (dal service auth) per la lista
  const rows = data ?? []
  const userIds = Array.from(new Set(rows.map((r: any) => r.user_id)))
  const emailById = new Map<string, string>()
  if (userIds.length) {
    const { data: page } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 })
    for (const u of page?.users ?? []) if (u.id && u.email) emailById.set(u.id, u.email)
  }
  const shaped = rows.map((r: any) => ({
    id: r.id,
    email: emailById.get(r.user_id) ?? '—',
    operator: r.operators?.name ?? '—',
    amountCents: r.amount_cents,
    points: r.points,
    note: r.note,
    status: r.status,
    createdAt: r.created_at,
  }))
  return NextResponse.json({ data: shaped })
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const body = await request.json().catch(() => ({}))
  const requestId = String(body?.requestId ?? '')
  const approve = !!body?.approve
  if (!requestId) return NextResponse.json({ error: 'requestId richiesto' }, { status: 400 })

  const { data, error } = await service.rpc('points_request_decide', {
    p_request: requestId, p_approve: approve, p_decider: guard.user.id,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const row = Array.isArray(data) ? data[0] : data
  return NextResponse.json({ ok: true, request: row })
}
