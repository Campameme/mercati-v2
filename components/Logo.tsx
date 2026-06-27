// Logotipo "Mercati di Ponente": wordmark grotesque + simbolo (sole che sorge
// sul mare). Il colore del testo e dell'onda eredita da `currentColor`
// (ink su chiaro, carta su scuro); il sole è sempre Sole (#F4B62C).

interface LogoProps {
  className?: string
  /** layout in linea (mark + nome su una riga) invece che impilato */
  inline?: boolean
  markClassName?: string
}

export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 44" className={className} fill="none" aria-hidden="true">
      <circle cx="30" cy="17" r="9" fill="#F4B62C" />
      <path d="M6 31 C 14 25, 22 37, 30 31 S 46 25, 54 31" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M6 38 C 14 32, 22 44, 30 38 S 46 32, 54 38" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  )
}

/** Monogramma compatto per favicon / app / social. */
export function LogoMonogram({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl bg-notte ${className}`}
      aria-label="Mercati di Ponente"
    >
      <LogoMark className="w-3/5 text-carta" />
    </span>
  )
}

export default function Logo({ className = '', inline = false, markClassName = '' }: LogoProps) {
  if (inline) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Mercati di Ponente">
        <LogoMark className={`w-7 h-5 flex-shrink-0 ${markClassName}`} />
        <span className="font-display uppercase leading-none tracking-tight">Mercati di Ponente</span>
      </span>
    )
  }
  return (
    <span className={`inline-flex flex-col items-start ${className}`} aria-label="Mercati di Ponente">
      <LogoMark className={`w-12 h-9 ${markClassName}`} />
      <span className="font-display uppercase leading-[0.9] tracking-tight mt-1.5">
        Mercati
        <br />
        di Ponente
      </span>
    </span>
  )
}
