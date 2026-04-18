'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import itLocale from '@fullcalendar/core/locales/it'
import { MapPin, Repeat } from 'lucide-react'
import type { MarketEvent } from '@/types/event'
import {
  CATEGORY_COLOR as SCH_COLOR,
  CATEGORY_LABEL as SCH_LABEL,
  type ScheduleCategory,
} from '@/lib/schedules/classify'

const EVT_LABEL: Record<string, string> = {
  market: 'Mercato', fair: 'Fiera', food: 'Gastronomia', music: 'Musica',
  art: 'Arte', sport: 'Sport', other: 'Altro',
}
const EVT_COLOR: Record<string, string> = {
  market: '#B75A40', fair: '#8B5CF6', food: '#6B7F3A', music: '#2A5A75',
  art: '#EC4899', sport: '#06B6D4', other: '#4A4F3B',
}
const ALL_EVT_CATS = Object.keys(EVT_LABEL)
const ALL_SCH_CATS: ScheduleCategory[] = ['alimentare', 'antiquariato', 'artigianato', 'varie']

interface MarketInfo { id: string; slug: string; name: string }

interface Occurrence {
  schedule_id: string
  market_id: string
  market_slug: string
  market_name: string
  comune: string
  luogo: string | null
  orario: string | null
  giorno: string
  settori: string | null
  category: ScheduleCategory
  start: string
  end: string | null
}

type CalItem =
  | { kind: 'event'; e: MarketEvent }
  | { kind: 'schedule'; o: Occurrence }

