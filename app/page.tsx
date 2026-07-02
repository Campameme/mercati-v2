import Link from 'next/link'
import { loadPins } from '@/lib/markets/loadPins'
import { createClient } from '@/lib/supabase/server'
import MapHome, { type HomeEvent } from '@/components/home/MapHome'
import Logo from '@/components/Logo'
import PageviewTracker from '@/components/analytics/PageviewTracker'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createClient()
  const nowIso = new Date().toISOString()
  const [pins, { data: evData }] = await Promise.all([
    loadPins(),
    supabase
      .from('events')
      .select('id, title, start_at, markets(slug, name)')
      .or(`end_at.gte.${nowIso},and(end_at.is.null,start_at.gte.${nowIso})`)
      .order('start_at', { ascending: true })
      .limit(3),
  ])

  const events: HomeEvent[] = (evData ?? []).map((e: any) => ({
    id: e.id,
    title: e.title,
    startAt: e.start_at,
    marketName: e.markets?.name ?? null,
  }))

  return (
    <>
      <PageviewTracker type="view_homepage" />
      <MapHome pins={pins} events={events} />
      <footer className="bg-paper border-t-2 border-ink/10 py-8">
        <div className="container mx-auto px-4 md:px-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted">
          <Logo inline className="text-ink text-xs" />
          <span className="text-ink-muted/70">Guida ai mercati della Riviera di Ponente.</span>
          <span className="flex-1" />
          <Link href="/mappa" className="hover:text-ink">Mappa</Link>
          <Link href="/operatori" className="hover:text-ink">Ambulanti</Link>
          <Link href="/eventi" className="hover:text-ink">Eventi</Link>
          <Link href="/aderisci" className="hover:text-ink">Aderisci</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/cookie" className="hover:text-ink">Cookie</Link>
          <a href="mailto:emanueleecampanini@gmail.com" className="hover:text-ink">Contatti</a>
        </div>
      </footer>
    </>
  )
}
