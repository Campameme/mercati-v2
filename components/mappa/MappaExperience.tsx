'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight, Map as MapIcon, CalendarDays } from 'lucide-react'
import MarketExplorer from '@/components/home/MarketExplorer'
import PhotoStack, { type StackPhoto } from '@/components/motion/PhotoStack'
import Bollino from '@/components/Bollino'
import { LogoMark } from '@/components/Logo'
import { CATEGORY_COLOR } from '@/lib/schedules/classify'
import type { MarketPin } from '@/components/home/types'
import { useLang } from '@/lib/i18n/useLang'
import type { Lang } from '@/lib/i18n/home'

// Il calendario porta FullCalendar: caricato solo quando serve (vista Calendario).
const MarketCalendar = dynamic(() => import('./MarketCalendar'), {
  ssr: false,
  loading: () => <div className="container mx-auto px-4 py-24 text-center text-ink-muted text-sm">…</div>,
})

const VIEW_LABEL: Record<Lang, { map: string; cal: string }> = {
  it: { map: 'Mappa', cal: 'Calendario' },
  fr: { map: 'Carte', cal: 'Calendrier' },
  de: { map: 'Karte', cal: 'Kalender' },
  en: { map: 'Map', cal: 'Calendar' },
}

const INTRO_PHOTOS: StackPhoto[] = [
  { src: '/zone/vita-mercato-ventimiglia.webp', alt: 'Il mercato del venerdì a Ventimiglia', caption: 'Ventimiglia · il venerdì' },
  { src: '/zone/vita-fiori-sanremo-1962.webp', alt: 'Il mercato dei fiori di Sanremo nel 1962', caption: 'Mercato dei fiori · 1962' },
  { src: '/zone/vita-sapori.webp', alt: 'Cestini di sapori su un banco di mercato', caption: 'Al banco' },
  { src: '/zone/vita-mercato-coperto-ventimiglia.webp', alt: 'L’interno del mercato coperto di Ventimiglia', caption: 'Il mercato coperto' },
]

interface FamilyCard {
  photo: string
  alt: string
  label: string
  desc: string
  color: string
}

interface Copy {
  eyebrow: string
  title: string
  titleAccent: string
  lead: string
  bannerPill: string
  bannerTitle: string
  bannerReqs: string[]
  bannerCta: string
  famEyebrow: string
  famTitle: string
  famLead: string
  seeOnMap: string
  principali: Omit<FamilyCard, 'color'>
  tematici: Omit<FamilyCard, 'color'>
}

