'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Search, Crosshair, Navigation as NavIcon, ChevronDown, Check, History, X } from 'lucide-react'
import UnifiedMapClient from '@/components/UnifiedMapClient'
import type { UnifiedMapPin } from '@/components/UnifiedMap'
import MarketPanel from './MarketPanel'
import type { MarketPin, MarketSession } from './types'
import { HOME_I18N, LANGS, type Lang } from '@/lib/i18n/home'
import { useLang } from '@/lib/i18n/useLang'
import { marketStatus, weekdaysOf, occursOn, fmtHour, type MarketStatus } from '@/lib/markets/hours'
import { classifyMany, categoryLabelI18n, CATEGORY_COLOR, CATEGORY_ORDER, type ScheduleCategory } from '@/lib/schedules/classify'
import { ZONES, ZONE_BY_SLUG, IMPERIA_ZONE_SLUGS } from '@/lib/markets/zones'
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
const TIPO_LABEL: Record<Lang, string> = { it: 'Tipologie', fr: 'Types', de: 'Arten', en: 'Types' }
const RESET_LABEL: Record<Lang, string> = { it: 'Azzera', fr: 'Effacer', de: 'Zurücksetzen', en: 'Clear' }
// Striscia legenda: cosa indicano il pin e i due stati d'orario della lista.
const LEGEND_I18N: Record<Lang, { pin: string; open: string; opens: string }> = {
  it: { pin: 'Mercato settimanale', open: 'Aperto adesso', opens: 'Apre più tardi' },
  fr: { pin: 'Marché hebdomadaire', open: 'Ouvert maintenant', opens: 'Ouvre plus tard' },
  de: { pin: 'Wochenmarkt', open: 'Jetzt geöffnet', opens: 'Öffnet später' },
  en: { pin: 'Weekly market', open: 'Open now', opens: 'Opens later' },
}

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
        className={`inline-flex items-center gap-1.5 font-alt text-xs font-semibold px-3 py-1.5 rounded-full border-[1.5px] transition-colors ${
          active ? 'bg-alga text-crema border-alga' : 'bg-white text-alga-600 border-alga/60 hover:border-alga'
        }`}
      >
        {label}
        {active && (
          <span className="grid place-items-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-limone text-ink text-[11px] leading-none">
            {count}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-1.5 z-50 w-60 max-w-[80vw] bg-white border border-[#e0d7c1] rounded-xl shadow-xl p-1.5 max-h-[60vh] overflow-y-auto imk-scroll"
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
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-crema-2/70 text-left transition-colors"
    >
      <span className={`grid place-items-center w-4 h-4 rounded border-2 flex-shrink-0 ${checked ? 'bg-alga border-alga' : 'border-ink/25'}`}>
        {checked && <Check className="w-3 h-3 text-crema" aria-hidden="true" />}
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
  /** altezza del blocco mappa+lista; ridotta quando è incorporata in una pagina con contenuti sopra/sotto */
  heightClass?: string
}

export default function MarketExplorer({ pins: allPins, initialQuery = '', initialZone = 'all', initialToday = false, initialDays = [], initialNear = false, heightClass = 'md:h-[calc(100svh-4rem)]' }: Props) {
  const [lang, setLang] = useLang()
  const [days, setDays] = useState<number[]>(initialDays)
  const [today, setToday] = useState(initialToday)
  const [openNow, setOpenNow] = useState(false)
  const [cats, setCats] = useState<ScheduleCategory[]>([])
  const [recents, setRecents] = useState<string[]>([])
  const [zone, setZone] = useState<string>(initialZone && ZONE_BY_SLUG[initialZone] ? initialZone : 'all')
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
    // ricerche recenti: memorizzate in locale per ri-proporle al focus
    try { setRecents(JSON.parse(localStorage.getItem('imk:recentSearches') ?? '[]')) } catch { /* ignore */ }
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 60_000)
    fetch('/api/operators?all=1')
      .then((r) => r.json())
      .then((j) => setOperators(Array.isArray(j?.data) ? j.data : []))
      .catch(() => {})
    return () => clearInterval(t)
  }, [])

  // Chip "Vicino a me" dalla home: chiede subito la posizione e ordina per distanza.
  useEffect(() => {
    if (initialNear) locateNearest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const meta = useMemo(() => {
    const m = new Map<string, { category: ScheduleCategory }>()
    for (const p of allPins) m.set(p.id, { category: classifyMany(p.sessions.map((s) => s.settori)) })
    return m
  }, [allPins])

  // Pagina unica "mercati + tematici": la mappa mostra TUTTE le tipologie.
  // I principali (settimanali, 'generale') si distinguono per il pin più grande;
  // il filtro Tipologie e i colori separano antiquariato/produttori/artigianato.
  const pins = allPins

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
      if (cats.length > 0 && !cats.includes(meta.get(p.id)?.category ?? 'generale')) return false
      if (openNow && statuses.get(p.id)?.state !== 'open') return false
      if (today || days.length > 0) {
        const okToday = today && now ? p.sessions.some((s) => occursOn(s.giorno, now)) : false
        const okWeekday = days.length > 0 ? days.some((d) => pinWeekdays(p).has(d)) : false
        if (!okToday && !okWeekday) return false
      }
      return true
    })
  }, [pins, zone, cats, days, today, now, meta, openNow, statuses])

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

  // Conteggio "aperti adesso" sul set filtrato SENZA il filtro openNow stesso
  // (così il numero sul chip resta stabile quando lo attivi/disattivi).
  const openCount = useMemo(() => {
    if (!now) return 0
    let n = 0
    for (const p of pins) {
      if (zone !== 'all' && p.marketSlug !== zone) continue
      if (statuses.get(p.id)?.state === 'open') n++
    }
    return n
  }, [pins, zone, meta, statuses, now])

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

  function saveRecent(q: string) {
    const t = q.trim()
    if (t.length < 2) return
    setRecents((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8)
      try { localStorage.setItem('imk:recentSearches', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }
  function selectMarket(id: string, searched?: string) {
    if (searched) saveRecent(searched)
    setSelectedId(id); setOpen(false); setQuery('')
  }
  /** Invio nella ricerca: seleziona il miglior risultato. */
  function submitSearch(e: { preventDefault(): void }) {
    e.preventDefault()
    if (searchResults.length > 0) selectMarket(searchResults[0].pin.id, query)
  }
  function toggleDay(d: number) {
    setDays((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]))
  }
  function toggleCat(c: ScheduleCategory) {
    setCats((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))
  }

  return (
    <div className={`flex flex-col ${heightClass}`}>
      {/* band di testa: filo di brand in cima (crosshatch alga) */}
      <div className="mz-band" aria-hidden="true" />
      {/* ===== Barra controlli: NON sticky (prima, scorrendo, copriva le prime
           righe della lista); resta z-30 così i suoi menu passano sopra la mappa ===== */}
      <div className="relative z-30 bg-crema border-b border-[#e0d7c1] flex-shrink-0">
        <div className="container mx-auto px-4 md:px-6 pt-3 pb-2 space-y-2.5">
          {/* riga 1: ricerca + posizione + lingua */}
          <div className="flex items-center gap-2.5">
            <form onSubmit={submitSearch} role="search" className="relative flex-1 min-w-0 bg-white text-ink border border-[#e0d7c1] rounded-xl shadow-[0_12px_26px_-18px_rgba(38,36,30,0.5)] focus-within:border-alga">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted z-10" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 180)}
                placeholder={typedPlaceholder}
                aria-label={dict.searchPlaceholder}
                enterKeyHint="search"
                className="relative w-full pl-11 pr-12 py-3 bg-transparent rounded-xl text-[15px] focus:outline-none"
              />
              {/* Invio esplicito: seleziona il miglior risultato */}
              <button
                type="submit"
                aria-label={dict.searchPlaceholder}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-terracotta text-crema hover:bg-terracotta-600 transition-colors z-10"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
              </button>
              {/* Ricerche recenti (a focus, prima di digitare) */}
              {open && query.trim().length < 2 && recents.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#e0d7c1] rounded-xl shadow-xl z-40 overflow-hidden"
                  data-lenis-prevent
                >
                  {recents.map((r) => (
                    <button
                      key={r}
                      onMouseDown={(e) => { e.preventDefault(); setQuery(r); setOpen(true) }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 hover:bg-crema-2/70 border-b border-ink/5 last:border-0"
                    >
                      <History className="w-4 h-4 text-ink-muted flex-shrink-0" aria-hidden="true" />
                      <span className="font-alt text-sm text-ink truncate">{r}</span>
                    </button>
                  ))}
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setRecents([])
                      try { localStorage.removeItem('imk:recentSearches') } catch { /* ignore */ }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left font-alt text-xs font-semibold text-ink-muted hover:text-ink"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" /> {RESET_LABEL[lang]}
                  </button>
                </div>
              )}
              {open && query.trim().length >= 2 && (
                <div
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#e0d7c1] rounded-xl shadow-xl z-40 max-h-[60vh] overflow-y-auto imk-scroll"
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
                          onMouseDown={(e) => { e.preventDefault(); selectMarket(r.pin.id, query) }}
                          className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 hover:bg-crema-2/70 border-b border-ink/5 last:border-0"
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
            </form>
            <button
              onClick={locateNearest}
              disabled={locating}
              aria-pressed={sort === 'near'}
              className={`imk-lift flex-shrink-0 inline-flex items-center justify-center gap-2 font-alt font-semibold text-sm border rounded-xl px-3.5 py-3 transition-colors disabled:opacity-60 ${
                sort === 'near' ? 'bg-alga text-crema border-alga' : 'border-[#e0d7c1] bg-white hover:border-alga hover:text-alga-600'
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
                  className={`text-xs font-bold uppercase px-2 py-1 rounded-md border-2 transition-colors ${lang === l ? 'bg-ink text-crema border-ink' : 'text-ink border-ink/20 hover:border-ink'}`}
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
              className={`flex-shrink-0 font-alt text-xs font-semibold px-3 py-1.5 rounded-full border-[1.5px] focus:outline-none focus:border-alga transition-colors ${
                zone !== 'all' ? 'bg-alga text-crema border-alga' : 'bg-white text-alga-600 border-alga/60'
              }`}
            >
              <option value="all">{dict.allZones}</option>
              {ZONES.filter((z) => (IMPERIA_ZONE_SLUGS as readonly string[]).includes(z.slug)).map((z) => <option key={z.slug} value={z.slug}>{z.name}</option>)}
            </select>

            {/* Tipologie: principali (generale) + tematici (antiquariato/produttori/artigianato) */}
            <FilterDropdown label={TIPO_LABEL[lang]} count={cats.length}>
              {CATEGORY_ORDER.map((c) => (
                <CheckRow key={c} checked={cats.includes(c)} onClick={() => toggleCat(c)} label={categoryLabelI18n(c, lang)} color={CATEGORY_COLOR[c]} />
              ))}
              {cats.length > 0 && (
                <button onClick={() => setCats([])} className="w-full mt-1 px-2.5 py-1.5 text-left font-alt text-xs font-semibold text-ink-muted hover:text-ink">
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

            {/* "Sono le HH:MM · N aperti adesso": è un FILTRO cliccabile */}
            {now && (
              <button
                onClick={() => setOpenNow((v) => !v)}
                aria-pressed={openNow}
                className={`inline-flex items-center gap-1.5 font-alt text-xs font-semibold px-3 py-1.5 rounded-full border-[1.5px] transition-colors ${
                  openNow ? 'bg-alga text-crema border-alga' : 'bg-white text-ink-soft border-alga/60 hover:border-alga'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${openNow ? 'bg-crema' : 'bg-terracotta'}`} aria-hidden="true" />
                {nowText} · <b className={openNow ? 'text-crema' : 'text-alga-600'}>{openCount}</b>{' '}
                {openCount > 0 ? dict.openSuffix : dict.noneOpen}
              </button>
            )}

            {(zone !== 'all' || dayCount > 0 || openNow || cats.length > 0) && (
              <button
                onClick={() => { setZone('all'); setDays([]); setToday(false); setOpenNow(false); setCats([]) }}
                className="font-alt text-xs font-semibold text-ink-muted hover:text-ink underline underline-offset-2"
              >
                {RESET_LABEL[lang]}
              </button>
            )}
          </div>

          {/* riga 3: striscia legenda — pin e stati d'orario, a colpo d'occhio */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pb-1 font-alt text-[11px] text-ink-soft">
            {CATEGORY_ORDER.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5">
                <span className={`rounded-full flex-shrink-0 ${c === 'generale' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'}`} style={{ background: CATEGORY_COLOR[c] }} aria-hidden="true" />
                {categoryLabelI18n(c, lang)}
              </span>
            ))}
            <span className="mx-0.5 w-px h-3 bg-ink/15 self-center" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-2.5 rounded-full bg-alga flex-shrink-0" aria-hidden="true" />
              {LEGEND_I18N[lang].open}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-2.5 rounded-full bg-terracotta-50 border border-terracotta/40 flex-shrink-0" aria-hidden="true" />
              {LEGEND_I18N[lang].opens}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Lista + Mappa (riempiono l'altezza rimanente, scroll interni) ===== */}
      <div className="flex-1 flex flex-col md:flex-row md:min-h-0">
        <aside
          className="order-2 md:order-1 w-full md:w-[340px] md:flex-shrink-0 bg-crema border-t md:border-t-0 md:border-r border-[#e0d7c1] h-[42svh] md:h-auto md:min-h-0 overflow-y-auto imk-scroll"
          data-lenis-prevent
        >
          <div className="sticky top-0 bg-crema/95 backdrop-blur-sm px-4 py-2.5 border-b border-[#e0d7c1] flex items-center justify-between gap-2 z-10">
            <span className="font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              <span className="font-display font-extrabold text-sm text-ink">{sortedPins.length}</span> {dict.list}
            </span>
            <button
              onClick={() => setSort('az')}
              aria-pressed={sort === 'az'}
              className={`text-xs font-semibold px-2 py-1 rounded-md ${sort === 'az' ? 'bg-alga text-crema' : 'text-ink-soft hover:bg-ink/5'}`}
            >
              {dict.sortAZ}
            </button>
          </div>

          {sortedPins.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink-muted">{dict.listEmpty}</p>
          ) : (
            <ul className="p-3 space-y-2">
              {sortedPins.map((p) => {
                const cat = meta.get(p.id)?.category ?? 'generale'
                const st = statuses.get(p.id)
                const dist = sort === 'near' && userLoc ? haversineMeters(userLoc, p) : null
                const isSel = p.id === selectedId
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => selectMarket(p.id)}
                      className={`w-full text-left flex items-start gap-3 px-3.5 py-3 bg-white rounded-xl border shadow-[0_10px_20px_-18px_rgba(38,36,30,0.45)] transition-colors ${
                        isSel ? 'border-alga bg-alga-50/60' : 'border-[#e0d7c1] hover:border-alga/60'
                      }`}
                    >
                      <span className="mt-1 w-3 h-3 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLOR[cat] }} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="font-display font-extrabold tracking-tight text-[15px] text-ink leading-tight block truncate">{p.comune}</span>
                        {p.luogo && <span className="block text-xs text-ink-muted truncate">{p.luogo}</span>}
                        <span className="mt-1 flex items-center gap-2 flex-wrap">
                          {st && st.state === 'open' && (
                            <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-alga text-crema">
                              {dict.openUntil} {fmtHour(st.hour ?? 0)}
                            </span>
                          )}
                          {st && st.state === 'opens' && (
                            <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-terracotta-50 text-terracotta-600">
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

        {/* z-0: crea uno stacking context così mappa E card mercato restano
            SOTTO la barra filtri sticky (z-30), senza clippare i suoi menu. */}
        <div className="order-1 md:order-2 relative z-0 flex-1 h-[55svh] md:h-auto min-h-[420px] overflow-hidden bg-ink">
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
              <span className="font-alt font-semibold text-sm text-crema bg-ink/55 backdrop-blur-sm px-4 py-2 rounded-full">{dict.hint}</span>
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
