import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guard'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

// Scollega una scheda operatore dall'utente a cui è legata (operators.user_id = null).
// Se l'utente non ha più altre schede, riporta profiles.role da 'operator' a
// 'citizen'. Solo super admin (service-role: profiles.role è blindato da 0027).
export async function POST(request: NextRequest) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const body = await request.json().catch(() => ({}))
  const operatorId = String(body?.operatorId ?? '')
  if (!operatorId) return NextResponse.json({ error: 'operatorId richiesto' }, { status: 400 })

  const { data: op } = await service.from('operators').select('id, user_id').eq('id', operatorId).maybeSingle()
  if (!op) return NextResponse.json({ error: 'Operatore non trovato' }, { status: 404 })
  const userId = op.user_id as string | null
  if (!userId) return NextResponse.json({ ok: true, message: 'La scheda era già scollegata.' })

  const { error } = await service.from('operators').update({ user_id: null }).eq('id', operatorId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Nessun'altra scheda operatore legata? Riporta operator → citizen (senza toccare
  // super_admin/market_admin che potrebbero possedere schede per altri motivi).
  const { count } = await service.from('operators').select('id', { count: 'exact', head: true }).eq('user_id', userId)
  if ((count ?? 0) === 0) {
    await service.from('profiles').update({ role: 'citizen' }).eq('id', userId).eq('role', 'operator')
  }

  return NextResponse.json({ ok: true })
}
