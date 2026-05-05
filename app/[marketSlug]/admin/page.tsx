import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapIcon, Store, Newspaper, CalendarDays, ArrowRight, MapPin, Map as MapPinIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { classifySchedule, CATEGORY_COLOR } from '@/lib/schedules/classify'

export const dynamic = 'force-dynamic'

interface PlaceScheduleRow {
  id: string
  giorno: string
  orario: string | null
  settori: string | null
}

interface PlaceRow {
  id: string
  comune: string
  luogo: string
  market_schedules: PlaceScheduleRow[] | null
}

export default async function MarketAdminHome({ params }: { params: { marketSlug: string } }) {
  const supabase = createClient()
  const { data: market } = await supabase
    .from('markets')
    .select('id, slug, name, city')
    .ilike('slug', params.marketSlug)
    .maybeSingle()
  if (!market) notFound()

  const [{ data: places }, { count: operatorsCount }] = await Promise.all([
    supabase
      .from('market_places')
      .select('id, comune, luogo, market_schedules(id, giorno, orario, settori)')
      .eq('market_id', market.id)
      .order('comune', { ascending: true })
      .order('luogo', { ascending: true }),
    supabase
      .from('operators')
      .select('*', { count: 'exact', head: true })
      .eq('market_id', market.id),
  ])

  // Conta operatori per sessione
  const { data: opsBySched } = await supabase
    .from('operators')
    .select('schedule_id')
    .eq('market_id', market.id)
  const countByScheduleId = new Map<string, number>()
  for (const o of opsBySched ?? []) {
    if (!o.schedule_id) continue
    countByScheduleId.set(o.schedule_id, (countByScheduleId.get(o.schedule_id) ?? 0) + 1)
  }
  const unboundCount = (opsBySched ?? []).filter((o) => !o.schedule_id).length

  const cards: Array<{ href: string; icon: any; title: string; desc: string }> = [
    { href: `/${market.slug}/admin/area`,      icon: MapIcon,      title: 'Area del mercato',  desc: 'Disegna il poligono sulla mappa.' },
    { href: `/${market.slug}/admin/operators`, icon: Store,        title: 'Tutti i banchi',    desc: `${operatorsCount ?? 0} totali — gestisci l'elenco della zona.` },
    { href: `/${market.slug}/admin/news`,      icon: Newspaper,    title: 'News e avvisi',     desc: 'Pubblica notizie con finestra temporale.' },
    { href: `/${market.slug}/admin/events`,    icon: CalendarDays, title: 'Eventi',            desc: 'Crea eventi con categoria e orario.' },
  ]

  const placeRows: PlaceRow[] = (places ?? []) as any

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-5xl">
      <div className="mb-8 border-b border-cream-300 pb-6">
        <Link href={`/${market.slug}`} className="text-xs uppercase tracking-widest-plus text-ink-muted hover:text-ink">
          ← {market.name}
        </Link>
        <h1 className="font-serif text-3xl md:text-5xl text-ink mt-2">Gestione {market.name}</h1>
        <p className="text-ink-soft mt-2">{market.city}</p>
      </div>

      {/* Macro aree della gestione */}
      <section className="mb-12">
        <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-4">Configurazione zona</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((c) => {
            const Icon = c.icon
            return (
              <Link
                key={c.href}
                href={c.href}
                className="group bg-cream-50 border border-cream-300 rounded-sm p-5 hover:border-olive-500 hover:-translate-y-0.5 transition-all"
              >
                <Icon className="w-8 h-8 text-olive-500 mb-3" />
                <h2 className="font-serif text-lg text-ink mb-1 group-hover:text-olive-700 transition-colors">{c.title}</h2>
                <p className="text-sm text-ink-soft">{c.desc}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Gestione per luogo (place) → sessioni del luogo */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-1">Gestione per luogo</p>
            <h2 className="font-serif text-2xl text-ink">Stesso luogo, sessioni diverse</h2>
          </div>
          <p className="text-xs text-ink-muted hidden sm:block">
            Area condivisa, banchi specifici per ogni giorno
          </p>
        </div>
        <p className="text-sm text-ink-soft mb-5 max-w-2xl">
          Ogni luogo (comune + indirizzo) può avere più sessioni (giorni). Disegni l'area del mercato una sola volta
          per il luogo: vale per tutti i giorni. I banchi invece restano configurabili per singola sessione.
        </p>

        {placeRows.length === 0 ? (
          <p className="text-sm text-ink-muted italic">Nessun luogo configurato per questa zona.</p>
        ) : (
          <div className="space-y-6">
            {placeRows.map((place) => {
              const schedules = place.market_schedules ?? []
              const totalOps = schedules.reduce(
                (acc, s) => acc + (countByScheduleId.get(s.id) ?? 0),
                0,
              )
              return (
                <div key={place.id} className="border border-cream-300 rounded-sm bg-cream-50">
                  <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-4 border-b border-cream-300 flex-wrap">
                    <div className="min-w-0">
                      <h3 className="font-serif text-xl text-ink flex items-center gap-2 min-w-0">
                        <MapPin className="w-4 h-4 text-olive-500 flex-shrink-0" />
                        <span className="truncate">{place.comune}</span>
                        <span className="text-ink-muted">·</span>
                        <span className="truncate text-ink-soft">{place.luogo}</span>
                      </h3>
                      <p className="text-xs text-ink-muted mt-1 tabular-nums">
                        {schedules.length} sessione{schedules.length === 1 ? '' : 'i'} · {totalOps} banc{totalOps === 1 ? 'o' : 'hi'}
                      </p>
                    </div>
                    <Link
                      href={`/${market.slug}/admin/places/${place.id}/area`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-cream-200 hover:bg-cream-300 text-ink rounded-sm text-xs"
                    >
                      <MapPinIcon className="w-3.5 h-3.5" /> Disegna area
                    </Link>
                  </div>

                  {schedules.length === 0 ? (
                    <p className="px-4 md:px-5 py-4 text-sm text-ink-muted italic">
                      Nessuna sessione legata a questo luogo.
                    </p>
                  ) : (
                    <ul className="divide-y divide-cream-300">
                      {schedules.map((s) => {
                        const cat = classifySchedule(s.settori)
                        const opsCount = countByScheduleId.get(s.id) ?? 0
                        return (
                          <li key={s.id}>
                            <Link
                              href={`/${market.slug}/admin/s/${s.id}`}
                              className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-5 items-center py-3 md:py-4 px-4 md:px-5 hover:bg-cream-100 transition-colors"
                            >
                              <div className="md:col-span-4 flex items-center gap-2.5 min-w-0">
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: CATEGORY_COLOR[cat] }}
                                />
                                <span className="font-serif text-base text-ink truncate">{s.giorno}</span>
                              </div>
                              <div className="md:col-span-4 min-w-0">
                                {s.orario && (
                                  <p className="text-xs text-ink-muted tabular-nums">{s.orario}</p>
                                )}
                              </div>
                              <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-3">
                                <span className="text-xs text-ink-muted tabular-nums">
                                  {opsCount} banc{opsCount === 1 ? 'o' : 'hi'}
                                </span>
                                <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-olive-600 group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {unboundCount > 0 && (
          <p className="mt-4 text-xs text-ink-muted">
            {unboundCount} banc{unboundCount === 1 ? 'o' : 'hi'} non legati a una sessione specifica — visibili in
            <Link href={`/${market.slug}/admin/operators`} className="underline ml-1">Tutti i banchi</Link>.
          </p>
        )}
      </section>
    </div>
  )
}
