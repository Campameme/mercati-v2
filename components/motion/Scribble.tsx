'use client'

// Scarabocchi a mano, nello stesso tratto calligrafico del Nodo: un cerchio
// storto, una freccia con l'ansa (parente del logo, non copia), una
// sottolineatura mossa, un ghirigoro libero. Servono a dare movimento —
// decoro, aria-hidden, pointer-events-none.
//
// Con `draw` (default) il tratto si DISEGNA quando entra in vista (IO +
// .imk-draw); prima resta invisibile (.imk-draw-wait). Reduced-motion: il
// tratto è semplicemente visibile, fermo (regole in globals.css).
// `stretch` deforma il viewBox sul contenitore (preserveAspectRatio none):
// serve ai cerchi che devono avvolgere TUTTA una parola, larga quanto è.

import { useEffect, useRef } from 'react'

type Variant = 'loop' | 'arrow' | 'underline' | 'scribble'

const PATHS: Record<Variant, { vb: string; d: string; extra?: string }> = {
  // cerchio storto, aperto (per cerchiare una parola intera: usare stretch)
  loop: { vb: '0 0 120 90', d: 'M96 20 C 60 2, 14 10, 10 44 C 7 74, 52 84, 82 78 C 108 72, 118 44, 100 26 C 92 18, 80 16, 74 20' },
  // freccia calligrafica NUOVA (2026-07-20): l'asta fa un'ansa su se stessa
  // — il gesto del Nodo — e la punta parte esattamente dalla fine del tratto.
  arrow: {
    vb: '0 0 120 90',
    d: 'M8 24 C 30 8, 52 8, 58 24 C 63 38, 46 46, 40 34 C 34 22, 52 14, 70 24 C 88 34, 98 48, 102 64',
    extra: 'M102 64 L82 57 M102 64 L96 44',
  },
  // sottolineatura mossa (doppio passaggio)
  underline: { vb: '0 0 200 34', d: 'M6 16 C 60 6, 140 6, 194 14 M10 24 C 70 16, 150 18, 190 24' },
  // ghirigoro libero
  scribble: { vb: '0 0 160 60', d: 'M6 40 C 26 8, 40 8, 46 34 C 52 58, 70 58, 78 32 C 86 8, 104 10, 110 36 C 116 58, 138 54, 154 22' },
}

export default function Scribble({
  variant = 'scribble',
  className = '',
  color = 'text-terracotta',
  draw = true,
  strokeWidth = 5,
  stretch = false,
}: {
  variant?: Variant
  className?: string
  color?: string
  draw?: boolean
  strokeWidth?: number
  stretch?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)

  // Il tratto si disegna la prima volta che lo scarabocchio entra in vista.
  useEffect(() => {
    if (!draw) return
    const el = ref.current
    const svg = el?.querySelector('svg')
    if (!el || !svg) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          svg.classList.remove('imk-draw-wait')
          svg.classList.add('imk-draw')
          io.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [draw])

  const p = PATHS[variant]
  return (
    <span ref={ref} aria-hidden="true" className={`pointer-events-none inline-block ${color} ${className}`}>
      {/* overflow-visible: il tratto spesso non viene mai tagliato ai bordi del viewBox */}
      <svg
        viewBox={p.vb}
        fill="none"
        className={`w-full h-full overflow-visible ${draw ? 'imk-draw-wait' : ''}`}
        preserveAspectRatio={stretch ? 'none' : 'xMidYMid meet'}
      >
        <path d={p.d} pathLength={240} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {p.extra && <path d={p.extra} pathLength={240} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </span>
  )
}
