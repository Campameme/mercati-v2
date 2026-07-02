import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, type Guard } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

// Guardia sulla news esistente: globale → super admin, di mercato → admin di quel mercato.
async function guardByNews(newsId: string): Promise<Guard> {
  const { data: existing } = await createClient()
    .from('news')
    .select('id, market_id, is_global')
    .eq('id', newsId)
    .maybeSingle()
  if (!existing) return { ok: false, res: NextResponse.json({ error: 'News non trovata' }, { status: 404 }) }
  return requireAdmin({ marketId: existing.market_id, superOnly: !!existing.is_global })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await guardByNews(params.id)
  if (!guard.ok) return guard.res
  const supabase = guard.supabase
  const body = await request.json()
  const allowed = ['title', 'content', 'type', 'priority', 'publish_from', 'publish_until', 'is_global', 'market_id']
  const update: Record<string, unknown> = {}
  for (const k of allowed) if (k in body) update[k] = body[k]
  // Promuovere una news a globale resta un'operazione da super admin.
  if (update.is_global === true && guard.role !== 'super_admin') {
    return NextResponse.json({ error: 'Solo il super admin può rendere una news globale' }, { status: 403 })
  }
  const { data, error } = await supabase.from('news').update(update).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await guardByNews(params.id)
  if (!guard.ok) return guard.res
  const { error } = await guard.supabase.from('news').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
