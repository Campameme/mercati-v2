'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import itLocale from '@fullcalendar/core/locales/it'
import { MapPin, Repeat, LayoutGrid, ArrowLeft } from 'lucide-react'
import type { MarketEvent } from '@/types/event'
import DriftBackdrop from '@/components/motion/DriftBackdrop'
import { SeaWaves, RivieraSun, Lemon } from '@/components/events/decorations'
import { EVT_LABEL, EVT_COLOR, ALL_EVT_CATS } from '@/lib/events/labels'

interface MarketInfo { id: string; slug: string; name: string }

export default function GlobalCalendarPage() {
  const [events, setEvents] = useState<MarketEvent[]>([])
  const [markets, setMarkets] = useState<MarketInfo[]>([])
  const [selectedMarkets, setSelectedMarkets] = useState<Set<string>>(new Set())
  const [selectedEvtCats, setSelectedEvtCats] = useState<Set<string>>(new Set(ALL_EVT_CATS))
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<MarketEvent | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const [eventsRes, marketsRes] = await Promise.all([
        fetch('/api/events?all=1').then((r) => r.json()),
        fetch('/api/markets').then((r) => r.json()),
      ])
      setEvents(eventsRes.data ?? [])
      const mk: MarketInfo[] = (marketsRes.data ?? []).map((m: any) => ({ id: m.id, slug: m.slug, name: m.name }))
      setMarkets(mk)
      setSelectedMarkets(new Set(mk.map((m) => m.id)))
      setLoading(false)
    })()
  }, [])

  const fcEvents = useMemo(() => {
    const out: any[] = []
    for (const e of events) {
      if (!selectedMarkets.has(e.market_id)) continue
      if (!selectedEvtCats.has(e.category)) continue
      const color = EVT_COLOR[e.category] ?? '#4A4F3B'
      out.push({
        id: `ev-${e.id}`,
        title: e.title,
        start: e.start_at,
        end: e.end_at ?? undefined,
        backgroundColor: color,
        borderColor: color,
        textColor: '#F7EFDD',
        extendedProps: { e },
      })
    }
    return out
  }, [events, selectedMarkets, selectedEvtCats])

  const upcoming: MarketEvent[] = useMemo(() => {
    const now = Date.now()
    const list = events.filter((e) => {
      if (!selectedMarkets.has(e.market_id)) return false
      if (!selectedEvtCats.has(e.category)) return false
      return new Date(e.start_at).getTime() >= now
    })
    list.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    return list.slice(0, 8)
  }, [events, selectedMarkets, selectedEvtCats])

  function toggleMarket(id: string) {
    setSelectedMarkets((prev) => {
      const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
    })
  }
  function toggleEvtCat(c: string) {
    setSelectedEvtCats((prev) => {
      const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n
    })
  }

  return (
    <div className="min-h-screen bg-carta text-ink">
      {/* ============ HEADER ============ */}
      <header className="relative overflow-hidden border-b-2 border-ink/10 bg-notte text-carta">
        <DriftBackdrop tone="dark" variant="section" />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-notte/20 via-transparent to-notte"
          aria-hidden="true"
        />
        <RivieraSun className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 text-sole/80 md:right-10 md:top-6 md:h-40 md:w-40" />
        <Lemon className="pointer-events-none absolute right-1/3 top-8 hidden h-14 w-14 rotate-12 text-sole/40 lg:block" />

        <div className="container relative z-10 mx-auto px-4 py-10 md:px-6 md:py-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/eventi"
              className="imk-lift inline-flex items-center gap-1.5 rounded-full bg-carta/10 px-3 py-1 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-carta/90 ring-1 ring-carta/20 transition-colors hover:bg-carta/20"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Torna alla bacheca
            </Link>
            <Link
              href="/eventi"
              className="imk-lift inline-flex items-center gap-2 rounded-full bg-sole px-4 py-2 font-alt text-sm font-semibold text-ink transition-colors hover:bg-sole-600"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              Vista bacheca
            </Link>
          </div>

          <p className="mt-6 font-alt text-xs font-semibold uppercase tracking-[0.14em] text-sole">
            Liguria · Provincia di Imperia
          </p>
          <h1 className="mt-2 font-display text-3xl leading-[0.95] md:text-5xl">
            Calendario <span className="imk-mark text-carta">eventi</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-carta/80 md:text-base">
            Fiere, sagre e appuntamenti speciali della Riviera di Ponente, a colpo d&apos;occhio.
            Filtrabili per zona e categoria.
          </p>
        </div>

        <SeaWaves
          className="absolute bottom-0 left-0 z-10 h-4 w-[200%] text-mare/60 md:h-5"
          preserveAspectRatio="none"
        />
      </header>

      {/* ============ CONTENUTO ============ */}
      <main className="relative overflow-hidden bg-carta bg-paper-grain">
        <DriftBackdrop tone="light" variant="section" />
        <div className="container relative z-10 mx-auto px-4 py-10 md:px-6 md:py-14">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <div className="imk-edge border-2 border-ink/10 bg-white p-4">
                {loading ? (
                  <p className="py-12 text-center text-sm text-ink-muted">Caricamento…</p>
                ) : (
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                    initialView="dayGridMonth"
                    locale={itLocale}
                    height={680}
                    events={fcEvents}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,listMonth',
                    }}
                    eventClick={(info) => setSelected(info.event.extendedProps.e as MarketEvent)}
                  />
                )}
              </div>
            </div>

            <aside className="space-y-4 text-sm">
              <div className="imk-edge border-2 border-ink/10 bg-white p-4">
                <h2 className="mb-3 font-alt font-bold text-base text-ink">Categorie eventi</h2>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_EVT_CATS.map((c) => {
                    const active = selectedEvtCats.has(c)
                    return (
                      <button
                        key={c}
                        onClick={() => toggleEvtCat(c)}
                        className={`font-alt text-xs font-semibold px-2.5 py-1 rounded-full border-2 transition-colors ${
                          active ? 'text-carta' : 'bg-white text-ink-muted border-ink/15 hover:text-ink hover:border-ink/30'
                        }`}
                        style={active ? { backgroundColor: EVT_COLOR[c], borderColor: EVT_COLOR[c] } : undefined}
                      >
                        {EVT_LABEL[c]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="imk-edge border-2 border-ink/10 bg-white p-4">
                <h2 className="mb-3 font-alt font-bold text-base text-ink">Zone</h2>
                <div className="imk-scroll max-h-60 space-y-1 overflow-y-auto pr-1">
                  {markets.map((m) => (
                    <label key={m.id} className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedMarkets.has(m.id)}
                        onChange={() => toggleMarket(m.id)}
                      />
                      <span className="text-ink">{m.name}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex gap-3 border-t-2 border-ink/10 pt-3">
                  <button
                    onClick={() => setSelectedMarkets(new Set(markets.map((m) => m.id)))}
                    className="font-alt text-xs font-semibold text-mare-600 hover:underline"
                  >
                    Tutte
                  </button>
                  <button
                    onClick={() => setSelectedMarkets(new Set())}
                    className="text-xs text-ink-muted hover:text-ink"
                  >
                    Nessuna
                  </button>
                </div>
              </div>

              <div className="imk-edge border-2 border-ink/10 bg-white p-4">
                <h2 className="mb-3 font-alt font-bold text-base text-ink">Prossimi</h2>
                {upcoming.length === 0 ? (
                  <p className="text-xs text-ink-muted">Nessun evento coi filtri correnti.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {upcoming.map((e) => {
                      const d = new Date(e.start_at)
                      const color = EVT_COLOR[e.category] ?? '#4A4F3B'
                      return (
                        <li key={e.id} className="border-l-2 pl-2.5" style={{ borderColor: color }}>
                          <button onClick={() => setSelected(e)} className="w-full text-left">
                            <p className="text-xs text-ink-muted">
                              {d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                              {e.markets?.name ? ` · ${e.markets.name}` : ''}
                            </p>
                            <p className="text-sm text-ink">{e.title}</p>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-notte/55 p-4 backdrop-blur-[2px]"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="imk-edge w-full max-w-lg border-2 border-ink/10 bg-white p-6 shadow-2xl"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
              <span
                className="rounded-full px-2.5 py-0.5 font-alt font-semibold text-carta"
                style={{ backgroundColor: EVT_COLOR[selected.category] ?? '#4A4F3B' }}
              >
                {EVT_LABEL[selected.category] ?? selected.category}
              </span>
              {selected.markets?.slug && (
                <Link
                  href={`/${selected.markets.slug}`}
                  className="rounded-full border-2 border-ink/10 bg-carta px-2.5 py-0.5 font-alt font-semibold text-ink hover:border-mare"
                >
                  {selected.markets.name}
                </Link>
              )}
              {selected.is_recurring && (
                <span className="flex items-center text-ink-muted">
                  <Repeat className="mr-1 h-3 w-3" />ricorrente
                </span>
              )}
            </div>
            <h3 className="mb-1 font-alt font-bold text-xl text-ink">{selected.title}</h3>
            <p className="mb-3 text-sm text-ink-soft">
              {new Date(selected.start_at).toLocaleString('it-IT')}
              {selected.end_at ? ` → ${new Date(selected.end_at).toLocaleString('it-IT')}` : ''}
            </p>
            {selected.location && (
              <p className="mb-2 flex items-center text-sm text-ink">
                <MapPin className="mr-1 h-4 w-4" />{selected.location}
              </p>
            )}
            {selected.description && (
              <p className="whitespace-pre-wrap text-sm text-ink">{selected.description}</p>
            )}
            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-full border-2 border-ink/15 bg-carta px-4 py-2.5 font-alt text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
