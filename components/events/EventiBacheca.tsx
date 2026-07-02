'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, LayoutGrid, MapPin, ArrowUpRight, Repeat } from 'lucide-react'
import WaterCard from '@/components/motion/WaterCard'
import type { MarketEvent } from '@/types/event'
import EventCard, { EVENT_CATEGORY_LABEL } from './EventCard'
import { RivieraSun, Lemon, SeaWaves } from './decorations'

/** Colore "pennarello" del bigliettino per categoria (token brand). */
const PIN_COLOR: Record<string, string> = {
  market: 'text-mare-600',
  fair: 'text-fiore-600',
  food: 'text-fiore-600',
  music: 'text-mare-600',
  art: 'text-fiore-600',
  sport: 'text-mare-600',
  other: 'text-ink-soft',
}

function catLabel(cat: string) {
  return EVENT_CATEGORY_LABEL[cat] ?? cat
}

/** Parti della data per il bigliettino (font-accent, "a mano"). */
function noteDate(iso: string) {
  const d = new Date(iso)
  return {
    day: d.toLocaleDateString('it-IT', { day: 'numeric' }),
    month: d.toLocaleDateString('it-IT', { month: 'long' }),
    weekday: d.toLocaleDateString('it-IT', { weekday: 'long' }),
    time: d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
  }
}

/** Etichetta mese-anno per i divisori. */
function monthLabel(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
}

/** Raggruppa per mese mantenendo l'ordine cronologico già ricevuto. */
function groupByMonth(events: MarketEvent[]) {
  const groups: { key: string; label: string; events: MarketEvent[] }[] = []
  const index = new Map<string, number>()
  for (const e of events) {
    const d = new Date(e.start_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    let pos = index.get(key)
    if (pos === undefined) {
      pos = groups.length
      index.set(key, pos)
      groups.push({ key, label: monthLabel(e.start_at), events: [] })
    }
    groups[pos].events.push(e)
  }
  return groups
}

export default function EventiBacheca({ events }: { events: MarketEvent[] }) {
  // Toggle "in pagina": bacheca (default) o lista per mese.
  const [view, setView] = useState<'bacheca' | 'lista'>('bacheca')
  const groups = useMemo(() => groupByMonth(events), [events])

  return (
    <div>
      {/* ===== Toggle vista + landmark calendario ===== */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-1 rounded-full border-2 border-ink/10 bg-white p-1"
          role="group"
          aria-label="Modalità di visualizzazione eventi"
        >
          <button
            onClick={() => setView('bacheca')}
            aria-pressed={view === 'bacheca'}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-alt text-sm font-semibold transition-colors ${
              view === 'bacheca' ? 'bg-mare text-white' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            Bacheca
          </button>
          <button
            onClick={() => setView('lista')}
            aria-pressed={view === 'lista'}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-alt text-sm font-semibold transition-colors ${
              view === 'lista' ? 'bg-mare text-white' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Per mese
          </button>
        </div>

        <Link
          href="/calendar"
          className="imk-lift inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 font-alt text-sm font-semibold text-paper transition-colors hover:bg-mare"
        >
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Vista calendario
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {view === 'bacheca' ? (
        <BachecaGrid events={events} />
      ) : (
        <div className="space-y-12">
          {groups.map((g) => (
            <section key={g.key} aria-labelledby={`mese-${g.key}`}>
              <div className="mb-5 flex items-center gap-3">
                <h2 id={`mese-${g.key}`} className="font-display text-xl capitalize text-ink md:text-2xl">
                  {g.label}
                </h2>
                <span className="h-[3px] flex-1 rounded-full bg-ink/10" aria-hidden="true" />
                <span className="font-alt text-sm font-semibold text-ink-muted">{g.events.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {g.events.map((e, i) => (
                  <EventCard key={e.id} event={e} tilt={i % 2 === 0 ? 'l' : 'r'} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

/** Griglia di bigliettini "imperfetto-pop": WaterCard + nastro + rotazioni alterne. */
function BachecaGrid({ events }: { events: MarketEvent[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
      {events.map((e, i) => (
        <Bigliettino key={e.id} event={e} idx={i} />
      ))}
    </div>
  )
}

/** Singolo bigliettino appuntato. */
function Bigliettino({ event, idx }: { event: MarketEvent; idx: number }) {
  const d = noteDate(event.start_at)
  const market = event.markets
  const place = event.location ?? market?.city ?? null
  const tilt = idx % 2 === 0 ? 'l' : 'r'
  const pin = PIN_COLOR[event.category] ?? PIN_COLOR.other

  return (
    <WaterCard tilt={tilt} edge={idx % 3 === 0 ? 2 : 1} className="imk-tape p-5 pt-7">
      {/* Categoria a pennarello + data a mano */}
      <div className="flex items-start justify-between gap-3">
        <span className={`font-alt text-[11px] font-semibold uppercase tracking-[0.12em] ${pin}`}>
          {catLabel(event.category)}
        </span>
        {event.is_recurring && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted">
            <Repeat className="h-3 w-3" aria-hidden="true" />
            ricorrente
          </span>
        )}
      </div>

      <p className="mt-1 font-accent text-2xl leading-tight text-mare-600">
        <span className="capitalize">{d.weekday}</span> {d.day} {d.month}
      </p>
      <p className="font-alt text-xs font-semibold text-ink-muted">ore {d.time}</p>

      <h3 className="mt-2 font-display text-lg leading-tight text-ink">{event.title}</h3>

      {place && (
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-ink-soft">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-muted" aria-hidden="true" />
          <span className="min-w-0">{place}</span>
        </p>
      )}

      {event.description && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft/90">{event.description}</p>
      )}

      {market?.slug && (
        <Link
          href={`/${market.slug}`}
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-paper px-3 py-1 font-alt text-xs font-semibold text-ink ring-2 ring-ink/10 transition-colors hover:bg-ink hover:text-paper hover:ring-ink"
        >
          {market.name}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </WaterCard>
  )
}

/** Stato vuoto elegante per la bacheca (riusabile). */
export function BachecaEmpty() {
  return (
    <WaterCard edge={2} className="mx-auto flex max-w-lg flex-col items-center px-6 py-14 text-center">
      <div className="relative mb-6 grid h-24 w-24 place-items-center rounded-full bg-carta ring-2 ring-ink/10">
        <RivieraSun className="h-12 w-12 text-sole-600" />
        <Lemon className="absolute -bottom-1 -right-1 h-8 w-8 text-mare" />
      </div>
      <h2 className="font-display text-2xl text-ink">Bacheca vuota, per ora</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Nessun appuntamento appuntato in bacheca. Torna a trovarci: fiere, sagre e mercati
        straordinari della Riviera dei Fiori sono sempre in arrivo.
      </p>
      <SeaWaves className="my-6 h-4 w-40 text-mare/50" />
      <Link
        href="/calendar"
        className="imk-lift inline-flex items-center gap-2 rounded-full bg-mare px-5 py-2.5 font-alt text-sm font-semibold text-white transition-colors hover:bg-mare-600"
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Apri il calendario eventi
      </Link>
    </WaterCard>
  )
}
