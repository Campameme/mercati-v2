import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireNewsAccess, type Guard } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

// Guardia sulla news esistente: redazione e super admin → tutto,
// market_admin → solo il suo mercato (mai le globali).
async function guardByNews(newsId: string): Promise<Guard> {
  const { data: existing } = await createClient()
    .from('news')
    .select('id, market_id, is_global')
    .eq('id', newsId)
    .maybeSingle()
  if (!existing) return { ok: false, res: NextResponse.json({ error: 'News non trovata' }, { status: 404 }) }
  return requireNewsAccess({ marketId: existing.market_id, isGlobal: !!existing.is_global })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await guardByNews(params.id)
  if (!guard.ok) return guard.res
  const supabase = guard.supabase
  const body = await request.json()
  const allowed = ['title', 'content', 'type', 'priority', 'status', 'publish_from', 'publish_until', 'is_global', 'market_id']
  const update: Record<string, unknown> = {}
  for (const k of allowed) if (k in body) update[k] = body[k]
  // Clamp lunghezze sui campi testuali liberi (coerente con la POST).
  if (typeof update.title === 'string') update.title = update.title.trim().slice(0, 300)
  if (typeof update.content === 'string') update.content = update.content.slice(0, 20000)
  if (update.status && update.status !== 'draft' && update.status !== 'published') {
    return NextResponse.json({ error: 'status non valido' }, { status: 400 })
  }
  // Promuovere una news a globale è della redazione (o del super admin).
  if (update.is_global === true && guard.role !== 'super_admin' && guard.role !== 'news_editor') {
    return NextResponse.json({ error: 'Solo la redazione può rendere una news globale' }, { status: 403 })
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
