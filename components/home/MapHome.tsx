'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { Search, Crosshair, Clock, Store, MapPin } from 'lucide-react'
import UnifiedMapClient from '@/components/UnifiedMapClient'
import type { UnifiedMapPin } from '@/components/UnifiedMap'
import MarketPanel from './MarketPanel'
import type { MarketPin, MarketSession } from './types'
import { HOME_I18N, LANGS, type Lang } from '@/lib/i18n/home'
import { marketStatus, weekdaysOf, occursOn, fmtHour } from '@/lib/markets/hours'

type DayFilter = 'all' | 'today' | number

const WD_LABELS: Record<Lang, string[]> = {
  it: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
  fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}
const WD_ORDER = [1, 2, 3, 4, 5, 6, 0]

interface HubOperator {
  id: string
  name: string
  category: string
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

export default function MapHome({ pins }: { pins: MarketPin[] }) {
  const [lang, setLang] = useState<Lang>('it')
  const [day, setDay] = useState<DayFilter>('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [now, setNow] = useState<Date | null>(null)
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [operators, setOperators] = useState<HubOperator[]>([])

  const heroRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const dict = HOME_I18N[lang]
  const wd = WD_LABELS[lang]

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

  // Signature GSAP: titolo cinetico (solo transform → sempre leggibile) + entrate
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.from(heroRef.current.querySelectorAll('[data-word]'), {
          yPercent: 115,
          rotate: 4,
          stagger: 0.05,
          duration: 0.7,
          ease: 'back.out(1.5)',
          clearProps: 'transform',
        })
        gsap.from(heroRef.current.querySelectorAll('[data-anim]'), {
          y: 14,
          stagger: 0.08,
          duration: 0.5,
          delay: 0.15,
          ease: 'power3.out',
          clearProps: 'transform',
        })
      }
      if (barRef.current) {
        gsap.from(barRef.current, { y: 16, duration: 0.45, delay: 0.25, ease: 'power3.out', clearProps: 'transform' })
      }
    })
    return () => ctx.revert()
  }, [])

  const statuses = useMemo(() => {
    const map = new Map<string, ReturnType<typeof marketStatus>>()
    for (const pin of pins) {
      const s = pickSession(pin, now)
      map.set(pin.id, marketStatus(now ?? new Date(0), s.giorno, s.orario))
    }
    return map
  }, [pins, now])

  const q = query.trim().toLowerCase()

  const filteredPins = useMemo(() => {
    return pins.filter((p) => {
      if (day === 'today' && now) {
        if (!p.sessions.some((s) => occursOn(s.giorno, now))) return false
      } else if (typeof day === 'number') {
        if (!pinWeekdays(p).has(day)) return false
      }
      if (q) {
        const hay = `${p.comune} ${p.luogo ?? ''} ${p.marketName} ${p.sessions.map((s) => s.settori ?? '').join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [pins, day, now, q])

  const matchedOperators = useMemo(() => {
    if (q.length < 2) return []
    return operators
      .filter((o) => `${o.name} ${o.category} ${(o.schedules ?? []).map((s) => s.comune).join(' ')}`.toLowerCase().includes(q))
      .slice(0, 5)
  }, [operators, q])

  const openCount = useMemo(() => {
    if (!now) return 0
    let n = 0
    for (const p of filteredPins) if (statuses.get(p.id)?.state === 'open') n++
    return n
  }, [filteredPins, statuses, now])

  const mapPins = useMemo<UnifiedMapPin[]>(
    () =>
      filteredPins.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        kind: 'market' as const,
        title: p.comune,
        subtitle: p.luogo ?? p.marketName,
      })),
    [filteredPins],
  )

  const selected = useMemo(() => pins.find((p) => p.id === selectedId) ?? null, [pins, selectedId])
  const selectedSession = selected ? pickSession(selected, now) : null
  const selectedStatus = selected ? statuses.get(selected.id) : undefined

  const nowText = now ? `${dict.nowLabel} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}` : ''

  function locate() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  function selectMarket(id: string) {
    setSelectedId(id)
    setOpen(false)
  }

  const dayChip = (key: DayFilter, label: string) => (
    <button
      key={String(key)}
      onClick={() => setDay(key)}
      aria-pressed={day === key}
      className={`font-alt text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-colors whitespace-nowrap ${
        day === key ? 'bg-ink text-paper border-ink' : 'bg-white text-ink border-ink/15 hover:border-ink'
      }`}
    >
      {label}
    </button>
  )

  const headlineWords = dict.introTitle.split(' ')

  return (
    <>
      {/* HERO — brand forte, motivi liguri (sole + mare), titolo cinetico */}
      <section ref={heroRef} className="relative overflow-hidden bg-night text-paper">
        {/* Sole di Riviera */}
        <svg
          aria-hidden="true"
          viewBox="0 0 120 120"
          className="absolute -top-8 -right-6 w-52 h-52 text-mimosa opacity-90 imk-sun"
        >
          <circle cx="60" cy="60" r="22" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * Math.PI) / 6
              return (
                <line
                  key={i}
                  x1={60 + Math.cos(a) * 32}
                  y1={60 + Math.sin(a) * 32}
                  x2={60 + Math.cos(a) * 44}
                  y2={60 + Math.sin(a) * 44}
                />
              )
            })}
          </g>
        </svg>

        <div className="container mx-auto px-4 md:px-6 pt-8 pb-12 relative z-10">
          <div className="flex items-start justify-between gap-3">
            <p data-anim className="font-alt text-[11px] md:text-xs uppercase tracking-[0.22em] text-mimosa">
              Provincia di Imperia · Riviera di Ponente
            </p>
            <div data-anim className="flex gap-1">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md border-2 transition-colors ${
                    lang === l ? 'bg-paper text-ink border-paper' : 'text-paper border-paper/30 hover:border-paper'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <h1 className="font-display text-4xl md:text-6xl leading-[0.95] tracking-tight mt-4 max-w-4xl">
            {headlineWords.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden align-bottom">
                <span data-word className="inline-block">
                  {w}
                  {i < headlineWords.length - 1 ? ' ' : ''}
                </span>
              </span>
            ))}
          </h1>

          <p data-anim className="font-accent text-2xl md:text-3xl text-mimosa mt-3">{dict.tagline}</p>
          <p data-anim className="text-paper/80 text-base md:text-lg mt-2 max-w-2xl leading-snug">{dict.introText}</p>

          <Link
            data-anim
            href="/operatori"
            className="mt-5 inline-flex items-center gap-2 font-alt font-semibold text-sm bg-pesto text-white px-5 py-2.5 rounded-full hover:bg-pesto-600 transition-colors"
          >
            <Store className="w-4 h-4" />
            {dict.operatorsLink}
          </Link>
        </div>

        {/* Onde animate (mare) */}
        <div className="imk-wave-divider text-riviera/70 -mb-1">
          <svg viewBox="0 0 1200 24" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M0 12 C 50 2, 100 22, 150 12 S 250 2, 300 12 S 400 22, 450 12 S 550 2, 600 12 S 700 22, 750 12 S 850 2, 900 12 S 1000 22, 1050 12 S 1150 2, 1200 12 M0 12 C 50 2, 100 22, 150 12 S 250 2, 300 12 S 400 22, 450 12 S 550 2, 600 12 S 700 22, 750 12 S 850 2, 900 12 S 1000 22, 1050 12 S 1150 2, 1200 12" />
        </svg>
        </div>
      </section>

      {/* BARRA: ricerca + filtri SOPRA la mappa */}
      <div ref={barRef} className="sticky top-0 z-30 bg-paper border-b-2 border-ink/10">
        <div className="container mx-auto px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center gap-3">
          {/* Ricerca con dropdown */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder={dict.searchPlaceholder}
              aria-label={dict.searchPlaceholder}
              className="w-full pl-11 pr-3 py-3 bg-white border-2 border-ink/15 rounded-xl text-[15px] focus:outline-none focus:border-pesto"
            />
            {open && q.length >= 2 && (filteredPins.length > 0 || matchedOperators.length > 0) && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border-2 border-ink/15 rounded-xl shadow-xl z-40 max-h-80 overflow-y-auto imk-scroll">
                {filteredPins.slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      selectMarket(p.id)
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 hover:bg-pesto/5 border-b border-ink/5"
                  >
                    <MapPin className="w-4 h-4 text-pesto flex-shrink-0" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block font-alt font-semibold text-sm text-ink truncate">{p.comune}</span>
                      {p.luogo && <span className="block text-xs text-ink-muted truncate">{p.luogo}</span>}
                    </span>
                  </button>
                ))}
                {matchedOperators.map((o) => (
                  <Link
                    key={o.id}
                    href={o.market ? `/${o.market.slug}/operators/${o.id}` : '/operatori'}
                    className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-mimosa/10 border-b border-ink/5 last:border-0"
                  >
                    <Store className="w-4 h-4 text-mimosa-600 flex-shrink-0" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block font-alt font-semibold text-sm text-ink truncate">{o.name}</span>
                      <span className="block text-xs text-ink-muted truncate">{dict.operators}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Filtri per giorno */}
          <div className="flex items-center gap-1.5 overflow-x-auto imk-scroll md:flex-wrap">
            {dayChip('all', dict.filters.all)}
            {dayChip('today', dict.filters.today)}
            {WD_ORDER.map((d) => dayChip(d, wd[d]))}
          </div>

          {/* La mia posizione */}
          <button
            onClick={locate}
            disabled={locating}
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 font-alt font-semibold text-sm border-2 border-ink/15 bg-white rounded-xl px-3.5 py-2.5 hover:border-riviera hover:text-riviera transition-colors disabled:opacity-60"
          >
            <Crosshair className="w-4 h-4" />
            <span className="hidden sm:inline">{locating ? dict.loading : dict.locate}</span>
          </button>
        </div>
      </div>

      {/* MAPPA */}
      <section className="relative w-full h-[70svh] min-h-[520px] overflow-hidden bg-night">
        <div className="absolute inset-0">
          <UnifiedMapClient
            pins={mapPins}
            height="100%"
            variant="bold"
            bare
            onPinClick={(p) => selectMarket(p.id)}
            selectedId={selectedId}
            panToSelected
            userLocation={userLoc}
            maxZoom={13}
          />
        </div>

        <div className="absolute top-3 left-3 z-[1000] inline-flex items-center gap-2 rounded-full bg-night/85 backdrop-blur-sm px-3.5 py-1.5 text-sm text-paper pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-pesto" aria-hidden="true" />
          <span className="text-paper/80">{nowText}</span>
          {now && (
            <span>
              · <b className="font-display text-mimosa">{openCount}</b> {openCount > 0 ? dict.openSuffix : dict.noneOpen}
            </span>
          )}
        </div>

        {!selected && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[900] pointer-events-none">
            <span className="font-alt font-semibold text-sm text-paper bg-night/55 backdrop-blur-sm px-4 py-2 rounded-full">
              {dict.hint}
            </span>
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
      </section>
    </>
  )
}