export default function GlobalCalendarPage() {
  const [events, setEvents] = useState<MarketEvent[]>([])
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [markets, setMarkets] = useState<MarketInfo[]>([])
  const [selectedMarkets, setSelectedMarkets] = useState<Set<string>>(new Set())
  const [selectedSchCats, setSelectedSchCats] = useState<Set<ScheduleCategory>>(new Set(ALL_SCH_CATS))
  const [selectedEvtCats, setSelectedEvtCats] = useState<Set<string>>(new Set(ALL_EVT_CATS))
  const [showMarkets, setShowMarkets] = useState(true)
  const [showEvents, setShowEvents] = useState(true)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CalItem | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const [eventsRes, marketsRes, occRes] = await Promise.all([
        fetch('/api/events?all=1').then((r) => r.json()),
        fetch('/api/markets').then((r) => r.json()),
        fetch('/api/schedules/occurrences').then((r) => r.json()),
      ])
      setEvents(eventsRes.data ?? [])
      setOccurrences(occRes.data ?? [])
      const mk: MarketInfo[] = (marketsRes.data ?? []).map((m: any) => ({ id: m.id, slug: m.slug, name: m.name }))
      setMarkets(mk)
      setSelectedMarkets(new Set(mk.map((m) => m.id)))
      setLoading(false)
    })()
  }, [])

  const fcEvents = useMemo(() => {
    const out: any[] = []
    if (showEvents) {
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
          textColor: '#FCFAF5',
          extendedProps: { kind: 'event', e },
        })
      }
    }
    if (showMarkets) {
      for (const o of occurrences) {
        if (!selectedMarkets.has(o.market_id)) continue
        if (!selectedSchCats.has(o.category)) continue
        const color = SCH_COLOR[o.category]
        out.push({
          id: `sc-${o.schedule_id}-${o.start}`,
          title: `${o.comune} · ${o.market_name}`,
          start: o.start,
          end: o.end ?? undefined,
          backgroundColor: 'transparent',
          borderColor: color,
          textColor: color,
          classNames: [`schedule-occ schedule-cat-${o.category}`],
          extendedProps: { kind: 'schedule', o },
        })
      }
    }
    return out
  }, [events, occurrences, selectedMarkets, selectedSchCats, selectedEvtCats, showMarkets, showEvents])

  const upcoming: CalItem[] = useMemo(() => {
    const list: CalItem[] = []
    const now = Date.now()
    if (showMarkets) {
      for (const o of occurrences) {
        if (!selectedMarkets.has(o.market_id)) continue
        if (!selectedSchCats.has(o.category)) continue
        if (new Date(o.start).getTime() < now) continue
        list.push({ kind: 'schedule', o })
      }
    }
    if (showEvents) {
      for (const e of events) {
        if (!selectedMarkets.has(e.market_id)) continue
        if (!selectedEvtCats.has(e.category)) continue
        if (new Date(e.start_at).getTime() < now) continue
        list.push({ kind: 'event', e })
      }
    }
    list.sort((a, b) => {
      const ta = a.kind === 'event' ? new Date(a.e.start_at).getTime() : new Date(a.o.start).getTime()
      const tb = b.kind === 'event' ? new Date(b.e.start_at).getTime() : new Date(b.o.start).getTime()
      return ta - tb
    })
    return list.slice(0, 8)
  }, [events, occurrences, selectedMarkets, selectedSchCats, selectedEvtCats, showMarkets, showEvents])

  function toggleMarket(id: string) {
    setSelectedMarkets((prev) => {
      const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
    })
  }
  function toggleSchCat(c: ScheduleCategory) {
    setSelectedSchCats((prev) => {
      const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n
    })
  }
  function toggleEvtCat(c: string) {
    setSelectedEvtCats((prev) => {
      const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n
    })
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
      <div className="mb-8 md:mb-10 border-b border-cream-300 pb-6">
        <p className="text-[0.72rem] uppercase tracking-widest-plus text-ink-muted mb-2">Liguria · Provincia di Imperia</p>
        <h1 className="font-serif text-3xl md:text-5xl text-ink leading-tight">Calendario</h1>
        <p className="text-sm text-ink-soft mt-3 max-w-xl">
          Mercati ricorrenti ed eventi speciali, filtrabili per zona, tipologia e categoria.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-cream-50 border border-cream-300 rounded-sm p-4">
            {loading ? (
              <p className="text-center py-12 text-ink-muted text-sm">Caricamento…</p>
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
                eventClick={(info) => setSelected(info.event.extendedProps as CalItem)}
              />
            )}
          </div>
        </div>

        <aside className="space-y-4 text-sm">
          <div className="bg-cream-50 border border-cream-300 rounded-sm p-4">
            <h2 className="font-serif text-ink text-base mb-3">Cosa mostrare</h2>
            <label className="flex items-center gap-2.5 mb-2 cursor-pointer">
              <input type="checkbox" checked={showMarkets} onChange={(e) => setShowMarkets(e.target.checked)} />
              <span className="text-ink">Mercati ricorrenti</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={showEvents} onChange={(e) => setShowEvents(e.target.checked)} />
              <span className="text-ink">Eventi speciali</span>
            </label>
          </div>

          {showMarkets && (
            <div className="bg-cream-50 border border-cream-300 rounded-sm p-4">
              <h2 className="font-serif text-ink text-base mb-3">Tipologia mercato</h2>
              <div className="space-y-1.5">
                {ALL_SCH_CATS.map((c) => {
                  const active = selectedSchCats.has(c)
                  return (
                    <button
                      key={c}
                      onClick={() => toggleSchCat(c)}
                      className="flex items-center gap-2.5 w-full text-left text-sm group"
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0 transition-opacity ${active ? '' : 'opacity-30'}`}
                        style={{ borderColor: SCH_COLOR[c], backgroundColor: active ? SCH_COLOR[c] + '22' : 'transparent' }}
                      />
                      <span className={active ? 'text-ink' : 'text-ink-muted'}>{SCH_LABEL[c]}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {showEvents && (
            <div className="bg-cream-50 border border-cream-300 rounded-sm p-4">
              <h2 className="font-serif text-ink text-base mb-3">Categorie eventi</h2>
              <div className="flex flex-wrap gap-1.5">
                {ALL_EVT_CATS.map((c) => {
                  const active = selectedEvtCats.has(c)
                  return (
                    <button
                      key={c}
                      onClick={() => toggleEvtCat(c)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        active ? 'text-cream-50' : 'bg-cream-50 text-ink-muted border-cream-300 hover:text-ink'
                      }`}
                      style={active ? { backgroundColor: EVT_COLOR[c], borderColor: EVT_COLOR[c] } : undefined}
                    >
                      {EVT_LABEL[c]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="bg-cream-50 border border-cream-300 rounded-sm p-4">
            <h2 className="font-serif text-ink text-base mb-3">Zone</h2>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {markets.map((m) => (
                <label key={m.id} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMarkets.has(m.id)}
                    onChange={() => toggleMarket(m.id)}
                  />
                  <span className="text-ink">{m.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-3 pt-3 border-t border-cream-300">
              <button
                onClick={() => setSelectedMarkets(new Set(markets.map((m) => m.id)))}
                className="text-xs text-ink hover:underline font-medium"
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

          <div className="bg-cream-50 border border-cream-300 rounded-sm p-4">
            <h2 className="font-serif text-ink text-base mb-3">Prossimi</h2>
            {upcoming.length === 0 ? (
              <p className="text-xs text-ink-muted">Nessun appuntamento coi filtri correnti.</p>
            ) : (
              <ul className="space-y-2.5">
                {upcoming.map((it, i) => {
                  const label = it.kind === 'event' ? it.e.title : it.o.comune
                  const sub = it.kind === 'event' ? (it.e.markets?.name ?? '') : it.o.market_name
                  const d = it.kind === 'event' ? new Date(it.e.start_at) : new Date(it.o.start)
                  const color = it.kind === 'event' ? (EVT_COLOR[it.e.category] ?? '#4A4F3B') : SCH_COLOR[it.o.category]
                  return (
                    <li key={i} className="border-l-2 pl-2.5" style={{ borderColor: color }}>
                      <button onClick={() => setSelected(it)} className="text-left w-full">
                        <p className="text-xs text-ink-muted">
                          {d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} · {sub}
                        </p>
                        <p className="text-sm text-ink">{label}</p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-cream-50 rounded-sm max-w-lg w-full p-6 border border-cream-300">
            {selected.kind === 'event' ? (
              <>
                <div className="flex items-center gap-2 mb-2 flex-wrap text-xs">
                  <span className="px-2 py-0.5 rounded-sm text-cream-50" style={{ backgroundColor: EVT_COLOR[selected.e.category] ?? '#4A4F3B' }}>
                    {EVT_LABEL[selected.e.category] ?? selected.e.category}
                  </span>
                  {selected.e.markets?.slug && (
                    <Link href={`/${selected.e.markets.slug}`} className="px-2 py-0.5 rounded-sm bg-cream-200 text-ink hover:bg-cream-300">
                      {selected.e.markets.name}
                    </Link>
                  )}
                  {selected.e.is_recurring && (
                    <span className="text-ink-muted flex items-center"><Repeat className="w-3 h-3 mr-1" />ricorrente</span>
                  )}
                </div>
                <h3 className="font-serif text-xl text-ink mb-1">{selected.e.title}</h3>
                <p className="text-sm text-ink-soft mb-3">
                  {new Date(selected.e.start_at).toLocaleString('it-IT')}
                  {selected.e.end_at ? ` → ${new Date(selected.e.end_at).toLocaleString('it-IT')}` : ''}
                </p>
                {selected.e.location && (
                  <p className="text-sm text-ink flex items-center mb-2"><MapPin className="w-4 h-4 mr-1" />{selected.e.location}</p>
                )}
                {selected.e.description && <p className="text-sm text-ink whitespace-pre-wrap">{selected.e.description}</p>}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2 flex-wrap text-xs">
                  <span
                    className="px-2 py-0.5 rounded-sm text-cream-50"
                    style={{ backgroundColor: SCH_COLOR[selected.o.category] }}
                  >
                    {SCH_LABEL[selected.o.category]}
                  </span>
                  <Link href={`/${selected.o.market_slug}`} className="px-2 py-0.5 rounded-sm bg-cream-200 text-ink hover:bg-cream-300">
                    {selected.o.market_name}
                  </Link>
                </div>
                <h3 className="font-serif text-xl text-ink mb-1">{selected.o.comune}</h3>
                <p className="text-sm text-ink-soft mb-1">
                  {selected.o.giorno}
                  {selected.o.orario ? ` · ${selected.o.orario}` : ''}
                </p>
                {selected.o.luogo && (
                  <p className="text-sm text-ink flex items-center mt-2"><MapPin className="w-4 h-4 mr-1" />{selected.o.luogo}</p>
                )}
                {selected.o.settori && (
                  <p className="text-xs text-ink-muted italic mt-2">{selected.o.settori}</p>
                )}
              </>
            )}
            <button onClick={() => setSelected(null)} className="mt-6 px-4 py-2 bg-cream-200 hover:bg-cream-300 rounded-sm w-full text-sm text-ink">
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
