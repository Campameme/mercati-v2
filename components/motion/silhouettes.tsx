import type { SVGProps } from 'react'

// Arrotonda i valori calcolati (cos/sin): Node e il browser possono divergere
// all'ultima cifra → mismatch di hydration. Fissiamo la precisione.
const r2 = (n: number) => Math.round(n * 100) / 100

// Silhouette piene (currentColor) per il backdrop "in ombra" che deriva.
// Coerenti col Ponente ligure: borghi, mare, sole, agrumi, banchi, fiori, pesce.
// Pensate per essere grandi, sfocate e a bassa opacità sullo sfondo.

export function BorgoSil(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 220 90" fill="currentColor" {...props}>
      {/* campanile */}
      <rect x="16" y="14" width="14" height="62" />
      <path d="M16 14 L23 4 L30 14 Z" />
      {/* case a schiera */}
      <rect x="34" y="40" width="22" height="36" />
      <rect x="56" y="30" width="26" height="46" />
      <path d="M56 30 L69 18 L82 30 Z" />
      <rect x="82" y="46" width="20" height="30" />
      <rect x="102" y="34" width="28" height="42" />
      <path d="M102 34 L116 22 L130 34 Z" />
      <rect x="130" y="48" width="22" height="28" />
      <rect x="152" y="38" width="26" height="38" />
      <path d="M152 38 L165 27 L178 38 Z" />
      <rect x="178" y="50" width="26" height="26" />
      <rect x="0" y="76" width="220" height="6" />
    </svg>
  )
}

export function WaveBand(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 44" fill="currentColor" {...props}>
      <path d="M0 18 C 24 6, 48 6, 72 18 S 120 30, 144 18 S 192 6, 240 18 L240 44 L0 44 Z" opacity="0.9" />
      <path d="M0 30 C 24 20, 48 20, 72 30 S 120 40, 144 30 S 192 20, 240 30 L240 44 L0 44 Z" />
    </svg>
  )
}

export function SunSil(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="currentColor" {...props}>
      <circle cx="60" cy="60" r="26" />
      <g stroke="currentColor" strokeWidth="6" strokeLinecap="round">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6
          return <line key={i} x1={r2(60 + Math.cos(a) * 36)} y1={r2(60 + Math.sin(a) * 36)} x2={r2(60 + Math.cos(a) * 50)} y2={r2(60 + Math.sin(a) * 50)} />
        })}
      </g>
    </svg>
  )
}

export function LemonSil(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 80" fill="currentColor" {...props}>
      <ellipse cx="40" cy="42" rx="22" ry="28" transform="rotate(35 40 42)" />
      <path d="M56 18 c6 -5 12 -6 16 -4" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function AwningSil(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 96 90" fill="currentColor" {...props}>
      <rect x="10" y="20" width="76" height="16" rx="5" />
      <path d="M10 36 q9.5 14 19 0 q9.5 14 19 0 q9.5 14 19 0 q9.5 14 19 0 L86 36 Z" />
      <rect x="20" y="36" width="6" height="44" />
      <rect x="70" y="36" width="6" height="44" />
      <rect x="14" y="44" width="68" height="6" />
    </svg>
  )
}

export function FlowerSil(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 80" fill="currentColor" {...props}>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i * Math.PI) / 3
        const cx = r2(40 + Math.cos(a) * 17)
        const cy = r2(40 + Math.sin(a) * 17)
        return <ellipse key={i} cx={cx} cy={cy} rx="11" ry="7" transform={`rotate(${i * 60} ${cx} ${cy})`} />
      })}
      <circle cx="40" cy="40" r="9" />
    </svg>
  )
}

export function FishSil(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 110 56" fill="currentColor" {...props}>
      <path d="M8 28 C 28 6, 70 6, 86 28 C 70 50, 28 50, 8 28 Z" />
      <path d="M86 28 L106 12 L102 28 L106 44 Z" />
      <circle cx="30" cy="24" r="3.4" fill="#0E3040" />
    </svg>
  )
}
