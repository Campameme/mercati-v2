'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { gsap } from '@/lib/motion/gsap'
import { prefersReduced } from '@/lib/motion/tokens'
import { ZONES } from '@/lib/markets/zones'
import { ZONES_I18N } from '@/lib/markets/zones.i18n'
import { useLang } from '@/lib/i18n/useLang'
import { zoneHeroKey } from '@/lib/zonePhotos'
import { CanopyEdge, BigWaves } from '@/components/decorations'
import ZoneImage from '@/components/ZoneImage'

// Sezione zone: le 8 zone del Ponente come card fotografiche → pagina zona.
// Ogni card ha la foto curata del borgo/costa, il nome e il suo carattere:
// il racconto entra in home, la navigazione è diretta (niente modale).
// Testata e CTA configurabili così la home può usarla come sezione-valore
// ("Il progetto") in 4 lingue.
export default function BorghiSection({
  className = 'bg-carta bg-paper-grain border-b-2 border-ink/10',
  eyebrow = 'Le zone',
  title = 'Da Ventimiglia a Varazze, un solo Ponente.',
  lead = 'Quindici zone tra mare e entroterra: ognuna con i suoi giorni, le sue piazze e il suo racconto.',
  cta,
}: {
  className?: string
  eyebrow?: string
  title?: string
  lead?: string
  cta?: { label: string; href: string }
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [lang] = useLang()
  const ZONE_LINK: Record<string, string> = { it: 'La zona', fr: 'La zone', de: 'Die Zone', en: 'The area' }

  useEffect(() => {
    if (prefersReduced()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.bsec-reveal').forEach((el) => {
        gsap.from(el, {
          y: 28, duration: 0.7, ease: 'power3.out', clearProps: 'transform',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="borghi" ref={rootRef} className={`relative overflow-hidden ${className}`}>
      {/* Il tendone copre la sezione dall'alto; il mare la riempie dal basso */}
      <CanopyEdge color="#F4B62C" className="absolute top-0 inset-x-0" />
      <BigWaves className="absolute bottom-0 inset-x-0 h-40 md:h-64 pointer-events-none" />
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-5xl">
        <p className="bsec-reveal font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-2">{eyebrow}</p>
        <h2 className="bsec-reveal font-alt font-extrabold tracking-tight text-3xl md:text-5xl leading-[1.04] text-ink mb-3">{title}</h2>
        <p className="bsec-reveal text-ink-soft mb-8 max-w-2xl">{lead}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {ZONES.map((z, i) => (
            <Link
              key={z.slug}
              href={`/${z.slug}`}
              className={`bsec-reveal imk-lift group flex flex-col bg-white border-2 border-ink/10 imk-edge overflow-hidden hover:border-mare transition-colors ${
                i % 4 === 0 ? 'imk-tilt-l' : i % 4 === 3 ? 'imk-tilt-r' : ''
              }`}
            >
              <div className="relative">
                <ZoneImage query={zoneHeroKey(z.slug)} alt={z.name} aspect="aspect-[4/3]" hoverZoom />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-notte/80 to-transparent pointer-events-none" aria-hidden="true" />
                <span className="absolute left-3 bottom-2.5 right-3 font-alt font-bold text-lg text-carta leading-tight [text-shadow:0_1px_8px_rgba(14,48,64,0.5)]">
                  {z.name}
                </span>
              </div>
              <p className="flex-1 p-3.5 text-[13px] leading-snug text-ink-soft">
                {(lang !== 'it' ? ZONES_I18N[z.slug]?.[lang]?.carattere : null) ?? z.carattere}
              </p>
              <span className="px-3.5 pb-3 inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.08em] text-mare-600">
                {ZONE_LINK[lang]} <ArrowRight className="imk-march w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>

        {cta && (
          <div className="bsec-reveal mt-9">
            <Link href={cta.href} className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-sole text-ink px-6 py-3.5 rounded-full hover:bg-sole-600 transition-colors">
              {cta.label} <ArrowRight className="imk-march w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
