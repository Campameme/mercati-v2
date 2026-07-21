'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from '@/lib/motion/gsap'
import { Search, ArrowRight, CalendarDays, ChevronDown, Newspaper, MessageCircle, LocateFixed } from 'lucide-react'
import Bollino from '@/components/Bollino'
import WaterCard from '@/components/motion/WaterCard'
import BancoAvatar from '@/components/BancoAvatar'
import WaveDivider from '@/components/motion/WaveDivider'
import VideoWaveFrame from '@/components/motion/VideoWaveFrame'
import Scribble from '@/components/motion/Scribble'
import PostItCollage, { PostItNote } from '@/components/motion/PostItCollage'
import { occursOn, isNonWeekly } from '@/lib/markets/hours'
import { categoryLabel } from '@/lib/i18n/home'
import { UI_I18N } from '@/lib/i18n/ui'
import { classifySchedule } from '@/lib/schedules/classify'
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
  description?: string
  socialLinks?: { whatsapp?: string; instagram?: string; facebook?: string; website?: string }
  market: { slug: string; name: string } | null
  schedules?: Array<{ comune: string; giorno: string }>
}

function waHref(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://wa.me/${value.replace(/[^0-9]/g, '')}`
}

// "val-nervia" → "Val Nervia" (la "e" resta minuscola: "Taggia e Costa").
function zoneName(slug: string): string {
  return slug.split('-').map((w) => (w === 'e' ? 'e' : w.charAt(0).toUpperCase() + w.slice(1))).join(' ')
}

// Le tre polaroid del collage "A due passi da casa" (layout pre-V2 ripreso
// su richiesta 2026-07-19): la piazza di ieri e la spesa di oggi.
const PROJECT_PHOTOS = [
  { src: '/zone/vita-mercato-ventimiglia-borgo.webp', alt: 'Il mercato ai piedi della città vecchia di Ventimiglia', caption: 'Ventimiglia · il venerdì' },
  { src: '/zone/vita-piazza-mercato-sanremo-1880.webp', alt: 'Sanremo, la piazza del mercato a fine Ottocento', caption: 'Sanremo · 1880' },
  { src: '/zone/vita-banco-ortofrutta-ombrelloni.webp', alt: 'Pomodori e carciofi sui banchi, sotto gli ombrelloni verdi', caption: 'La spesa di stagione' },
]


const TIPICI_CTA: Record<Lang, string> = { it: 'Tutti i mercati tipici', fr: 'Tous les marchés typiques', de: 'Alle typischen Märkte', en: 'All the special markets' }

// FOTO TEMPORANEE per le card dei banchi (finché gli operatori non caricano le
// proprie): scene di mercato vere, assegnate in modo stabile per indice.
const TEMP_OP_PHOTOS = [
  '/zone/vita-banco-verdure.webp',
  '/zone/vita-sapori.webp',
  '/zone/vita-banco-ortofrutta-ombrelloni.webp',
  '/zone/vita-artigianato-borse.webp',
  '/zone/vita-banchi-piazza.webp',
  '/zone/vita-mercato-sanremo-banchi.webp',
  '/zone/vita-antiquariato-banco.webp',
  '/zone/vita-mercato-lungomare.webp',
]
// Video dell'hero: la passeggiata tra i banchi (dal mare alla piazza), già
// ritagliato 4:5 e compresso. Poster = il suo primo fotogramma; per rimetterci
// una foto basta azzerare HERO_VIDEO.
const HERO_VIDEO: string | null = '/zone/hero-mercato.mp4'
const HERO_POSTER = '/zone/hero-mercato-poster.webp'
const HERO_PHOTO = { src: '/zone/vita-mercato-lungomare.webp', alt: 'Il mercato settimanale sul lungomare, tra i banchi e le palme' }

