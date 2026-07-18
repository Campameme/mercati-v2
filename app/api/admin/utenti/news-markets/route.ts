import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guard'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

// Assegna/rimuove i mercati di competenza di un redattore (news_editor_markets).
// Solo super admin. Il redattore scrive notizie SOLO per questi mercati (0028).

// Assegnare mercati-notizie ha senso solo per chi è già redattore: is_news_editor_of()
// non controlla il ruolo, quindi darli a un non-redattore gli aprirebbe le notizie
// di quei mercati via chiave anon. Si esige il ruolo news_editor.
async function assertNewsEditor(service: ReturnType<typeof createServiceClient>, userId: string) {
  const { data } = await service.from('profiles').select('role').eq('id', userId).maybeSingle()
  return data?.role === 'news_editor'
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const body = await request.json().catch(() => ({}))
  const userId = String(body?.userId ?? '')
  const marketId = String(body?.marketId ?? '')
  if (!userId || !marketId) return NextResponse.json({ error: 'userId e marketId richiesti' }, { status: 400 })

  if (!(await assertNewsEditor(service, userId))) {
    return NextResponse.json({ error: 'L’utente non è un redattore: assegna prima il ruolo news_editor.' }, { status: 400 })
  }

  const { error } = await service
    .from('news_editor_markets')
    .upsert({ user_id: userId, market_id: marketId }, { onConflict: 'user_id,market_id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin({ superOnly: true })
  if (!guard.ok) return guard.res
  const service = createServiceClient()
  const body = await request.json().catch(() => ({}))
  const userId = String(body?.userId ?? '')
  const marketId = String(body?.marketId ?? '')
  if (!userId || !marketId) return NextResponse.json({ error: 'userId e marketId richiesti' }, { status: 400 })

  const { error } = await service
    .from('news_editor_markets')
    .delete()
    .eq('user_id', userId)
    .eq('market_id', marketId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
