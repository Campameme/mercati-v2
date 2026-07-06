'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from '@/lib/motion/gsap'
import { Search, Store, ArrowRight, CalendarDays, ChevronDown, Sun, Newspaper } from 'lucide-react'
import Logo from '@/components/Logo'
import DriftBackdrop from '@/components/motion/DriftBackdrop'
import WaterCard from '@/components/motion/WaterCard'
import BancoAvatar from '@/components/BancoAvatar'
import PhotoFx from './PhotoFx'
import { StringLights } from '@/components/decorations'
import { occursOn } from '@/lib/markets/hours'
import { categoryLabel } from '@/lib/i18n/home'
import { mountAqua } from '@/lib/home/aqua'
import BorghiSection from './BorghiSection'
import type { MarketPin } from './types'
import type { NewsItem } from '@/types/news'
import { HOME_I18N, LANGS, type Lang } from '@/lib/i18n/home'
import { HOME_COPY } from '@/lib/i18n/homeCopy'
import { useLang } from '@/lib/i18n/useLang'
import { useTypewriter } from '@/lib/useTypewriter'

export interface HomeEvent {
  id: string
  title: string
  startAt: string
  marketName: string | null
}

interface HubOperator {
  id: string
  name: string
  category: string
  market: { slug: string; name: string } | null
}

