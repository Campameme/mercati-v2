'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from '@/lib/motion/gsap'
import { Search, Store, ArrowRight, CalendarDays, ChevronDown, Newspaper } from 'lucide-react'
import Logo, { LogoMark } from '@/components/Logo'
import Bollino from '@/components/Bollino'
import WaterCard from '@/components/motion/WaterCard'
import BancoAvatar from '@/components/BancoAvatar'
import { type StackPhoto } from '@/components/motion/PhotoStack'
import PostItCollage, { PostItNote } from '@/components/motion/PostItCollage'
import WaveDivider from '@/components/motion/WaveDivider'
import { occursOn, isNonWeekly, isOpenNow } from '@/lib/markets/hours'
import { categoryLabel } from '@/lib/i18n/home'
import { UI_I18N } from '@/lib/i18n/ui'
import { classifySchedule, categoryLabelI18n, CATEGORY_COLOR, CATEGORY_COLOR_DARK } from '@/lib/schedules/classify'
import type { MarketPin } from './types'
import type { NewsItem } from '@/types/news'
import { IMPERIA_ZONE_SLUGS } from '@/lib/markets/zones'
import { HOME_I18N, type Lang } from '@/lib/i18n/home'
import { HOME_COPY } from '@/lib/i18n/homeCopy'
import { useLang } from '@/lib/i18n/useLang'
import { useTypewriter } from '@/lib/useTypewriter'

interface HubOperator {
  id: string
  name: string
  category: string
  market: { slug: string; name: string } | null
}


