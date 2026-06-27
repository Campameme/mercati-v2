import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { slugifyName } from '@/lib/markets/slug'
import MapHome from '@/components/home/MapHome'
import Logo from '@/components/Logo'
import type { MarketPin } from '@/components/home/types'
import PageviewTracker from '@/components/analytics/PageviewTracker'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createClient()
  const [{ data: markets }, { data: schedules }] = await Promise.all([
    supabase
      .from('markets')
      .select('id, slug, name, city, market_days')
      .eq('is_active', true),
    supabase
      .from('market_schedules')
      .select('id, market_id, comune, giorno, orario, settori, luogo, lat, lng, is_active, markets!inner(is_active)')
      .eq('is_active', true)
      .eq('markets.is_active', true),
  ])

  // Indice mercato → info (slug, nome, giorni)
  const marketInfo = new Map(
    (markets ?? []).map((m: any) => [
      m.id as string,
      { slug: m.slug as string, name: m.name as string, market_days: (m.market_days ?? []) as number[] },
    ]),
  )

  // Un pin per LUOGO fisico (mercato + comune + luogo): così ogni mercato
  // distinto dello stesso comune (es. le tante piazze di Sanremo) appare a sé.
  // Le diverse giornate dello stesso luogo confluiscono nelle sue sessioni.
  const byKey = new Map<string, MarketPin>()
  for (const s of schedules ?? []) {
    const row = s as any
    const mi = marketInfo.get(row.market_id)
    if (!mi) continue
    // Coordinate robuste: Supabase può restituire numeric come stringa.
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

  const pins = Array.from(byKey.values()).sort((a, b) => a.comune.localeCompare(b.comune, 'it'))

  return (
    <>
      <PageviewTracker type="view_homepage" />
      <MapHome pins={pins} />
      <footer className="bg-paper border-t-2 border-ink/10 py-8">
        <div className="container mx-auto px-4 md:px-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted">
          <Logo inline className="text-ink text-xs" />
          <span className="text-ink-muted/70">Guida ai mercati della provincia di Imperia.</span>
          <span className="flex-1" />
          <Link href="/operatori" className="hover:text-ink">Ambulanti</Link>
          <Link href="/eventi" className="hover:text-ink">Eventi</Link>
          <Link href="/calendar" className="hover:text-ink">Calendario</Link>
          <Link href="/aderisci" className="hover:text-ink">Aderisci</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/cookie" className="hover:text-ink">Cookie</Link>
          <a href="mailto:emanueleecampanini@gmail.com" className="hover:text-ink">Contatti</a>
        </div>
      </footer>
    </>
  )
}
