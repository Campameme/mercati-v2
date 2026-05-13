'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, CalendarDays } from 'lucide-react'
import { slugifyName } from '@/lib/markets/slug'

interface SessionRow {
  id: string
  comune: string
  giorno: string
  orario: string | null
  luogo: string | null
  market_id: string
  market_slug: string
  market_name: string
}

interface Props {
  sessions: SessionRow[]
}

const WEEKDAY_ORDER = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

function weekdayOf(giorno: string): string | null {
  const lower = giorno.toLowerCase()
  if (/luned[iì]/.test(lower)) return 'Lunedì'
  if (/marted[iì]/.test(lower)) return 'Martedì'
  if (/mercoled[iì]/.test(lower)) return 'Mercoledì'
  if (/gioved[iì]/.test(lower)) return 'Giovedì'
  if (/venerd[iì]/.test(lower)) return 'Venerdì'
  if (/sabato|sabati/.test(lower)) return 'Sabato'
  if (/domenica|domeniche/.test(lower)) return 'Domenica'
  return null
}

const ITALIAN_DAYS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']

export default function MarketsQuickFinder({ sessions }: Props) {
  const [q, setQ] = useState('')
  const [dayFilter, setDayFilter] = useState<string | 'all' | 'today' | 'weekend'>('all')
  const [today, setToday] = useState<string>('')

  useEffect(() => {
    const d = new Date()
    setToday(ITALIAN_DAYS[d.getDay()])
  }, [])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return sessions.filter((s) => {
      if (needle) {
        const hay = `${s.comune} ${s.luogo ?? ''} ${s.giorno} ${s.market_name}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      const wd = weekdayOf(s.giorno)
      if (dayFilter === 'today') {
        // include "ogni X" + "X e Y" + "1° X del mese" se contiene il giorno di oggi
        return wd === today || (today && s.giorno.toLowerCase().includes(today.toLowerCase()))
      }
      if (dayFilter === 'weekend') {
        return s.giorno.toLowerCase().includes('sabato') ||
               s.giorno.toLowerCase().includes('domenica') ||
               s.giorno.toLowerCase().includes('domeniche')
      }
      if (dayFilter !== 'all') return wd === dayFilter
      return true
    })
  }, [sessions, q, dayFilter, today])

  // Sort: prima i match più "esatti" (comune che inizia con needle), poi per comune
  const sorted = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return [...filtered].sort((a, b) => {
      if (needle) {
        const aStarts = a.comune.toLowerCase().startsWith(needle) ? 0 : 1
        const bStarts = b.comune.toLowerCase().startsWith(needle) ? 0 : 1
        if (aStarts !== bStarts) return aStarts - bStarts
      }
      return a.comune.localeCompare(b.comune, 'it')
    })
  }, [filtered, q])

  const visible = sorted.slice(0, 24)
  const more = sorted.length - visible.length

  return (
    <section className="py-8 md:py-10">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-2">Trova un mercato</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink">Cerca per comune o giorno</h2>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Es. "Sanremo", "Mercoledì", "Piazza Goito"…'
          className="w-full pl-12 pr-4 py-3.5 bg-cream-50 border border-cream-300 rounded-sm text-base focus:outline-none focus:border-olive-500"
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        <Chip active={dayFilter === 'all'} onClick={() => setDayFilter('all')}>Tutti</Chip>
        <Chip active={dayFilter === 'today'} onClick={() => setDayFilter('today')}>Oggi ({today})</Chip>
        <Chip active={dayFilter === 'weekend'} onClick={() => setDayFilter('weekend')}>Weekend</Chip>
        {WEEKDAY_ORDER.map((d) => (
          <Chip key={d} active={dayFilter === d} onClick={() => setDayFilter(d)}>{d}</Chip>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="bg-cream-50 border border-cream-300 rounded-sm p-6 text-center text-ink-muted text-sm">
          {q ? `Nessun mercato corrisponde a "${q}".` : 'Nessun mercato col filtro corrente.'}
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {visible.map((s) => {
            const comuneSlug = slugifyName(s.comune)
            return (
              <li key={s.id}>
                <Link
                  href={`/${s.market_slug}/c/${comuneSlug}?s=${s.id}`}
                  className="group block bg-cream-50 border border-cream-300 rounded-sm px-4 py-3 hover:border-olive-500 hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-serif text-base text-ink leading-tight group-hover:text-olive-700 transition-colors truncate">
                      {s.comune}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-ink-muted flex-shrink-0">
                      {s.market_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-ink-soft">
                    <CalendarDays className="w-3 h-3 text-olive-500 flex-shrink-0" />
                    <span className="truncate">{s.giorno}</span>
                    {s.orario && <span className="text-ink-muted tabular-nums flex-shrink-0">· {s.orario}</span>}
                  </div>
                  {s.luogo && (
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-ink-muted">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{s.luogo}</span>
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {more > 0 && (
        <p className="text-xs text-ink-muted mt-3">+ altri {more} mercati. Affina la ricerca o usa i filtri.</p>
      )}
    </section>
  )
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
        active
          ? 'bg-ink text-cream-100 border-ink'
          : 'bg-cream-50 text-ink-soft border-cream-300 hover:border-olive-500'
      }`}
    >
      {children}
    </button>
  )
}
