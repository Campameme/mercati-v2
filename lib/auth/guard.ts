import 'server-only'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// Guardie di autorizzazione per le route /api. Il middleware protegge solo le
// PAGINE (/admin, /operator): ogni route API di mutazione deve chiamare una di
// queste guardie. Le RLS su Supabase restano la seconda linea di difesa.

type Supa = ReturnType<typeof createClient>

type Deny = { ok: false; res: NextResponse }

export type Guard =
  | { ok: true; supabase: Supa; user: User; role: string }
  | Deny

export type OperatorGuard =
  | {
      ok: true
      supabase: Supa
      user: User
      role: string
      isOwner: boolean
      isAdmin: boolean
      operator: { id: string; user_id: string | null; market_id: string }
    }
  | Deny

function deny(status: number, error: string): Deny {
  return { ok: false, res: NextResponse.json({ error }, { status }) }
}

async function isMarketAdminOf(supabase: Supa, userId: string, marketId: string): Promise<boolean> {
  const { data } = await supabase
    .from('market_admins')
    .select('market_id')
    .eq('market_id', marketId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

/**
 * Richiede un utente autenticato con ruolo admin.
 * - super_admin: sempre ammesso.
 * - market_admin: ammesso solo se NON `superOnly`; se `marketId` è indicato,
 *   deve risultare assegnato a quel mercato in `market_admins`.
 */
export async function requireAdmin(
  opts: { marketId?: string | null; superOnly?: boolean } = {},
): Promise<Guard> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return deny(401, 'Non autenticato')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  const role = profile?.role ?? 'citizen'

  if (role === 'super_admin') return { ok: true, supabase, user, role }
  if (opts.superOnly) return deny(403, 'Operazione riservata al super admin')
  if (role !== 'market_admin') return deny(403, 'Permessi insufficienti')
  if (opts.marketId && !(await isMarketAdminOf(supabase, user.id, opts.marketId))) {
    return deny(403, 'Non sei amministratore di questo mercato')
  }
  return { ok: true, supabase, user, role }
}

/**
 * Accesso a un operatore: ammessi il proprietario della scheda
 * (operators.user_id) e gli admin (super, o market_admin del mercato
 * dell'operatore). Ritorna anche la riga operatore per evitare doppie query.
 */
export async function requireOperatorAccess(operatorId: string): Promise<OperatorGuard> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return deny(401, 'Non autenticato')

  const { data: operator } = await supabase
    .from('operators')
    .select('id, user_id, market_id')
    .eq('id', operatorId)
    .maybeSingle()
  if (!operator) return deny(404, 'Operatore non trovato')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  const role = profile?.role ?? 'citizen'

  const isOwner = operator.user_id === user.id
  const isAdmin =
    role === 'super_admin' ||
    (role === 'market_admin' && (await isMarketAdminOf(supabase, user.id, operator.market_id)))

  if (!isOwner && !isAdmin) return deny(403, 'Permessi insufficienti')
  return { ok: true, supabase, user, role, isOwner, isAdmin, operator }
}
