import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'node:crypto'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = new Set([
  'view_market', 'view_operator', 'view_comune', 'view_homepage',
  'click_market', 'click_operator', 'click_adesione', 'submit_adesione',
])

function todayString(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function visitorHash(ip: string, ua: string): string {
  const salt = process.env.IP_SALT ?? 'imercati-default-salt'
  if (!process.env.IP_SALT && process.env.NODE_ENV === 'production') {
    console.error('[analytics] IP_SALT mancante in produzione: impostala nelle env del deploy')
  }
  // Rotazione giornaliera: lo stesso utente domani ha un hash diverso.
  // Cosi non possiamo costruire profili cross-day, ma possiamo dedup nello stesso giorno.
  return crypto
    .createHash('sha256')
    .update(`${ip}|${ua}|${salt}|${todayString()}`)
    .digest('hex')
    .slice(0, 32)
}

function detectDeviceType(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/Tablet|iPad/i.test(ua)) return 'tablet'
  if (/Mobile|iPhone|Android(?!.*Tablet)/i.test(ua)) return 'mobile'
  return 'desktop'
}

function extractHost(referrer: string | null): string | null {
  if (!referrer) return null
  try {
    return new URL(referrer).hostname.slice(0, 100)
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const type = body.type
  if (!type || !ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0'
  const ua = request.headers.get('user-agent') ?? ''
  const referrer = request.headers.get('referer')

  const vh = visitorHash(ip, ua)
  const supabase = createClient()

  // Dedup is_unique: stesso visitor + stesso target oggi → is_unique=false
  let isUnique = true
  const targetMatch: any = {}
  if (body.marketId) targetMatch.market_id = body.marketId
  if (body.operatorId) targetMatch.operator_id = body.operatorId
  if (body.scheduleId) targetMatch.schedule_id = body.scheduleId

  if (Object.keys(targetMatch).length > 0) {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    let q = supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .eq('visitor_hash', vh)
      .eq('event_type', type)
      .gte('created_at', startOfDay.toISOString())
    for (const [k, v] of Object.entries(targetMatch)) q = q.eq(k, v as string)
    const { count } = await q
    if ((count ?? 0) > 0) isUnique = false
  }

  await supabase.from('analytics_events').insert({
    event_type: type,
    market_id: body.marketId ?? null,
    operator_id: body.operatorId ?? null,
    schedule_id: body.scheduleId ?? null,
    comune: typeof body.comune === 'string' ? body.comune.slice(0, 120) : null,
    path: typeof body.path === 'string' ? body.path.slice(0, 500) : null,
    visitor_hash: vh,
    referrer_host: extractHost(referrer),
    device_type: detectDeviceType(ua),
    is_unique: isUnique,
  })

  return NextResponse.json({ ok: true })
}
