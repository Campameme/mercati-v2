import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Store, Newspaper, Calendar, Cloud, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatMarketDays } from '@/lib/markets/days'
import { OliveSprig, WaveDivider } from '@/components/decorations'
import { slugifyName } from '@/lib/markets/slug'
import { classifySchedule, CATEGORY_COLOR } from '@/lib/schedules/classify'
import ZoneImage from '@/components/ZoneImage'
import Reveal from '@/components/Reveal'
import MarketViewer from '@/components/MarketViewer'
import FavoriteButton from '@/components/FavoriteButton'

export const dynamic = 'force-dynamic'

const ZONE_HERO_COMUNE: Record<string, string> = {
  'val-nervia':             'Camporosso',
  'bordighera-ospedaletti': 'Bordighera',
  'taggia-e-costa':         'Taggia',
  'golfo-dianese':          'Diano Marina',
  'entroterra':             'Pieve di Teco',
}

export default async function MarketHomePage({ params }: { params: { marketSlug: string } }) {
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
  const prevMarket = idx > 0 ? (allMarkets ?? [])[idx - 1] : null
  const nextMarket = idx < (allMarkets?.length ?? 0) - 1 ? (allMarkets ?? [])[idx + 1] : null

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

  const mapPins = (schedules ?? [])
    .filter((s) => s.lat != null && s.lng != null)
    .map((s: any) => {
      const placePolygon = s.market_places?.polygon_geojson ?? null
      return {
        id: s.id as string,
        lat: s.lat as number,
        lng: s.lng as number,
        kind: 'market' as const,
        title: `${s.comune} · ${s.giorno}`,
        subtitle: s.luogo ?? s.settori ?? undefined,
        polygon: (placePolygon ?? s.polygon_geojson ?? null) as any,
        href: `/${marketFull.slug}/c/${slugifyName(s.comune)}`,
      }
    })

  const comuni = Array.from(new Set((schedules ?? []).map((s) => s.comune)))
  const heroQuery = ZONE_HERO_COMUNE[marketFull.slug] ?? marketFull.city ?? comuni[0]

  const features = [
    { href: `/${marketFull.slug}/operators`, label: 'Banchi',     icon: Store },
    { href: `/${marketFull.slug}/calendar`,  label: 'Calendario', icon: Calendar },
    { href: `/${marketFull.slug}/news`,      label: 'Notizie',    icon: Newspaper },
    { href: `/${marketFull.slug}/weather`,   label: 'Meteo',      icon: Cloud },
  ]

  return (
    <div>
      {/* HERO: foto a sinistra (piccola) + testo + mappa above-the-fold a destra */}
      <section className="border-b border-cream-300">
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-6xl">
          <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-10 items-start">
            {/* Foto a sinistra, leggermente più piccola */}
            <Reveal>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest-plus text-ink-muted hover:text-ink mb-4 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Provincia
              </Link>
              <div className="relative rounded-sm overflow-hidden border border-cream-300 shadow-sm bg-cream-50 p-1.5">
                <ZoneImage
                  query={heroQuery}
                  fallbackQuery={comuni[0] ?? marketFull.city}
                  alt={marketFull.name}
                  aspect="aspect-[4/5]"
                  priority
                />
              </div>
              <p className="mt-2 text-[11px] text-ink-muted italic">{heroQuery} · via Wikipedia</p>
            </Reveal>

            {/* Testo + mappa */}
            <div>
              <Reveal>
                <div className="flex items-center gap-3 mb-4 text-ink-soft">
                  <OliveSprig className="w-10 h-3 text-olive-500" />
                  <p className="text-[0.72rem] uppercase tracking-widest-plus">
                    {comuni.length > 1 ? `${comuni.length} comuni` : marketFull.city}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <h1 className="font-serif text-3xl md:text-5xl leading-[1.04] tracking-tight text-ink flex-1">
                    {marketFull.name}
                  </h1>
                  <FavoriteButton kind="market" id={marketFull.slug} label={marketFull.name} />
                </div>
                {marketFull.description && (
                  <p className="mt-4 text-sm md:text-base text-ink-soft max-w-2xl leading-relaxed">
                    {marketFull.description}
                  </p>
                )}
                {marketFull.market_days && marketFull.market_days.length > 0 && (
                  <p className="mt-3 text-sm text-ink-soft">
                    <span className="uppercase tracking-widest-plus text-xs text-ink-muted mr-2">Giorni</span>
                    <span className="text-ink">{formatMarketDays(marketFull.market_days)}</span>
                  </p>
                )}
              </Reveal>

              {mapPins.length > 0 && (
                <Reveal delayMs={80} className="mt-5">
                  <MarketViewer pins={mapPins} mapHeight="460px" />
                  <p className="mt-2 text-[11px] text-ink-muted">
                    {mapPins.length} {mapPins.length === 1 ? 'mercato' : 'mercati'} · parcheggi entro 2 km
                  </p>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        {/* Shortcut */}
        <Reveal as="nav" className="grid grid-cols-2 md:grid-cols-4 gap-2 py-8 border-b border-cream-300">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <Link
                key={f.href}
                href={f.href}
                className="group flex items-center justify-between gap-3 px-4 py-3 border border-cream-300 rounded-sm bg-cream-50 hover:bg-cream-100 hover:border-olive-500 transition-all hover:-translate-y-0.5"
                style={{ transitionDelay: `${i * 20}ms` }}
              >
                <span className="flex items-center gap-2.5 text-sm text-ink font-medium">
                  <Icon className="w-4 h-4 text-olive-500" />
                  {f.label}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-olive-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            )
          })}
        </Reveal>

        {/* Comuni con foto */}
        {comuni.length > 1 && (
          <section className="py-12 md:py-16">
            <Reveal className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-1">I borghi</p>
                <h2 className="font-serif text-2xl md:text-3xl text-ink">I comuni della zona</h2>
              </div>
              <WaveDivider className="w-24 text-sea-500 opacity-60 hidden md:block" />
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {comuni.map((c, i) => {
                const slug = slugifyName(c)
                return (
                  <Reveal key={c} delayMs={Math.min(i, 5) * 60}>
                    <Link
                      href={`/${marketFull.slug}/c/${slug}`}
                      className="group block bg-cream-50 border border-cream-300 rounded-sm overflow-hidden hover:border-olive-500 hover:shadow-sm transition-all hover:-translate-y-0.5"
                    >
                      <ZoneImage query={c} aspect="aspect-[3/2]" hoverZoom />
                      <div className="p-4 flex items-baseline justify-between">
                        <h3 className="font-serif text-lg text-ink leading-tight group-hover:text-olive-700 transition-colors">{c}</h3>
                        <span className="text-ink-muted group-hover:text-olive-600 group-hover:translate-x-0.5 transition-all">→</span>
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
                <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-1">Il calendario locale</p>
                <h2 className="font-serif text-2xl md:text-3xl text-ink">Mercati di questa zona</h2>
              </div>
              <Link href={`/${marketFull.slug}/calendar`} className="text-xs text-ink-muted hover:text-ink underline underline-offset-2">
                Calendario completo →
              </Link>
            </Reveal>

            <ul>
              {schedules.map((s, i) => {
                const cat = classifySchedule(s.settori)
                const comuneSlug = slugifyName(s.comune)
                return (
                  <Reveal as="li" key={i} delayMs={Math.min(i, 8) * 40} className="border-t border-cream-300 last:border-b">
                    <Link
                      href={`/${marketFull.slug}/c/${comuneSlug}`}
                      className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 items-baseline py-5 md:py-6 hover:bg-cream-50 -mx-4 px-4 md:-mx-6 md:px-6 transition-all"
                    >
                      <div className="md:col-span-3 flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLOR[cat] }} />
                        <h3 className="font-serif text-lg md:text-xl text-ink group-hover:text-olive-700 transition-colors">{s.comune}</h3>
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
                        <span className="text-ink-muted group-hover:text-olive-600 group-hover:translate-x-1 transition-all">→</span>
                      </div>
                    </Link>
                  </Reveal>
                )
              })}
            </ul>
          </section>
        )}

        {/* Nav prev/next tra zone */}
        <nav className="grid grid-cols-2 gap-3 py-8 border-t border-cream-300 text-sm">
          {prevMarket ? (
            <Link
              href={`/${prevMarket.slug}`}
              className="group flex items-center gap-3 px-4 py-3 bg-cream-50 border border-cream-300 rounded-sm hover:border-olive-500 hover:-translate-y-0.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-olive-500 group-hover:-translate-x-0.5 transition-transform" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest-plus text-ink-muted">Zona precedente</p>
                <p className="font-serif text-base text-ink truncate">{prevMarket.name}</p>
              </div>
            </Link>
          ) : <div />}
          {nextMarket ? (
            <Link
              href={`/${nextMarket.slug}`}
              className="group flex items-center justify-end gap-3 px-4 py-3 bg-cream-50 border border-cream-300 rounded-sm hover:border-olive-500 hover:-translate-y-0.5 transition-all text-right"
            >
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest-plus text-ink-muted">Zona successiva</p>
                <p className="font-serif text-base text-ink truncate">{nextMarket.name}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-olive-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : <div />}
        </nav>
      </div>
    </div>
  )
}
