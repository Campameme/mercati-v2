'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapPin, CalendarClock, Repeat, Sun, ChevronDown } from 'lucide-react'
import {
  CATEGORY_COLOR,
  CATEGORY_ORDER,
  categoryLabelI18n,
  classifySchedule,
  type ScheduleCategory,
} from '@/lib/schedules/classify'
import { IMPERIA_ZONE_SLUGS } from '@/lib/markets/zones'
import { useLang } from '@/lib/i18n/useLang'
import type { Lang } from '@/lib/i18n/home'

interface Occ {
  schedule_id: string
  market_slug: string
  market_name: string
  comune: string
  luogo: string | null
  orario: string | null
  giorno: string
  settori: string | null
  start: string
  end: string | null
}

// Un mercato che ricorre in un dato giorno della settimana, con la sua natura
// (settimanale / mensile / stagionale) e la prossima data reale.
interface DayMarket {
  schedule_id: string
  market_slug: string
  market_name: string
  comune: string
  luogo: string | null
  orario: string | null
  giorno: string
  settori: string | null
  cat: ScheduleCategory
  recur: 'weekly' | 'monthly' | 'seasonal'
  season: string | null
  next: Date | null
}

// Lunedì-prima, all'europea
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

const WEEKDAY_LONG: Record<Lang, string[]> = {
  it: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
  fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
}

const T: Record<Lang, {
  pick: string
  today: string
  weekly: string
  monthly: string
  seasonal: string
  next: string
  principali: string
  tematici: string
  empty: string
  loading: string
  close: string
  count: (n: number) => string
}> = {
  it: {
    pick: 'Scegli un giorno', today: 'oggi',
    weekly: 'Ogni settimana', monthly: 'Ricorrenza mensile', seasonal: 'Stagionale',
    next: 'Prossimo', principali: 'Mercati principali', tematici: 'Mercati tematici',
    empty: 'Nessun mercato in questo giorno.', loading: 'Caricamento…', close: 'Chiudi',
    count: (n) => `${n} mercat${n === 1 ? 'o' : 'i'}`,
  },
  fr: {
    pick: 'Choisis un jour', today: "aujourd'hui",
    weekly: 'Chaque semaine', monthly: 'Rendez-vous mensuel', seasonal: 'Saisonnier',
    next: 'Prochain', principali: 'Marchés principaux', tematici: 'Marchés thématiques',
    empty: 'Aucun marché ce jour-là.', loading: 'Chargement…', close: 'Fermer',
    count: (n) => `${n} marché${n === 1 ? '' : 's'}`,
  },
  de: {
    pick: 'Wähle einen Tag', today: 'heute',
    weekly: 'Jede Woche', monthly: 'Monatlicher Termin', seasonal: 'Saisonal',
    next: 'Nächster', principali: 'Hauptmärkte', tematici: 'Themenmärkte',
    empty: 'An diesem Tag kein Markt.', loading: 'Laden…', close: 'Schließen',
    count: (n) => `${n} Markt${n === 1 ? '' : 'e'}`,
  },
  en: {
    pick: 'Pick a day', today: 'today',
    weekly: 'Every week', monthly: 'Monthly date', seasonal: 'Seasonal',
    next: 'Next', principali: 'Main markets', tematici: 'Themed markets',
    empty: 'No market on this day.', loading: 'Loading…', close: 'Close',
    count: (n) => `${n} market${n === 1 ? '' : 's'}`,
  },
}

function seasonPeriod(giorno: string): string | null {
  const m = giorno.match(/dal\s+\d{1,2}\/\d{1,2}\s+al\s+\d{1,2}\/\d{1,2}/i)
  return m ? m[0] : null
}
function isMonthly(giorno: string): boolean {
  return /del mese|\b\d\s*[ª°]|prima|second[ao]|terz[ao]|quart[ao]|ultim/i.test(giorno)
}

/**
 * Vista Calendario dei mercati (provincia di Imperia): PRIMA si sceglie un
 * giorno della settimana, POI si caricano i mercati di quel giorno — principali
 * e tematici insieme, con gli stagionali in evidenza sul loro periodo.
 * Le occorrenze arrivano già espanse da /api/schedules/occurrences.
 */
