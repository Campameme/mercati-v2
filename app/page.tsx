import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatMarketDays } from '@/lib/markets/days'
import ProvinceMapWrapper from '@/components/ProvinceMapWrapper'
import { MountainSea, WaveDivider, OliveSprig } from '@/components/decorations'
import ZoneImage from '@/components/ZoneImage'
import Reveal from '@/components/Reveal'

export const dynamic = 'force-dynamic'

// Comune di riferimento per l'immagine hero delle zone aggregate (Wikipedia IT).
// Per le zone a città singola si usa direttamente market.city.
const ZONE_HERO_COMUNE: Record<string, string> = {
  'val-nervia':             'Camporosso',
  'bordighera-ospedaletti': 'Bordighera',
  'taggia-e-costa':         'Taggia',
  'golfo-dianese':          'Diano Marina',
  'entroterra':             'Pieve di Teco',
}

function heroQueryFor(slug: string, city: string): string {
  return ZONE_HERO_COMUNE[slug] ?? city
}

export default async function HomePage() {
  const supabase = createClient()
  const [{ data: markets }, { data: schedules }] = await Promise.all([
    supabase
      .from('markets')
      .select('id, slug, name, city, description, market_days')
      .eq('is_active', true)
      .order('name', { ascending: true }),
    supabase
      .from('market_schedules')
      .select('market_id, comune, giorno, orario, luogo, lat, lng, is_active')
      .eq('is_active', true),
  ])

  const comuniByMarket = new Map<string, string[]>()
  const sessionsByMarket = new Map<string, number>()
  for (const s of schedules ?? []) {
    const arr = comuniByMarket.get(s.market_id) ?? []
    if (!arr.includes(s.comune)) arr.push(s.comune)
    comuniByMarket.set(s.market_id, arr)
    sessionsByMarket.set(s.market_id, (sessionsByMarket.get(s.market_id) ?? 0) + 1)
  }

  const marketInfo = new Map((markets ?? []).map((m) => [m.id, { slug: m.slug, name: m.name }]))
  const mapSessions = (schedules ?? [])
    .map((s) => {
      const mi = marketInfo.get(s.market_id)
      if (!mi) return null
      return {
        market_id: s.market_id, market_slug: mi.slug, market_name: mi.name,
        comune: s.comune, giorno: s.giorno, orario: s.orario, luogo: s.luogo,
        lat: s.lat, lng: s.lng,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  const totalComuni = new Set(mapSessions.map((s) => s.comune)).size
  const totalMercati = mapSessions.length

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-cream-300">
        <MountainSea className="absolute -top-4 right-0 w-[620px] text-olive-500 opacity-60 pointer-events-none hidden md:block animate-float-soft" />
        <div className="container mx-auto px-4 md:px-6 py-20 md:py-28 relative">
          <div className="max-w-3xl reveal is-visible">
            <div className="flex items-center gap-3 mb-8 text-ink-soft">
              <OliveSprig className="w-10 h-3 text-olive-500" />
              <p className="text-[0.72rem] uppercase tracking-widest-plus">
                Liguria · Provincia di Imperia
              </p>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] tracking-tight text-ink">
              Mercati di
              <br />
              <span className="italic font-light text-olive-600">terra e di mare</span>.
            </h1>

            <p className="mt-8 text-lg md:text-xl text-ink-soft max-w-xl leading-relaxed">
              Dall&apos;entroterra d&apos;ulivi al blu del Mar Ligure: ogni settimana, ogni valle, ogni borgo.
              Mercatini, fiere, prodotti locali — in un unico calendario.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/calendar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-cream-100 text-sm hover:bg-olive-700 transition-all hover:-translate-y-0.5"
              >
                Vedi il calendario
              </Link>
              <a
                href="#zone"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-ink/20 text-ink text-sm hover:bg-cream-50 transition-all hover:-translate-y-0.5"
              >
                Esplora le zone
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6">
        {/* Dati salienti */}
        <Reveal as="section" className="grid grid-cols-3 gap-6 md:gap-10 py-10 md:py-14 border-b border-cream-300">
          <div>
            <div className="font-serif text-3xl md:text-4xl text-ink tabular-nums">{markets?.length ?? 0}</div>
            <div className="mt-1 text-xs uppercase tracking-widest-plus text-ink-muted">Zone</div>
          </div>
          <div>
            <div className="font-serif text-3xl md:text-4xl text-ink tabular-nums">{totalComuni}</div>
            <div className="mt-1 text-xs uppercase tracking-widest-plus text-ink-muted">Comuni</div>
          </div>
          <div>
            <div className="font-serif text-3xl md:text-4xl text-ink tabular-nums">{totalMercati}</div>
            <div className="mt-1 text-xs uppercase tracking-widest-plus text-ink-muted">Mercati</div>
          </div>
        </Reveal>

        {/* Mappa */}
        {mapSessions.length > 0 && (
          <Reveal as="section" className="py-12 md:py-16">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-1">La mappa</p>
                <h2 className="font-serif text-2xl md:text-3xl text-ink">Dove trovarli</h2>
              </div>
              <WaveDivider className="w-32 text-sea-500 opacity-60 hidden md:block" />
            </div>
            <div className="border border-cream-300 bg-cream-50 rounded-sm p-1.5">
              <ProvinceMapWrapper sessions={mapSessions} />
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              {totalComuni} comuni · {totalMercati} mercati · tocca un pin per i dettagli
            </p>
          </Reveal>
        )}

        {/* Zone — lista editoriale con foto */}
        {markets && markets.length > 0 && (
          <section id="zone" className="py-12 md:py-20 scroll-mt-24">
            <Reveal className="mb-10">
              <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-1">Le zone</p>
              <h2 className="font-serif text-3xl md:text-4xl text-ink">Otto tappe, un territorio</h2>
              <div className="mt-3 flex items-center gap-3">
                <span className="block w-12 h-px bg-olive-500" />
                <OliveSprig className="w-8 h-2.5 text-olive-500" />
              </div>
            </Reveal>

            <ul className="space-y-0">
              {markets.map((m, idx) => {
                const comuni = comuniByMarket.get(m.id) ?? []
                const sessionsCount = sessionsByMarket.get(m.id) ?? 0
                const isAgg = comuni.length > 1
                const num = String(idx + 1).padStart(2, '0')
                const heroQuery = heroQueryFor(m.slug, m.city)
                return (
                  <Reveal as="li" key={m.id} delayMs={Math.min(idx, 5) * 70} className="border-t border-cream-300 last:border-b">
                    <Link
                      href={`/${m.slug}`}
                      className="group grid grid-cols-[auto_6.5rem_1fr_auto] md:grid-cols-[auto_10rem_1fr_auto] gap-4 md:gap-6 items-center py-5 md:py-6 hover:bg-cream-50 -mx-4 px-4 md:-mx-6 md:px-6 transition-all"
                    >
                      <div className="font-serif italic text-xl md:text-2xl text-olive-500 w-8 flex-shrink-0 tabular-nums self-start mt-1.5">
                        {num}
                      </div>

                      <div className="rounded-sm overflow-hidden">
                        <ZoneImage
                          query={heroQuery}
                          fallbackQuery={comuni[0] ?? m.city}
                          alt={m.name}
                          aspect="aspect-[4/3] md:aspect-[5/4]"
                          hoverZoom
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-serif text-xl md:text-2xl text-ink leading-tight group-hover:text-olive-700 transition-colors">
                          {m.name}
                        </h3>
                        {comuni.length > 0 && (
                          <p className="mt-1.5 text-sm text-ink-soft line-clamp-2">
                            {isAgg ? comuni.join(' · ') : m.city}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                          {m.market_days && m.market_days.length > 0 && (
                            <span className="uppercase tracking-wider">{formatMarketDays(m.market_days)}</span>
                          )}
                          <span className="tabular-nums">
                            {sessionsCount} {sessionsCount === 1 ? 'mercato' : 'mercati'}
                          </span>
                        </div>
                      </div>

                      <span className="text-ink-muted group-hover:text-olive-600 group-hover:translate-x-1.5 transition-all self-center text-xl">
                        →
                      </span>
                    </Link>
                  </Reveal>
                )
              })}
            </ul>
          </section>
        )}

        {/* Footer */}
        <footer className="py-10 border-t border-cream-300 mt-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-ink-muted">
            <div className="flex items-center gap-3">
              <OliveSprig className="w-8 h-2.5 text-olive-500" />
              <span className="font-serif italic text-ink">iMercati</span>
              <span>· Liguria · Provincia di Imperia</span>
            </div>
            <div>
              Immagini da Wikipedia. Dati aggiornati in tempo reale.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
