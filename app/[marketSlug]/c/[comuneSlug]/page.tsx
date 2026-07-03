import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { slugifyName } from '@/lib/markets/slug'
import { SunRay } from '@/components/decorations'
import Reveal from '@/components/Reveal'
import ComuneSessionsExplorer from '@/components/ComuneSessionsExplorer'
import PageviewTracker from '@/components/analytics/PageviewTracker'
import DriftBackdrop from '@/components/motion/DriftBackdrop'
import Cartolina from '@/components/Cartolina'

export const dynamic = 'force-dynamic'

export default async function ComunePage({
  params,
}: {
  params: { marketSlug: string; comuneSlug: string }
}) {
  const supabase = createClient()
  const { data: market } = await supabase
    .from('markets')
    .select('id, slug, name, city, is_active')
    .ilike('slug', params.marketSlug)
    .maybeSingle()
  if (!market || !market.is_active) notFound()

  const { data: schedules } = await supabase
    .from('market_schedules')
    .select('id, comune, giorno, orario, luogo, settori, lat, lng, polygon_geojson, place_id, market_places(polygon_geojson)')
    .eq('market_id', market.id)
    .eq('is_active', true)
    .order('comune', { ascending: true })

  const forComuneRaw = (schedules ?? []).filter((s) => slugifyName(s.comune) === params.comuneSlug)
  if (forComuneRaw.length === 0) notFound()
  const forComune = forComuneRaw.map((s: any) => ({
    id: s.id,
    comune: s.comune,
    giorno: s.giorno,
    orario: s.orario,
    luogo: s.luogo,
    settori: s.settori,
    lat: s.lat,
    lng: s.lng,
    polygon_geojson: s.polygon_geojson ?? null,
    placePolygon: s.market_places?.polygon_geojson ?? null,
  }))

  const comune = forComune[0].comune

  // Lista comuni della zona ordinati — per prev/next
  const comuniOrdinati = Array.from(new Set((schedules ?? []).map((s) => s.comune)))
    .sort((a, b) => a.localeCompare(b, 'it'))
  const curIdx = comuniOrdinati.indexOf(comune)
  const prevComune = curIdx > 0 ? comuniOrdinati[curIdx - 1] : null
  const nextComune = curIdx < comuniOrdinati.length - 1 ? comuniOrdinati[curIdx + 1] : null

  // Operatori del comune: modello M:N (operator_schedules) + fallback legacy.
  // Così un ambulante presente in più mercati compare in ognuno di essi.
  const scheduleIds = forComune.map((s) => s.id)
  const [{ data: links }, { data: legacy }] = await Promise.all([
    supabase
      .from('operator_schedules')
      .select('schedule_id, stall_number, operators(id, name, category, description)')
      .in('schedule_id', scheduleIds),
    supabase
      .from('operators')
      .select('id, name, category, description, stall_number, schedule_id')
      .eq('market_id', market.id)
      .in('schedule_id', scheduleIds),
  ])
  const opMap = new Map<string, { id: string; name: string; category: string; description: string | null; stall_number: string | null; schedule_id: string | null }>()
  for (const l of (links ?? []) as any[]) {
    const op = l.operators
    if (!op) continue
    opMap.set(`${op.id}:${l.schedule_id}`, {
      id: op.id, name: op.name, category: op.category, description: op.description ?? null,
      stall_number: l.stall_number ?? null, schedule_id: l.schedule_id,
    })
  }
  for (const o of (legacy ?? []) as any[]) {
    const k = `${o.id}:${o.schedule_id}`
    if (!opMap.has(k)) opMap.set(k, { id: o.id, name: o.name, category: o.category, description: o.description ?? null, stall_number: o.stall_number ?? null, schedule_id: o.schedule_id })
  }
  const operators = Array.from(opMap.values())

  return (
    <div>
      <PageviewTracker type="view_comune" marketId={market.id} comune={comune} />
      {/* HERO compatto: foto sx, titolo dx. Mappa è sotto in ComuneSessionsExplorer */}
      <section className="relative overflow-hidden bg-carta bg-paper-grain border-b-2 border-ink/10">
        <DriftBackdrop tone="light" variant="section" />
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-10 max-w-6xl relative z-10">
          <div className="grid md:grid-cols-[220px_1fr] gap-6 md:gap-10 items-start">
            <Reveal>
              <Link
                href={`/${market.slug}`}
                className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-mare-600 mb-3 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> {market.name}
              </Link>
              <Cartolina query={comune} alt={comune} caption={`${comune} · via Wikipedia`} aspect="aspect-[4/5]" tilt="l" tape priority />
            </Reveal>

            <Reveal>
              <div className="flex items-center gap-3 mb-3 text-ink-soft">
                <SunRay className="w-5 h-5 text-sole" aria-hidden="true" />
                <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em]">Comune</p>
              </div>
              <h1 className="font-display text-3xl md:text-5xl text-ink leading-[1.06]"><span className="imk-mark text-ink">{comune}</span></h1>
              <p className="mt-3 text-sm text-ink-soft">
                {forComune.length} {forComune.length === 1 ? 'mercato' : 'mercati'} · {market.name}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-5xl">
        <ComuneSessionsExplorer
          marketSlug={market.slug}
          marketName={market.name}
          marketCity={market.city}
          comune={comune}
          sessions={forComune}
          operators={operators}
        />

        {/* Sulla Riviera: cartoline di costa e borgo */}
        <section className="mt-12 pt-10 border-t-2 border-ink/10">
          <Reveal className="mb-6">
            <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-fiore-600 mb-1">Sulla Riviera</p>
            <h2 className="font-alt font-bold text-2xl text-ink">Attorno a {comune}</h2>
          </Reveal>
          <Reveal delayMs={60} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Cartolina query={`${comune} Liguria`} fallbackQuery={comune} caption={comune} tilt="l" aspect="aspect-[4/3]" />
            <Cartolina query={`${market.city} Liguria`} fallbackQuery="Riviera dei Fiori" caption={market.city} tilt="r" aspect="aspect-[4/3]" />
            <Cartolina query="Riviera dei Fiori mare" fallbackQuery="Liguria mare" caption="Il mare di Ponente" tilt="l" aspect="aspect-[4/3]" />
          </Reveal>
        </section>

        {/* Nav prev/next tra comuni della stessa zona */}
        {(prevComune || nextComune) && (
          <nav className="grid grid-cols-2 gap-3 mt-12 pt-8 border-t-2 border-ink/10 text-sm">
            {prevComune ? (
              <Link
                href={`/${market.slug}/c/${slugifyName(prevComune)}`}
                className="imk-water imk-edge imk-lift group flex items-center gap-3 px-4 py-3 bg-white border-2 border-ink/10 hover:border-mare transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-mare group-hover:-translate-x-0.5 transition-transform" />
                <div className="min-w-0">
                  <p className="font-alt text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Comune precedente</p>
                  <p className="font-alt font-bold text-base text-ink truncate">{prevComune}</p>
                </div>
              </Link>
            ) : <div />}
            {nextComune ? (
              <Link
                href={`/${market.slug}/c/${slugifyName(nextComune)}`}
                className="imk-water imk-edge imk-lift group flex items-center justify-end gap-3 px-4 py-3 bg-white border-2 border-ink/10 hover:border-mare transition-colors text-right"
              >
                <div className="min-w-0">
                  <p className="font-alt text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Comune successivo</p>
                  <p className="font-alt font-bold text-base text-ink truncate">{nextComune}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-mare group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : <div />}
          </nav>
        )}
      </div>
    </div>
  )
}
