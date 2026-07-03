import Link from 'next/link'
import { CalendarDays, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { MarketEvent } from '@/types/event'
import DriftBackdrop from '@/components/motion/DriftBackdrop'
import EventiBacheca, { BachecaEmpty } from '@/components/events/EventiBacheca'
import { SeaWaves, RivieraSun, Lemon } from '@/components/events/decorations'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Eventi — Mercati della Riviera di Ponente',
  description:
    'Fiere, sagre, gastronomia, musica e appuntamenti speciali nei mercati della provincia di Imperia. Tutti gli eventi in arrivo, in una bacheca della Riviera.',
}

export default async function EventiPage() {
  const supabase = createClient()

  // Soglia: includiamo gli eventi ancora in corso. Un evento è "passato"
  // solo quando la sua fine (end_at) — o l'inizio, se non c'è fine — è < ora.
  const now = new Date()
  const nowIso = now.toISOString()

  const { data, error } = await supabase
    .from('events')
    .select('*, markets(slug, name, city)')
    .or(`end_at.gte.${nowIso},and(end_at.is.null,start_at.gte.${nowIso})`)
    .order('start_at', { ascending: true })

  const events: MarketEvent[] = error ? [] : ((data as MarketEvent[]) ?? [])
  const total = events.length

  return (
    <div className="min-h-screen bg-carta text-ink">
      {/* ============ HEADER ============ */}
      <header className="relative overflow-hidden border-b-2 border-ink/10 bg-notte text-carta">
        <DriftBackdrop tone="dark" variant="hero" />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-notte/20 via-transparent to-notte"
          aria-hidden="true"
        />
        {/* Sole di Riviera */}
        <RivieraSun className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-sole/80 md:right-10 md:top-8 md:h-44 md:w-44" />
        {/* Limone */}
        <Lemon className="pointer-events-none absolute right-1/3 top-10 hidden h-16 w-16 rotate-12 text-sole/40 lg:block" />

        <div className="container relative z-10 mx-auto px-4 py-12 md:px-6 md:py-16">
          <Link
            href="/"
            className="imk-lift mb-6 inline-flex items-center gap-1.5 rounded-full bg-carta/10 px-3 py-1 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-carta/90 ring-1 ring-carta/20 transition-colors hover:bg-carta/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Torna alla mappa
          </Link>

          <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-sole">
            Liguria · Provincia di Imperia
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl leading-[0.95] md:text-6xl">
            La <span className="imk-mark text-carta">bacheca</span> degli eventi
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-carta/80 md:text-lg">
            Fiere, sagre, gastronomia, musica e appuntamenti speciali nei mercati del Ponente
            ligure. Tutti gli eventi in arrivo, appuntati come bigliettini.
          </p>

          {total > 0 && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-mare px-4 py-1.5 font-alt text-sm font-semibold text-white">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {total} {total === 1 ? 'evento in programma' : 'eventi in programma'}
            </p>
          )}
        </div>

        {/* Onde del mare a chiudere l'header */}
        <SeaWaves
          className="absolute bottom-0 left-0 z-10 h-4 w-[200%] text-mare/60 md:h-5"
          preserveAspectRatio="none"
        />
      </header>

      {/* ============ CONTENUTO ============ */}
      <main className="relative overflow-hidden bg-carta bg-paper-grain">
        <DriftBackdrop tone="light" variant="section" />
        <div className="container relative z-10 mx-auto px-4 py-10 md:px-6 md:py-14">
          {total === 0 ? (
            <BachecaEmpty />
          ) : (
            <EventiBacheca events={events} />
          )}

          {/* Rimando compatto al calendario (l'empty state ha già la sua CTA) */}
          {total > 0 && (
            <div className="mt-12 text-center">
              <Link
                href="/calendar"
                className="imk-lift inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-alt text-sm font-semibold text-carta transition-colors hover:bg-mare"
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Vedi il calendario completo, mese per mese
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
