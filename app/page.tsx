import { loadPins } from '@/lib/markets/loadPins'
import { createClient } from '@/lib/supabase/server'
import MapHome, { type HomeEvent } from '@/components/home/MapHome'
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
    </>
  )
}