export default function MarketCalendar() {
  const [lang] = useLang()
  const t = T[lang]
  const [occ, setOcc] = useState<Occ[]>([])
  const [loading, setLoading] = useState(true)
  const [cats, setCats] = useState<Set<ScheduleCategory>>(new Set(CATEGORY_ORDER))
  const [sel, setSel] = useState<DayMarket | null>(null)
  const [today] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [weekday, setWeekday] = useState<number>(() => new Date().getDay())

  useEffect(() => {
    fetch('/api/schedules/occurrences')
      .then((r) => r.json())
      .then((j) => {
        const imperia = new Set<string>(IMPERIA_ZONE_SLUGS as readonly string[])
        setOcc((j.data ?? []).filter((o: Occ) => imperia.has(o.market_slug)))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Per ogni giorno della settimana, i mercati che vi ricorrono (dedotti dalle
  // occorrenze reali: coglie anche mensili e stagionali). Quanti mercati per
  // giorno serve pure a "spegnere" i giorni vuoti nel selettore.
  const byWeekday = useMemo(() => {
    const map = new Map<number, Map<string, DayMarket>>()
    for (let d = 0; d < 7; d++) map.set(d, new Map())
    const nowMs = today.getTime()
    for (const o of occ) {
      const start = new Date(o.start)
      const wd = start.getDay()
      const bucket = map.get(wd)!
      const cat = classifySchedule(o.settori)
      const existing = bucket.get(o.schedule_id)
      if (existing) {
        // tieni la prossima data futura più vicina
        if (start.getTime() >= nowMs && (!existing.next || start < existing.next)) existing.next = start
        continue
      }
      const season = seasonPeriod(o.giorno)
      bucket.set(o.schedule_id, {
        schedule_id: o.schedule_id,
        market_slug: o.market_slug,
        market_name: o.market_name,
        comune: o.comune,
        luogo: o.luogo,
        orario: o.orario,
        giorno: o.giorno,
        settori: o.settori,
        cat,
        recur: season ? 'seasonal' : isMonthly(o.giorno) ? 'monthly' : 'weekly',
        season,
        next: start.getTime() >= nowMs ? start : null,
      })
    }
    // seconda passata per la "prossima data" quando la prima occorrenza era passata
    for (const o of occ) {
      const start = new Date(o.start)
      if (start.getTime() < nowMs) continue
      const m = map.get(start.getDay())!.get(o.schedule_id)
      if (m && (!m.next || start < m.next)) m.next = start
    }
    return map
  }, [occ, today])

  const dayMarkets = useMemo(() => {
    const all = Array.from(byWeekday.get(weekday)?.values() ?? [])
      .filter((m) => cats.has(m.cat))
      .sort((a, b) => a.comune.localeCompare(b.comune))
    return {
      principali: all.filter((m) => m.cat === 'generale'),
      tematici: all.filter((m) => m.cat !== 'generale'),
    }
  }, [byWeekday, weekday, cats])

  function toggle(c: ScheduleCategory) {
    setCats((prev) => {
      const n = new Set(prev)
      n.has(c) ? n.delete(c) : n.add(c)
      return n
    })
  }

  const fmtNext = (d: Date | null) =>
    d ? d.toLocaleDateString(lang === 'it' ? 'it-IT' : lang, { weekday: 'short', day: 'numeric', month: 'short' }) : ''

  const totalForWeekday = (wd: number) => byWeekday.get(wd)?.size ?? 0
  const todayWd = today.getDay()

  return (
    <div className="container mx-auto px-4 md:px-6 py-5 md:py-6">
      {/* Selettore giorno: UN grande menu a tendina, ben evidente — l'unica
          interazione insieme al filtro tipologie. Il giorno corrente è marcato. */}
      <label className="block mb-5">
        <span className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-2 block">{t.pick}</span>
        <div className="relative max-w-xl">
          <select
            value={weekday}
            onChange={(e) => setWeekday(Number(e.target.value))}
            className="imk-day-select w-full appearance-none bg-alga text-crema font-display font-extrabold tracking-tight text-2xl md:text-3xl leading-none pl-6 pr-14 py-4 md:py-5 rounded-2xl border-0 shadow-[0_20px_40px_-24px_rgba(53,80,44,0.8)] cursor-pointer focus:outline-none focus:ring-4 focus:ring-limone/60"
          >
            {WEEK_ORDER.map((wd) => {
              const n = totalForWeekday(wd)
              const isToday = wd === todayWd
              return (
                <option key={wd} value={wd} disabled={n === 0} className="font-sans text-base bg-white text-ink">
                  {WEEKDAY_LONG[lang][wd]}{isToday ? ` — ${t.today}` : ''}{n > 0 ? ` · ${t.count(n)}` : ''}
                </option>
              )
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 w-7 h-7 text-limone" aria-hidden="true" />
        </div>
      </label>

      {/* Filtro tipologie */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORY_ORDER.map((c) => {
          const active = cats.has(c)
          return (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              className={`inline-flex items-center gap-1.5 font-alt text-xs font-semibold px-3 py-1.5 rounded-full border-[1.5px] transition-colors ${
                active ? 'text-crema border-transparent' : 'bg-white text-ink-muted border-ink/15 hover:border-ink/30'
              }`}
              style={active ? { backgroundColor: CATEGORY_COLOR[c] } : undefined}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: active ? '#FBF6EC' : CATEGORY_COLOR[c] }} />
              {categoryLabelI18n(c, lang)}
            </button>
          )
        })}
      </div>

      {loading ? (
        <p className="text-center py-16 text-ink-muted text-sm">{t.loading}</p>
      ) : dayMarkets.principali.length === 0 && dayMarkets.tematici.length === 0 ? (
        <div className="bg-white border border-[#e0d7c1] rounded-2xl px-6 py-14 text-center">
          <CalendarClock className="w-8 h-8 text-alga/60 mx-auto mb-3" aria-hidden="true" />
          <p className="text-ink-soft">{t.empty}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {([['principali', dayMarkets.principali], ['tematici', dayMarkets.tematici]] as const).map(([key, list]) =>
            list.length === 0 ? null : (
              <section key={key}>
                <h3 className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-ink-muted mb-3">
                  {key === 'principali' ? t.principali : t.tematici} · {t.count(list.length)}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map((m) => (
                    <button
                      key={m.schedule_id}
                      type="button"
                      onClick={() => setSel(m)}
                      className="imk-lift group text-left bg-white rounded-xl border border-[#e0d7c1] overflow-hidden"
                    >
                      <span aria-hidden="true" className="mz-band block" style={{ ['--band' as string]: CATEGORY_COLOR[m.cat] }} />
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className="inline-flex items-center gap-1 font-alt text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-crema"
                            style={{ backgroundColor: CATEGORY_COLOR[m.cat] }}
                          >
                            {categoryLabelI18n(m.cat, lang)}
                          </span>
                          <RecurBadge recur={m.recur} t={t} />
                        </div>
                        <h4 className="font-display font-extrabold tracking-tight text-lg text-ink leading-tight group-hover:text-alga-600 transition-colors">{m.comune}</h4>
                        {m.luogo && <p className="text-sm text-ink-soft mt-0.5 line-clamp-1">{m.luogo}</p>}
                        {m.orario && <p className="text-xs text-ink-muted tabular-nums mt-1">{m.orario}</p>}
                        {/* Stagionale: il periodo in evidenza */}
                        {m.season && (
                          <p className="mt-2 inline-flex items-center gap-1.5 font-alt text-xs font-semibold text-terracotta-600 bg-terracotta/10 border border-terracotta/25 rounded-full px-2.5 py-1">
                            <Sun className="w-3.5 h-3.5" aria-hidden="true" /> {m.season}
                          </p>
                        )}
                        {m.next && (
                          <p className="text-xs text-ink-muted mt-2">
                            {t.next}: <span className="font-semibold text-ink capitalize">{fmtNext(m.next)}</span>
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}

      {sel && (
        <div className="fixed inset-0 z-[1000] bg-ink/55 backdrop-blur-[2px] flex items-center justify-center p-4" onClick={() => setSel(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#e0d7c1] shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-block font-alt font-semibold text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full text-crema"
                style={{ backgroundColor: CATEGORY_COLOR[sel.cat] }}
              >
                {categoryLabelI18n(sel.cat, lang)}
              </span>
              <RecurBadge recur={sel.recur} t={t} />
            </div>
            <h3 className="font-display font-extrabold tracking-tight text-2xl text-ink leading-tight">{sel.comune}</h3>
            <p className="text-sm text-ink-soft mt-1">{sel.giorno}{sel.orario ? ` · ${sel.orario}` : ''}</p>
            {sel.season && (
              <p className="mt-2 inline-flex items-center gap-1.5 font-alt text-sm font-semibold text-terracotta-600 bg-terracotta/10 border border-terracotta/25 rounded-full px-3 py-1">
                <Sun className="w-4 h-4" aria-hidden="true" /> {sel.season}
              </p>
            )}
            {sel.luogo && (
              <p className="text-sm text-ink flex items-center gap-1.5 mt-3"><MapPin className="w-4 h-4 text-terracotta" />{sel.luogo}</p>
            )}
            {sel.settori && <p className="text-xs text-ink-muted italic mt-2">{sel.settori}</p>}
            {sel.next && <p className="text-sm text-ink-soft mt-3">{t.next}: <span className="font-semibold text-ink capitalize">{fmtNext(sel.next)}</span></p>}
            <a
              href={`/${sel.market_slug}`}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-alga text-crema rounded-full font-alt text-sm font-semibold hover:bg-alga-600 transition-colors"
            >
              {sel.market_name || sel.comune}
            </a>
            <button
              onClick={() => setSel(null)}
              className="mt-2 px-4 py-2.5 bg-crema border-2 border-ink/15 hover:border-ink rounded-full w-full font-alt text-sm font-semibold text-ink transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function RecurBadge({ recur, t }: { recur: DayMarket['recur']; t: (typeof T)['it'] }) {
  if (recur === 'seasonal') {
    return (
      <span className="inline-flex items-center gap-1 font-alt text-[10px] font-bold uppercase tracking-wider text-terracotta-600">
        <Sun className="w-3 h-3" aria-hidden="true" /> {t.seasonal}
      </span>
    )
  }
  if (recur === 'monthly') {
    return (
      <span className="inline-flex items-center gap-1 font-alt text-[10px] font-bold uppercase tracking-wider text-ink-muted">
        <CalendarClock className="w-3 h-3" aria-hidden="true" /> {t.monthly}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 font-alt text-[10px] font-bold uppercase tracking-wider text-ink-muted">
      <Repeat className="w-3 h-3" aria-hidden="true" /> {t.weekly}
    </span>
  )
}
