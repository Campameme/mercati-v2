// Scarabocchi a mano, nello stesso tratto calligrafico del Nodo: un cerchio
// storto, una freccia, una sottolineatura mossa, una spirale, una stella. Servono
// a dare movimento — decoro, aria-hidden, pointer-events-none. Si "disegnano"
// entrando in vista (.imk-draw, reduced-motion safe: restano semplicemente visibili).

type Variant = 'loop' | 'arrow' | 'underline' | 'spiral' | 'star' | 'scribble'

const PATHS: Record<Variant, { vb: string; d: string; extra?: string }> = {
  // cerchio storto, aperto (per cerchiare una parola)
  loop: { vb: '0 0 120 90', d: 'M96 20 C 60 2, 14 10, 10 44 C 7 74, 52 84, 82 78 C 108 72, 118 44, 100 26 C 92 18, 80 16, 74 20' },
  // freccia curva a mano
  arrow: { vb: '0 0 110 80', d: 'M6 20 C 40 8, 84 18, 96 54', extra: 'M84 40 L98 58 L74 62' },
  // sottolineatura mossa (doppio passaggio)
  underline: { vb: '0 0 200 34', d: 'M6 16 C 60 6, 140 6, 194 14 M10 24 C 70 16, 150 18, 190 24' },
  // spirale
  spiral: { vb: '0 0 90 90', d: 'M45 45 m0 0 C 45 36, 58 36, 58 48 C 58 64, 36 64, 34 46 C 31 22, 62 20, 70 46 C 78 74, 40 82, 20 60' },
  // stellina a tratto
  star: { vb: '0 0 90 90', d: 'M45 8 L55 36 L84 36 L60 54 L69 82 L45 64 L21 82 L30 54 L6 36 L35 36 Z' },
  // ghirigoro libero
  scribble: { vb: '0 0 160 60', d: 'M6 40 C 26 8, 40 8, 46 34 C 52 58, 70 58, 78 32 C 86 8, 104 10, 110 36 C 116 58, 138 54, 154 22' },
}

export default function Scribble({
  variant = 'scribble',
  className = '',
  color = 'text-terracotta',
  draw = true,
  strokeWidth = 5,
}: {
  variant?: Variant
  className?: string
  color?: string
  draw?: boolean
  strokeWidth?: number
}) {
  const p = PATHS[variant]
  return (
    <span aria-hidden="true" className={`pointer-events-none inline-block ${color} ${className}`}>
      <svg viewBox={p.vb} fill="none" className={`w-full h-full ${draw ? 'imk-draw' : ''}`} preserveAspectRatio="xMidYMid meet">
        {variant === 'star' ? (
          <path d={p.d} pathLength={240} stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
        ) : (
          <path d={p.d} pathLength={240} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        )}
        {p.extra && <path d={p.extra} pathLength={240} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </span>
  )
}
