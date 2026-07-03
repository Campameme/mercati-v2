'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { gsap } from '@/lib/motion/gsap'
import { prefersReduced } from '@/lib/motion/tokens'
import { BORGHI, BorgoMark } from './borghi'
import PhotoFx from './PhotoFx'

// Sezione borghi: 8 tessere FOTO cliccabili → dettaglio in situ con foto
// grande, giorno di mercato, carattere e link alla mappa.
// Self-contained (stato + reveal proprio); testata e CTA configurabili così la
// home può usarla come sezione-valore ("Il progetto") in 4 lingue.
export default function BorghiSection({
  className = 'bg-marel/40 border-t-2 border-ink/10',
  eyebrow = 'I mercati, borgo per borgo',
  title = 'Otto borghi, otto mercati',
  lead = 'Tocca un borgo: la foto va a colori e ti dice il giorno di mercato e il suo carattere. Poi ti portiamo al banco.',
  cta,
}: {
  className?: string
  eyebrow?: string
  title?: string
  lead?: string
  cta?: { label: string; href: string }
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [openBorgo, setOpenBorgo] = useState<number | null>(null)
  const sel = openBorgo !== null ? BORGHI[openBorgo] : null

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
    <section id="borghi" ref={rootRef} className={`relative ${className}`}>
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-5xl">
        <p className="bsec-reveal font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-2">{eyebrow}</p>
        <h2 className="bsec-reveal font-alt font-extrabold tracking-tight text-3xl md:text-5xl leading-[1.04] text-ink mb-3">{title}</h2>
        <p className="bsec-reveal text-ink-soft mb-8 max-w-2xl">{lead}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {BORGHI.map((b, i) => {
            const open = openBorgo === i
            return (
              <button
                key={b.n}
                onClick={() => setOpenBorgo(open ? null : i)}
                aria-expanded={open}
                className={`bsec-reveal group relative rounded-3xl overflow-hidden border-2 transition-colors ${open ? 'border-mare' : 'border-ink/10 hover:border-mare/60'}`}
              >
                <PhotoFx
                  query={b.wiki ?? b.n}
                  fallbackQuery={b.wiki ? b.n : undefined}
                  alt={b.n}
                  aspect="aspect-[4/5]"
                  tint="hover"
                  hoverZoom
                  overlay={
                    <>
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-notte/90 to-transparent" aria-hidden="true" />
                      <span className="absolute top-2 right-2 opacity-90 drop-shadow"><BorgoMark i={i} className="w-9 h-auto" /></span>
                      <span className="absolute left-3 bottom-3 text-left">
                        <span className="block font-alt font-bold text-base md:text-lg text-carta leading-tight">{b.n}</span>
                        <span className="font-alt text-[11px] text-sole">{b.g}</span>
                      </span>
                    </>
                  }
                />
              </button>
            )
          })}
        </div>

        {sel && (
          <div className="mt-5 relative grid md:grid-cols-[1.1fr_1fr] gap-5 rounded-3xl border-2 border-ink/10 bg-white p-4 md:p-5 shadow-sm">
            <PhotoFx key={sel.n} query={sel.wiki ?? sel.n} fallbackQuery={sel.wiki ? sel.n : undefined} alt={sel.n} aspect="aspect-[16/10]" tint="none" priority className="rounded-2xl" />
            <div className="min-w-0 flex flex-col justify-center">
              <h3 className="font-alt font-bold text-3xl text-ink leading-tight">{sel.n}</h3>
              <p className="font-alt text-xs font-semibold text-mare-600 mt-1">Mercato: {sel.g}</p>
              <p className="font-accent text-2xl text-mare-700 leading-snug mt-3">{sel.nota}</p>
              <Link href={`/mappa?q=${encodeURIComponent(sel.n)}`} className="group mt-4 inline-flex w-fit items-center gap-2 font-alt font-semibold text-sm bg-ink text-carta px-4 py-2.5 rounded-full hover:bg-mare transition-colors">
                Vedi sulla mappa <ArrowRight className="imk-march w-4 h-4" />
              </Link>
            </div>
            <button onClick={() => setOpenBorgo(null)} aria-label="Chiudi" className="absolute right-3 top-3 grid place-items-center w-8 h-8 rounded-full bg-ink/5 text-ink-muted hover:bg-ink/10">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
