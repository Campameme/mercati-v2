import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ZoneIndex from '@/components/home/ZoneIndex'

export const metadata: Metadata = {
  title: 'Le zone della Riviera',
  description:
    'Le zone dei mercati della Riviera di Ponente, da Ventimiglia a Varazze: scegli la tua e scopri giorni, banchi e comuni di ogni mercato.',
}

export default function ZonePage() {
  return (
    <div className="bg-carta min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl py-10 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-mare-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Homepage
        </Link>
        <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-2">Da Ventimiglia a Varazze</p>
        <h1 className="font-display text-4xl md:text-6xl text-ink leading-[1.02] mb-3">Le zone della Riviera</h1>
        <p className="text-base md:text-lg text-ink-soft max-w-2xl mb-9">
          Tratti di costa e di entroterra, ognuno con i suoi mercati e i suoi giorni. Scegli la tua zona e scopri dove e quando.
        </p>
        <ZoneIndex />
      </div>
    </div>
  )
}
