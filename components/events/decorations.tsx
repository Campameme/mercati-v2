import type { SVGProps } from 'react'

/**
 * Motivi decorativi liguri/Imperia per la pagina Eventi.
 * Brand "bold" — mare/onde, sole di Riviera, agrumi, archi dei caruggi.
 * NESSUNA foglia d'ulivo.
 */

/** Onde del mare ligure — ripetibili in orizzontale. */
export function SeaWaves(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M0 6 C 12 0, 24 12, 40 6 S 68 0, 80 6 S 108 12, 120 6 S 148 0, 160 6 S 188 12, 200 6" />
      <path d="M0 13 C 12 7, 24 19, 40 13 S 68 7, 80 13 S 108 19, 120 13 S 148 7, 160 13 S 188 19, 200 13" opacity="0.55" />
    </svg>
  )
}

/** Sole di Riviera con raggi. */
export function RivieraSun(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <circle cx="24" cy="24" r="9" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M24 3 V 9" />
        <path d="M24 39 V 45" />
        <path d="M3 24 H 9" />
        <path d="M39 24 H 45" />
        <path d="M9 9 L 13 13" />
        <path d="M35 35 L 39 39" />
        <path d="M39 9 L 35 13" />
        <path d="M13 35 L 9 39" />
      </g>
    </svg>
  )
}

/** Limone / agrume della Riviera. */
export function Lemon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}>
      <ellipse cx="20" cy="22" rx="13" ry="11" transform="rotate(-28 20 22)" fill="currentColor" />
      <path d="M30 12 q 4 -4 7 -3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="20" cy="22" rx="6.5" ry="5" transform="rotate(-28 20 22)" fill="var(--paper, #FBF6EA)" opacity="0.35" />
    </svg>
  )
}

/** Arco dei caruggi — facciate dei centri storici liguri. */
export function CaruggiArch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 60 80" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M6 78 V 30 a 24 24 0 0 1 48 0 V 78" />
      <path d="M16 78 V 40 a 14 14 0 0 1 28 0 V 78" opacity="0.55" />
    </svg>
  )
}

/** Banda di archi ripetuti — quinta scenica dei caruggi. */
export function ArchRow({ className = '', count = 6 }: { className?: string; count?: number }) {
  return (
    <svg
      viewBox={`0 0 ${count * 40} 48`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {Array.from({ length: count }).map((_, i) => (
        <path key={i} d={`M${i * 40 + 4} 48 V 22 a 16 16 0 0 1 32 0 V 48`} />
      ))}
    </svg>
  )
}
