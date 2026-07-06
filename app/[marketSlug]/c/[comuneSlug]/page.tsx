import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { slugifyName } from '@/lib/markets/slug'
import { SunRay } from '@/components/decorations'
import Reveal from '@/components/Reveal'
import ComuneSessionsExplorer from '@/components/ComuneSessionsExplorer'
import PageviewTracker from '@/components/analytics/PageviewTracker'
import DriftBackdrop from '@/components/motion/DriftBackdrop'
import Cartolina from '@/components/Cartolina'
import ZoneImage from '@/components/ZoneImage'
import { comuneDescription } from '@/lib/markets/comuni'
import { getLang } from '@/lib/i18n/getLang'
import { UI_I18N } from '@/lib/i18n/ui'
import { weekdaysOf } from '@/lib/markets/hours'
import { haversineMeters } from '@/lib/markets/geo'

export const dynamic = 'force-dynamic'


export default async function ComunePage({
  params,
}: {
  params: { marketSlug: string; comuneSlug: string }
}) {
  const lang = getLang()
  const ui = UI_I18N[lang]
  const WD_SHORT = ui.weekdaysShort
  const supabase = createClient()
  const { data: market } = await supabase
    .from('markets')
    .select('id, slug, name, city, is_active')
    .ilike('slug', params.marketSlug)
    .maybeSingle()
  if (!market || !market.is_active) notFound()

  const { data: schedules } = await supabase
    .from('market_schedules')
    .select('id, comune, giorno, orario, luogo, settori, lat, lng, polygon_geojson, market_places(polygon_geojson)')
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
    // area del mercato: preferita quella del luogo (place), poi quella legacy
    polygon: (s.market_places?.polygon_geojson ?? s.polygon_geojson ?? null),
  }))

  const comune = forComune[0].comune
  const descrizione = comuneDescription(comune, lang)

  // Comuni limitrofi (anche di ALTRE zone): centroide per comune su tutta la
  // Riviera, poi i 3 più vicini — ognuno apre la SUA pagina comune.
  const { data: allSchedules } = await supabase
    .from('market_schedules')
    .select('comune, giorno, lat, lng, markets!inner(slug, is_active)')
    .eq('is_active', true)
    .eq('markets.is_active', true)

  interface Vicino { comune: string; slug: string; marketSlug: string; lat: number; lng: number; giorni: Set<number>; n: number }
  const byComune = new Map<string, Vicino>()
  for (const s of (allSchedules ?? []) as any[]) {
    if (s.lat == null || s.lng == null) continue
    const key = slugifyName(s.comune)
    const cur = byComune.get(key) ?? {
      comune: s.comune, slug: key, marketSlug: s.markets.slug, lat: 0, lng: 0, giorni: new Set<number>(), n: 0,
    }
    cur.lat += s.lat; cur.lng += s.lng; cur.n += 1
    for (const d of weekdaysOf(s.giorno)) cur.giorni.add(d)
    byComune.set(key, cur)
  }
  const here = byComune.get(params.comuneSlug)
  const vicini = here
    ? Array.from(byComune.values())
        .filter((v) => v.slug !== params.comuneSlug)
        .map((v) => ({ ...v, lat: v.lat / v.n, lng: v.lng / v.n, km: haversineMeters({ lat: here.lat / here.n, lng: here.lng / here.n }, { lat: v.lat / v.n, lng: v.lng / v.n }) / 1000 }))
        .sort((a, b) => a.km - b.km)
        .slice(0, 3)
    : []

  // Operatori del comune: modello M:N (operator_schedules) + fallback legacy.
  // Così un ambulante presente in più mercati compare in ognuno di essi.
  const scheduleIds = forComune.map((s) => s.id)
  const [{ data: links }, { data: legacy }] = await Promise.all([
    supabase
      .from('operator_schedules')
      .select('schedule_id, stall_number, location_lat, location_lng, operators(id, name, category, description)')
      .in('schedule_id', scheduleIds),
    supabase
      .from('operators')
      .select('id, name, category, description, stall_number, schedule_id, location_lat, location_lng')
      .eq('market_id', market.id)
      .in('schedule_id', scheduleIds),
  ])
  const opMap = new Map<string, { id: string; name: string; category: string; description: string | null; stall_number: string | null; schedule_id: string | null; location_lat: number | null; location_lng: number | null }>()
  for (const l of (links ?? []) as any[]) {
    const op = l.operators
    if (!op) continue
    opMap.set(`${op.id}:${l.schedule_id}`, {
      id: op.id, name: op.name, category: op.category, description: op.description ?? null,
      stall_number: l.stall_number ?? null, schedule_id: l.schedule_id,
      location_lat: l.location_lat ?? null, location_lng: l.location_lng ?? null,
    })
  }
  for (const o of (legacy ?? []) as any[]) {
    const k = `${o.id}:${o.schedule_id}`
    if (!opMap.has(k)) opMap.set(k, { id: o.id, name: o.name, category: o.category, description: o.description ?? null, stall_number: o.stall_number ?? null, schedule_id: o.schedule_id, location_lat: o.location_lat ?? null, location_lng: o.location_lng ?? null })
  }
  const operators = Array.from(opMap.values())

  return (
    <div>
      <PageviewTracker type="view_comune" marketId={market.id} comune={comune} />
      {/* HERO compatto: foto sx, titolo + descrizione del paese a dx */}
      <section className="relative overflow-hidden bg-carta border-b-2 border-ink/10">
        <DriftBackdrop tone="light" variant="section" />
        {/* banda-tendone: filo di brand in cima */}
        <div className="imk-awning h-2" aria-hidden="true" />
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-10 max-w-6xl relative z-10">
          <div className="grid md:grid-cols-[220px_1fr] gap-6 md:gap-10 items-start">
            <Reveal>
              <Link
                href={`/${market.slug}`}
                className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-mare-600 mb-3 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> {market.name}
              </Link>
              <Cartolina query={comune} alt={comune} caption={comune} aspect="aspect-[4/5]" tilt="l" tape priority />
            </Reveal>

            <Reveal>
              <div className="flex items-center gap-3 mb-3 text-ink-soft">
                <SunRay className="w-5 h-5 text-sole" aria-hidden="true" />
                <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em]">{ui.comuneLabel}</p>
              </div>
              <h1 className="font-display text-3xl md:text-5xl text-ink leading-[1.06]"><span className="imk-mark text-ink">{comune}</span></h1>
              {descrizione && (
                <p className="mt-4 text-sm md:text-base text-ink-soft max-w-2xl leading-relaxed">{descrizione}</p>
              )}
              <p className="mt-3 text-sm text-ink-soft">
                {forComune.length} {forComune.length === 1 ? ui.zoneMarketsCount.one : ui.zoneMarketsCount.many} · {market.name}
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

        {/* Sulla Riviera: i comuni limitrofi coi loro mercati (link alla pagina comune) */}
        {vicini.length > 0 && (
          <section className="mt-12 pt-10 border-t-2 border-ink/10">
            <Reveal className="mb-6">
              <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-1">{ui.comuneRiviera}</p>
              <h2 className="font-alt font-bold text-2xl text-ink">{ui.comuneAround} {comune}</h2>
              <p className="mt-1 text-sm text-ink-soft">{ui.comuneAroundLead}</p>
            </Reveal>
            <Reveal delayMs={60} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {vicini.map((v) => (
                <Link
                  key={v.slug}
                  href={`/${v.marketSlug}/c/${v.slug}`}
                  className="imk-lift group flex flex-col bg-white border-2 border-ink/10 imk-edge overflow-hidden hover:border-mare transition-colors"
                >
                  <div className="relative">
                    <ZoneImage query={v.comune} alt={v.comune} aspect="aspect-[4/3]" hoverZoom />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-notte/80 to-transparent pointer-events-none" aria-hidden="true" />
                    <span className="absolute left-3 bottom-2.5 right-3 font-alt font-bold text-lg text-carta leading-tight [text-shadow:0_1px_8px_rgba(14,48,64,0.5)]">
                      {v.comune}
                    </span>
                  </div>
                  <div className="p-3.5 flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-alt font-semibold text-ink">
                      {Array.from(v.giorni).sort().map((d) => WD_SHORT[d]).join(' · ') || ui.comuneVariableDates}
                    </span>
                    <span className="text-ink-muted whitespace-nowrap">{v.km < 1 ? ui.comuneNextDoor : `${Math.round(v.km)} km`}</span>
                  </div>
                </Link>
              ))}
            </Reveal>
          </section>
        )}
      </div>
    </div>
  )
}
