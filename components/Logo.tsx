// Logotipo "I Mercati della Riviera dei Fiori" (sistema Nodo × Mezzogiorno):
// il NODO — un tratto calligrafico che si annoda, col capo in terracotta —
// + lockup tutto in display: "I Mercati" (800) / "della Riviera dei Fiori"
// (700, alga — mai corsivo, mai un font diverso: scelta del proprietario).
// Il tratto eredita `currentColor` (ink su chiaro, crema su scuro); il capo
// resta terracotta. Nelle riduzioni piccole (monogramma/favicon) solo il tratto.

const NAME = 'I Mercati della Riviera dei Fiori'

interface LogoProps {
  className?: string
  /** layout in linea (nodo + nome su una riga) invece che impilato */
  inline?: boolean
  markClassName?: string
}

/** Il Nodo. `capo` = mostra il capo terracotta (spegnerlo nelle riduzioni piccole).
 *  `draw` = il nodo "si annoda" al mount (stroke-draw one-shot, reduced-motion safe). */
export function LogoMark({
  className = '',
  capo = true,
  draw = false,
}: {
  className?: string
  capo?: boolean
  draw?: boolean
}) {
  return (
    <svg viewBox="0 0 120 100" className={`${draw ? 'imk-knot ' : ''}${className}`} fill="none" aria-hidden="true">
      <path
        pathLength="1"
        d="M14 68 C 2 52, 12 26, 36 26 C 62 26, 60 62, 40 62 C 24 62, 26 38, 48 33 C 74 27, 96 40, 100 66"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {capo && (
        <path
          pathLength="1"
          className="imk-knot-capo"
          d="M36 26 C 62 26, 60 62, 40 62"
          stroke="#C4593C"
          strokeWidth="8"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

/** Monogramma compatto per avatar / app / social: nodo in negativo su alga. */
export function LogoMonogram({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl bg-alga ${className}`}
      aria-label={NAME}
    >
      <LogoMark className="w-3/5 text-crema" capo={false} />
    </span>
  )
}

export default function Logo({ className = '', inline = false, markClassName = '' }: LogoProps) {
  if (inline) {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label={NAME}>
        <LogoMark className={`w-8 h-[1.65rem] flex-shrink-0 ${markClassName}`} draw />
        <span className="leading-none whitespace-nowrap">
          <span className="font-display font-extrabold tracking-tight text-[1.06em]">I Mercati</span>{' '}
          <span className="font-display font-bold tracking-tight text-[0.92em] text-alga">della Riviera dei Fiori</span>
        </span>
      </span>
    )
  }
  return (
    <span className={`inline-flex flex-col items-start ${className}`} aria-label={NAME}>
      <LogoMark className={`w-16 h-[3.35rem] ${markClassName}`} draw />
      <span className="mt-2 leading-tight">
        <span className="block font-display font-extrabold tracking-tight text-[1.3em]">I Mercati</span>
        <span className="block font-display font-bold tracking-tight text-[0.95em] text-alga">della Riviera dei Fiori</span>
      </span>
    </span>
  )
}