export default function MapHome({ pins, events = [] }: { pins: MarketPin[]; events?: HomeEvent[] }) {
  const router = useRouter()
  const [lang, setLang] = useLang()
  const [query, setQuery] = useState('')
  const [operators, setOperators] = useState<HubOperator[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const heroRef = useRef<HTMLDivElement>(null)
  const aquaRef = useRef<HTMLCanvasElement>(null)
  const heroPhotoRef = useRef<HTMLDivElement>(null)

  const dict = HOME_I18N[lang]
  const copy = HOME_COPY[lang]
  const typed = useTypewriter(copy.searchExamples)

  // Ticker vivo dell'hero: i comuni dove OGGI c'è davvero mercato.
  const todayComuni = useMemo(() => {
    const now = new Date()
    const set = new Set<string>()
    for (const p of pins) if (p.sessions.some((s) => occursOn(s.giorno, now))) set.add(p.comune)
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'it'))
  }, [pins])

  useEffect(() => {
    fetch('/api/operators?all=1').then((r) => r.json()).then((j) => setOperators(Array.isArray(j?.data) ? j.data : [])).catch(() => {})
    fetch('/api/news?all=1').then((r) => r.json()).then((j) => setNews(Array.isArray(j?.data) ? j.data : [])).catch(() => {})
  }, [])

  // Hero: ingresso cinetico (transform-only → sempre leggibile)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const root = heroRef.current
      if (!root) return
      gsap.from(root.querySelectorAll('[data-word]'), { yPercent: 120, rotate: 5, stagger: 0.06, duration: 0.85, ease: 'back.out(1.5)', clearProps: 'transform' })
      gsap.from(root.querySelectorAll('[data-anim]'), { y: 16, duration: 0.6, stagger: 0.08, delay: 0.2, ease: 'power3.out', clearProps: 'transform' })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  // Effetto acqua nell'hero: bollicine + increspature/alone al passaggio del
  // mouse, sopra la foto ferma. Reduced-motion safe (gestito in mountAqua).
  useEffect(() => {
    const c = aquaRef.current, host = heroRef.current
    if (!c || !host) return
    return mountAqua(c, host, { bubbles: 32 })
  }, [])

  // Parallasse leggera della foto hero al movimento del mouse (solo desktop,
  // reduced-motion safe): la scena "respira" dietro il titolo.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const host = heroRef.current, photo = heroPhotoRef.current
    if (!host || !photo) return
    const onMove = (e: MouseEvent) => {
      const r = host.getBoundingClientRect()
      const dx = (e.clientX - r.left) / r.width - 0.5
      const dy = (e.clientY - r.top) / r.height - 0.5
      gsap.to(photo, { x: dx * -14, y: dy * -10, scale: 1.04, duration: 0.9, ease: 'power2.out' })
    }
    const onLeave = () => gsap.to(photo, { x: 0, y: 0, scale: 1.02, duration: 1.1, ease: 'power2.out' })
    host.addEventListener('mousemove', onMove)
    host.addEventListener('mouseleave', onLeave)
    return () => { host.removeEventListener('mousemove', onMove); host.removeEventListener('mouseleave', onLeave) }
  }, [])

  // Reveal d'ingresso delle sezioni (solo transform → mai testo invisibile)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.home-reveal').forEach((el) => {
        gsap.from(el, { y: 30, duration: 0.7, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      })
    })
    return () => ctx.revert()
  }, [])

  const headlineWords = copy.heroHeadline.split(' ')

  function submitSearch(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/mappa?q=${encodeURIComponent(q)}` : '/mappa')
  }
  function fmtDate(iso: string) {
    try { return new Date(iso).toLocaleDateString(lang === 'it' ? 'it-IT' : lang, { day: '2-digit', month: 'short' }) } catch { return '' }
  }

  return (
    <>
      {/* ===== HERO — foto ferma + velo blu + acqua reattiva. UNA sola azione. ===== */}
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col overflow-hidden bg-notte text-carta">
        <div ref={heroPhotoRef} className="absolute -inset-4 scale-[1.02] will-change-transform">
          <PhotoFx query="Sanremo" fallbackQuery="Sanremo Liguria" alt="La Riviera di Ponente" fill priority tint="none" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-mare-700/60 via-notte/45 to-notte/90 pointer-events-none" aria-hidden="true" />
        <canvas ref={aquaRef} className="pointer-events-none absolute inset-0 h-full w-full z-[1]" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-notte/25 via-transparent to-notte/75 pointer-events-none z-[1]" aria-hidden="true" />

        <div className="relative z-10 container mx-auto px-4 md:px-6 pt-7 flex items-start justify-between gap-3">
          <div data-anim className="text-carta text-base"><Logo inline /></div>
          <div data-anim className="flex gap-1">
            {LANGS.map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md border-2 transition-colors ${lang === l ? 'bg-carta text-ink border-carta' : 'text-carta border-carta/30 hover:border-carta'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex-1 flex items-center">
          <div className="container mx-auto px-4 md:px-6 py-10">
            <h1 className="font-display text-carta text-[14vw] leading-[0.96] tracking-[0.01em] max-w-[14ch] md:text-[8rem] [text-shadow:0_2px_28px_rgba(14,48,64,0.55)]">
              {headlineWords.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden align-bottom pr-[0.14em]">
                  <span data-word className={`imk-word inline-block ${i === headlineWords.length - 1 ? 'italic text-sole' : ''}`}>{w}</span>
                </span>
              ))}
            </h1>
            <p data-anim className="mt-5 max-w-2xl text-lg md:text-xl text-carta [text-shadow:0_1px_14px_rgba(14,48,64,0.6)]">{copy.heroSubtitle}</p>
            {/* Ricerca direttamente nell'hero: una sola azione forte, sopra la piega
                (la vecchia sezione #cerca separata è stata assorbita qui). */}
            <form data-anim onSubmit={submitSearch} className="mt-8 flex flex-col sm:flex-row gap-2.5 max-w-xl">
              <div className="imk-edge relative flex-1 min-w-0 bg-white text-ink border-2 border-transparent shadow-lg focus-within:border-sole">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted z-10" aria-hidden="true" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={typed} aria-label={dict.searchPlaceholder}
                  className="w-full pl-12 pr-4 py-4 bg-transparent rounded-2xl text-[16px] focus:outline-none" />
              </div>
              <button type="submit" className="group imk-lift inline-flex items-center justify-center gap-2 font-alt font-semibold text-sm bg-sole text-ink px-6 py-4 imk-edge hover:bg-sole-600 transition-colors flex-shrink-0">
                {copy.searchCta} <ArrowRight className="imk-march w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Box "Oggi al mercato": informativo e cliccabile, in basso a destra.
            Su mobile resta in flusso sopra il bordo-onda. */}
        {todayComuni.length > 0 && (
          <Link
            data-anim
            href="/mappa?d=oggi"
            aria-label={copy.heroChips.today}
            className="group relative z-10 mx-4 mb-4 block lg:absolute lg:bottom-16 lg:right-8 lg:m-0 lg:w-[22rem] imk-edge border border-carta/25 bg-notte/65 backdrop-blur-[3px] hover:border-sole/80 transition-colors"
          >
            <span className="flex items-center justify-between gap-2 px-3.5 pt-2.5">
              <span className="inline-flex items-center gap-1.5 font-alt text-[11px] font-bold uppercase tracking-[0.12em] text-sole">
                <Sun className="w-3.5 h-3.5" aria-hidden="true" /> {copy.heroChips.today}
              </span>
              <span className="font-alt text-[11px] font-bold text-ink bg-sole rounded-full px-2 py-0.5 group-hover:bg-sole-600 transition-colors">
                {todayComuni.length} <ArrowRight className="inline w-3 h-3 -mt-px" aria-hidden="true" />
              </span>
            </span>
            <span className="imk-marquee relative block min-w-0 overflow-hidden whitespace-nowrap pb-2.5 pt-1.5" aria-hidden="true">
              <span className="imk-marquee-track inline-block font-alt text-sm text-carta/90 pl-3.5">
                {[...todayComuni, ...todayComuni].map((c, i) => (
                  <span key={i} className="mx-3">
                    {c} <span className="text-sole mx-1">·</span>
                  </span>
                ))}
              </span>
              <span className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-notte/70 to-transparent" />
              <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-notte/70 to-transparent" />
            </span>
          </Link>
        )}

        <a href="#valori" aria-label={copy.heroScrollCue} className="relative z-10 mx-auto mb-8 mt-3 flex flex-col items-center text-carta/70 hover:text-carta">
          <span className="font-alt text-[11px] font-semibold uppercase tracking-[0.14em] mb-1">{copy.heroScrollCue}</span>
          <span className="flex flex-col -space-y-1.5">
            <ChevronDown className="imk-chev w-4 h-4" /><ChevronDown className="imk-chev w-4 h-4" /><ChevronDown className="imk-chev w-4 h-4" />
          </span>
        </a>

        {/* Bordo a onda: l'hero "sfocia" nella carta della pagina */}
        <svg
          className="pointer-events-none absolute bottom-0 inset-x-0 w-full h-7 md:h-10 text-carta z-[2]"
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 28 C 90 46 180 10 288 26 C 396 42 486 8 576 24 C 666 40 756 10 864 26 C 972 42 1062 8 1152 24 C 1242 40 1350 12 1440 28 L1440 48 L0 48 Z" fill="currentColor" />
        </svg>
      </section>

      {/* ===== LE PERSONE — il manifesto del progetto: mettere in contatto
           chi cerca con chi tiene banco. Prima sezione, la più ricca. ===== */}
      <section id="valori" className="relative overflow-hidden bg-carta bg-paper-grain border-b-2 border-ink/10">
        <DriftBackdrop tone="light" variant="section" />
        {/* Lettera fantasma: il Ponente in Italiana, come filigrana di carta */}
        <span
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-8 right-[-4%] font-display italic text-[24vw] md:text-[17rem] leading-none text-mare/[0.06]"
        >
          Ponente
        </span>
        <div className="home-reveal relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-6xl">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
            <div>
              <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-2">{copy.valueProject.k}</p>
              <h2 className="font-display text-4xl md:text-6xl leading-[1.02] text-ink">
                {copy.operatorsTitle.split(' ').map((w, i, arr) => (
                  <span key={i} className={i === arr.length - 1 ? 'italic text-fiore' : ''}>{w} </span>
                ))}
              </h2>
              <p className="mt-4 text-base md:text-lg text-ink-soft leading-relaxed">{copy.operatorsLead}</p>
            </div>

            {/* Collage di vita di mercato: il calore, non i concetti */}
            <div className="relative pt-4 pb-10 pr-4 hidden sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/zone/vita-mercato-ventimiglia.jpg"
                alt="Il mercato del venerdì a Ventimiglia, con la città alta alle spalle"
                loading="lazy"
                className="imk-edge imk-tilt-r w-full aspect-[4/3] object-cover border-2 border-ink/10 shadow-md"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/zone/vita-banco-verdure.jpg"
                alt="Un banco di verdure al mercato, tra venditore e clienti"
                loading="lazy"
                className="imk-edge imk-tilt-l absolute -bottom-2 -left-3 w-1/2 aspect-[4/3] object-cover border-[3px] border-carta shadow-xl"
              />
              <figure className="imk-tape absolute -top-3 -right-1 w-[38%] rotate-2 bg-white border-2 border-ink/10 imk-edge p-1.5 pb-2 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/zone/vita-fiori-sanremo-1962.jpg"
                  alt="Il mercato dei fiori di Sanremo nel 1962"
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover"
                />
                <figcaption className="mt-1 px-1 font-accent text-sm text-ink-soft leading-tight">Sanremo, 1962</figcaption>
              </figure>
            </div>
          </div>

          {/* I valori raccolti ai banchi: tre cartoline con nastro, la voce vera */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
            {copy.qualities.slice(0, 3).map((q, i) => (
              <WaterCard key={q.t} tilt={i % 2 === 0 ? 'l' : 'r'} className="imk-tape p-5 pt-7 bg-white">
                <p className="font-accent text-xl text-mare-700 leading-snug">{q.t}</p>
                <p className="mt-2 text-[13px] leading-snug text-ink-soft">{q.d}</p>
              </WaterCard>
            ))}
          </div>
          <p className="mt-3 font-alt text-xs text-ink-muted">{copy.qualitiesNote}</p>

          {/* Gli ambulanti, in evidenza: card grandi, non chip */}
          {operators.length > 0 && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {operators.slice(0, 8).map((op, i) => (
                <Link
                  key={op.id}
                  href={op.market ? `/${op.market.slug}/operators/${op.id}` : '/operatori'}
                  aria-label={`Scopri ${op.name}`}
                  className={`imk-lift group flex items-start gap-3.5 bg-white border-2 border-ink/10 imk-edge p-4 hover:border-mare transition-colors ${
                    i % 4 === 1 ? 'imk-tilt-l' : i % 4 === 2 ? 'imk-tilt-r' : ''
                  }`}
                >
                  <BancoAvatar name={op.name} size={52} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-alt font-bold text-base text-ink leading-tight group-hover:text-mare-600 transition-colors">{op.name}</span>
                    <span className="block font-alt text-[11px] font-semibold uppercase tracking-wider text-fiore-600 mt-1">{categoryLabel(op.category, lang)}</span>
                    {op.market && <span className="block text-xs text-ink-muted mt-0.5 truncate">{op.market.name}</span>}
                  </span>
                  <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-mare-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/operatori" className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-sole text-ink px-6 py-3.5 rounded-full hover:bg-sole-600 transition-colors">
              <Store className="w-4 h-4" /> {copy.operatorsCta} <ArrowRight className="imk-march w-4 h-4" />
            </Link>
            <Link href="/aderisci" className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-ink text-carta px-6 py-3.5 rounded-full hover:bg-mare transition-colors">
              {copy.operatorsJoinCta} <ArrowRight className="imk-march w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== LE ZONE — quindici zone, quindici racconti (aria di marel) ===== */}
      <BorghiSection
        className="bg-marel/40 border-b-2 border-ink/10"
        eyebrow={dict.zones.eyebrow}
        title={copy.valueProject.title}
        lead={copy.valueProject.lead}
        cta={{ label: copy.exploreMapCta, href: '/mappa' }}
      />

      {/* ===== LA SETTIMANA — notizie ed eventi, di sera: le luci da sagra ===== */}
      <section id="settimana" className="relative overflow-hidden bg-notte text-carta border-b-2 border-notte">
        <StringLights className="absolute top-0 inset-x-0" />
        <div className="home-reveal relative z-10 container mx-auto px-4 md:px-6 pt-24 pb-16 md:pt-28 md:pb-24 max-w-5xl">
          <div className="max-w-2xl mb-9">
            <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-sole mb-2">{copy.weekEyebrow}</p>
            <h2 className="font-alt font-extrabold tracking-tight text-3xl md:text-4xl leading-[1.04] text-carta">{copy.weekTitle}</h2>
            <p className="mt-2 text-sm text-carta/70">{copy.weekLead}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {/* colonna notizie */}
            <div>
              <p className="inline-flex items-center gap-2 font-alt text-xs font-semibold uppercase tracking-[0.14em] text-marel mb-4">
                <Newspaper className="w-4 h-4" aria-hidden="true" /> {copy.newsColTitle}
              </p>
              {news.length === 0 ? (
                <WaterCard className="px-6 py-9 text-center">
                  <p className="font-accent text-2xl text-mare-600">{copy.newsEmpty}</p>
                  <p className="mt-2 text-sm text-ink-soft">{copy.newsEmptyLead}</p>
                </WaterCard>
              ) : (
                <div className="space-y-4">
                  {news.slice(0, 3).map((n, i) => (
                    <WaterCard key={n.id} tilt={i % 2 === 0 ? 'l' : 'r'} className="p-5">
                      <span className="font-alt text-xs font-semibold uppercase tracking-[0.1em] text-mare-600">
                        {fmtDate(n.publish_from)}{n.markets?.name ? ` · ${n.markets.name}` : ''}
                      </span>
                      <h3 className="font-alt font-bold text-lg text-ink leading-tight mt-1.5">{n.title}</h3>
                      {n.content && <p className="mt-1.5 text-sm text-ink-soft leading-snug line-clamp-2">{n.content}</p>}
                    </WaterCard>
                  ))}
                </div>
              )}
            </div>

            {/* colonna eventi */}
            <div>
              <p className="inline-flex items-center gap-2 font-alt text-xs font-semibold uppercase tracking-[0.14em] text-sole mb-4">
                <CalendarDays className="w-4 h-4" aria-hidden="true" /> {copy.eventsColTitle}
              </p>
              {events.length === 0 ? (
                <WaterCard className="px-6 py-9 text-center">
                  <p className="font-accent text-2xl text-mare-600">{copy.eventsEmpty}</p>
                  <p className="mt-2 text-sm text-ink-soft">{copy.eventsEmptyLead}</p>
                </WaterCard>
              ) : (
                <div className="space-y-4">
                  {events.slice(0, 3).map((e, i) => (
                    <WaterCard key={e.id} tilt={i % 2 === 0 ? 'r' : 'l'} className="imk-tape p-5 pt-6">
                      <span className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.1em] text-mare-600">
                        <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" /> {fmtDate(e.startAt)}
                      </span>
                      <h3 className="font-alt font-bold text-lg text-ink leading-tight mt-1.5">{e.title}</h3>
                      {e.marketName && <p className="mt-1 text-sm text-ink-muted">{e.marketName}</p>}
                    </WaterCard>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* pulsanti evidenti verso le sezioni dedicate */}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/notizie" className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-carta text-ink px-6 py-3.5 rounded-full hover:bg-sole transition-colors">
              <Newspaper className="w-4 h-4" /> {copy.newsAllCta} <ArrowRight className="imk-march w-4 h-4" />
            </Link>
            <Link href="/eventi" className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-ink text-carta px-6 py-3.5 rounded-full hover:bg-mare transition-colors">
              <CalendarDays className="w-4 h-4" /> {copy.eventsAllCta} <ArrowRight className="imk-march w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </>
  )
}
