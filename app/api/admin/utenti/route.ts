import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guard'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

// Gestione ruoli e persone (super admin). Le promozioni di ruolo passano SEMPRE
// da qui (service-role): 0027 ha blindato profiles.role lato client. Fonte utenti:
// auth.admin.listUsers (paginato) + join con profiles.role e schede operatore.

const ROLES = ['citizen', 'operator', 'market_admin', 'news_editor', 'super_admin'] as const
type Role = (typeof ROLES)[number]

export async function GET() {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()

  // listUsers è paginato: raccogli tutte le pagine (tetto ragionevole di sicurezza).
  const authUsers: { id: string; email: string; created_at: string }[] = []
  for (let page = 1; page <= 25; page++) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    for (const u of data.users) authUsers.push({ id: u.id, email: u.email ?? '', created_at: u.created_at })
    if (data.users.length < 200) break
  }

  const ids = authUsers.map((u) => u.id)
  const [{ data: profiles }, { data: operators }, { data: newsMarkets }] = await Promise.all([
    service.from('profiles').select('id, full_name, role').in('id', ids),
    service.from('operators').select('id, name, user_id, email'),
    service.from('news_editor_markets').select('user_id, market_id'),
  ])

  const profById = new Map((profiles ?? []).map((p) => [p.id as string, { role: p.role as string, full_name: (p.full_name as string | null) ?? null }]))

  // Mercati-notizie assegnati per redattore.
  const newsMarketsByUser = new Map<string, string[]>()
  for (const r of newsMarkets ?? []) {
    if (!newsMarketsByUser.has(r.user_id)) newsMarketsByUser.set(r.user_id, [])
    newsMarketsByUser.get(r.user_id)!.push(r.market_id as string)
  }

  // Operatori collegati per utente + operatori scollegabili per email (candidati al collegamento).
  const linkedByUser = new Map<string, { id: string; name: string }[]>()
  const linkableByEmail = new Map<string, { id: string; name: string }[]>()
  for (const o of operators ?? []) {
    if (o.user_id) {
      if (!linkedByUser.has(o.user_id)) linkedByUser.set(o.user_id, [])
      linkedByUser.get(o.user_id)!.push({ id: o.id, name: o.name })
    } else if (o.email) {
      const key = String(o.email).toLowerCase()
      if (!linkableByEmail.has(key)) linkableByEmail.set(key, [])
      linkableByEmail.get(key)!.push({ id: o.id, name: o.name })
    }
  }

  const data = authUsers.map((u) => ({
    id: u.id,
    email: u.email,
    full_name: profById.get(u.id)?.full_name ?? null,
    role: profById.get(u.id)?.role ?? 'citizen',
    operators: linkedByUser.get(u.id) ?? [],
    linkable: u.email ? (linkableByEmail.get(u.email.toLowerCase()) ?? []) : [],
    newsMarketIds: newsMarketsByUser.get(u.id) ?? [],
    created_at: u.created_at,
  }))

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const body = await request.json().catch(() => ({}))
  const userId = String(body?.userId ?? '')
  const role = String(body?.role ?? '') as Role
  if (!userId) return NextResponse.json({ error: 'userId richiesto' }, { status: 400 })
  if (!ROLES.includes(role)) return NextResponse.json({ error: 'Ruolo non valido' }, { status: 400 })

  // Guardia "ultimo super admin": non lasciare la rete senza super admin. Se il
  // target è super_admin e lo si declassa, dev'esserci almeno un altro super admin
  // (copre anche l'auto-declassamento: il current user è lui stesso il target).
  if (role !== 'super_admin') {
    const { data: current } = await service.from('profiles').select('role').eq('id', userId).maybeSingle()
    if (current?.role === 'super_admin') {
      const { count } = await service.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'super_admin')
      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: 'È l’unico super admin rimasto: promuovine un altro prima di togliergli il ruolo.' },
          { status: 400 },
        )
      }
    }
  }

  const { error } = await service.from('profiles').update({ role }).eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Pulizia dei poteri RLS residui: is_market_admin() e is_news_editor_of()
  // guardano SOLO le tabelle-ponte, non profiles.role. Lasciare righe orfane
  // dopo un declassamento conserverebbe quei poteri via chiave anon → si puliscono.
  if (role !== 'market_admin') {
    await service.from('market_admins').delete().eq('user_id', userId)
  }
  if (role !== 'news_editor') {
    await service.from('news_editor_markets').delete().eq('user_id', userId)
  }

  return NextResponse.json({ ok: true })
}
