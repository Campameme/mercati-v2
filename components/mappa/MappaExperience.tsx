'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight, Map as MapIcon, CalendarDays } from 'lucide-react'
import MarketExplorer from '@/components/home/MarketExplorer'
import Bollino from '@/components/Bollino'
import { LogoMark } from '@/components/Logo'
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

interface Copy {
  eyebrow: string
  title: string
  titleAccent: string
  lead: string
  bannerPill: string
  bannerTitle: string
  bannerReqs: string[]
  bannerCta: string
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


  return (
    <div className="bg-crema">
      {/* 1. Header compatto: titolo + una riga, poi SUBITO la vista unica.
          (Via la pila di foto: la mappa e il calendario devono emergere.) */}
      <section id="mappa" className="relative overflow-hidden bg-crema-2 scroll-mt-2">
        <div aria-hidden="true" className="mz-band absolute top-0 inset-x-0" />
        <div className="relative z-10 container mx-auto px-4 md:px-6 pt-7 pb-4 max-w-6xl flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-1.5">{c.eyebrow}</p>
            <h1 className="font-display font-extrabold tracking-[-0.02em] text-ink text-[7vw] leading-[1.02] sm:text-4xl lg:text-[2.8rem]">
              {c.title} <span className="text-alga">{c.titleAccent}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm md:text-base text-ink-soft leading-snug">{c.lead}</p>
          </div>
          {/* Toggle Mappa ⇄ Calendario, allineato al titolo */}
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
          <MarketExplorer {...props} heightClass="md:h-[84svh]" />
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

    </div>
  )
}
