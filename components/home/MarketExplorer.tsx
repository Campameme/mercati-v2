'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Search, Crosshair, Navigation as NavIcon, ChevronDown, Check } from 'lucide-react'
import UnifiedMapClient from '@/components/UnifiedMapClient'
import type { UnifiedMapPin } from '@/components/UnifiedMap'
import MarketPanel from './MarketPanel'
import type { MarketPin, MarketSession } from './types'
import { HOME_I18N, LANGS, type Lang } from '@/lib/i18n/home'
import { marketStatus, weekdaysOf, occursOn, fmtHour, type MarketStatus } from '@/lib/markets/hours'
import {
  classifyMany, CATEGORY_ORDER, CATEGORY_COLOR, CATEGORY_GLYPH, categoryLabelI18n, type ScheduleCategory,
} from '@/lib/schedules/classify'
import { ZONES, ZONE_BY_SLUG } from '@/lib/markets/zones'
import { haversineMeters } from '@/lib/markets/geo'
import { HOME_COPY } from '@/lib/i18n/homeCopy'
import { useTypewriter } from '@/lib/useTypewriter'
import { searchMarkets, type SearchOperatorLite } from '@/lib/markets/search'

const WD_FULL: Record<Lang, string[]> = {
  it: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
  fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
}
const WD_ORDER = [1, 2, 3, 4, 5, 6, 0]
const DAYS_LABEL: Record<Lang, string> = { it: 'Giorni', fr: 'Jours', de: 'Tage', en: 'Days' }
const RESET_LABEL: Record<Lang, string> = { it: 'Azzera', fr: 'Effacer', de: 'Zurücksetzen', en: 'Clear' }

interface HubOperator {
  id: string
  name: string
  category: string
  description?: string
  market: { slug: string; name: string } | null
  schedules: Array<{ comune: string | null }>
}

function pickSession(pin: MarketPin, now: Date | null): MarketSession {
  if (now) {
    const match = pin.sessions.find((s) => occursOn(s.giorno, now))
    if (match) return match
  }
  return pin.sessions[0]
}

function pinWeekdays(pin: MarketPin): Set<number> {
  const set = new Set<number>()
  for (const s of pin.sessions) for (const d of weekdaysOf(s.giorno)) set.add(d)
  return set
}