// ===== Copy V2 "Mercato Centrale" (adottato su richiesta 2026-07-18) =====
// Voce ligure con i footnote che traducono per chi arriva da fuori.
// Titolo hero 2026-07-20: l'esperienza del mercato come QUALITÀ ("il meglio
// della Riviera"), evidenziato in alga su "al mercato", e la via d'azione
// doppia: cerca + "più vicini a me".
const HERO2: Record<Lang, { eyebrow: string; tPre: string; tEm: string; tMid: string; tMark: string; sub: string; ctaFind: string; ctaNear: string; ctaBanchi: string; zone: string; comuni: string; quasi: string }> = {
  it: { eyebrow: 'Riviera dei Fiori · da Ventimiglia a Diano', tPre: 'Il meglio', tEm: 'della Riviera', tMid: 'lo trovi', tMark: 'al mercato.', sub: 'Banchi curati, prodotti di stagione, facce che conosci. Cerca il mercato più vicino a te e vacci: il resto si scopre in piazza.', ctaFind: 'Trova il mercato', ctaNear: 'Più vicini a me', ctaBanchi: 'Conosci i banchi', zone: 'zone', comuni: 'comuni con mercato', quasi: 'quasi ogni giorno' },
  fr: { eyebrow: 'Riviera dei Fiori · de Vintimille à Diano', tPre: 'Le meilleur', tEm: 'de la Riviera', tMid: 'se trouve', tMark: 'au marché.', sub: 'Des étals soignés, des produits de saison, des visages connus. Cherche le marché le plus proche et vas-y : le reste se découvre sur la place.', ctaFind: 'Trouver le marché', ctaNear: 'Les plus proches', ctaBanchi: 'Découvrir les étals', zone: 'zones', comuni: 'communes avec marché', quasi: 'presque chaque jour' },
  de: { eyebrow: 'Riviera dei Fiori · von Ventimiglia bis Diano', tPre: 'Das Beste', tEm: 'der Riviera', tMid: 'findest du', tMark: 'auf dem Markt.', sub: 'Gepflegte Stände, Saisonware, bekannte Gesichter. Such den Markt in deiner Nähe und geh hin: der Rest zeigt sich auf dem Platz.', ctaFind: 'Markt finden', ctaNear: 'In meiner Nähe', ctaBanchi: 'Die Stände kennenlernen', zone: 'Zonen', comuni: 'Orte mit Markt', quasi: 'fast jeden Tag' },
  en: { eyebrow: 'Riviera dei Fiori · from Ventimiglia to Diano', tPre: 'The best', tEm: 'of the Riviera', tMid: 'is found', tMark: 'at the market.', sub: 'Well-kept stalls, seasonal produce, familiar faces. Find the market nearest you and go: the rest you discover in the square.', ctaFind: 'Find the market', ctaNear: 'Nearest to me', ctaBanchi: 'Meet the stalls', zone: 'zones', comuni: 'towns with a market', quasi: 'almost every day' },
}
// Il copy di "A due passi da casa" [0] e "Le otto zone" [1]: dal 2026-07-19
// non più due card affiancate ma due SEZIONI piene, in quest'ordine.
const PBLOCKS: Record<Lang, Array<{ eyebrow: string; title: string; body: string; cta: string; href: string }>> = {
  it: [
    { eyebrow: 'Il mercato in piazza', title: 'A due passi da casa, dal banco di chi la porta.', body: 'La spesa di stagione vicino a te, dalle mani di chi la coltiva e la sceglie. Il mercato più vicino te lo mostra la mappa — niente più elenchi di date da decifrare.', cta: 'Apri la mappa', href: '/mappa' },
    { eyebrow: 'Le zone', title: 'Otto zone, da Ventimiglia a Diano.', body: 'Il venerdì di Ventimiglia, istituzione per chi scende dalla Costa Azzurra. Il golfo Dianese coi mercati quasi ogni giorno. Ogni zona, il suo carattere.', cta: 'Scopri le zone', href: '/zone' },
  ],
  fr: [
    { eyebrow: 'Le marché sur la place', title: 'À deux pas de chez toi, de la main qui le cultive.', body: 'Les courses de saison près de toi, choisies par ceux qui les produisent. Le marché le plus proche, la carte te le montre — fini les listes de dates à déchiffrer.', cta: 'Ouvrir la carte', href: '/mappa' },
    { eyebrow: 'Les zones', title: 'Huit zones, de Vintimille à Diano.', body: 'Le vendredi de Vintimille, institution pour qui descend de la Côte d’Azur. Le golfe de Diano, marchés presque chaque jour. Chaque zone, son caractère.', cta: 'Découvrir les zones', href: '/zone' },
  ],
  de: [
    { eyebrow: 'Der Markt auf dem Platz', title: 'Ein paar Schritte von zu Hause, vom Stand dessen, der es anbaut.', body: 'Saisonaler Einkauf in deiner Nähe, aus den Händen derer, die ihn wählen. Den nächsten Markt zeigt dir die Karte — keine Datumslisten mehr.', cta: 'Karte öffnen', href: '/mappa' },
    { eyebrow: 'Die Zonen', title: 'Acht Zonen, von Ventimiglia bis Diano.', body: 'Der Freitag in Ventimiglia, Institution für Gäste von der Côte d’Azur. Der Golf von Diano mit Märkten fast täglich. Jede Zone, ihr Charakter.', cta: 'Zonen entdecken', href: '/zone' },
  ],
  en: [
    { eyebrow: 'The market in the square', title: 'A short walk from home, from the hands that grow it.', body: 'Seasonal shopping near you, chosen by the people who produce it. The nearest market? The map shows you — no more lists of dates to decode.', cta: 'Open the map', href: '/mappa' },
    { eyebrow: 'The zones', title: 'Eight zones, from Ventimiglia to Diano.', body: 'Ventimiglia’s Friday, an institution for visitors from the Côte d’Azur. The Gulf of Diano with markets almost every day. Each zone, its own character.', cta: 'Discover the zones', href: '/zone' },
  ],
}
// "Belin, c'è il mercato" — i giorni speciali come mercati d'autore, di nicchia
const TIPICI2: Record<Lang, { eyebrow: string; title: string; star: string; lead: string; foot: string; tiles: Array<{ b: string; s: string }> }> = {
  it: { eyebrow: 'I giorni speciali', title: 'Belin, c’è il mercato.', star: '*', lead: 'Mercati d’autore, piccoli e di nicchia, che capitano ogni tanto e sanno soddisfare ogni ricerca. L’antiquariato sotto i portici, il produttore in piazza, il pezzo che non ti aspetti.', foot: '*«Belin» — esclamazione ligure. Per chi arriva da fuori: «guarda un po’, c’è il mercato».', tiles: [ { b: 'Antiquariato', s: 'Sotto i portici · una domenica al mese' }, { b: 'Il produttore in piazza', s: 'Agricolo · di stagione' }, { b: 'Artigianato & creativo', s: 'Fatto a mano · d’estate' }, { b: 'Vintage & collezionismo', s: 'Pezzi unici · periodico' } ] },
  fr: { eyebrow: 'Les jours spéciaux', title: 'Tiens, c’est le marché.', star: '*', lead: 'Des marchés d’auteur, petits et de niche, qui reviennent de temps en temps et savent combler toutes les envies. Les antiquités sous les arcades, le producteur sur la place, la pièce inattendue.', foot: '*«Belin» — exclamation ligure : «tiens, c’est le marché».', tiles: [ { b: 'Antiquités', s: 'Sous les arcades · un dimanche par mois' }, { b: 'Le producteur sur la place', s: 'Agricole · de saison' }, { b: 'Artisanat & création', s: 'Fait main · l’été' }, { b: 'Vintage & collection', s: 'Pièces uniques · périodique' } ] },
  de: { eyebrow: 'Die besonderen Tage', title: 'Sieh an, der Markt ist da.', star: '*', lead: 'Autorenmärkte, klein und speziell, die ab und zu kommen und jeden Wunsch erfüllen. Antiquitäten unter den Arkaden, der Erzeuger auf dem Platz, das unerwartete Stück.', foot: '*«Belin» — ligurischer Ausruf: «sieh an, der Markt ist da».', tiles: [ { b: 'Antiquitäten', s: 'Unter den Arkaden · ein Sonntag im Monat' }, { b: 'Der Erzeuger auf dem Platz', s: 'Landwirtschaft · saisonal' }, { b: 'Handwerk & Kreatives', s: 'Handgemacht · im Sommer' }, { b: 'Vintage & Sammeln', s: 'Einzelstücke · periodisch' } ] },
  en: { eyebrow: 'The special days', title: 'Well, look — a market.', star: '*', lead: 'Signature markets, small and niche, that come around now and then and meet every quest. Antiques under the arcades, the grower in the square, the piece you didn’t expect.', foot: '*«Belin» — a Ligurian exclamation: «well, look, there’s the market».', tiles: [ { b: 'Antiques', s: 'Under the arcades · one Sunday a month' }, { b: 'The grower in the square', s: 'Farm · seasonal' }, { b: 'Crafts & creative', s: 'Handmade · in summer' }, { b: 'Vintage & collecting', s: 'One-of-a-kind · periodic' } ] },
}
// La sezione banchi (box bianco besugo + card in riga)
const BANCHI2: Record<Lang, { eyebrow: string; title: string; sub: string; q1: string; em: string; q2: string; u: string; q3: string; foot: string; cta: string; all: string; wa: string; go: string }> = {
  it: { eyebrow: 'Le persone del mercato', title: 'Ti aspettano al banco.', sub: 'Il mercato non è un posto: è chi ci sta dietro. Un nome, una faccia, una parola che vale.', q1: '«Dove l’hai preso? ', em: 'Online?', q2: ' Ma se sei un ', u: 'besugo', q3: ', ce l’hanno al mercato.»', foot: '*besugo — in genovese è un pesce. E, con affetto, anche uno un po’ ingenuo.', cta: 'Conosci i banchi', all: 'Vedi tutti i banchi di fiducia', wa: 'WhatsApp', go: 'Vai al mercato' },
  fr: { eyebrow: 'Les gens du marché', title: 'Ils t’attendent à l’étal.', sub: 'Le marché n’est pas un lieu : c’est qui se tient derrière. Un nom, un visage, une parole qui compte.', q1: '«Tu l’as pris où ? ', em: 'En ligne ?', q2: ' Mais si tu es un ', u: 'besugo', q3: ', ils l’ont au marché.»', foot: '*besugo — en génois, un poisson. Et, avec tendresse, quelqu’un d’un peu naïf.', cta: 'Découvrir les étals', all: 'Voir tous les étals de confiance', wa: 'WhatsApp', go: 'Aller au marché' },
  de: { eyebrow: 'Die Menschen des Marktes', title: 'Sie erwarten dich am Stand.', sub: 'Der Markt ist kein Ort: er ist, wer dahintersteht. Ein Name, ein Gesicht, ein Wort, das gilt.', q1: '«Wo hast du das her? ', em: 'Online?', q2: ' Aber wenn du ein ', u: 'besugo', q3: ' bist — das gibt’s am Markt.»', foot: '*besugo — auf Genuesisch ein Fisch. Und, liebevoll, jemand etwas Naiver.', cta: 'Die Stände kennenlernen', all: 'Alle Stände des Vertrauens ansehen', wa: 'WhatsApp', go: 'Zum Markt' },
  en: { eyebrow: 'The people of the market', title: 'They’re waiting at the stall.', sub: 'The market isn’t a place: it’s who stands behind it. A name, a face, a word you can count on.', q1: '«Where’d you get it? ', em: 'Online?', q2: ' But if you’re a ', u: 'besugo', q3: ', they have it at the market.»', foot: '*besugo — in Genoese, a fish. And, fondly, someone a bit naïve.', cta: 'Meet the stalls', all: 'See all the trusted stalls', wa: 'WhatsApp', go: 'Go to the market' },
}
// La rete (V2): bollino, requisiti pill, "i primi banchi entrano gratis"
const RETE2: Record<Lang, { eyebrow: string; title: string; lead: string; req: string[]; cta: string; bollino: string }> = {
  it: { eyebrow: 'La rete dei banchi', title: 'Hai un banco? Entra nella rete.', lead: 'Non è un abbonamento: è un gruppo che si sceglie. Ti trovano prima ancora di arrivare al mercato. I primi banchi entrano gratis, per sempre.', req: ['Banco pulito e curato', 'Prodotti di qualità', 'Serietà'], cta: 'Chiedi di entrare', bollino: 'RETE DEI BANCHI · RIVIERA DEI FIORI' },
  fr: { eyebrow: 'Le réseau des étals', title: 'Tu as un étal ? Rejoins le réseau.', lead: 'Ce n’est pas un abonnement : c’est un groupe qui se choisit. On te trouve avant même d’arriver au marché. Les premiers étals entrent gratuitement, pour toujours.', req: ['Étal propre et soigné', 'Produits de qualité', 'Sérieux'], cta: 'Demande d’entrer', bollino: 'RÉSEAU DES ÉTALS · RIVIERA DEI FIORI' },
  de: { eyebrow: 'Das Netz der Stände', title: 'Hast du einen Stand? Mach mit.', lead: 'Kein Abo: eine Gemeinschaft, die man wählt. Man findet dich, noch bevor du am Markt bist. Die ersten Stände sind für immer kostenlos dabei.', req: ['Sauberer, gepflegter Stand', 'Qualitätsprodukte', 'Verlässlichkeit'], cta: 'Frag an, dabei zu sein', bollino: 'NETZ DER STÄNDE · RIVIERA DEI FIORI' },
  en: { eyebrow: 'The network of stalls', title: 'Got a stall? Join the network.', lead: 'Not a subscription: a group you choose. People find you before they even reach the market. The first stalls join free, forever.', req: ['A clean, well-kept stall', 'Quality products', 'Reliability'], cta: 'Ask to join', bollino: 'NETWORK OF STALLS · RIVIERA DEI FIORI' },
}

