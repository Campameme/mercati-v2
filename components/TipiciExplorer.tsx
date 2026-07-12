'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, LayoutList, MapPin, Check, Map as MapIcon, ArrowRight } from 'lucide-react'
import UnifiedMapClient from '@/components/UnifiedMapClient'
import { slugifyName } from '@/lib/markets/slug'
import { useLang } from '@/lib/i18n/useLang'
import { UI_I18N } from '@/lib/i18n/ui'
import { occursOn, isNonWeekly } from '@/lib/markets/hours'
import {
  CATEGORY_COLOR, CATEGORY_COLOR_DARK, CATEGORY_LABEL, CATEGORY_GLYPH, type ScheduleCategory,
} from '@/lib/schedules/classify'

export interface TipicoItem {
  id: string
  comune: string
  giorno: string
  orario: string | null
  luogo: string | null
  settori: string | null
  lat: number | null
  lng: number | null
  marketSlug: string
  marketName: string
  category: ScheduleCategory
}

const TIPICO_CATS: ScheduleCategory[] = ['antiquariato', 'alimentare', 'artigianato']

/** Prossimi N giorni con almeno un mercato (per la vista calendario). */
function agenda(items: TipicoItem[], days: number) {
  const out: Array<{ date: Date; events: TipicoItem[] }> = []
  const start = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    const events = items.filter((it) => occursOn(it.giorno, d))
    if (events.length > 0) out.push({ date: d, events })
  }
  return out
}