// --- Dropdown filtro multi-selezione (chiude su click-fuori / Esc) ----------
function FilterDropdown({
  label, count, children,
}: { label: string; count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  const active = count > 0
  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 font-alt text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-colors ${
          active ? 'bg-ink text-carta border-ink' : 'bg-white text-ink border-ink/15 hover:border-ink'
        }`}
      >
        {label}
        {active && (
          <span className="grid place-items-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-sole text-ink text-[11px] leading-none">
            {count}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-1.5 z-50 w-60 max-w-[80vw] bg-white border-2 border-ink/15 imk-edge shadow-xl p-1.5 max-h-[60vh] overflow-y-auto imk-scroll"
          data-lenis-prevent
        >
          {children}
        </div>
      )}
    </div>
  )
}

function CheckRow({
  checked, onClick, label, color,
}: { checked: boolean; onClick: () => void; label: string; color?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-marel/50 text-left transition-colors"
    >
      <span className={`grid place-items-center w-4 h-4 rounded border-2 flex-shrink-0 ${checked ? 'bg-ink border-ink' : 'border-ink/25'}`}>
        {checked && <Check className="w-3 h-3 text-carta" aria-hidden="true" />}
      </span>
      {color && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />}
      <span className="font-alt text-sm text-ink">{label}</span>
    </button>
  )
}

interface Props {
  pins: MarketPin[]
  initialQuery?: string
  initialZone?: string
  /** dai chip della home: filtro "oggi" pre-attivo */
  initialToday?: boolean
  /** dai chip della home: giorni della settimana pre-selezionati (0=dom … 6=sab) */
  initialDays?: number[]
  /** dai chip della home: chiede subito la posizione e ordina per distanza */
  initialNear?: boolean
}

export default function MarketExplorer({ pins, initialQuery = '', initialZone = 'all', initialToday = false, initialDays = [], initialNear = false }: Props) {
  const [lang, setLang] = useState<Lang>('it')
  const [days, setDays] = useState<number[]>(initialDays)
  const [today, setToday] = useState(initialToday)
  const [zone, setZone] = useState<string>(initialZone && ZONE_BY_SLUG[initialZone] ? initialZone : 'all')
  const [types, setTypes] = useState<ScheduleCategory[]>([])
  const [sort, setSort] = useState<'az' | 'near'>('az')
  const [query, setQuery] = useState(initialQuery)
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [now, setNow] = useState<Date | null>(null)
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [operators, setOperators] = useState<HubOperator[]>([])
  const didAuto = useRef(false)

  const dict = HOME_I18N[lang]
  const typedPlaceholder = useTypewriter(HOME_COPY[lang].searchExamples)

  useEffect(() => {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('imk:lang')) as Lang | null
    if (saved && LANGS.includes(saved)) setLang(saved)
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 60_000)
    fetch('/api/operators?all=1')
      .then((r) => r.json())
      .then((j) => setOperators(Array.isArray(j?.data) ? j.data : []))
      .catch(() => {})
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang
    if (typeof localStorage !== 'undefined') localStorage.setItem('imk:lang', lang)
  }, [lang])

  // Chip "Vicino a me" dalla home: chiede subito la posizione e ordina per distanza.
  useEffect(() => {
    if (initialNear) locateNearest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const meta = useMemo(() => {
    const m = new Map<string, { category: ScheduleCategory }>()
    for (const p of pins) m.set(p.id, { category: classifyMany(p.sessions.map((s) => s.settori)) })
    return m
  }, [pins])

  const statuses = useMemo(() => {
    const map = new Map<string, MarketStatus>()
    for (const pin of pins) {
      const s = pickSession(pin, now)
      map.set(pin.id, marketStatus(now ?? new Date(0), s.giorno, s.orario))
    }
    return map
  }, [pins, now])

  const filteredPins = useMemo(() => {
    return pins.filter((p) => {
      if (zone !== 'all' && p.marketSlug !== zone) return false
      if (types.length > 0 && !types.includes(meta.get(p.id)?.category ?? 'generale')) return false
      if (today || days.length > 0) {
        const okToday = today && now ? p.sessions.some((s) => occursOn(s.giorno, now)) : false
        const okWeekday = days.length > 0 ? days.some((d) => pinWeekdays(p).has(d)) : false
        if (!okToday && !okWeekday) return false
      }
      return true
    })
  }, [pins, zone, types, days, today, now, meta])

  const sortedPins = useMemo(() => {
    const arr = [...filteredPins]
    if (sort === 'near' && userLoc) arr.sort((a, b) => haversineMeters(userLoc, a) - haversineMeters(userLoc, b))
    else arr.sort((a, b) => a.comune.localeCompare(b.comune, 'it'))
    return arr
  }, [filteredPins, sort, userLoc])

  const operatorsLite = useMemo<SearchOperatorLite[]>(
    () =>
      operators.map((o) => ({
        id: o.id,
        name: o.name,
        category: o.category,
        description: o.description,
        marketSlug: o.market?.slug ?? null,
        comuni: (o.schedules ?? []).map((s) => s.comune).filter((c): c is string => !!c),
      })),
    [operators],
  )
  const searchResults = useMemo(
    () => searchMarkets(query, pins, operatorsLite, lang, userLoc),
    [query, pins, operatorsLite, lang, userLoc],
  )

  // Auto-selezione dal q iniziale (una volta): seleziona il miglior risultato.
  useEffect(() => {
    if (didAuto.current) return
    if (!initialQuery || initialQuery.trim().length < 2) { didAuto.current = true; return }
    if (searchResults.length > 0) {
      setSelectedId(searchResults[0].pin.id)
      didAuto.current = true
    }
  }, [initialQuery, searchResults])

  const openCount = useMemo(() => {
    if (!now) return 0
    let n = 0
    for (const p of filteredPins) if (statuses.get(p.id)?.state === 'open') n++
    return n
  }, [filteredPins, statuses, now])

  const mapPins = useMemo<UnifiedMapPin[]>(
    () =>
      filteredPins.map((p) => ({
        id: p.id, lat: p.lat, lng: p.lng, kind: 'market' as const,
        title: p.comune, subtitle: p.luogo ?? p.marketName, category: meta.get(p.id)?.category,
      })),
    [filteredPins, meta],
  )

  const selected = useMemo(() => pins.find((p) => p.id === selectedId) ?? null, [pins, selectedId])
  const selectedSession = selected ? pickSession(selected, now) : null
  const selectedStatus = selected ? statuses.get(selected.id) : undefined
  const nowText = now ? `${dict.nowLabel} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}` : ''

  const dayCount = (today ? 1 : 0) + days.length

  function locateNearest() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setSort('near'); setLocating(false) },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  function selectMarket(id: string) { setSelectedId(id); setOpen(false); setQuery('') }
  function toggleType(c: ScheduleCategory) {
    setTypes((t) => (t.includes(c) ? t.filter((x) => x !== c) : [...t, c]))
  }
  function toggleDay(d: number) {
    setDays((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]))
  }

  return (
    <div className="flex flex-col md:h-[calc(100svh-4rem)]">
      {/* ===== Barra controlli (sopra la mappa, mai sovrapposta) ===== */}
      <div className="sticky top-16 z-30 bg-carta/95 backdrop-blur-sm border-b-2 border-ink/10 flex-shrink-0">
        <div className="container mx-auto px-4 md:px-6 pt-3 pb-2 space-y-2.5">
          {/* riga 1: ricerca + posizione + lingua */}
          <div className="flex items-center gap-2.5">
            <div className="imk-edge relative flex-1 min-w-0 bg-white border-2 border-ink/15 shadow-sm focus-within:border-mare">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted z-10" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 180)}
                placeholder={typedPlaceholder}
                aria-label={dict.searchPlaceholder}
                className="relative w-full pl-11 pr-3 py-3 bg-transparent rounded-2xl text-[15px] focus:outline-none"
              />
              {open && query.trim().length >= 2 && (
                <div
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white border-2 border-ink/15 imk-edge shadow-xl z-40 max-h-[60vh] overflow-y-auto imk-scroll"
                  data-lenis-prevent
                >
                  <div className="px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-ink-muted border-b border-ink/10">
                    {dict.whyShown}: <span className="text-ink font-semibold normal-case tracking-normal">«{query.trim()}»</span>
                  </div>
                  {searchResults.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-ink-muted">{dict.noResults}</p>
                  ) : (
                    searchResults.slice(0, 8).map((r) => {
                      const cat = classifyMany(r.pin.sessions.map((s) => s.settori))
                      return (
                        <button
                          key={r.pin.id}
                          onMouseDown={(e) => { e.preventDefault(); selectMarket(r.pin.id) }}
                          className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 hover:bg-marel/50 border-b border-ink/5 last:border-0"
                        >
                          <span className="mt-0.5 w-3 h-3 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLOR[cat] }} aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block font-alt font-semibold text-sm text-ink truncate">{r.pin.comune}</span>
                            {r.pin.luogo && <span className="block text-xs text-ink-muted truncate">{r.pin.luogo}</span>}
                            <span className="mt-1 flex flex-wrap gap-1">
                              {r.reasons.slice(0, 2).map((reason, i) => (
                                <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-ink/5 text-ink-soft rounded-full px-2 py-0.5">
                                  <b className="font-semibold text-ink">{reason.field}:</b> {reason.value}
                                </span>
                              ))}
                            </span>
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>
            <button
              onClick={locateNearest}
              disabled={locating}
              aria-pressed={sort === 'near'}
              className={`imk-lift imk-edge flex-shrink-0 inline-flex items-center justify-center gap-2 font-alt font-semibold text-sm border-2 px-3.5 py-3 transition-colors disabled:opacity-60 ${
                sort === 'near' ? 'bg-mare text-white border-mare' : 'border-ink/15 bg-white hover:border-mare hover:text-mare'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              <span className="hidden sm:inline">{locating ? dict.loading : dict.sortNear}</span>
            </button>
            <div className="hidden md:flex gap-1 flex-shrink-0">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`text-xs font-bold uppercase px-2 py-1 rounded-md border-2 transition-colors ${lang === l ? 'bg-ink text-carta border-ink' : 'text-ink border-ink/15 hover:border-ink'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* riga 2: filtri compatti (zona + tipologie + giorni) */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              aria-label={dict.filterZone}
              className="flex-shrink-0 font-alt text-xs font-semibold px-3 py-1.5 rounded-full border-2 border-ink/15 bg-white text-ink focus:outline-none focus:border-mare"
            >
              <option value="all">{dict.allZones}</option>
              {ZONES.map((z) => <option key={z.slug} value={z.slug}>{z.name}</option>)}
            </select>

            <FilterDropdown label={dict.filterType} count={types.length}>
              {CATEGORY_ORDER.map((c) => (
                <CheckRow
                  key={c}
                  checked={types.includes(c)}
                  onClick={() => toggleType(c)}
                  color={CATEGORY_COLOR[c]}
                  label={`${CATEGORY_GLYPH[c]} ${categoryLabelI18n(c, lang)}`}
                />
              ))}
              {types.length > 0 && (
                <button onClick={() => setTypes([])} className="w-full mt-1 px-2.5 py-1.5 text-left font-alt text-xs font-semibold text-ink-muted hover:text-ink">
                  ✕ {RESET_LABEL[lang]}
                </button>
              )}
            </FilterDropdown>

            <FilterDropdown label={DAYS_LABEL[lang]} count={dayCount}>
              <CheckRow checked={today} onClick={() => setToday((t) => !t)} label={dict.filters.today} />
              <div className="my-1 border-t border-ink/10" />
              {WD_ORDER.map((d) => (
                <CheckRow key={d} checked={days.includes(d)} onClick={() => toggleDay(d)} label={WD_FULL[lang][d]} />
              ))}
              {dayCount > 0 && (
                <button onClick={() => { setDays([]); setToday(false) }} className="w-full mt-1 px-2.5 py-1.5 text-left font-alt text-xs font-semibold text-ink-muted hover:text-ink">
                  ✕ {RESET_LABEL[lang]}
                </button>
              )}
            </FilterDropdown>

            {(zone !== 'all' || types.length > 0 || dayCount > 0) && (
              <button
                onClick={() => { setZone('all'); setTypes([]); setDays([]); setToday(false) }}
                className="font-alt text-xs font-semibold text-ink-muted hover:text-ink underline underline-offset-2"
              >
                {RESET_LABEL[lang]}
              </button>
            )}
          </div>

          {/* riga 3: stato (ora + aperti) + legenda tipologie — in linea, niente overlay */}
          <div className="flex items-center gap-x-4 gap-y-1 flex-wrap pb-0.5 text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-alt font-semibold text-ink-soft">
              <span className="w-2 h-2 rounded-full bg-sole" aria-hidden="true" />
              {nowText}
              {now && (
                <>· <b className="text-mare-600">{openCount}</b> {openCount > 0 ? dict.openSuffix : dict.noneOpen}</>
              )}
            </span>
            <span className="hidden sm:flex items-center gap-x-3 gap-y-1 flex-wrap text-ink-muted">
              {CATEGORY_ORDER.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLOR[c] }} aria-hidden="true" />
                  {categoryLabelI18n(c, lang)}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Lista + Mappa (riempiono l'altezza rimanente, scroll interni) ===== */}
      <div className="flex-1 flex flex-col md:flex-row md:min-h-0">
        <aside
          className="order-2 md:order-1 w-full md:w-[340px] md:flex-shrink-0 bg-carta/85 border-t-2 md:border-t-0 md:border-r-2 border-ink/10 h-[42svh] md:h-auto md:min-h-0 overflow-y-auto imk-scroll"
          data-lenis-prevent
        >
          <div className="sticky top-0 bg-carta/95 backdrop-blur-sm px-4 py-2.5 border-b border-ink/10 flex items-center justify-between gap-2 z-10">
            <span className="font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              <span className="imk-mark text-ink">{sortedPins.length}</span> {dict.list}
            </span>
            <button
              onClick={() => setSort('az')}
              aria-pressed={sort === 'az'}
              className={`text-xs font-semibold px-2 py-1 rounded-md ${sort === 'az' ? 'bg-ink text-carta' : 'text-ink-soft hover:bg-ink/5'}`}
            >
              {dict.sortAZ}
            </button>
          </div>

          {sortedPins.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink-muted">{dict.listEmpty}</p>
          ) : (
            <ul className="divide-y divide-ink/5">
              {sortedPins.map((p) => {
                const cat = meta.get(p.id)?.category ?? 'generale'
                const st = statuses.get(p.id)
                const dist = sort === 'near' && userLoc ? haversineMeters(userLoc, p) : null
                const isSel = p.id === selectedId
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => selectMarket(p.id)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors ${isSel ? 'bg-marel/60' : 'hover:bg-marel/40'}`}
                    >
                      <span className="mt-1 w-3 h-3 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLOR[cat] }} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="font-alt font-semibold text-[15px] text-ink leading-tight block truncate">{p.comune}</span>
                        {p.luogo && <span className="block text-xs text-ink-muted truncate">{p.luogo}</span>}
                        <span className="mt-1 flex items-center gap-2 flex-wrap">
                          {st && st.state === 'open' && (
                            <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 text-white" style={{ background: '#15607C' }}>
                              {dict.openUntil} {fmtHour(st.hour ?? 0)}
                            </span>
                          )}
                          {st && st.state === 'opens' && (
                            <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 text-ink" style={{ background: '#F4B62C' }}>
                              {dict.opensAt} {fmtHour(st.hour ?? 0)}
                            </span>
                          )}
                          {dist !== null && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
                              <NavIcon className="w-3 h-3" aria-hidden="true" />
                              {dist < 1000 ? `${Math.round(dist)} m` : `${(dist / 1000).toFixed(1)} km`}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>

        <div className="order-1 md:order-2 relative flex-1 h-[55svh] md:h-auto min-h-[420px] overflow-hidden bg-notte">
          <div className="absolute inset-0">
            <UnifiedMapClient
              pins={mapPins}
              height="100%"
              bare
              onPinClick={(p) => selectMarket(p.id)}
              selectedId={selectedId}
              panToSelected
              userLocation={userLoc}
              maxZoom={14}
            />
          </div>

          {!selected && (
            <div className="absolute left-1/2 bottom-3 -translate-x-1/2 z-[900] pointer-events-none">
              <span className="font-alt font-semibold text-sm text-carta bg-notte/55 backdrop-blur-sm px-4 py-2 rounded-full">{dict.hint}</span>
            </div>
          )}

          {selected && selectedSession && selectedStatus && (
            <MarketPanel
              key={selected.id}
              pin={selected}
              session={selectedSession}
              status={selectedStatus}
              lang={lang}
              dict={dict}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
