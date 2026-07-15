import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Store, Newspaper, Cloud, ArrowRight, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatMarketDays } from '@/lib/markets/days'
import { slugifyName } from '@/lib/markets/slug'
import { classifySchedule, CATEGORY_COLOR } from '@/lib/schedules/classify'
import { ZONE_BY_SLUG } from '@/lib/markets/zones'
import { ZONES_I18N } from '@/lib/markets/zones.i18n'
import { getLang } from '@/lib/i18n/getLang'
import { UI_I18N } from '@/lib/i18n/ui'
import ZoneImage from '@/components/ZoneImage'
import Reveal from '@/components/Reveal'
import MarketViewer from '@/components/MarketViewer'
import FavoriteButton from '@/components/FavoriteButton'
import PageviewTracker from '@/components/analytics/PageviewTracker'

export const dynamic = 'force-dynamic'

// Il lookup in generateMetadata avviene PRIMA che lo streaming parta (i
// loading.tsx creano Suspense boundary): così uno slug inesistente produce un
// VERO 404 HTTP (non un soft-404 con status 200) e ogni zona ha title propri.
export async function generateMetadata({ params }: { params: { marketSlug: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data: market } = await supabase
    .from('markets')
    .select('name, city, description')
    .eq('slug', params.marketSlug)
    .eq('is_active', true)
    .maybeSingle()
  if (!market) notFound()
  return {
    title: market.name,
    description:
      market.description?.slice(0, 160) ||
      `Il mercato di ${market.city ?? market.name}: giorni e orari, banchi, ambulanti e come arrivarci — Riviera dei Fiori, provincia di Imperia.`,
  }
}

// Eyebrow del territorio (stesso giro di lingue dell'hero della home).
const RIVIERA_EYEBROW: Record<string, string> = {
  it: 'La Riviera dei Fiori',
  fr: 'La Riviera dei Fiori',
  de: 'Die Riviera dei Fiori',
  en: 'The Riviera dei Fiori',
}

// Comune della foto-hero di ogni zona (le foto sono la selezione curata in
// public/zone — vedi lib/zonePhotos): il soggetto più riconoscibile della zona.
const ZONE_HERO_COMUNE: Record<string, string> = {
  'val-nervia':             'Perinaldo',
  'bordighera-ospedaletti': 'Bordighera',
  'taggia-e-costa':         'Arma di Taggia',
  'golfo-dianese':          'Cervo',
  'entroterra':             'Pieve di Teco',
}

export default async function MarketHomePage({ params }: { params: { marketSlug: string } }) {
  const lang = getLang()
  const ui = UI_I18N[lang]
  const supabase = createClient()

  // Carica tutte le zone attive ordinate (serve per prev/next)
  const { data: allMarkets } = await supabase
    .from('markets')
    .select('id, slug, name')
    .eq('is_active', true)
    .order('name', { ascending: true })

  const idx = (allMarkets ?? []).findIndex((m) => m.slug === params.marketSlug)
  const market = idx >= 0 ? (allMarkets ?? [])[idx] : null
  if (!market) notFound()

  // Full market info + sessions (con coord e poligoni per la mappa)
  const [{ data: marketFull }, { data: schedules }] = await Promise.all([
    supabase.from('markets').select('*').eq('id', market.id).maybeSingle(),
    supabase
      .from('market_schedules')
      .select('id, comune, giorno, orario, luogo, settori, lat, lng, polygon_geojson, place_id, market_places(polygon_geojson)')
      .eq('market_id', market.id)
      .eq('is_active', true)
      .order('comune', { ascending: true }),
  ])
  if (!marketFull) notFound()

  // Sulla mappa di zona solo i mercati settimanali (i tipici hanno la loro
  // mappa su /tipici); l'elenco sotto resta completo.
  const mapPins = (schedules ?? [])
    .filter((s) => s.lat != null && s.lng != null && classifySchedule(s.settori) === 'generale')
    .map((s: any) => ({
      id: s.id as string,
      lat: s.lat as number,
      lng: s.lng as number,
      kind: 'market' as const,
      title: `${s.comune} · ${s.giorno}`,
      subtitle: s.luogo ?? s.settori ?? undefined,
      href: `/${marketFull.slug}/c/${slugifyName(s.comune)}`,
      category: classifySchedule(s.settori),
    }))

  const comuni = Array.from(new Set((schedules ?? []).map((s) => s.comune)))
  const heroQuery = ZONE_HERO_COMUNE[marketFull.slug] ?? marketFull.city ?? comuni[0]
  // Il racconto della zona: curato in lib/markets/zones, tradotto in
  // zones.i18n; la description dal DB resta come ripiego per zone non mappate.
  const zoneStory =
    (lang !== 'it' ? ZONES_I18N[marketFull.slug]?.[lang]?.story : null) ??
    ZONE_BY_SLUG[marketFull.slug]?.story ??
    marketFull.description

  const features = [
    { href: `/${marketFull.slug}/operators`, label: ui.featBanchi,   icon: Store },
    { href: `/${marketFull.slug}/news`,      label: ui.featNews,     icon: Newspaper },
    { href: `/${marketFull.slug}/weather`,   label: ui.featWeather,  icon: Cloud },
  ]

  return (
    <div>
      <PageviewTracker type="view_market" marketId={marketFull.id} />
      {/* HERO: foto a sinistra (piccola) + testo + mappa above-the-fold a destra */}
      <section className="relative overflow-hidden bg-crema border-b border-[#e0d7c1]">
        {/* band di testa: filo di brand in cima (crosshatch alga) */}
        <div className="mz-band" aria-hidden="true" />
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-6xl relative z-10">
          <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-10 items-start">
            {/* Foto a sinistra, leggermente più piccola — cornice bianca semplice */}
            <Reveal>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-alga-600 mb-4 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> {ui.zoneBack}
              </Link>
              <figure className="-rotate-1 bg-white border border-[#e0d7c1] rounded-md p-1.5 pb-2 shadow-lg">
                <ZoneImage
                  query={heroQuery}
                  fallbackQuery={comuni[0] ?? marketFull.city}
                  alt={marketFull.name}
                  aspect="aspect-[4/5]"
                  className="rounded-sm"
                  priority
                />
                <figcaption className="mt-1 px-1 font-alt italic text-xs text-ink-soft leading-tight">{heroQuery}</figcaption>
              </figure>
            </Reveal>

            {/* Testo + mappa */}
            <div>
              <Reveal>
                <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-4">
                  {RIVIERA_EYEBROW[lang]} · {comuni.length > 1 ? `${comuni.length} ${ui.comuniWord}` : marketFull.city}
                </p>
                <div className="flex items-start gap-2">
                  <h1 className="font-display font-extrabold tracking-tight text-4xl md:text-6xl leading-[1.04] text-ink flex-1">
                    {marketFull.name}
                  </h1>
                  <FavoriteButton kind="market" id={marketFull.slug} label={marketFull.name} />
                </div>
                {zoneStory && (
                  <p className="mt-4 text-sm md:text-base text-ink-soft max-w-2xl leading-relaxed">
                    {zoneStory}
                  </p>
                )}
                {marketFull.market_days && marketFull.market_days.length > 0 && (
                  <p className="mt-3 text-sm text-ink-soft">
                    <span className="font-alt font-semibold uppercase tracking-[0.12em] text-xs text-ink-muted mr-2">{ui.zoneDays}</span>
                    <span className="text-ink">{formatMarketDays(marketFull.market_days)}</span>
                  </p>
                )}
              </Reveal>

              {mapPins.length > 0 && (
                <Reveal delayMs={80} className="mt-5">
                  <MarketViewer pins={mapPins} mapHeight="460px" />
                  <p className="mt-2 text-xs text-ink-soft">
                    {mapPins.length} {mapPins.length === 1 ? ui.zoneMarketsCount.one : ui.zoneMarketsCount.many} · {ui.zoneParkingNote}
                  </p>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        {/* Shortcut — pill di navigazione */}
        <Reveal as="nav" className="grid grid-cols-2 md:grid-cols-4 gap-2 py-8 border-b border-[#e0d7c1]">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <Link
                key={f.href}
                href={f.href}
                className="imk-lift group flex items-center justify-between gap-3 px-5 py-3 rounded-full bg-white border border-[#e0d7c1] hover:border-alga transition-colors"
                style={{ transitionDelay: `${i * 20}ms` }}
              >
                <span className="flex items-center gap-2.5 font-alt text-sm text-ink font-semibold">
                  <Icon className="w-4 h-4 text-alga" aria-hidden="true" />
                  {f.label}
                </span>
                <ArrowRight className="imk-march w-3.5 h-3.5 text-ink-muted group-hover:text-terracotta transition-colors" />
              </Link>
            )
          })}
        </Reveal>

        {/* Comuni con foto */}
        {comuni.length > 1 && (
          <section className="py-12 md:py-16">
            <Reveal className="mb-8">
              <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-1">{ui.zoneComuni}</p>
              <h2 className="font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink">{ui.zoneComuniTitle}</h2>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {comuni.map((c, i) => {
                const slug = slugifyName(c)
                return (
                  <Reveal key={c} delayMs={Math.min(i, 5) * 60}>
                    <Link
                      href={`/${marketFull.slug}/c/${slug}`}
                      className="imk-lift group block bg-white rounded-xl border border-[#e0d7c1] overflow-hidden hover:border-alga transition-colors"
                    >
                      <span aria-hidden="true" className="mz-band block" />
                      <ZoneImage query={c} aspect="aspect-[3/2]" hoverZoom />
                      <div className="p-4 flex items-baseline justify-between">
                        <h3 className="font-display font-extrabold tracking-tight text-lg text-ink leading-tight group-hover:text-alga-600 transition-colors">{c}</h3>
                        <ArrowRight className="imk-march w-4 h-4 self-center text-ink-muted group-hover:text-terracotta transition-colors" aria-hidden="true" />
                      </div>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          </section>
        )}

        {/* Sessioni */}
        {schedules && schedules.length > 0 && (
          <section className="py-12 md:py-16">
            <Reveal className="flex items-end justify-between mb-8">
              <div>
                <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-1">{ui.zoneLocalCalendar}</p>
                <h2 className="font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink">{ui.zoneMarketsTitle}</h2>
              </div>
            </Reveal>

            <ul>
              {schedules.map((s, i) => {
                const cat = classifySchedule(s.settori)
                const comuneSlug = slugifyName(s.comune)
                return (
                  <Reveal as="li" key={i} delayMs={Math.min(i, 8) * 40} className="border-t border-[#e0d7c1] last:border-b">
                    <Link
                      href={`/${marketFull.slug}/c/${comuneSlug}`}
                      className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 items-baseline py-5 md:py-6 hover:bg-white -mx-4 px-4 md:-mx-6 md:px-6 transition-colors"
                    >
                      <div className="md:col-span-3 flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLOR[cat] }} />
                        <h3 className="font-display font-extrabold tracking-tight text-lg md:text-xl text-ink group-hover:text-alga-600 transition-colors">{s.comune}</h3>
                      </div>
                      <div className="md:col-span-4">
                        <p className="text-sm text-ink">{s.giorno}</p>
                        {s.orario && <p className="text-xs text-ink-muted tabular-nums mt-1">{s.orario}</p>}
                      </div>
                      <div className="md:col-span-4">
                        {s.luogo && <p className="text-sm text-ink-soft">{s.luogo}</p>}
                        {s.settori && <p className="text-xs text-ink-muted mt-1 italic line-clamp-1">{s.settori}</p>}
                      </div>
                      <div className="md:col-span-1 flex md:justify-end items-center">
                        <span className="text-ink-muted group-hover:text-terracotta group-hover:translate-x-1 transition-all">→</span>
                      </div>
                    </Link>
                  </Reveal>
                )
              })}
            </ul>
          </section>
        )}

      </div>
    </div>
  )
}
