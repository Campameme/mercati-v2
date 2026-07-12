// Avatar duotone del banco: gradiente alga→terracotta (Mezzogiorno) con
// l'iniziale del venditore. Sostituisce le silhouette grigie / i pallini nelle
// liste inline e fa da placeholder nelle card quando manca la foto.

interface BancoAvatarProps {
  name: string
  /** dimensione in px del cerchio (default 40) */
  size?: number
  className?: string
}

/** Iniziale (prima lettera alfanumerica) del nome, in maiuscolo. */
function initialOf(name: string): string {
  const m = name.trim().match(/[\p{L}\p{N}]/u)
  return (m?.[0] ?? '·').toUpperCase()
}

/**
 * Avatar circolare duotone alga→terracotta con iniziale. Da usare nelle liste
 * inline al posto di silhouette grigie o pallini.
 */
export default function BancoAvatar({ name, size = 40, className = '' }: BancoAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-alga to-terracotta text-crema font-alt font-bold leading-none select-none ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initialOf(name)}
    </span>
  )
}

/**
 * Placeholder duotone per la testata della card (formato pieno, non
 * circolare): gradiente alga→terracotta con una grande iniziale al centro.
 */
export function BancoPlaceholder({ name, className = '' }: { name: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center bg-gradient-to-br from-alga to-terracotta ${className}`}
    >
      <span className="font-alt font-bold text-5xl text-crema/90 leading-none select-none">
        {initialOf(name)}
      </span>
    </div>
  )
}