const COPY: Record<Lang, Copy> = {
  it: {
    eyebrow: 'Ogni settimana, in ogni comune',
    title: 'I mercati della Riviera,',
    titleAccent: 'su una mappa sola.',
    lead: 'Quelli di ogni settimana e le ricorrenze speciali — antiquariato, produttori, artigianato. Dove sono, che giorni, a che ora, cosa ci trovi. Il resto si scopre al banco.',
    bannerPill: 'La rete',
    bannerTitle: 'Hai un banco? Entra nella rete.',
    bannerReqs: ['Banco pulito e curato', 'Prodotti di qualità', 'Serietà con colleghi e clienti'],
    bannerCta: 'Chiedi di entrare',
    famEyebrow: 'Tutti sulla stessa mappa',
    famTitle: 'Principali e tematici.',
    famLead: 'Il grande mercato settimanale di merci varie, e i giorni speciali con la loro ricorrenza — sulla stessa mappa.',
    seeOnMap: 'Vedi sulla mappa',
    principali: { photo: '/zone/vita-mercato-ventimiglia.webp', alt: 'Il mercato settimanale a Ventimiglia', label: 'Mercati principali', desc: 'Ogni settimana, in piazza: alimentari, abbigliamento, casa. Il mercato di sempre, comune per comune.' },
    tematici: { photo: '/zone/vita-fiori-sanremo-1962.webp', alt: 'Il mercato dei fiori di Sanremo', label: 'Mercati tematici', desc: 'Antiquariato, produttori a km0, artigianato: ricorrenze mensili e stagionali, ognuna col suo giorno.' },
  },
  fr: {
    eyebrow: 'Chaque semaine, dans chaque commune',
    title: 'Les marchés de la Riviera,',
    titleAccent: 'sur une seule carte.',
    lead: 'Ceux de chaque semaine et les rendez-vous spéciaux — antiquités, producteurs, artisanat. Où ils sont, quels jours, à quelle heure, ce qu’on y trouve. Le reste se découvre à l’étal.',
    bannerPill: 'Le réseau',
    bannerTitle: 'Tu as un étal ? Rejoins le réseau.',
    bannerReqs: ['Étal propre et soigné', 'Produits de qualité', 'Sérieux avec collègues et clients'],
    bannerCta: 'Demande d’entrer',
    famEyebrow: 'Tous sur la même carte',
    famTitle: 'Principaux et thématiques.',
    famLead: 'Le grand marché hebdomadaire tout-venant, et les jours spéciaux avec leur rendez-vous — sur la même carte.',
    seeOnMap: 'Voir sur la carte',
    principali: { photo: '/zone/vita-mercato-ventimiglia.webp', alt: 'Le marché hebdomadaire à Vintimille', label: 'Marchés principaux', desc: 'Chaque semaine, sur la place : alimentation, vêtements, maison. Le marché de toujours, commune par commune.' },
    tematici: { photo: '/zone/vita-fiori-sanremo-1962.webp', alt: 'Le marché aux fleurs de Sanremo', label: 'Marchés thématiques', desc: 'Antiquités, producteurs locaux, artisanat : rendez-vous mensuels et saisonniers, chacun son jour.' },
  },
  de: {
    eyebrow: 'Jede Woche, in jeder Gemeinde',
    title: 'Die Märkte der Riviera,',
    titleAccent: 'auf einer Karte.',
    lead: 'Die wöchentlichen und die besonderen Termine — Antiquitäten, Erzeuger, Handwerk. Wo sie sind, welche Tage, um welche Uhrzeit, was es gibt. Der Rest zeigt sich am Stand.',
    bannerPill: 'Das Netz',
    bannerTitle: 'Hast du einen Stand? Mach mit.',
    bannerReqs: ['Sauberer, gepflegter Stand', 'Qualitätsprodukte', 'Verlässlichkeit'],
    bannerCta: 'Frag an, dabei zu sein',
    famEyebrow: 'Alle auf einer Karte',
    famTitle: 'Haupt- und Themenmärkte.',
    famLead: 'Der große Wochenmarkt mit Allerlei und die besonderen Tage mit ihrem Termin — auf derselben Karte.',
    seeOnMap: 'Auf der Karte zeigen',
    principali: { photo: '/zone/vita-mercato-ventimiglia.webp', alt: 'Der Wochenmarkt in Ventimiglia', label: 'Hauptmärkte', desc: 'Jede Woche auf dem Platz: Lebensmittel, Kleidung, Haushalt. Der Markt wie immer, Gemeinde für Gemeinde.' },
    tematici: { photo: '/zone/vita-fiori-sanremo-1962.webp', alt: 'Der Blumenmarkt von Sanremo', label: 'Themenmärkte', desc: 'Antiquitäten, Erzeuger, Handwerk: monatliche und saisonale Termine, jeder an seinem Tag.' },
  },
  en: {
    eyebrow: 'Every week, in every town',
    title: 'The markets of the Riviera,',
    titleAccent: 'on a single map.',
    lead: 'The weekly ones and the special dates — antiques, growers, crafts. Where they are, which days, what time, what you’ll find. The rest you discover at the stall.',
    bannerPill: 'The network',
    bannerTitle: 'Got a stall? Join the network.',
    bannerReqs: ['A clean, well-kept stall', 'Quality products', 'Reliability'],
    bannerCta: 'Ask to join',
    famEyebrow: 'All on one map',
    famTitle: 'Main and themed.',
    famLead: 'The big weekly general market, and the special days with their recurrence — on the same map.',
    seeOnMap: 'See on the map',
    principali: { photo: '/zone/vita-mercato-ventimiglia.webp', alt: 'The weekly market in Ventimiglia', label: 'Main markets', desc: 'Every week, in the square: food, clothing, home. The market as always, town by town.' },
    tematici: { photo: '/zone/vita-fiori-sanremo-1962.webp', alt: 'The Sanremo flower market', label: 'Themed markets', desc: 'Antiques, local growers, crafts: monthly and seasonal dates, each on its own day.' },
  },
}

interface Props {
  pins: MarketPin[]
  initialQuery?: string
  initialZone?: string
  initialToday?: boolean
  initialDays?: number[]
  initialNear?: boolean
}

