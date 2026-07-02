// Skeleton di transizione della home: fondo notte coerente con l'hero,
// emblema + wordmark così il primo paint è già "brand" (niente flash bianco).
import { LogoMark } from '@/components/Logo'

export default function Loading() {
  return (
    <div className="min-h-[100svh] bg-notte flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-paper/85">
        <LogoMark className="w-16 h-12 text-paper" />
        <span className="font-display uppercase tracking-[0.06em] text-sm text-center leading-snug">
          Mercati della
          <br />
          Riviera di Ponente
        </span>
        <span className="imk-skel h-1.5 w-40" aria-hidden="true" />
        <span className="sr-only">Caricamento…</span>
      </div>
    </div>
  )
}
