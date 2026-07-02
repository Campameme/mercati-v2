import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveMarketFromRequest } from '@/lib/markets/resolve'
import { requireAdmin } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const wantsAll = searchParams.get('all') === '1'
  let adminView = searchParams.get('admin') === '1'

  // La vista admin mostra anche le news programmate/scadute: solo per admin.
  if (adminView) {
    const guard = await requireAdmin()
    if (!guard.ok) adminView = false
  }

  const now = new Date().toISOString()

  if (wantsAll) {
    let q = supabase
      .from('news')
      .select('*, markets(slug, name, city)')
      .order('publish_from', { ascending: false })
    if (!adminView) {
      q = q.lte('publish_from', now).or(`publish_until.is.null,publish_until.gte.${now}`)
    }
    const { data, error } = await q
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  const resolved = await resolveMarketFromRequest(searchParams)
  if (resolved.kind !== 'market') return NextResponse.json({ error: 'Mercato non trovato' }, { status: 404 })

  let q = supabase
    .from('news')
    .select('*, markets(slug, name, city)')
    .or(`market_id.eq.${resolved.market.id},is_global.eq.true`)
    .order('publish_from', { ascending: false })
  if (!adminView) {
    q = q.lte('publish_from', now).or(`publish_until.is.null,publish_until.gte.${now}`)
  }
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, content } = body
  const isGlobal = !!body.is_global
  const marketId = body.market_id ?? null
  if (!title || !content) {
    return NextResponse.json({ error: 'title e content obbligatori' }, { status: 400 })
  }
  if (!isGlobal && !marketId) {
    return NextResponse.json({ error: 'market_id richiesto se non is_global' }, { status: 400 })
  }
  // News globali: solo super admin. News di mercato: admin di quel mercato.
  const guard = await requireAdmin({ marketId, superOnly: isGlobal })
  if (!guard.ok) return guard.res
  const supabase = guard.supabase
  const insert = {
    market_id: isGlobal ? null : marketId,
    is_global: isGlobal,
    title,
    content,
    type: body.type ?? 'notice',
    priority: body.priority ?? 'medium',
    publish_from: body.publish_from ?? new Date().toISOString(),
    publish_until: body.publish_until ?? null,
  }
  const { data, error } = await supabase.from('news').insert(insert).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
