'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from '@/lib/motion/gsap'
import { Search, Store, MapPin, ArrowRight, CalendarDays, ChevronDown, Sun, Crosshair, Newspaper } from 'lucide-react'
import Logo from '@/components/Logo'
import DriftBackdrop from '@/components/motion/DriftBackdrop'
import WaterCard from '@/components/motion/WaterCard'
import BancoAvatar from '@/components/BancoAvatar'
import PhotoFx from './PhotoFx'
import UnifiedMapClient from '@/components/UnifiedMapClient'
import { WaveDivider } from '@/components/decorations'
import { classifyMany } from '@/lib/schedules/classify'
import { slugifyName } from '@/lib/markets/slug'
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

  // La mappa è il fulcro: tutti i mercati come pin-banco, click → popup con
  // link alla pagina comune.
  const mapPins = useMemo(
    () =>
      pins.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        kind: 'market' as const,
        title: p.comune,
        subtitle: p.luogo ?? p.marketName,
        category: classifyMany(p.sessions.map((s) => s.settori)),
        href: `/${p.marketSlug}/c/${slugifyName(p.comune)}`,
      })),
    [pins],
  )

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
                  <span data-word className={`inline-block ${i === headlineWords.length - 1 ? 'italic text-sole' : ''}`}>{w}</span>
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
            <div data-anim className="mt-4 flex flex-wrap items-center gap-2">
              {[
                { t: copy.heroChips.today, href: '/mappa?d=oggi', Icon: Sun },
                { t: copy.heroChips.near, href: '/mappa?vicino=1', Icon: Crosshair },
                { t: copy.heroChips.saturday, href: '/mappa?d=sab', Icon: CalendarDays },
                { t: copy.exploreMapCta, href: '/mappa', Icon: MapPin },
              ].map(({ t, href, Icon }) => (
                <Link key={href} href={href} className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.08em] text-carta bg-notte/35 border border-carta/30 rounded-full px-3.5 py-2 hover:border-sole hover:text-sole transition-colors">
                  <Icon className="w-3.5 h-3.5 text-sole" aria-hidden="true" /> {t}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <a href="#mappa" aria-label={copy.heroScrollCue} className="relative z-10 mx-auto mb-5 mt-3 flex flex-col items-center text-carta/70 hover:text-carta">
          <span className="font-alt text-[11px] font-semibold uppercase tracking-[0.14em] mb-1">{copy.heroScrollCue}</span>
          <span className="flex flex-col -space-y-1.5">
            <ChevronDown className="imk-chev w-4 h-4" /><ChevronDown className="imk-chev w-4 h-4" /><ChevronDown className="imk-chev w-4 h-4" />
          </span>
        </a>
      </section>

      {/* ===== LA MAPPA — il fulcro: tutti i mercati, subito ===== */}
      <section id="mappa" className="relative overflow-hidden bg-carta bg-paper-grain border-b-2 border-ink/10">
        <DriftBackdrop tone="light" variant="section" />
        <div className="home-reveal relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-6xl">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-2">{dict.list}</p>
              <h2 className="font-alt font-extrabold tracking-tight text-3xl md:text-4xl leading-[1.06] text-ink">{dict.introTitle}</h2>
              <p className="mt-3 text-base text-ink-soft leading-relaxed">{dict.introText}</p>
            </div>
            <WaveDivider className="w-24 text-mare opacity-60 hidden md:block flex-shrink-0" aria-hidden="true" />
          </div>
          <div className="imk-edge overflow-hidden border-2 border-ink/10 bg-white shadow-sm">
            <UnifiedMapClient pins={mapPins} height={480} maxZoom={11} bare />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/mappa" className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-sole text-ink px-6 py-3.5 rounded-full hover:bg-sole-600 transition-colors">
              <MapPin className="w-4 h-4" /> {copy.exploreMapCta} <ArrowRight className="imk-march w-4 h-4" />
            </Link>
            <span className="font-alt text-xs text-ink-muted">{dict.hint}</span>
          </div>
        </div>
      </section>

      {/* ===== LE PERSONE — il cuore del progetto: chi sta dietro i banchi ===== */}
      <section id="valori" className="relative overflow-hidden bg-carta bg-paper-grain border-b-2 border-ink/10">
        <DriftBackdrop tone="light" variant="section" />
        <div className="home-reveal relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-5xl">
          <div className="max-w-2xl mb-9">
            <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-2">{copy.valueMarket.k}</p>
            <h2 className="font-alt font-extrabold tracking-tight text-3xl md:text-4xl leading-[1.06] text-ink">{copy.valueMarket.title}</h2>
            <p className="mt-3 text-base text-ink-soft leading-relaxed">{copy.valueMarket.lead}</p>
          </div>
          <div className="mt-2">
            <div className="max-w-2xl">
              <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-2">{copy.operatorsEyebrow}</p>
              <h3 className="font-alt font-bold text-2xl md:text-4xl leading-[1.04] text-ink"><span className="imk-mark">{copy.operatorsTitle}</span></h3>
              <p className="mt-3 text-base text-ink-soft leading-relaxed">{copy.operatorsLead}</p>
            </div>
            {operators.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {operators.slice(0, 10).map((op) => (
                  <Link key={op.id} href={op.market ? `/${op.market.slug}/operators/${op.id}` : '/operatori'} className="imk-lift" aria-label={`Scopri ${op.name}`}>
                    <WaterCard className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full hover:border-mare/50">
                      <BancoAvatar name={op.name} size={32} />
                      <span className="font-alt text-sm font-semibold text-ink">{op.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-mare-600 flex-shrink-0" aria-hidden="true" />
                    </WaterCard>
                  </Link>
                ))}
              </div>
            )}
            <Link href="/operatori" className="group imk-lift mt-7 inline-flex items-center gap-2 font-alt font-semibold text-sm bg-sole text-ink px-6 py-3.5 rounded-full hover:bg-sole-600 transition-colors">
              <Store className="w-4 h-4" /> {copy.operatorsCta} <ArrowRight className="imk-march w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== LE ZONE — quindici zone, quindici racconti ===== */}
      <BorghiSection
        eyebrow={copy.valueProject.k}
        title={copy.valueProject.title}
        lead={copy.valueProject.lead}
        cta={{ label: copy.exploreMapCta, href: '/mappa' }}
      />

      {/* ===== LA SETTIMANA — notizie ed eventi, fianco a fianco ===== */}
      <section id="settimana" className="relative overflow-hidden bg-carta bg-paper-grain border-b-2 border-ink/10">
        <DriftBackdrop tone="light" variant="section" />
        <div className="home-reveal relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-5xl">
          <div className="max-w-2xl mb-9">
            <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-2">{copy.weekEyebrow}</p>
            <h2 className="font-alt font-extrabold tracking-tight text-3xl md:text-4xl leading-[1.04] text-ink">{copy.weekTitle}</h2>
            <p className="mt-2 text-sm text-ink-soft">{copy.weekLead}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {/* colonna notizie */}
            <div>
              <p className="inline-flex items-center gap-2 font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-4">
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
              <p className="inline-flex items-center gap-2 font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-4">
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
            <Link href="/notizie" className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-ink text-carta px-6 py-3.5 rounded-full hover:bg-mare transition-colors">
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
