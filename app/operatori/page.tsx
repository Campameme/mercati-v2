'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, CalendarDays } from 'lucide-react'
import { OliveSprig } from '@/components/decorations'

interface HubOperator {
  id: string
  name: string
  category: string
  description: string
  photos: string[]
  location: { lat: number; lng: number; stallNumber: string }
  market: { id: string; slug: string; name: string; city: string } | null
  schedules: Array<{
    scheduleId: string
    comune: string
    giorno: string
    luogo: string | null
    stallNumber: string | null
    lat: number | null
    lng: number | null
  }>
}

const CAT_LABEL: Record<string, string> = {
  food: 'Alimentare',
  clothing: 'Abbigliamento',
  accessories: 'Accessori',
  electronics: 'Elettronica',
  home: 'Casa',
  books: 'Libri',
  flowers: 'Fiori',
  other: 'Altro',
  fruit_vegetables: 'Frutta e verdura',
  bakery: 'Panificio',
  meat_fish: 'Carne e pesce',
  dairy: 'Latticini',
}

export default function OperatoriHubPage() {
  const [operators, setOperators] = useState<HubOperator[]>([])
  const [loading, setLoading] = useState(true)
  const [marketFilter, setMarketFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [comuneFilter, setComuneFilter] = useState<string>('all')
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
    return Array.from(m.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [operators])

  const comuni = useMemo(() => {
    const set = new Set<string>()
    for (const o of operators) for (const s of o.schedules ?? []) if (s.comune) set.add(s.comune)
    return Array.from(set).sort()
  }, [operators])

  const categories = useMemo(() => Array.from(new Set(operators.map((o) => o.category))), [operators])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return operators.filter((o) => {
      if (marketFilter !== 'all' && o.market?.id !== marketFilter) return false
      if (categoryFilter !== 'all' && o.category !== categoryFilter) return false
      if (comuneFilter !== 'all' && !(o.schedules ?? []).some((s) => s.comune === comuneFilter)) return false
      if (needle) {
        const hay = `${o.name} ${o.description} ${(o.schedules ?? []).map((s) => s.comune).join(' ')}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
  }, [operators, marketFilter, categoryFilter, comuneFilter, q])

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
      <div className="mb-8 border-b border-cream-300 pb-6">
        <div className="flex items-center gap-3 mb-2 text-ink-soft">
          <OliveSprig className="w-8 h-2.5 text-olive-500" />
          <p className="text-[0.72rem] uppercase tracking-widest-plus">Provincia · panoramica</p>
        </div>
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h1 className="font-serif text-3xl md:text-5xl text-ink leading-tight">
            Banchi <span className="italic font-light text-olive-600">della provincia</span>
          </h1>
          <p className="text-xs text-ink-muted tabular-nums">
            {operators.length} operator{operators.length === 1 ? 'e' : 'i'}
          </p>
        </div>
        <p className="text-sm text-ink-soft mt-3 max-w-xl">
          Tutti gli operatori del territorio, con la lista dei mercati che frequentano ogni settimana.
          Filtra per zona, comune o categoria per trovare subito quello che cerchi.
        </p>
      </div>

      {/* Filtri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca banco, comune…"
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
          value={comuneFilter}
          onChange={(e) => setComuneFilter(e.target.value)}
          className="py-2.5 px-3 bg-cream-50 border border-cream-300 rounded-sm text-sm focus:outline-none focus:border-olive-500"
        >
          <option value="all">Tutti i comuni</option>
          {comuni.map((c) => <option key={c} value={c}>{c}</option>)}
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

      {/* Schede operatori */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((op) => {
            const sessions = op.schedules ?? []
            const preview = sessions.slice(0, 3)
            const more = sessions.length - preview.length
            const href = op.market ? `/${op.market.slug}/operators/${op.id}` : '#'
            return (
              <Link
                key={op.id}
                href={href}
                className="group bg-cream-50 border border-cream-300 rounded-sm overflow-hidden flex flex-col hover:border-olive-500 hover:-translate-y-0.5 transition-all"
              >
                {op.photos?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={op.photos[0]} alt={op.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-cream-100 border-b border-cream-300 flex items-center justify-center">
                    <OliveSprig className="w-12 h-4 text-olive-300" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-serif text-xl text-ink leading-tight group-hover:text-olive-700 transition-colors">{op.name}</h3>
                    <span className="flex-shrink-0 text-[10px] uppercase tracking-wider px-2 py-0.5 bg-cream-200 text-ink rounded-sm">
                      {CAT_LABEL[op.category] ?? op.category}
                    </span>
                  </div>
                  {op.market && (
                    <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">{op.market.name}</p>
                  )}
                  {op.description && (
                    <p className="text-sm text-ink-soft line-clamp-2 mb-3">{op.description}</p>
                  )}
                  <div className="mt-auto space-y-1.5">
                    {preview.length === 0 ? (
                      <p className="text-xs text-ink-muted italic">Nessun mercato configurato</p>
                    ) : (
                      preview.map((s) => (
                        <div key={s.scheduleId} className="flex items-center gap-1.5 text-xs text-ink-soft">
                          <CalendarDays className="w-3 h-3 text-olive-500 flex-shrink-0" />
                          <span className="truncate">
                            <strong className="text-ink">{s.comune}</strong> · {s.giorno}
                            {s.luogo && <span className="text-ink-muted"> — {s.luogo}</span>}
                          </span>
                        </div>
                      ))
                    )}
                    {more > 0 && (
                      <p className="text-xs text-ink-muted italic">+ altri {more} mercat{more === 1 ? 'o' : 'i'}</p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
