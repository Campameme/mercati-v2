import { createClient } from '@/lib/supabase/server'
import { slugifyName } from '@/lib/markets/slug'
import { IMPERIA_ZONE_SLUGS } from '@/lib/markets/zones'
import type { MarketPin } from '@/components/home/types'

/**
 * Carica i mercati attivi + le sessioni e li raggruppa in MarketPin (uno per
 * LUOGO fisico: mercato + comune + luogo). Condiviso tra la home e /mappa.
 * PERIMETRO: solo la Riviera dei Fiori (provincia di Imperia) — le zone di
 * Savona restano nel DB ma fuori da ogni interfaccia.
 */
export async function loadPins(): Promise<MarketPin[]> {
  const supabase = createClient()
  const riviera = [...IMPERIA_ZONE_SLUGS]
  const [{ data: markets }, { data: schedules }] = await Promise.all([
    supabase.from('markets').select('id, slug, name, city, market_days').eq('is_active', true).in('slug', riviera),
    supabase
      .from('market_schedules')
      .select('id, market_id, comune, giorno, orario, settori, luogo, lat, lng, is_active, markets!inner(is_active, slug)')
      .eq('is_active', true)
      .eq('markets.is_active', true)
      .in('markets.slug', riviera),
  ])

  const marketInfo = new Map(
    (markets ?? []).map((m: any) => [
      m.id as string,
      { slug: m.slug as string, name: m.name as string, market_days: (m.market_days ?? []) as number[] },
    ]),
  )

  const byKey = new Map<string, MarketPin>()
  for (const s of schedules ?? []) {
    const row = s as any
    const mi = marketInfo.get(row.market_id)
    if (!mi) continue
    const lat = typeof row.lat === 'number' ? row.lat : parseFloat(row.lat)
    const lng = typeof row.lng === 'number' ? row.lng : parseFloat(row.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    const comune = row.comune as string
    const luogo = (row.luogo as string | null) ?? null
    const comuneSlug = slugifyName(comune)
    const luogoSlug = slugifyName(luogo ?? 'centro') || 'centro'
    const key = `${mi.slug}:${comuneSlug}:${luogoSlug}`
    let pin = byKey.get(key)
    if (!pin) {
      pin = {
        id: key,
        marketId: row.market_id,
        marketSlug: mi.slug,
        marketName: mi.name,
        marketDays: mi.market_days,
        comune,
        comuneSlug,
        luogo,
        lat,
        lng,
        sessions: [],
      }
      byKey.set(key, pin)
    }
    pin.sessions.push({
      scheduleId: row.id,
      giorno: row.giorno ?? null,
      orario: row.orario ?? null,
      luogo,
      settori: (row.settori as string | null) ?? null,
    })
  }

  return Array.from(byKey.values()).sort((a, b) => a.comune.localeCompare(b.comune, 'it'))
}
