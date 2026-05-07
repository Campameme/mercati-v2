'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, MapPin, Store } from 'lucide-react'
import { useFavorites } from '@/lib/favorites'

interface MarketRef {
  slug: string
  name: string
  city: string
}

interface OperatorRef {
  id: string
  name: string
  category: string
  marketSlug: string | null
}

/**
 * Sezione "I tuoi preferiti" — appare in home solo se l'utente ha preferiti.
 * Risolve i nomi a partire dagli ID via API (lato client).
 */
export default function FavoritesSection() {
  const { state } = useFavorites()
  const [markets, setMarkets] = useState<MarketRef[]>([])
  const [operators, setOperators] = useState<OperatorRef[]>([])

  useEffect(() => {
    if (state.market.length === 0) { setMarkets([]); return }
    let cancelled = false
    ;(async () => {
      try {
        // /api/markets ritorna tutti i mercati attivi
        const r = await fetch('/api/markets')
        if (!r.ok) return
        const j = await r.json()
        if (cancelled) return
        const all = (j.data ?? []) as Array<{ slug: string; name: string; city: string }>
        const filtered = all.filter((m) => state.market.includes(m.slug))
        setMarkets(filtered)
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [state.market])

  useEffect(() => {
    if (state.operator.length === 0) { setOperators([]); return }
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/operators?all=1')
        if (!r.ok) return
        const j = await r.json()
        if (cancelled) return
        const all = (j.data ?? []) as Array<{ id: string; name: string; category: string; market: { slug: string } | null }>
        const filtered = all
          .filter((o) => state.operator.includes(o.id))
          .map((o) => ({ id: o.id, name: o.name, category: o.category, marketSlug: o.market?.slug ?? null }))
        setOperators(filtered)
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [state.operator])

  const total = markets.length + operators.length
  if (total === 0) return null

  return (
    <section className="py-10 md:py-14 border-b border-cream-300">
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <p className="text-xs uppercase tracking-widest-plus text-ink-muted">I tuoi preferiti</p>
        <span className="ml-auto text-xs text-ink-muted tabular-nums">{total}</span>
      </div>

      {markets.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-widest-plus text-ink-muted mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Zone
          </p>
          <div className="flex flex-wrap gap-2">
            {markets.map((m) => (
              <Link
                key={m.slug}
                href={`/${m.slug}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-50 border border-cream-300 hover:border-olive-500 transition-colors text-sm text-ink"
              >
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                {m.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {operators.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest-plus text-ink-muted mb-2 flex items-center gap-1">
            <Store className="w-3 h-3" /> Banchi
          </p>
          <div className="flex flex-wrap gap-2">
            {operators.map((op) => (
              <Link
                key={op.id}
                href={op.marketSlug ? `/${op.marketSlug}/operators/${op.id}` : '#'}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-50 border border-cream-300 hover:border-olive-500 transition-colors text-sm text-ink"
              >
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                {op.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
