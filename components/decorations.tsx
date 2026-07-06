import type { SVGProps } from 'react'

/**
 * WaveTaglia — taglietto a onda (mare / Riviera). Sostituisce OliveSprig
 * come "firmetta" decorativa accanto agli eyebrow/label. Doppia onda piena
 * per un segno più deciso, coerente col brand bold.
 */
export function WaveTaglia(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 6 C 8 1, 14 1, 20 6 S 32 11, 38 6 S 50 1, 62 6" />
      <path d="M2 11 C 8 6, 14 6, 20 11 S 32 16, 38 11 S 50 6, 62 11" opacity="0.45" />
    </svg>
  )
}

/**
 * SunRay — piccolo sole con raggi (luce di Riviera). Accento caldo,
 * usabile come glifo accanto a titoli/eyebrow.
 */
export function SunRay(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4.4" fill="currentColor" opacity="0.9" stroke="none" />
      <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.4 4.4l2.1 2.1M17.5 17.5l2.1 2.1M19.6 4.4l-2.1 2.1M6.5 17.5l-2.1 2.1" />
    </svg>
  )
}

/**
 * Lemon — limone della Riviera (agrumi). Glifo agrume per accenti caldi.
 */
export function Lemon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="12.5" rx="6.5" ry="8" transform="rotate(35 12 12.5)" fill="currentColor" opacity="0.85" stroke="none" />
      <ellipse cx="12" cy="12.5" rx="6.5" ry="8" transform="rotate(35 12 12.5)" />
      <path d="M16.8 6.2c1.3-1 2.6-1.4 3.6-1.1" opacity="0.9" />
    </svg>
  )
}

/**
 * Arco — arco dei caruggi liguri (portico/voltino). Motivo architettonico
 * della Riviera, utile come cornice o glifo.
 */
export function Arco(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 30 V 16 C 4 6, 14 2, 24 2 S 44 6, 44 16 V 30" />
      <path d="M11 30 V 18 C 11 11, 17 8, 24 8 S 37 11, 37 18 V 30" opacity="0.4" />
    </svg>
  )
}

export function WaveDivider(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" {...props}>
      <path d="M0 8 C 12 2, 24 14, 40 8 S 68 2, 80 8 S 108 14, 120 8 S 148 2, 160 8 S 188 14, 200 8" />
    </svg>
  )
}

/**
 * CanopyEdge — il bordo smerlato del TENDONE da mercato (lo stesso profilo
 * dell'icona-banco), a tutta larghezza. Da appoggiare in cima a una sezione:
 * è la tela del banco che "copre" ciò che c'è sotto.
 */
export function CanopyEdge({ color = '#15607C', className = '' }: { color?: string; className?: string }) {
  const arcs = Array.from({ length: 30 }, (_, i) => `A 24 15 0 0 1 ${1440 - (i + 1) * 48} 11`).join(' ')
  return (
    <svg
      viewBox="0 0 1440 26"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block w-full h-4 md:h-5 ${className}`}
    >
      <path d={`M0 0 H1440 V11 ${arcs} Z`} fill={color} />
    </svg>
  )
}

/**
 * StringLights — le luci da sagra dei mercati serali: tre campate di filo
 * con le lampadine. Pensata per le sezioni scure (bg-notte).
 */
export function StringLights({ className = '' }: { className?: string }) {
  // punto sulla quadratica (x0,y0)-(cx,cy)-(x1,y1)
  const q = (t: number, a: number, c: number, b: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b
  const spans: Array<[number, number, number, number, number, number]> = [
    [0, 8, 240, 54, 480, 12],
    [480, 12, 720, 56, 960, 12],
    [960, 12, 1200, 54, 1440, 8],
  ]
  const bulbs: Array<[number, number]> = []
  for (const [x0, y0, cx, cy, x1, y1] of spans) {
    for (const t of [0.18, 0.38, 0.58, 0.78]) bulbs.push([q(t, x0, cx, x1), q(t, y0, cy, y1) + 7])
  }
  return (
    <svg viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true" className={`block w-full h-12 md:h-16 ${className}`}>
      {spans.map(([x0, y0, cx, cy, x1, y1], i) => (
        <path key={i} d={`M${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`} fill="none" stroke="#F7EFDD" strokeOpacity="0.28" strokeWidth="1.6" />
      ))}
      {bulbs.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="9" fill="#F4B62C" opacity="0.16" />
          <circle cx={x} cy={y} r="3.6" fill="#F4B62C" opacity="0.95" />
        </g>
      ))}
    </svg>
  )
}

/**
 * BigWaves — onde larghe di fondo (il mare della Riviera), per riempire
 * il piede di una sezione chiara senza rubare la scena.
 */
export function BigWaves({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true" className={`block w-full ${className}`}>
      <path d="M0 140 C 180 100 300 180 480 150 S 840 90 1020 140 S 1320 200 1440 150 V300 H0 Z" fill="#15607C" opacity="0.05" />
      <path d="M0 200 C 200 160 340 240 520 210 S 880 150 1060 200 S 1340 260 1440 210 V300 H0 Z" fill="#15607C" opacity="0.07" />
      <path d="M0 258 C 220 226 380 292 560 268 S 920 216 1100 258 S 1360 300 1440 268 V300 H0 Z" fill="#15607C" opacity="0.1" />
    </svg>
  )
}

