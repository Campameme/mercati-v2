// Logotipo "Mercati della Riviera di Ponente": emblema vettoriale (un borgo
// dell'entroterra che si affaccia sul mare) + wordmark in Italiana.
// Identità: marittima (le onde) e dei borghi (le case). Le case e le onde
// ereditano da `currentColor` (ink su chiaro, carta su scuro); il sole è Sole.

const NAME = 'Mercati della Riviera di Ponente'

interface LogoProps {
  className?: string
  /** layout in linea (mark + nome su una riga) invece che impilato */
  inline?: boolean
  markClassName?: string
}

/** Emblema: borgo sul promontorio + mare sotto + sole. */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 50" className={className} fill="none" aria-hidden="true">
      {/* sole */}
      <circle cx="51" cy="12" r="5.5" fill="#F4B62C" />
      {/* borgo: case di altezze diverse su una base */}
      <g fill="currentColor">
        <rect x="11" y="17" width="7.5" height="13" />
        <path d="M10 17 L14.75 11 L19.5 17 Z" />
        <rect x="21" y="21" width="8.5" height="9" />
        <path d="M20 21 L25.25 15.5 L30.5 21 Z" />
        <rect x="33" y="14" width="6" height="16" />
        <path d="M32 14 L36 9 L40 14 Z" />
        {/* finestrelle (in negativo col colore del fondo non è possibile: lasciamo pieno) */}
        <rect x="8" y="30" width="34" height="2" rx="1" />
      </g>
      {/* mare: due onde sotto il borgo */}
      <path d="M5 38 C 11 34, 16 42, 22 38 S 33 34, 38 38 S 49 42, 59 37" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M5 44 C 11 40, 16 48, 22 44 S 33 40, 38 44 S 49 48, 59 43" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

/** Monogramma compatto per favicon / app / social. */
export function LogoMonogram({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl bg-notte ${className}`}
      aria-label={NAME}
    >
      <LogoMark className="w-3/5 text-carta" />
    </span>
  )
}

export default function Logo({ className = '', inline = false, markClassName = '' }: LogoProps) {
  if (inline) {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label={NAME}>
        <LogoMark className={`w-8 h-6 flex-shrink-0 ${markClassName}`} />
        <span className="font-display uppercase leading-[0.95] tracking-[0.03em] text-[0.92em]">
          Mercati della<br />Riviera di Ponente
        </span>
      </span>
    )
  }
  return (
    <span className={`inline-flex flex-col items-start ${className}`} aria-label={NAME}>
      <LogoMark className={`w-14 h-11 ${markClassName}`} />
      <span className="font-display uppercase leading-[0.95] tracking-[0.03em] mt-2">
        Mercati della
        <br />
        Riviera di Ponente
      </span>
    </span>
  )
}
