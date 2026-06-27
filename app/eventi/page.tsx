import Link from 'next/link'
import { CalendarDays, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { MarketEvent } from '@/types/event'
import EventCard from '@/components/events/EventCard'
import { SeaWaves, RivieraSun, Lemon, ArchRow } from '@/components/events/decorations'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Eventi — Mercati della Riviera ligure di Ponente',
  description:
    'Fiere, sagre, gastronomia, musica e appuntamenti speciali nei mercati della provincia di Imperia. Tutti gli eventi in arrivo, in ordine di data.',
}

/** Raggruppa gli eventi per mese (chiave "Mese Anno"). */
function groupByMonth(events: MarketEvent[]) {
  const groups: { key: string; label: string; events: MarketEvent[] }[] = []
  const index = new Map<string, number>()
  for (const e of events) {
    const d = new Date(e.start_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const label = d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
    let pos = index.get(key)
    if (pos === undefined) {
      pos = groups.length
      index.set(key, pos)
      groups.push({ key, label, events: [] })
    }
    groups[pos].events.push(e)
  }
  return groups
}

export default async function EventiPage() {
  const supabase = createClient()

  // Soglia: includiamo gli eventi ancora in corso. Un evento è "passato"
  // solo quando la sua fine (end_at) — o l'inizio, se non c'è fine — è < ora.
  const now = new Date()
  const nowIso = now.toISOString()

  const { data, error } = await supabase
    .from('events')
    .select('*, markets(slug, name, city)')
    .or(`end_at.gte.${nowIso},and(end_at.is.null,start_at.gte.${nowIso})`)
    .order('start_at', { ascending: true })

  const events: MarketEvent[] = error ? [] : ((data as MarketEvent[]) ?? [])
  const groups = groupByMonth(events)
  const total = events.length

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* ============ HEADER ============ */}
      <header className="relative overflow-hidden border-b-2 border-ink/10 bg-night text-paper">
        {/* Sole di Riviera */}
        <RivieraSun className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-mimosa/80 md:right-10 md:top-8 md:h-44 md:w-44" />
        {/* Limone */}
        <Lemon className="pointer-events-none absolute right-1/3 top-10 hidden h-16 w-16 rotate-12 text-mimosa/40 lg:block" />

        <div className="container relative mx-auto px-4 py-12 md:px-6 md:py-16">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-paper/90 ring-1 ring-paper/20 transition-colors hover:bg-paper/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Torna alla mappa
          </Link>

          <p className="font-alt text-xs font-semibold uppercase tracking-[0.22em] text-mimosa">
            Liguria · Provincia di Imperia
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl leading-[0.95] md:text-6xl">
            Eventi sulla Riviera
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/80 md:text-lg">
            Fiere, sagre, gastronomia, musica e appuntamenti speciali nei mercati del Ponente
            ligure. Tutti gli eventi in arrivo, in ordine di data.
          </p>

          {total > 0 && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-pesto px-4 py-1.5 font-alt text-sm font-semibold text-white">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {total} {total === 1 ? 'evento in programma' : 'eventi in programma'}
            </p>
          )}
        </div>

        {/* Onde del mare a chiudere l'header */}
        <SeaWaves className="absolute bottom-0 left-0 h-4 w-[200%] text-riviera/60 md:h-5" preserveAspectRatio="none" />
      </header>

      {/* ============ CONTENUTO ============ */}
      <main className="container mx-auto px-4 py-10 md:px-6 md:py-14">
        {total === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-12">
            {groups.map((g) => (
              <section key={g.key} aria-labelledby={`mese-${g.key}`}>
                <div className="mb-5 flex items-center gap-3">
                  <h2
                    id={`mese-${g.key}`}
                    className="font-display text-xl capitalize text-ink md:text-2xl"
                  >
                    {g.label}
                  </h2>
                  <span className="h-[3px] flex-1 rounded-full bg-ink/10" aria-hidden="true" />
                  <span className="font-alt text-sm font-semibold text-ink-muted">
                    {g.events.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {g.events.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Rimando al calendario completo */}
        <div className="mt-14 flex flex-col items-center gap-4 rounded-xl border-2 border-ink/10 bg-white px-6 py-8 text-center">
          <ArchRow className="h-10 w-56 text-pesto/30" count={7} />
          <p className="font-accent text-2xl text-pesto-600">Vuoi vedere tutto a colpo d&apos;occhio?</p>
          <p className="max-w-md text-sm text-ink-soft">
            Eventi speciali e mercati ricorrenti, filtrabili per zona e categoria, nel calendario
            completo della Riviera.
          </p>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-alt text-sm font-semibold text-paper transition-colors hover:bg-pesto"
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Apri il calendario
          </Link>
        </div>
      </main>
    </div>
  )
}

/** Stato vuoto elegante, in stile brand bold. */
function EmptyState() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-xl border-2 border-ink/10 bg-white px-6 py-14 text-center">
      <div className="relative mb-6 grid h-24 w-24 place-items-center rounded-full bg-paper ring-2 ring-ink/10">
        <RivieraSun className="h-12 w-12 text-mimosa-600" />
        <Lemon className="absolute -bottom-1 -right-1 h-8 w-8 text-pesto" />
      </div>
      <h2 className="font-display text-2xl text-ink">Nessun evento in programma</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Per ora non ci sono appuntamenti speciali in calendario. Torna a trovarci: i mercati della
        Riviera non si fermano mai a lungo.
      </p>
      <SeaWaves className="my-6 h-4 w-40 text-riviera/50" />
      <Link
        href="/calendar"
        className="inline-flex items-center gap-2 rounded-full bg-pesto px-5 py-2.5 font-alt text-sm font-semibold text-white transition-colors hover:bg-pesto-600"
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Guarda i mercati ricorrenti
      </Link>
    </div>
  )
}