export default function MappaExperience(props: Props) {
  const [lang] = useLang()
  const [view, setView] = useState<'map' | 'cal'>('map')
  const c = COPY[lang]
  const v = VIEW_LABEL[lang]
  const tabCls = (active: boolean) =>
    `inline-flex items-center gap-2 font-alt text-sm font-semibold px-4 py-2 rounded-full transition-colors ${active ? 'bg-alga text-crema' : 'text-ink-soft hover:text-ink'}`

  const families: FamilyCard[] = [
    { ...c.principali, color: CATEGORY_COLOR.generale },
    { ...c.tematici, color: CATEGORY_COLOR.antiquariato },
  ]

  return (
    <div className="bg-crema">
      {/* 1. Concept — impersonale, a beneficio di chi cerca il mercato */}
      <section className="relative overflow-hidden bg-crema-2">
        <div aria-hidden="true" className="mz-band absolute top-0 inset-x-0" />
        <div className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-6xl grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          <div>
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-3">{c.eyebrow}</p>
            <h1 className="font-display font-extrabold tracking-[-0.02em] text-ink text-[8.5vw] leading-[1.05] md:text-5xl lg:text-[3.4rem]">
              {c.title} <span className="text-alga">{c.titleAccent}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base md:text-lg text-ink-soft leading-relaxed">{c.lead}</p>
            <a href="#mappa" className="group imk-lift mt-7 inline-flex items-center gap-2 font-alt font-semibold text-sm bg-terracotta text-crema px-6 py-3.5 rounded-full hover:bg-terracotta-600 transition-colors">
              {c.seeOnMap} <ArrowRight className="imk-march w-4 h-4" />
            </a>
          </div>
          <div className="mx-auto w-full max-w-sm lg:max-w-none mb-10 lg:mb-0">
            <PhotoStack photos={INTRO_PHOTOS} aspect="aspect-[4/5]" />
          </div>
        </div>
      </section>

      {/* 2. Vista unica: Mappa ⇄ Calendario */}
      <section id="mappa" className="scroll-mt-4">
        <div className="container mx-auto px-4 md:px-6 pt-6 pb-1">
          <div className="inline-flex rounded-full border border-[#e0d7c1] bg-white p-1 shadow-[0_10px_22px_-16px_rgba(38,36,30,0.5)]">
            <button type="button" onClick={() => setView('map')} aria-pressed={view === 'map'} className={tabCls(view === 'map')}>
              <MapIcon className="w-4 h-4" aria-hidden="true" /> {v.map}
            </button>
            <button type="button" onClick={() => setView('cal')} aria-pressed={view === 'cal'} className={tabCls(view === 'cal')}>
              <CalendarDays className="w-4 h-4" aria-hidden="true" /> {v.cal}
            </button>
          </div>
        </div>
        {view === 'map' ? (
          <MarketExplorer {...props} heightClass="md:h-[82svh]" />
        ) : (
          <MarketCalendar />
        )}
      </section>

      {/* 3. Banner ambulante — per chi tiene banco (il resto vive su /aderisci) */}
      <section className="relative overflow-hidden bg-alga text-crema">
        <div className="relative z-10 container mx-auto px-4 md:px-6 py-9 md:py-11 max-w-5xl flex flex-wrap items-center gap-x-8 gap-y-5">
          <Bollino className="w-20 md:w-24 flex-shrink-0" />
          <div className="flex-1 min-w-[240px]">
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-limone mb-1">{c.bannerPill}</p>
            <h2 className="font-display font-extrabold tracking-tight text-xl md:text-2xl leading-tight text-crema">{c.bannerTitle}</h2>
            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-crema/90">
              {c.bannerReqs.map((r) => (
                <span key={r} className="inline-flex items-center gap-1.5 font-alt font-semibold">
                  <LogoMark className="w-5 h-4 flex-shrink-0 text-limone" capo={false} /> {r}
                </span>
              ))}
            </p>
          </div>
          <Link href="/aderisci" className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-terracotta text-crema px-6 py-3.5 rounded-full hover:bg-terracotta-600 transition-colors flex-shrink-0">
            {c.bannerCta} <ArrowRight className="imk-march w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. Due famiglie di mercati, con foto */}
      <section className="relative overflow-hidden bg-crema">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20 max-w-6xl">
          <div className="max-w-2xl mb-9">
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-terracotta mb-2">{c.famEyebrow}</p>
            <h2 className="font-display font-extrabold tracking-tight text-4xl md:text-5xl leading-[1.04] text-ink">{c.famTitle}</h2>
            <p className="mt-3 text-ink-soft">{c.famLead}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
            {families.map((f) => (
              <a key={f.label} href="#mappa" className="imk-lift group flex flex-col bg-white rounded-2xl border border-[#e0d7c1] overflow-hidden">
                <span aria-hidden="true" className="mz-band" style={{ ['--band' as string]: f.color }} />
                <div className="relative aspect-[16/9] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.photo} alt={f.alt} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent" />
                  <span className="absolute left-4 bottom-3 font-display font-extrabold tracking-tight text-xl text-crema">{f.label}</span>
                </div>
                <div className="p-5 flex items-start justify-between gap-3">
                  <p className="text-[15px] text-ink-soft leading-relaxed">{f.desc}</p>
                  <span className="mt-0.5 inline-flex items-center gap-1 font-alt text-xs font-bold uppercase tracking-wider flex-shrink-0" style={{ color: f.color }}>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