// Micro-copy locale della home (4 lingue) — il resto vive in homeCopy.ts
const HERO_EYEBROW: Record<Lang, string> = {
  it: 'La Riviera dei Fiori · provincia di Imperia',
  fr: 'La Riviera dei Fiori · province d’Imperia',
  de: 'Die Riviera dei Fiori · Provinz Imperia',
  en: 'The Riviera dei Fiori · province of Imperia',
}
const DAYS_I18N: Record<Lang, string[]> = {
  it: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
  fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
}
const DAY_PARAM = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']
const TODAY_SHORT: Record<Lang, string> = { it: 'oggi', fr: 'auj.', de: 'heute', en: 'today' }
const TIPICI_TITLE: Record<Lang, string> = { it: 'Non solo ogni settimana.', fr: 'Pas seulement chaque semaine.', de: 'Nicht nur jede Woche.', en: 'Not only every week.' }
const TIPICI_LEAD: Record<Lang, string> = {
  it: 'C’è il mercato di ogni settimana, e poi ci sono i giorni speciali: l’antiquariato sotto i portici, i produttori in piazza, l’artigianato nelle sere d’estate. Sono le ricorrenze che scandiscono l’anno della Riviera — ognuna col suo colore.',
  fr: 'Il y a le marché de chaque semaine, et puis il y a les jours spéciaux : les antiquités sous les arcades, les producteurs sur la place, l’artisanat les soirs d’été. Ce sont les rendez-vous qui rythment l’année de la Riviera — chacun avec sa couleur.',
  de: 'Es gibt den Markt jeder Woche — und dann die besonderen Tage: Antiquitäten unter den Arkaden, Erzeuger auf dem Platz, Handwerk an Sommerabenden. Diese Termine geben dem Jahr der Riviera den Takt — jeder mit seiner Farbe.',
  en: 'There’s the weekly market — and then there are the special days: antiques under the arcades, growers in the square, crafts on summer evenings. These are the dates that mark the Riviera’s year — each with its own colour.',
}
const TIPICI_CTA: Record<Lang, string> = { it: 'Tutti i mercati tipici', fr: 'Tous les marchés typiques', de: 'Alle typischen Märkte', en: 'All the special markets' }
// Il "cosa" del progetto: percorso di qualità, operatori a portata, servizi in più
const WHAT_I18N: Record<Lang, { t: string; d: string }[]> = {
  it: [
    { t: 'Un percorso di qualità', d: 'La rete dei banchi di fiducia: banco curato, prodotti di qualità, serietà. Riconosci al volo chi ci mette la faccia.' },
    { t: 'Operatori facili da trovare', d: 'Cerchi un banco, un prodotto o un giorno: la mappa ti porta al posto giusto — e il mercato più vicino te lo dice lei.' },
    { t: 'Servizi in più', d: 'La tessera punti, le offerte dei banchi e i vantaggi riservati a chi il mercato lo vive con noi.' },
  ],
  fr: [
    { t: 'Un parcours de qualité', d: 'Le réseau des étals de confiance : étal soigné, produits de qualité, sérieux. Tu reconnais tout de suite qui s’engage.' },
    { t: 'Des marchands faciles à trouver', d: 'Tu cherches un étal, un produit ou un jour : la carte t’amène au bon endroit — et t’indique le marché le plus proche.' },
    { t: 'Des services en plus', d: 'La carte de fidélité, les offres des étals et les avantages réservés à qui vit le marché avec nous.' },
  ],
  de: [
    { t: 'Ein Weg der Qualität', d: 'Das Netz der Stände des Vertrauens: gepflegter Stand, gute Produkte, Verlässlichkeit. Du erkennst sofort, wer dahintersteht.' },
    { t: 'Stände, leicht zu finden', d: 'Du suchst einen Stand, ein Produkt oder einen Tag: die Karte bringt dich hin — und zeigt dir den nächsten Markt.' },
    { t: 'Mehr als nur Einkauf', d: 'Die Punktekarte, die Angebote der Stände und Vorteile für alle, die den Markt mit uns leben.' },
  ],
  en: [
    { t: 'A path of quality', d: 'The network of trusted stalls: well-kept stalls, quality products, reliability. You can tell at a glance who stands behind it.' },
    { t: 'Stallholders easy to find', d: 'Looking for a stall, a product or a day: the map takes you to the right place — and tells you the nearest market.' },
    { t: 'Extra services', d: 'The loyalty card, stall offers and perks reserved for those who live the market with us.' },
  ],
}
const APERTI_ORA: Record<Lang, string> = { it: 'Aperti ora', fr: 'Ouverts maintenant', de: 'Jetzt geöffnet', en: 'Open now' }
// I 3 box "cosa" del progetto sono cliccabili verso sezioni diverse.
const WHAT_HREFS = ['/operatori', '/mappa', '/tessera']
// Foto per la pila trascinabile della sezione "Il progetto"
const PROJECT_PHOTOS: StackPhoto[] = [
  { src: '/zone/vita-mercato-ventimiglia-borgo.webp', alt: 'Il mercato ai piedi della città vecchia di Ventimiglia', caption: 'Ventimiglia · il venerdì' },
  { src: '/zone/vita-piazza-mercato-sanremo-1880.webp', alt: 'Sanremo, la piazza del mercato a fine Ottocento', caption: 'Sanremo · 1880' },
  { src: '/zone/vita-banco-ortofrutta-ombrelloni.webp', alt: 'Pomodori e carciofi sui banchi, sotto gli ombrelloni verdi', caption: 'La spesa di stagione' },
]
// Video dell'hero: la passeggiata tra i banchi (dal mare alla piazza), già
// ritagliato 4:5 e compresso. Poster = il suo primo fotogramma; per rimetterci
// una foto basta azzerare HERO_VIDEO.
const HERO_VIDEO: string | null = '/zone/hero-mercato.mp4'
const HERO_POSTER = '/zone/hero-mercato-poster.webp'
const HERO_PHOTO = { src: '/zone/vita-mercato-lungomare.webp', alt: 'Il mercato settimanale sul lungomare, tra i banchi e le palme' }
const RETE_I18N: Record<Lang, { pill: string; title: string; req: string[]; cta: string }> = {
  it: {
    pill: 'La rete', title: 'Hai un banco? Entra nella rete.',
    req: ['Banco pulito e curato', 'Prodotti di qualità', 'Serietà con colleghi e clienti'],
    cta: 'Chiedi di entrare',
  },
  fr: {
    pill: 'Le réseau', title: 'Tu as un étal ? Rejoins le réseau.',
    req: ['Étal propre et soigné', 'Produits de qualité', 'Sérieux avec collègues et clients'],
    cta: 'Demande d’entrer',
  },
  de: {
    pill: 'Das Netz', title: 'Hast du einen Stand? Mach mit.',
    req: ['Sauberer, gepflegter Stand', 'Qualitätsprodukte', 'Verlässlichkeit'],
    cta: 'Frag an, dabei zu sein',
  },
  en: {
    pill: 'The network', title: 'Got a stall? Join the network.',
    req: ['A clean, well-kept stall', 'Quality products', 'Reliability'],
    cta: 'Ask to join',
  },
}