export default function TipiciExplorer({ items }: { items: TipicoItem[] }) {
  const [lang] = useLang()
  const ui = UI_I18N[lang]
  const WD_LONG = ui.weekdaysLong
  const MONTH_LONG = ui.monthsLong
  const MAP_TAB: Record<string, string> = { it: 'Mappa', fr: 'Carte', de: 'Karte', en: 'Map' }
  const [view, setView] = useState<'calendario' | 'elenco' | 'mappa'>('calendario')
  const [cats, setCats] = useState<ScheduleCategory[]>([])
  const [zona, setZona] = useState<string>('all')
  const [soloSpeciali, setSoloSpeciali] = useState(true)

  const zone = useMemo(() => {
    const m = new Map<string, string>()
    for (const it of items) m.set(it.marketSlug, it.marketName)
    return Array.from(m.entries()).sort((a, b) => a[1].localeCompare(b[1], 'it'))
  }, [items])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const it of items) c[it.category] = (c[it.category] ?? 0) + 1
    return c
  }, [items])

  const filtered = useMemo(
    () =>
      items.filter((it) => {
        if (cats.length > 0 && !cats.includes(it.category)) return false
        if (zona !== 'all' && it.marketSlug !== zona) return false
        return true
      }),
    [items, cats, zona],
  )

  // Calendario: solo le ricorrenze speciali (mensili/stagionali), come da
  // vocazione della sezione. L'elenco invece può mostrare tutto.
  const calendarItems = useMemo(() => filtered.filter((it) => isNonWeekly(it.giorno)), [filtered])
  const listItems = useMemo(
    () => (soloSpeciali ? filtered.filter((it) => isNonWeekly(it.giorno)) : filtered),
    [filtered, soloSpeciali],
  )
  const days = useMemo(() => agenda(calendarItems, 60), [calendarItems])

  function toggleCat(c: ScheduleCategory) {
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  const href = (it: TipicoItem) => `/${it.marketSlug}/c/${slugifyName(it.comune)}?s=${it.id}`

  // La mappa SOLO dei tipici: pin-banco colorati per tipologia
  const mapPins = useMemo(
    () =>
      filtered
        .filter((it) => it.lat != null && it.lng != null)
        .map((it) => ({
          id: it.id,
          lat: it.lat as number,
          lng: it.lng as number,
          kind: 'market' as const,
          title: `${it.comune} · ${it.giorno}`,
          subtitle: it.luogo ?? undefined,
          category: it.category,
          href: href(it),
        })),
    [filtered],
  )

  return (
    <div>
      {/* Filtri: grandi chip-interruttore per tipologia + zona. Diversi dal
          sistema della mappa: qui tutto a vista, niente dropdown. */}
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        {TIPICO_CATS.map((c) => {
          const on = cats.length === 0 || cats.includes(c)
          const selected = cats.includes(c)
          return (
            <button
              key={c}
              onClick={() => toggleCat(c)}
              aria-pressed={selected}
              className={`imk-lift inline-flex items-center gap-2 font-alt text-sm font-semibold px-4 py-2.5 rounded-full border-[1.5px] transition-colors ${
                selected
                  ? 'text-crema border-transparent'
                  : on
                    ? 'bg-white text-ink border-[#e0d7c1] hover:border-ink'
                    : 'bg-white text-ink-muted border-[#e0d7c1]/60'
              }`}
              style={selected ? { backgroundColor: CATEGORY_COLOR[c] } : undefined}
            >
              {selected && <Check className="w-4 h-4" aria-hidden="true" />}
              <span aria-hidden="true">{CATEGORY_GLYPH[c]}</span>
              {CATEGORY_LABEL[c]}
              <span className={`text-xs ${selected ? 'text-crema/80' : 'text-ink-muted'}`}>{counts[c] ?? 0}</span>
            </button>
          )
        })}
        <select
          value={zona}
          onChange={(e) => setZona(e.target.value)}
          aria-label={ui.tipiciAllZones}
          className="font-alt text-sm font-semibold px-4 py-2.5 rounded-full border-[1.5px] border-[#e0d7c1] bg-white text-ink focus:outline-none focus:border-alga"
        >
          <option value="all">{ui.tipiciAllZones}</option>
          {zone.map(([slug, name]) => (
            <option key={slug} value={slug}>{name}</option>
          ))}
        </select>
      </div>

      {/* Vista: calendario / elenco / mappa */}
      <div className="flex items-center gap-1.5 mb-8 border-b border-[#e0d7c1]">
        {([['calendario', ui.tipiciCalendarTab, CalendarDays], ['elenco', ui.tipiciListTab, LayoutList], ['mappa', MAP_TAB[lang], MapIcon]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            aria-pressed={view === key}
            className={`inline-flex items-center gap-2 font-alt text-sm font-semibold px-4 py-3 border-b-[3px] -mb-px transition-colors ${
              view === key ? 'border-alga text-alga-600' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Icon className="w-4 h-4" aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {view === 'mappa' ? (
        <div className="rounded-xl overflow-hidden border border-[#e0d7c1] bg-white shadow-sm">
          <UnifiedMapClient pins={mapPins} height={520} maxZoom={12} bare />
        </div>
      ) : view === 'calendario' ? (
        days.length === 0 ? (
          <p className="text-sm text-ink-muted py-8">{ui.tipiciEmptyCalendar}</p>
        ) : (
          <ol className="space-y-8">
            {days.map(({ date, events }) => (
              <li key={date.toISOString()} className="grid md:grid-cols-[150px_1fr] gap-3 md:gap-8">
                <div className="md:text-right md:border-r md:border-[#e0d7c1] md:pr-6">
                  <p className="font-alt text-xs font-bold uppercase tracking-[0.12em] text-terracotta">{WD_LONG[date.getDay()]}</p>
                  <p className="font-display font-extrabold tracking-tight text-2xl text-ink leading-none mt-0.5">{date.getDate()}</p>
                  <p className="text-xs text-ink-muted">{MONTH_LONG[date.getMonth()]}</p>
                </div>
                <ul className="space-y-2.5 min-w-0">
                  {events.map((it) => (
                    <li key={`${date.toISOString()}-${it.id}`}>
                      <Link
                        href={href(it)}
                        className="imk-lift group flex flex-col bg-white rounded-xl border border-[#e0d7c1] overflow-hidden"
                      >
                        <span aria-hidden="true" className="mz-band" style={{ ['--band' as string]: CATEGORY_COLOR[it.category] }} />
                        <div className="flex items-center justify-between gap-4 px-4 py-3">
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 flex-wrap">
                              <span className="font-display font-extrabold tracking-tight text-base text-ink leading-tight">{it.comune}</span>
                              <span
                                className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-alt font-bold uppercase tracking-wider text-crema"
                                style={{ background: CATEGORY_COLOR[it.category] }}
                              >
                                {CATEGORY_LABEL[it.category]}
                              </span>
                            </p>
                            <p className="text-xs text-ink-soft truncate mt-1">
                              {it.luogo && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-alga inline" aria-hidden="true" /> {it.luogo}</span>}
                              {it.orario && <span className="text-ink-muted"> · {it.orario}</span>}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-terracotta group-hover:translate-x-0.5 transition-all flex-shrink-0" aria-hidden="true" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )
      ) : (
        <>
          <label className="inline-flex items-center gap-2.5 mb-6 cursor-pointer select-none">
            <button
              role="switch"
              aria-checked={soloSpeciali}
              onClick={() => setSoloSpeciali((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${soloSpeciali ? 'bg-alga' : 'bg-ink/20'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${soloSpeciali ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
            <span className="font-alt text-sm font-semibold text-ink">{ui.tipiciOnlySpecial}</span>
          </label>

          {listItems.length === 0 ? (
            <p className="text-sm text-ink-muted py-8">{ui.tipiciEmptyList}</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listItems.map((it) => (
                <li key={it.id}>
                  <Link
                    href={href(it)}
                    className="imk-lift group flex flex-col h-full bg-white rounded-xl border border-[#e0d7c1] overflow-hidden"
                  >
                    <span aria-hidden="true" className="mz-band" style={{ ['--band' as string]: CATEGORY_COLOR[it.category] }} />
                    <div className="p-4 flex-1 flex flex-col">
                      {/* La ricorrenza in display, col colore scuro della tipologia
                          (stesso pattern delle card #tipici della home) */}
                      <p className="font-display font-extrabold tracking-tight text-base leading-tight" style={{ color: CATEGORY_COLOR_DARK[it.category] }}>
                        {it.giorno}
                      </p>
                      <h3 className="mt-1 font-display font-extrabold tracking-tight text-lg text-ink leading-tight">{it.comune}</h3>
                      <span
                        className="mt-2 self-start inline-block rounded-full px-2.5 py-0.5 text-[10px] font-alt font-bold uppercase tracking-wider text-crema"
                        style={{ background: CATEGORY_COLOR[it.category] }}
                      >
                        {CATEGORY_LABEL[it.category]}
                      </span>
                      <p className="text-xs text-ink-soft mt-2">
                        {it.luogo}
                        {it.orario && <span className="text-ink-muted"> · {it.orario}</span>}
                      </p>
                      {it.settori && <p className="text-xs text-ink-muted italic mt-2 line-clamp-2">{it.settori}</p>}
                      <span className="mt-auto pt-3 inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.08em] text-alga-600">
                        {it.marketName} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