export default function MapHome({ pins }: { pins: MarketPin[] }) {
  const router = useRouter()
  const [lang] = useLang()
  const [query, setQuery] = useState('')
  const [operators, setOperators] = useState<HubOperator[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const heroRef = useRef<HTMLDivElement>(null)

  const dict = HOME_I18N[lang]
  const ui = UI_I18N[lang]
  const copy = HOME_COPY[lang]
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


  // Indice del giorno di oggi (0 = lunedì) per le chips dei giorni.

  // Numeri VERI per la pillbar dell'hero: zone (marketSlug distinti) e comuni.
  const heroStats = useMemo(() => {
    const zone = new Set<string>()
    const comuni = new Set<string>()
    for (const p of pins) {
      if (p.marketSlug) zone.add(p.marketSlug)
      if (p.comune) comuni.add(p.comune)
    }
    return { zone: zone.size || 8, comuni: comuni.size }
  }, [pins])

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
        {/* Il logo qui non serve più: la barra di navigazione è sempre visibile
            al load (con logo, menu e Accedi), un secondo lockup sarebbe doppio. */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="container mx-auto px-4 md:px-6 py-12 w-full">
            <div className="max-w-2xl md:max-w-[50vw]">
              <p data-anim className="font-alt text-xs font-bold uppercase tracking-[0.2em] text-terracotta mb-6">{HERO2[lang].eyebrow}</p>
              {/* Titolo: "della Riviera" in corsivo terracotta, "al mercato." evidenziato ALGA */}
              <h1 className="font-display font-extrabold tracking-[-0.03em] text-ink text-[12vw] leading-[1.02] md:text-[4.6rem]">
                <span className="inline-block overflow-hidden align-bottom pr-[0.14em]"><span data-word className="imk-word inline-block">{HERO2[lang].tPre}</span></span>{' '}
                <span className="inline-block overflow-hidden align-bottom pr-[0.14em]"><span data-word className="imk-word inline-block italic text-terracotta">{HERO2[lang].tEm}</span></span>
                <br />
                <span className="inline-block overflow-hidden align-bottom pr-[0.14em]"><span data-word className="imk-word inline-block">{HERO2[lang].tMid}</span></span>{' '}
                <span className="inline-block overflow-hidden align-bottom pr-[0.14em]"><span data-word className="imk-word inline-block imk-mark">{HERO2[lang].tMark}</span></span>
              </h1>
              <p data-anim className="mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">{HERO2[lang].sub}</p>
              {/* La ricerca (mantenuta): semantica ampia, CTA "Trova il mercato" */}
              <form data-anim onSubmit={submitSearch} className="mt-8 flex flex-col sm:flex-row gap-2.5 max-w-xl">
                <div className="group relative flex-1 min-w-0 bg-white text-ink border border-[#e0d7c1] rounded-full shadow-[0_12px_26px_-18px_rgba(38,36,30,0.5)] transition-all duration-300 focus-within:border-terracotta focus-within:shadow-[0_18px_36px_-18px_rgba(196,89,60,0.5)] focus-within:-translate-y-0.5">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted z-10 transition-colors group-focus-within:text-terracotta" aria-hidden="true" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={typed} aria-label={dict.searchPlaceholder}
                    className="w-full pl-[3.25rem] pr-5 py-4 bg-transparent rounded-full text-[16px] focus:outline-none" />
                </div>
                <button type="submit" className="group imk-lift inline-flex items-center justify-center gap-2 font-alt font-semibold text-sm bg-terracotta text-crema px-7 py-4 rounded-full hover:bg-terracotta-600 transition-all duration-200 active:scale-95 flex-shrink-0">
                  {HERO2[lang].ctaFind} <ArrowRight className="imk-march w-4 h-4" />
                </button>
              </form>
              {/* La seconda via: i mercati più vicini a me (geolocalizzata su /mappa) */}
              <div data-anim className="mt-3">
                <Link href="/mappa?vicino=1" className="inline-flex items-center gap-2 font-alt font-semibold text-sm text-alga border-[1.5px] border-alga/50 bg-crema/60 px-5 py-2.5 rounded-full hover:bg-alga hover:text-crema hover:border-alga transition-colors">
                  <LocateFixed className="w-4 h-4" aria-hidden="true" /> {HERO2[lang].ctaNear}
                </Link>
              </div>
              {/* Pillbar (al posto della selezione giorni + aperti ora): numeri reali */}
              <div data-anim className="mt-8 flex flex-wrap gap-x-9 gap-y-3 py-4 border-t border-b border-[#e0d7c1] max-w-xl">
                <div className="font-alt text-sm text-ink-soft"><b className="font-display font-extrabold text-2xl text-terracotta mr-2">{heroStats.zone}</b>{HERO2[lang].zone}</div>
                {heroStats.comuni > 0 && (
                  <div className="font-alt text-sm text-ink-soft"><b className="font-display font-extrabold text-2xl text-terracotta mr-2">{heroStats.comuni}</b>{HERO2[lang].comuni}</div>
                )}
                <div className="relative font-alt text-sm text-ink-soft">
                  {/* Cerchio a mano attorno al 7/7: si disegna al load, insieme all'hero */}
                  <Scribble variant="loop" color="text-alga" className="absolute -left-3 -top-2 w-[4.2rem] h-10" />
                  <b className="font-display font-extrabold text-2xl text-terracotta mr-2">7/7</b>{HERO2[lang].quasi}
                </div>
              </div>
              {/* Su mobile il video non c'è: polaroid + bollino sotto i numeri, per dare vita */}
              <div aria-hidden="true" className="md:hidden mt-7 flex items-end gap-4 pointer-events-none">
                <div className="w-48"><PostItNote photo={{ src: '/zone/vita-banchi-piazza.webp', alt: '', caption: 'I banchi in piazza, la mattina' }} tilt={3} aspect="aspect-[4/3]" /></div>
                <Bollino className="w-20 flex-shrink-0 -rotate-6 mb-2" />
              </div>
            </div>

          </div>
        </div>

        {/* Video dell'hero: SENZA box, appoggiato al margine destro della pagina
            (ne "esce"), la crema lo lambisce con onde fluide su alto, basso e
            fianco sinistro (VideoWaveFrame). Su mobile non c'è: polaroid inline. */}
        {/* Fermo, senza ingresso animato: deve stare a filo con l'header (niente
            transform residui da data-anim) */}
        <div className="hidden md:block absolute inset-y-0 right-0 w-[45vw] lg:w-[42vw] z-0">
          <VideoWaveFrame>
            {HERO_VIDEO ? (
              <video
                src={HERO_VIDEO}
                poster={HERO_POSTER}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                ref={(el) => { if (el && typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.pause() }}
                aria-label="La passeggiata tra i banchi del mercato, dal mare alla piazza"
                className="imk-hero-video absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={HERO_PHOTO.src} alt={HERO_PHOTO.alt} className="absolute inset-0 w-full h-full object-cover" />
            )}
          </VideoWaveFrame>
          {/* Polaroid appoggiata sul fianco del video: primo bigliettino della bacheca */}
          <div aria-hidden="true" className="absolute bottom-16 -left-10 w-48 lg:w-60 z-20 pointer-events-none">
            <PostItNote photo={{ src: '/zone/vita-mercato-lungomare.webp', alt: '', caption: 'Il mercato sul lungomare' }} tilt={-5} aspect="aspect-[4/3]" />
          </div>
          {/* Il bollino della rete, come un sigillo sull'angolo alto del video */}
          <div className="absolute top-8 -left-12 z-20 w-24 lg:w-28 rotate-6">
            <Bollino className="w-full drop-shadow-[0_16px_28px_rgba(38,36,30,0.35)]" />
          </div>
        </div>

        <a href="#tipici" aria-label={copy.heroScrollCue} className="relative z-10 mx-auto mb-7 mt-2 flex flex-col items-center text-ink/50 hover:text-ink">
          <span className="font-alt text-[11px] font-semibold uppercase tracking-[0.14em] mb-1">{copy.heroScrollCue}</span>
          <span className="flex flex-col -space-y-1.5">
            <ChevronDown className="imk-chev w-4 h-4" /><ChevronDown className="imk-chev w-4 h-4" /><ChevronDown className="imk-chev w-4 h-4" />
          </span>
        </a>
        {/* onda piena di chiusura: la sezione dopo (limone, "Belin") sale nell'hero */}
        <WaveDivider fill className="relative z-20 text-limone" />
      </section>

      {/* ===== BELIN, C'È IL MERCATO — i giorni speciali come mercati d'autore,
           piccoli e di nicchia. SUBITO sotto l'hero (ordine 2026-07-19).
           Niente overflow-hidden: polaroid e ghirigori non si tagliano. ===== */}
      <section id="tipici" className="relative bg-limone">
        {/* La bacheca: polaroid media appoggiata in alto a destra (con didascalia
            vera) + spirale grande, tratto pieno — devono vedersi */}
        <div aria-hidden="true" className="hidden md:block absolute top-8 right-[3%] w-52 lg:w-64 z-0 pointer-events-none">
          <PostItNote photo={{ src: '/zone/vita-antiquariato-banco.webp', alt: '', caption: 'L’antiquariato sotto i portici' }} tilt={6} aspect="aspect-[4/3]" />
        </div>
        {/* Postcard anche sul LATO sinistro, che spunta tra hero e band limone */}
        <div aria-hidden="true" className="hidden lg:block absolute -top-14 left-[2%] w-52 z-20 pointer-events-none">
          <PostItNote photo={{ src: '/zone/vita-antiquariato-piazza.webp', alt: '', caption: 'La piazza dell’antiquariato' }} tilt={-4} aspect="aspect-[4/3]" />
        </div>
        <div className="home-reveal relative z-10 container mx-auto px-4 md:px-6 py-14 md:py-20 max-w-6xl">
          <div className="max-w-2xl mb-9">
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-terracotta-600 mb-2">{TIPICI2[lang].eyebrow}</p>
            <h2 className="relative font-display font-extrabold tracking-tight text-4xl md:text-5xl leading-[1.04] text-ink">
              {/* Cerchio a mano attorno a TUTTA la prima parola (stretch: si
                  allarga quanto la parola, in ogni lingua) */}
              <span className="relative inline-block">
                <Scribble variant="loop" color="text-terracotta" stretch className="hidden md:block absolute -left-[0.35em] -top-[0.18em] w-[calc(100%+0.7em)] h-[calc(100%+0.36em)]" />
                {TIPICI2[lang].title.split(' ')[0]}
              </span>{' '}
              {TIPICI2[lang].title.split(' ').slice(1).join(' ')}<span className="text-terracotta">{TIPICI2[lang].star}</span>
            </h2>
            <p className="mt-3 text-ink/80 leading-relaxed">{TIPICI2[lang].lead}</p>
            <p className="mt-2 text-[13px] italic text-limone-t">{TIPICI2[lang].foot}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TIPICI2[lang].tiles.map((t, i) => {
              const look = [
                { photo: '/zone/vita-antiquariato-piazza.webp', grad: 'from-transparent to-terracotta-600/90' },
                { photo: '/zone/vita-banco-verdure.webp', grad: 'from-transparent to-alga-600/90' },
                { photo: '/zone/vita-artigianato-borse.webp', grad: 'from-transparent to-[#7A611A]/90' },
                { photo: '/zone/vita-antiquariato-cornici.webp', grad: 'from-transparent to-ink/90' },
              ][i]
              return (
                <Link key={t.b} href="/mappa" className="imk-lift group relative flex items-end rounded-2xl overflow-hidden aspect-[3/4] text-crema">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={look.photo} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover saturate-[1.1] transition-transform duration-500 group-hover:scale-105" />
                  <span aria-hidden="true" className={`absolute inset-0 bg-gradient-to-b ${look.grad}`} />
                  <span className="relative p-4">
                    <b className="block font-display font-extrabold tracking-tight text-lg leading-tight">{t.b}</b>
                    <span className="block text-[12.5px] text-crema/90 mt-0.5">{t.s}</span>
                  </span>
                </Link>
              )
            })}
          </div>
          {prossimiTipici.length > 0 && (
            <p className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-ink/75">
              <CalendarDays className="w-4 h-4 text-terracotta-600" aria-hidden="true" />
              <span className="font-alt font-semibold">{ui.navTipici}:</span>
              {prossimiTipici.map((t, i) => (
                <span key={t.id}>
                  <span className="font-semibold text-ink">{fmtDate(t.date.toISOString())}</span> {t.comune}{i < prossimiTipici.length - 1 ? ' ·' : ''}
                </span>
              ))}
              <Link href="/mappa" className="ml-1 font-alt font-semibold text-terracotta-600 hover:text-terracotta underline underline-offset-2">{TIPICI_CTA[lang]} →</Link>
            </p>
          )}
        </div>
        <WaveDivider fill className="relative z-10 text-crema" />
      </section>

      {/* ===== A DUE PASSI DA CASA — il mercato in piazza, col layout della
           vecchia prima sezione (racconto a sinistra + collage di polaroid a
           destra) e il copy dei blocchi. ===== */}
      <section id="perche" className="relative bg-crema">
        <Scribble variant="scribble" color="text-terracotta" className="hidden md:block absolute top-6 right-[6%] w-28 z-0 rotate-3" />
        <div className="home-reveal relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-6xl">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
            <div>
              <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-terracotta mb-3">{PBLOCKS[lang][0].eyebrow}</p>
              <h2 className="font-display font-extrabold tracking-tight text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.04] text-ink">
                {PBLOCKS[lang][0].title.split(', ')[0]},{' '}
                <span className="text-terracotta">{PBLOCKS[lang][0].title.split(', ').slice(1).join(', ')}</span>
              </h2>
              <p className="mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">{PBLOCKS[lang][0].body}</p>
              <div className="mt-8 relative inline-block">
                <Link href={PBLOCKS[lang][0].href} className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-terracotta text-crema px-6 py-3.5 rounded-full hover:bg-terracotta-600 transition-colors">
                  {PBLOCKS[lang][0].cta} <ArrowRight className="imk-march w-4 h-4" />
                </Link>
                {/* Freccia a mano che scende sulla CTA */}
                <Scribble variant="arrow" color="text-alga" className="hidden md:block absolute -top-12 -right-20 w-20 h-14 -scale-x-100 rotate-6" />
              </div>
            </div>
            <div className="home-reveal mb-6 lg:mb-0">
              <PostItCollage photos={PROJECT_PHOTOS} />
            </div>
          </div>
        </div>
        {/* Polaroid che spunta TRA le sezioni (niente overflow-hidden: non si taglia) */}
        <div aria-hidden="true" className="absolute -bottom-10 left-[5%] w-44 md:w-60 z-20 pointer-events-none">
          <PostItNote photo={{ src: '/zone/vita-banco-verdure.webp', alt: '', caption: 'Il banco delle verdure' }} tilt={-6} aspect="aspect-[4/3]" />
        </div>
        <WaveDivider fill className="relative z-10 text-crema-2" />
      </section>

      {/* ===== LE OTTO ZONE — da Ventimiglia a Diano, ognuna col suo carattere ===== */}
      <section id="zone" className="relative bg-crema-2">
        {/* Postcard sul LATO destro, che spunta verso la sezione banchi */}
        <div aria-hidden="true" className="hidden lg:block absolute -bottom-12 right-[3%] w-52 z-20 pointer-events-none">
          <PostItNote photo={{ src: '/zone/vita-mercato-ventimiglia.webp', alt: '', caption: 'Ventimiglia, il venerdì' }} tilt={5} aspect="aspect-[4/3]" />
        </div>
        <div className="home-reveal relative z-10 container mx-auto px-4 md:px-6 py-14 md:py-20 max-w-6xl grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-center">
          <div className="relative order-last lg:order-first">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/zone/vita-mercato-ventimiglia-borgo.webp" alt="Il mercato ai piedi della città vecchia di Ventimiglia" loading="lazy" className="w-full aspect-[4/3] object-cover rounded-[22px] shadow-[0_24px_54px_-32px_rgba(38,36,30,0.6)]" />
            <Scribble variant="loop" color="text-limone" className="hidden md:block absolute -top-5 -left-4 w-24 h-16 -rotate-6" />
          </div>
          <div>
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-3">{PBLOCKS[lang][1].eyebrow}</p>
            <h2 className="font-display font-extrabold tracking-tight text-4xl md:text-5xl leading-[1.04] text-ink">
              {PBLOCKS[lang][1].title.split(', ')[0]},{' '}
              <span className="text-terracotta">{PBLOCKS[lang][1].title.split(', ').slice(1).join(', ')}</span>
            </h2>
            <p className="mt-5 max-w-xl text-lg text-ink-soft leading-relaxed">{PBLOCKS[lang][1].body}</p>
            {/* Le otto zone, una per una: pill cliccabili */}
            <div className="mt-6 flex flex-wrap gap-2">
              {IMPERIA_ZONE_SLUGS.map((s) => (
                <Link key={s} href="/zone" className="font-alt text-[13px] font-semibold rounded-full px-3.5 py-1.5 border-[1.5px] text-alga-600 border-alga/50 bg-crema/70 hover:bg-alga hover:text-crema hover:border-alga transition-colors">
                  {zoneName(s)}
                </Link>
              ))}
            </div>
            <Link href={PBLOCKS[lang][1].href} className="group imk-lift mt-7 inline-flex items-center gap-2 font-alt font-semibold text-sm bg-alga text-crema px-6 py-3.5 rounded-full hover:bg-alga-600 transition-colors">
              {PBLOCKS[lang][1].cta} <ArrowRight className="imk-march w-4 h-4" />
            </Link>
          </div>
        </div>
        <WaveDivider fill className="relative z-10 text-crema" />
      </section>

      {/* ===== LE PERSONE DEL MERCATO — il box bianco besugo + le card in riga ===== */}
      <section id="banchi" className="relative bg-crema">
        {/* Polaroid media appoggiata accanto al titolo: aria di bacheca */}
        <div aria-hidden="true" className="hidden md:block absolute top-10 right-[2%] w-56 xl:w-72 z-0 pointer-events-none">
          <PostItNote photo={{ src: '/zone/vita-mercato-sanremo-banchi.webp', alt: '', caption: 'Sanremo, i banchi del martedì' }} tilt={-4} aspect="aspect-[4/3]" />
        </div>
        <div className="home-reveal relative z-10 container mx-auto px-4 md:px-6 py-14 md:py-20 max-w-6xl">
          <div className="max-w-2xl mb-8">
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-terracotta mb-2">{BANCHI2[lang].eyebrow}</p>
            <h2 className="relative inline-block font-display font-extrabold tracking-tight text-4xl md:text-5xl leading-[1.04] text-ink">
              {BANCHI2[lang].title}
              <Scribble variant="underline" color="text-limone" className="absolute -bottom-3.5 left-0 w-full h-5" />
            </h2>
            <p className="mt-3 text-ink-soft">{BANCHI2[lang].sub}</p>
          </div>

          {/* Il box bianco grande: la battuta del besugo (col footnote che traduce) */}
          <div className="relative bg-white border-2 border-ink rounded-[22px] p-7 md:p-9 flex flex-wrap items-center justify-between gap-6">
            {/* Freccia a mano che scende sulla CTA */}
            <Scribble variant="arrow" color="text-terracotta" className="hidden lg:block absolute -top-9 right-40 w-24 h-16 rotate-[18deg]" />
            <p className="font-display font-extrabold tracking-tight text-2xl md:text-[2.1rem] leading-[1.12] max-w-[26ch] text-ink">
              {BANCHI2[lang].q1}<em className="italic text-terracotta">{BANCHI2[lang].em}</em>{BANCHI2[lang].q2}<u className="decoration-limone decoration-[5px] underline-offset-2">{BANCHI2[lang].u}</u>{BANCHI2[lang].q3}
              <small className="block font-alt text-[13px] font-medium italic text-ink-soft mt-2.5">{BANCHI2[lang].foot}</small>
            </p>
            <Link href="/operatori" className="imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-terracotta text-crema px-6 py-3.5 rounded-full hover:bg-terracotta-600 transition-colors whitespace-nowrap">
              {BANCHI2[lang].cta} <ArrowRight className="imk-march w-4 h-4" />
            </Link>
          </div>

          {/* Le card dei banchi IN RIGA, scorrevoli (5-6), con WhatsApp e Vai al mercato */}
          {operators.length > 0 && (
            <div className="mt-8 -mx-4 px-4 md:mx-0 md:px-0 flex gap-4 overflow-x-auto snap-x pb-4 imk-scroll">
              {operators.slice(0, 8).map((op, opIdx) => {
                const wa = op.socialLinks?.whatsapp
                const chips = (op.schedules ?? []).slice(0, 2)
                const marketHref = op.market ? `/${op.market.slug}` : '/mappa'
                return (
                  <div key={op.id} className="snap-start flex-shrink-0 w-[270px] flex flex-col bg-crema-2/60 border border-[#e0d7c1] rounded-2xl overflow-hidden">
                    <Link href={`/operatori/${op.id}`} className="group block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-white">
                        <span className="absolute top-3 left-3 z-10 -rotate-3 font-alt text-[11px] font-bold uppercase tracking-wide text-crema bg-terracotta rounded-md px-2.5 py-1">{categoryLabel(op.category, lang)}</span>
                        {/* Foto di mercato TEMPORANEA (stabile per indice) + avatar del banco */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={TEMP_OP_PHOTOS[opIdx % TEMP_OP_PHOTOS.length]} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute bottom-3 left-3">
                          <BancoAvatar name={op.name} size={52} className="border-2 border-white shadow-md" />
                        </div>
                      </div>
                    </Link>
                    <div className="p-4 flex flex-col flex-1">
                      <Link href={`/operatori/${op.id}`} className="group">
                        <h3 className="font-display font-extrabold tracking-tight text-lg text-ink leading-tight group-hover:text-terracotta transition-colors">{op.name.replace(/\.+$/, '')}.</h3>
                      </Link>
                      {op.description && <p className="mt-1 text-[13px] text-ink-soft leading-snug line-clamp-2">{op.description}</p>}
                      {chips.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {chips.map((s, i) => (
                            <span key={i} className="inline-block font-alt text-[11px] font-semibold text-alga-600 border border-alga/40 rounded-full px-2 py-0.5">{s.giorno} · {s.comune}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-3.5 flex gap-2 mt-auto pt-2">
                        {wa && (
                          <a href={waHref(wa)} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 font-alt font-semibold text-[13px] text-crema bg-[#25D366] rounded-full px-3 py-2 hover:brightness-105 transition">
                            <MessageCircle className="w-3.5 h-3.5" /> {BANCHI2[lang].wa}
                          </a>
                        )}
                        <Link href={marketHref} className="flex-1 inline-flex items-center justify-center gap-1.5 font-alt font-semibold text-[13px] text-crema bg-ink rounded-full px-3 py-2 hover:bg-alga transition-colors">
                          {BANCHI2[lang].go}
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/operatori" className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm border-2 border-ink text-ink px-6 py-3 rounded-full hover:bg-ink hover:text-crema transition-colors">
              {BANCHI2[lang].all} <ArrowRight className="imk-march w-4 h-4" />
            </Link>
          </div>
        </div>
        <WaveDivider fill className="relative z-10 text-terracotta" />
      </section>

      {/* ===== LA RETE — "Hai un banco? Entra nella rete." a TUTTO SCHERMO:
           stanza TERRACOTTA piena (richiesta 2026-07-19), bollino verde grande
           senza piatto, i 3 requisiti numerati e la CTA in crema. ===== */}
      <section id="rete" className="relative bg-terracotta text-crema flex flex-col min-h-[85svh]">
        {/* Polaroid storica che spunta tra questa sezione e le notizie */}
        <div aria-hidden="true" className="absolute -bottom-10 left-[4%] w-40 md:w-56 z-20 pointer-events-none">
          <PostItNote photo={{ src: '/zone/vita-fiori-sanremo-1962.webp', alt: '', caption: 'Sanremo, il mercato dei fiori — 1962' }} tilt={-5} aspect="aspect-[4/3]" />
        </div>
        <div className="home-reveal relative z-10 flex-1 flex items-center container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-6xl">
          <div className="w-full grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
            <div>
              <p className="font-alt text-sm font-bold uppercase tracking-[0.16em] text-limone mb-4">{RETE2[lang].eyebrow}</p>
              <h2 className="font-display font-extrabold tracking-tight text-[11vw] md:text-6xl lg:text-[4.4rem] leading-[1.02] text-crema">{RETE2[lang].title}</h2>
              <p className="mt-6 max-w-[40ch] text-xl md:text-2xl text-crema/90 leading-relaxed">{RETE2[lang].lead}</p>
              {/* I 3 requisiti della rete: numerati, corpo grande, una riga ciascuno */}
              <ul className="mt-9 grid gap-4">
                {RETE2[lang].req.map((r, i) => (
                  <li key={r} className="flex items-center gap-4">
                    <span aria-hidden="true" className="grid place-items-center flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-limone text-ink font-display font-extrabold text-xl md:text-2xl">{i + 1}</span>
                    <span className="font-alt font-semibold text-xl md:text-2xl">{r}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 relative inline-block">
                <Link href="/aderisci" className="group imk-lift inline-flex items-center gap-2.5 font-alt font-bold text-base md:text-lg bg-crema text-ink px-8 py-4 md:px-10 md:py-5 rounded-full hover:bg-white transition-colors">
                  {RETE2[lang].cta} <ArrowRight className="imk-march w-5 h-5" />
                </Link>
                {/* Freccia a mano (specchiata) che scende sulla CTA */}
                <Scribble variant="arrow" color="text-limone" className="hidden md:block absolute -top-14 -right-24 w-24 h-16 -scale-x-100 rotate-6" />
              </div>
            </div>
            {/* Il bollino verde, grande, senza piatto: il logo respira da solo
                sulla terracotta (via il cerchio bianco/crema — richiesta 2026-07-19) */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative -rotate-6">
                <Bollino className="w-56 md:w-72 lg:w-80 drop-shadow-[0_30px_45px_rgba(0,0,0,0.35)]" />
                <span className="sr-only">{RETE2[lang].bollino}</span>
              </div>
            </div>
          </div>
        </div>
        <WaveDivider fill className="relative z-10 text-ink" />
      </section>

      {/* ===== GLI ARTICOLI — le notizie dei comuni, al posto delle zone.
           (L'onda piena della sezione rete introduce già questo blocco ink.) ===== */}
      <section id="settimana" className="relative bg-ink text-crema">
        {/* La bacheca continua anche sull'ink: polaroid chiara + ghirigoro limone */}
        <div aria-hidden="true" className="hidden lg:block absolute top-14 right-[4%] w-56 z-0 pointer-events-none">
          <PostItNote photo={{ src: '/zone/vita-mercato-coperto-ventimiglia.webp', alt: '', caption: 'Il mercato coperto di Ventimiglia' }} tilt={4} aspect="aspect-[4/3]" />
        </div>
        <Scribble variant="scribble" color="text-limone" className="hidden md:block absolute bottom-12 right-[9%] w-28 z-0 -rotate-6" />
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
