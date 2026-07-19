// Skeleton dei banchi di fiducia: fondo crema coerente col resto del sito
// (Nodo × Mezzogiorno), nodo + lockup così il primo paint è già "brand".
import { LogoMark } from '@/components/Logo'

export default function Loading() {
  return (
    <div className="min-h-[100svh] bg-crema flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-ink">
        <LogoMark className="w-16 h-[3.3rem] text-ink" draw />
        <span className="text-center leading-snug">
          <span className="block font-display font-extrabold tracking-tight text-lg">I banchi di fiducia</span>
          <span className="block font-display font-bold tracking-tight text-sm text-alga">della Riviera dei Fiori</span>
        </span>
        <span className="imk-skel h-1.5 w-40" aria-hidden="true" />
        <span className="sr-only">Caricamento banchi…</span>
      </div>
    </div>
  )
}
