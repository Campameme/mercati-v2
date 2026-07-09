'use client'

import { useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { ZONES, IMPERIA_ZONE_SLUGS } from '@/lib/markets/zones'
import { ZoneCard } from './ZoneGrid'
import { useLang } from '@/lib/i18n/useLang'

// Indice zone filtrabile per provincia, con AutoAnimate sulla griglia
// (le card entrano/escono morbide quando cambi filtro).
const IMPERIA = new Set<string>(IMPERIA_ZONE_SLUGS)
type Filter = 'all' | 'imperia' | 'savona'

const ALL_LABEL: Record<string, string> = { it: 'Tutte', fr: 'Toutes', de: 'Alle', en: 'All' }

export default function ZoneIndex() {
  const [lang] = useLang()
  const [filter, setFilter] = useState<Filter>('all')
  const [gridRef] = useAutoAnimate<HTMLDivElement>()

  const zones = ZONES.filter((z) =>
    filter === 'all' ? true : filter === 'imperia' ? IMPERIA.has(z.slug) : !IMPERIA.has(z.slug),
  )

  const tabs: { k: Filter; label: string }[] = [
    { k: 'all', label: ALL_LABEL[lang] ?? 'Tutte' },
    { k: 'imperia', label: 'Imperia' },
    { k: 'savona', label: 'Savona' },
  ]

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setFilter(t.k)}
            aria-pressed={filter === t.k}
            className={`font-alt text-sm font-semibold px-4 py-2 rounded-full border-2 transition-colors ${
              filter === t.k ? 'bg-ink text-carta border-ink' : 'bg-white text-ink border-ink/15 hover:border-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {zones.map((z) => (
          <ZoneCard key={z.slug} zone={z} />
        ))}
      </div>
    </div>
  )
}
