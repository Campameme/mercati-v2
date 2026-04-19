'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { OliveSprig } from '@/components/decorations'

interface HubOperator {
  id: string
  name: string
  category: string
  description: string
  location: { lat: number; lng: number; stallNumber: string }
  isOpen: boolean
  market: { id: string; slug: string; name: string; city: string } | null
}

const CAT_LABEL: Record<string, string> = {
  fruit_vegetables: 'Frutta e verdura',
  bakery: 'Panificio',
  meat_fish: 'Carne e pesce',
  dairy: 'Latticini',
  flowers: 'Fiori',
  clothing: 'Abbigliamento',
  other: 'Altro',
}

export default function OperatoriHubPage() {
  const [operators, setOperators] = useState<HubOperator[]>([])
  const [loading, setLoading] = useState(true)
  const [marketFilter, setMarketFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [q, setQ] = useState('')

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const res = await fetch('/api/operators?all=1')
      const { data } = await res.json()
      setOperators(data ?? [])
      setLoading(false)
    })()
  }, [])

  const markets = useMemo(() => {
    const m = new Map<string, { slug: string; name: string }>()
    for (const o of operators) {
      if (o.market) m.set(o.market.id, { slug: o.market.slug, name: o.market.name })
    }
    return Array.from(m.entries()).map(([id, v]) => ({ id, ...v }))
  }, [operators])

  const categories = useMemo(() => Array.from(new Set(operators.map((o) => o.category))), [operators])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return operators.filter((o) => {
      if (marketFilter !== 'all' && o.market?.id !== marketFilter) return false
      if (categoryFilter !== 'all' && o.category !== categoryFilter) return false
      if (needle && !`${o.name} ${o.description}`.toLowerCase().includes(needle)) return false
      return true
    })
  }, [operators, marketFilter, categoryFilter, q])

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
      <div className="mb-8 border-b border-cream-300 pb-6">
        <div className="flex items-center gap-3 mb-2 text-ink-soft">
          <OliveSprig className="w-8 h-2.5 text-olive-500" />
          <p className="text-[0.72rem] uppercase tracking-widest-plus">Provincia · panoramica</p>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl text-ink leading-tight">
          Banchi <span className="italic font-light text-olive-600">della provincia</span>
        </h1>
        <p className="text-sm text-ink-soft mt-3 max-w-xl">
          Tutti gli operatori, filtrabili per zona e categoria. Clicca un banco per la sua scheda.
        </p>
      </div>

      {/* Filtri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca banco…"
            className="w-full pl-9 pr-3 py-2.5 bg-cream-50 border border-cream-300 rounded-sm text-sm focus:outline-none focus:border-olive-500"
          />
        </div>
        <select
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value)}
          className="py-2.5 px-3 bg-cream-50 border border-cream-300 rounded-sm text-sm focus:outline-none focus:border-olive-500"
        >
          <option value="all">Tutte le zone</option>
          {markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="py-2.5 px-3 bg-cream-50 border border-cream-300 rounded-sm text-sm focus:outline-none focus:border-olive-500"
        >
          <option value="all">Tutte le categorie</option>
          {categories.map((c) => <option key={c} value={c}>{CAT_LABEL[c] ?? c}</option>)}
        </select>
      </div>

      {/* Lista operatori */}
      {loading ? (
        <p className="text-center py-12 text-ink-muted text-sm">Caricamento…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-cream-50 border border-cream-300 rounded-sm p-10 text-center text-ink-muted">
          Nessun operatore coi filtri correnti.
          {operators.length === 0 && (
            <p className="text-xs mt-2">Gli admin di zona possono aggiungere banchi dall&apos;area di gestione.</p>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-cream-300 border-y border-cream-300">
          {filtered.map((op) => (
            <li key={op.id}>
              <Link
                href={op.market ? `/${op.market.slug}/operators/${op.id}` : '#'}
                className="group flex items-baseline justify-between gap-4 py-4 hover:bg-cream-50 -mx-3 px-3 rounded-sm transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-lg text-ink leading-tight">{op.name}</h3>
                  {op.description && <p className="text-sm text-ink-soft mt-0.5 line-clamp-1">{op.description}</p>}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted mt-1.5">
                    <span className="uppercase tracking-wider">{CAT_LABEL[op.category] ?? op.category}</span>
                    {op.market && <span>· {op.market.name}</span>}
                    {op.location.stallNumber && <span>· Banco {op.location.stallNumber}</span>}
                  </div>
                </div>
                <span className="text-ink-muted group-hover:text-ink group-hover:translate-x-0.5 transition-all flex-shrink-0">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