export default function MapHome({ pins }: { pins: MarketPin[] }) {
  const router = useRouter()
  const [lang] = useLang()
  const [query, setQuery] = useState('')
  const [operators, setOperators] = useState<HubOperator[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const heroRef = useRef<HTMLDivElement>(null)
  const oggiRef = useRef<HTMLSpanElement>(null)

  const dict = HOME_I18N[lang]
  const ui = UI_I18N[lang]
  const copy = HOME_COPY[lang]
  const rete = RETE_I18N[lang]
  const typed = useTypewriter(copy.searchExamples)

  // I prossimi Mercati tipici (ricorrenze speciali ≠ merci varie): hanno
  // preso il posto degli eventi — sono gli appuntamenti veri del territorio.
  const prossimiTipici = useMemo(() => {
    const out: Array<{ id: string; date: Date; comune: string; giorno: string; cat: ReturnType<typeof classifySchedule>; slug: string }> = []
    const start = new Date()
    for (const p of pins) {
      for (const sSess of p.sessions) {
        const g = sSess.giorno
        const cat = classifySchedule(sSess.settori)
        if (!g || cat === 'generale' || !isNonWeekly(g)) continue
        for (let i = 0; i < 45; i++) {
          const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
          if (occursOn(g, d)) {
            out.push({ id: `${p.id}-${sSess.scheduleId}`, date: d, comune: p.comune, giorno: g, cat, slug: p.marketSlug })
            break
          }
        }
      }
    }
    out.sort((a, b) => a.date.getTime() - b.date.getTime())
    const seen = new Set<string>()
    return out.filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true))).slice(0, 3)
  }, [pins])

  // I mercati di OGGI e quelli APERTI ORA. Il contatore dell'hero deve dire il
  // vero: se ci sono banchi aperti adesso mostra quelli (time-aware), altrimenti
  // ripiega sui mercati che si tengono oggi.
  const live = useMemo(() => {
    const now = new Date()
    const today = new Set<string>()
    const openNow = new Set<string>()
    for (const p of pins) {
      for (const s of p.sessions) {
        if (!occursOn(s.giorno, now)) continue
        today.add(p.comune)
        if (isOpenNow(now, s.giorno, s.orario)) openNow.add(p.comune)
      }
    }
    const isOpen = openNow.size > 0
    return { isOpen, count: isOpen ? openNow.size : today.size }
  }, [pins])

  // Indice del giorno di oggi (0 = lunedì) per le chips dei giorni.
  const todayIdx = useMemo(() => (new Date().getDay() + 6) % 7, [])

  useEffect(() => {
    fetch('/api/operators?all=1').then((r) => r.json()).then((j) => setOperators(Array.isArray(j?.data) ? j.data : [])).catch(() => {})
    fetch('/api/news?all=1').then((r) => r.json()).then((j) => setNews(Array.isArray(j?.data) ? j.data : [])).catch(() => {})
  }, [])

  // Hero: ingresso cinetico del contenuto (transform-only → sempre leggibile).
  // Lo sfondo resta fermo: l'animazione vive sugli elementi.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const root = heroRef.current
      if (!root) return
      gsap.from(root.querySelectorAll('[data-word]'), { yPercent: 120, rotate: 4, stagger: 0.06, duration: 0.85, ease: 'back.out(1.4)', clearProps: 'transform' })
      gsap.from(root.querySelectorAll('[data-anim]'), { y: 16, duration: 0.6, stagger: 0.08, delay: 0.2, ease: 'power3.out', clearProps: 'transform' })
      gsap.from(root.querySelectorAll('[data-chip]'), { y: 14, scale: 0.9, stagger: 0.05, delay: 0.55, duration: 0.5, ease: 'back.out(1.6)', clearProps: 'transform' })
      // Il nodo del logo: la CSS lo disegna al primo paint (spesso prima che
      // l'occhio arrivi lì). Lo riavviamo qui, insieme all'ingresso dell'hero,
      // così lo si vede davvero annodarsi.
      root.querySelectorAll<SVGPathElement>('.imk-hero-knot path').forEach((p) => {
        p.style.animation = 'none'
        void p.getBoundingClientRect()
        p.style.animation = ''
      })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  // Conta-su del numero dell'hero.
  useEffect(() => {
    const el = oggiRef.current
    if (!el || !live.count) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { el.textContent = String(live.count); return }
    const obj = { v: 0 }
    const tw = gsap.to(obj, { v: live.count, duration: 1, ease: 'power2.out', onUpdate: () => { el.textContent = String(Math.round(obj.v)) } })
    return () => { tw.kill() }
  }, [live.count])

  // Reveal d'ingresso delle sezioni + parallasse leggera sulle foto.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.home-reveal').forEach((el) => {
        gsap.from(el, { y: 30, duration: 0.7, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      })
      gsap.utils.toArray<HTMLElement>('[data-plx]').forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -8 },
          { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
    })
    return () => ctx.revert()
  }, [])

  const headlineWords = copy.heroHeadline.split(' ')

  // Notizie: SOLO quelle interne dei comuni della provincia di Imperia (più le
  // globali). Niente più stampa esterna: gli articoli arrivano dalle pagine dei
  // singoli comuni.
  const imperiaNews = useMemo(
    () => news.filter((n) => !n.markets?.slug || (IMPERIA_ZONE_SLUGS as readonly string[]).includes(n.markets.slug)),
    [news],
  )

  // Il nodo dei 3 box "cosa" si annoda quando il box entra in vista (scroll).
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const nodi = Array.from(document.querySelectorAll('.imk-cosa-nodo'))
    if (!nodi.length) return
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) { e.target.classList.add('imk-drawin'); io.unobserve(e.target) } },
      { threshold: 0.5 },
    )
    nodi.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

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
      {/* ===== HERO (proposta B "L'Intreccio") — crema + tratteggio tenue,
           contenuto a sinistra, collage fotografico a destra. ===== */}
      <section ref={heroRef} className="relative min-h-[92svh] flex flex-col overflow-hidden bg-crema text-ink">
        {/* Header dell'hero: solo il logo, che si annoda al load. Nient'altro —
            la lingua e il menu completo arrivano con la barra allo scroll. */}
        <div className="relative z-10 container mx-auto px-4 md:px-6 pt-7">
          <div data-anim className="inline-block"><Logo inline className="text-ink text-[1.15rem]" markClassName="imk-hero-knot !w-10 !h-8" /></div>
        </div>

        <div className="relative z-10 flex-1 flex items-center">
          <div className="container mx-auto px-4 md:px-6 py-12 grid md:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
            <div className="max-w-2xl">
              <p data-anim className="font-alt text-xs font-bold uppercase tracking-[0.2em] text-alga mb-6">{HERO_EYEBROW[lang]}</p>
              <h1 className="font-display font-extrabold tracking-[-0.02em] text-ink text-[11vw] leading-[1.04] md:text-[4.4rem]">
                {headlineWords.map((w, i) => (
                  <span key={i} className="inline-block overflow-hidden align-bottom pr-[0.16em]">
                    <span data-word className={`imk-word inline-block ${i >= headlineWords.length - 2 ? 'text-alga' : ''}`}>{w}</span>
                  </span>
                ))}
              </h1>
              <p data-anim className="mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">{copy.heroSubtitle}</p>
              <form data-anim onSubmit={submitSearch} className="mt-8 flex flex-col sm:flex-row gap-2.5 max-w-xl">
                <div className="group relative flex-1 min-w-0 bg-white text-ink border border-[#e0d7c1] rounded-full shadow-[0_12px_26px_-18px_rgba(38,36,30,0.5)] transition-all duration-300 focus-within:border-terracotta focus-within:shadow-[0_18px_36px_-18px_rgba(196,89,60,0.5)] focus-within:-translate-y-0.5">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted z-10 transition-colors group-focus-within:text-terracotta" aria-hidden="true" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={typed} aria-label={dict.searchPlaceholder}
                    className="w-full pl-[3.25rem] pr-5 py-4 bg-transparent rounded-full text-[16px] focus:outline-none" />
                </div>
                <button type="submit" className="group imk-lift inline-flex items-center justify-center gap-2 font-alt font-semibold text-sm bg-terracotta text-crema px-7 py-4 rounded-full hover:bg-terracotta-600 transition-all duration-200 active:scale-95 flex-shrink-0">
                  {copy.searchCta} <ArrowRight className="imk-march w-4 h-4" />
                </button>
              </form>
              {/* Chips dei giorni (dal mockup): il giorno di oggi è pieno alga */}
              <div className="mt-5 flex flex-wrap gap-2" aria-label={copy.heroChips.today}>
                {DAYS_I18N[lang].map((d, i) => (
                  <Link
                    key={d}
                    data-chip
                    href={i === todayIdx ? '/mappa?d=oggi' : `/mappa?d=${DAY_PARAM[i]}`}
                    className={`font-alt text-[13px] font-semibold rounded-full px-3.5 py-1.5 border-[1.5px] transition-colors ${
                      i === todayIdx
                        ? 'bg-alga text-crema border-alga'
                        : 'text-alga-600 border-alga/60 bg-crema/70 hover:bg-alga hover:text-crema hover:border-alga'
                    }`}
                  >
                    {d}{i === todayIdx ? ` · ${TODAY_SHORT[lang]}` : ''}
                  </Link>
                ))}
              </div>
              {live.count > 0 && (
                <Link data-anim href="/mappa?d=oggi" className="group mt-5 inline-flex items-baseline gap-2 font-alt text-sm font-semibold text-terracotta-600 hover:text-terracotta">
                  <span>{live.isOpen ? APERTI_ORA[lang] : copy.heroChips.today}: <span ref={oggiRef} className="font-display font-extrabold text-xl text-ink">{live.count}</span></span>
                  <ArrowRight className="w-4 h-4 self-center group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </Link>
              )}
            </div>

            {/* Collage fotografico: i mercati, uno sopra l'altro, sparsi sul lato destro. */}
            <div data-anim className="relative hidden md:block pr-4 pt-6 pb-10">
              <div className="relative overflow-hidden rounded-2xl border border-[#e0d7c1] shadow-xl aspect-[4/5]">
                {HERO_VIDEO ? (
                  <video
                    src={HERO_VIDEO}
                    poster={HERO_POSTER}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    // Chi preferisce meno movimento resta sul poster.
                    ref={(el) => { if (el && typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.pause() }}
                    aria-label="La passeggiata tra i banchi del mercato, dal mare alla piazza"
                    className="imk-hero-video absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={HERO_PHOTO.src}
                    alt={HERO_PHOTO.alt}
                    data-plx
                    className="absolute inset-0 w-full h-full object-cover scale-110 will-change-transform"
                  />
                )}
              </div>
              <figure className="absolute -top-2 -right-2 w-[42%] rotate-2 bg-white border border-[#e0d7c1] rounded-md p-1.5 pb-2 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/zone/vita-fiori-sanremo-1962.webp" alt="Il mercato dei fiori di Sanremo nel 1962" loading="lazy" className="w-full aspect-[4/3] object-cover rounded-sm" />
                <figcaption className="mt-1 px-1 font-alt italic text-xs text-ink-soft leading-tight">Sanremo, 1962</figcaption>
              </figure>
              <figure className="absolute -bottom-5 -left-5 w-[46%] -rotate-3 bg-white border border-[#e0d7c1] rounded-md p-1.5 pb-2 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/zone/vita-mercato-sanremo-banchi.webp" alt="I banchi del mercato di Sanremo, pieni di gente sotto i tendoni" loading="lazy" className="w-full aspect-[4/3] object-cover rounded-sm" />
                <figcaption className="mt-1 px-1 font-alt italic text-xs text-ink-soft leading-tight">Sanremo, il martedì e il sabato</figcaption>
              </figure>
            </div>
          </div>
        </div>

        <a href="#perche" aria-label={copy.heroScrollCue} className="relative z-10 mx-auto mb-7 mt-2 flex flex-col items-center text-ink/50 hover:text-ink">
          <span className="font-alt text-[11px] font-semibold uppercase tracking-[0.14em] mb-1">{copy.heroScrollCue}</span>
          <span className="flex flex-col -space-y-1.5">
            <ChevronDown className="imk-chev w-4 h-4" /><ChevronDown className="imk-chev w-4 h-4" /><ChevronDown className="imk-chev w-4 h-4" />
          </span>
        </a>
        <WaveDivider className="relative z-10 text-alga/35" />
      </section>

      {/* ===== IL PROGETTO — storytelling emotivo: le informazioni si intendono,
           non si elencano. Una foto che parla + tre passaggi di racconto. ===== */}
      <section id="perche" className="relative overflow-hidden bg-crema-2">
        <div aria-hidden="true" className="mz-band absolute top-0 inset-x-0" />
        <div className="relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-6xl">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
            <div className="home-reveal">
              <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-terracotta mb-3">{copy.liguria.eyebrow}</p>
              <h2 className="font-display font-extrabold tracking-tight text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.04] text-ink">
                {copy.liguria.title.split(', ')[0]},{' '}
                <span className="text-terracotta">{copy.liguria.title.split(', ').slice(1).join(', ')}</span>
              </h2>
              <p className="mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">{copy.liguria.beats[0].d}</p>
              <div className="mt-8">
                <Link href="/mappa?vicino=1" className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-terracotta text-crema px-6 py-3.5 rounded-full hover:bg-terracotta-600 transition-colors">
                  {copy.heroChips.near} <ArrowRight className="imk-march w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="home-reveal mb-6 lg:mb-0">
              <PostItCollage photos={PROJECT_PHOTOS} />
            </div>
          </div>

          {/* Il "cosa" del progetto: percorso di qualità, operatori a portata, servizi in più */}
          <div className="home-reveal mt-14 md:mt-16 grid sm:grid-cols-3 gap-5 md:gap-6">
            {WHAT_I18N[lang].map((w, i) => (
              <Link
                key={w.t}
                href={WHAT_HREFS[i] ?? '/mappa'}
                className="imk-cosa group imk-lift flex flex-col gap-2 bg-crema rounded-2xl border border-[#e0d7c1] p-5 md:p-6 shadow-[0_16px_30px_-24px_rgba(38,36,30,0.45)] hover:border-terracotta/50 transition-colors"
              >
                <LogoMark className="w-8 h-7 text-terracotta imk-cosa-nodo" capo={false} />
                <h3 className="font-display font-extrabold tracking-tight text-lg md:text-xl leading-tight text-ink group-hover:text-terracotta transition-colors">{w.t}</h3>
                <p className="text-[15px] text-ink-soft leading-relaxed">{w.d}</p>
                <ArrowRight className="w-4 h-4 text-terracotta mt-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MERCATI TIPICI — dentro il racconto: un'altra famiglia di mercati ===== */}
      <section id="tipici" className="relative overflow-hidden bg-crema">
        <div aria-hidden="true" className="hidden xl:block absolute right-14 top-10 w-40 z-0 pointer-events-none">
          <PostItNote photo={{ src: '/zone/vita-antiquariato-banco.webp', alt: '' }} tilt={5} aspect="aspect-[4/3]" />
        </div>
        <div className="home-reveal relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-20 max-w-6xl">
          <div className="max-w-2xl mb-8">
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-terracotta mb-2">{ui.navTipici}</p>
            <h2 className="font-display font-extrabold tracking-tight text-4xl md:text-5xl leading-[1.04] text-ink">{TIPICI_TITLE[lang]}</h2>
            <p className="mt-3 text-ink-soft">{TIPICI_LEAD[lang]}</p>
          </div>
          {prossimiTipici.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {prossimiTipici.map((t) => (
                <Link key={t.id} href="/mappa" className="imk-lift group flex flex-col bg-white rounded-xl border border-[#e0d7c1] overflow-hidden">
                  <span aria-hidden="true" className="mz-band" style={{ ['--band' as string]: CATEGORY_COLOR[t.cat] }} />
                  <span className="p-5">
                    <span className="block font-display font-extrabold tracking-tight text-2xl leading-none" style={{ color: CATEGORY_COLOR_DARK[t.cat] }}>
                      {fmtDate(t.date.toISOString())}
                    </span>
                    <span className="mt-1.5 block font-display font-extrabold tracking-tight text-lg text-ink leading-tight">{t.comune}</span>
                    <span className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-alt font-bold uppercase tracking-wider text-crema" style={{ background: CATEGORY_COLOR[t.cat] }}>
                      {categoryLabelI18n(t.cat, lang)}
                    </span>
                    <span className="mt-2 block text-xs text-ink-muted leading-snug">{t.giorno}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-8">
            <Link href="/mappa" className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-terracotta text-crema px-6 py-3.5 rounded-full hover:bg-terracotta-600 transition-colors">
              <CalendarDays className="w-4 h-4" /> {TIPICI_CTA[lang]} <ArrowRight className="imk-march w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TI ASPETTANO AL BANCO — sneak peek dei banchi di fiducia ===== */}
      <section id="valori" className="relative overflow-hidden bg-crema-2">
        <div className="home-reveal relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-6xl">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
            <div>
              <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-2">{copy.operatorsEyebrow}</p>
              <h2 className="font-display font-extrabold tracking-tight text-4xl md:text-5xl leading-[1.04] text-ink">
                {copy.operatorsTitle.split(' ').map((w, i, arr) => (
                  <span key={i} className={i === arr.length - 1 ? 'text-terracotta' : ''}>{w} </span>
                ))}
              </h2>
              <p className="mt-4 text-base md:text-lg text-ink-soft leading-relaxed">{copy.operatorsLead}</p>
              <div className="mt-7">
                <Link href="/operatori" className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-alga text-crema px-6 py-3.5 rounded-full hover:bg-alga-600 transition-colors">
                  <Store className="w-4 h-4" /> {copy.operatorsCta} <ArrowRight className="imk-march w-4 h-4" />
                </Link>
              </div>
            </div>
            {/* Due foto di operatori, a lato: il banco e le mani, non i concetti */}
            <div className="relative hidden lg:block pt-4 pb-10 pr-3">
              <div className="relative overflow-hidden rounded-2xl border border-[#e0d7c1] shadow-lg aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-plx
                  src="/zone/vita-banco-verdure.webp"
                  alt="Un banco di verdure al mercato, tra venditore e clienti"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover scale-110 will-change-transform"
                />
              </div>
              <figure className="absolute -bottom-6 -left-4 w-[46%] -rotate-2 bg-white border border-[#e0d7c1] rounded-md p-1.5 pb-2 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/zone/vita-sapori.webp" alt="Sapori e prodotti sul banco del mercato" loading="lazy" className="w-full aspect-[4/3] object-cover rounded-sm" />
                <figcaption className="mt-1 px-1 font-alt italic text-xs text-ink-soft leading-tight">I sapori del banco</figcaption>
              </figure>
            </div>
          </div>

          {/* I banchi di fiducia: card bianche con la band terracotta */}
          {operators.length > 0 && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {operators.slice(0, 8).map((op) => (
                <Link
                  key={op.id}
                  href={op.market ? `/${op.market.slug}/operators/${op.id}` : '/operatori'}
                  aria-label={`Scopri ${op.name}`}
                  className="imk-lift group flex flex-col bg-white border border-[#e0d7c1] rounded-xl overflow-hidden hover:border-terracotta transition-colors"
                >
                  <span aria-hidden="true" className="mz-band" style={{ ['--band' as string]: '#C4593C' }} />
                  <span className="flex items-start gap-3.5 p-4">
                    <BancoAvatar name={op.name} size={48} className="border border-[#e0d7c1]" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display font-extrabold tracking-tight text-lg text-ink leading-tight group-hover:text-terracotta transition-colors">{op.name.replace(/\.+$/, '')}.</span>
                      <span className="mt-1 inline-block font-alt text-[11px] font-bold uppercase tracking-wide text-terracotta-600 bg-terracotta-50 rounded-full px-2 py-0.5">{categoryLabel(op.category, lang)}</span>
                      {op.market && <span className="block text-xs text-ink-muted mt-1 truncate">{op.market.name}</span>}
                    </span>
                    <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-terracotta group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ===== LA RETE — striscia compatta per chi tiene banco (il resto vive su /aderisci) ===== */}
      <section id="rete" className="relative overflow-hidden bg-alga text-crema">
        <div className="home-reveal relative z-10 container mx-auto px-4 md:px-6 py-9 md:py-11 max-w-5xl flex flex-wrap items-center gap-x-8 gap-y-5">
          <Bollino className="w-20 md:w-24 flex-shrink-0" />
          <div className="flex-1 min-w-[240px]">
            <h2 className="font-display font-extrabold tracking-tight text-xl md:text-2xl leading-tight text-crema">{rete.title}</h2>
            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-crema/90">
              {rete.req.map((r) => (
                <span key={r} className="inline-flex items-center gap-1.5 font-alt font-semibold">
                  <LogoMark className="w-5 h-4 flex-shrink-0 text-limone" capo={false} /> {r}
                </span>
              ))}
            </p>
          </div>
          <Link href="/aderisci" className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-terracotta text-crema px-6 py-3.5 rounded-full hover:bg-terracotta-600 transition-colors flex-shrink-0">
            {rete.cta} <ArrowRight className="imk-march w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ===== GLI ARTICOLI — le notizie dei comuni, al posto delle zone ===== */}
      <section id="settimana" className="relative overflow-hidden bg-ink text-crema">
        <WaveDivider className="relative z-10 mt-2 text-crema/25" />
        <div className="home-reveal relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-5xl">
          <div className="max-w-2xl mb-9">
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-limone mb-2">{copy.weekEyebrow}</p>
            <h2 className="font-display font-extrabold tracking-tight text-3xl md:text-4xl leading-[1.04] text-crema">{copy.weekTitle}</h2>
            <p className="mt-2 text-sm text-crema/70">{copy.weekLead}</p>
          </div>

          <p className="inline-flex items-center gap-2 font-alt text-xs font-bold uppercase tracking-[0.16em] text-crema/70 mb-4">
            <Newspaper className="w-4 h-4" aria-hidden="true" /> {copy.newsColTitle}
          </p>
          {imperiaNews.length === 0 ? (
            <WaterCard className="px-6 py-9 text-center max-w-xl">
              <p className="font-display font-extrabold text-xl text-alga">{copy.newsEmpty}</p>
              <p className="mt-2 text-sm text-ink-soft">{copy.newsEmptyLead}</p>
            </WaterCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {imperiaNews.slice(0, 4).map((n) => (
                <WaterCard key={n.id} className="p-5">
                  <span className="font-alt text-xs font-semibold uppercase tracking-[0.1em] text-alga">
                    {fmtDate(n.publish_from)}{n.markets?.name ? ` · ${n.markets.name}` : ''}
                  </span>
                  <h3 className="font-display font-extrabold tracking-tight text-lg text-ink leading-tight mt-1.5">{n.title}</h3>
                  {n.content && <p className="mt-1.5 text-sm text-ink-soft leading-snug line-clamp-2">{n.content}</p>}
                </WaterCard>
              ))}
            </div>
          )}

          <div className="mt-10">
            <Link href="/notizie" className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-crema text-ink px-6 py-3.5 rounded-full hover:bg-limone transition-colors">
              <Newspaper className="w-4 h-4" /> {copy.newsAllCta} <ArrowRight className="imk-march w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </>
  )
}
