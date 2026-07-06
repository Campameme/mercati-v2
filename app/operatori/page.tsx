'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, CalendarDays, BadgeCheck, MessageCircle } from 'lucide-react'
import { WaveTaglia, CanopyEdge } from '@/components/decorations'
import { BancoPlaceholder } from '@/components/BancoAvatar'
import DriftBackdrop from '@/components/motion/DriftBackdrop'

interface HubOperator {
  id: string
  name: string
  category: string
  description: string
  photos: string[]
  socialLinks?: { facebook?: string; instagram?: string; website?: string; whatsapp?: string }
  rating?: number
  verified?: boolean
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

function waHref(value: string): string {
  if (/^https?:\/\//i.test(value)) return value
  return `https://wa.me/${value.replace(/[^0-9]/g, '')}`
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
    <div>
      {/* Il tendone all'ingresso: banda a righe + smerlo, come sui social */}
      <div aria-hidden="true" className="imk-awning h-2.5" />
      <CanopyEdge color="#15607C" className="h-3 md:h-3.5 -mt-px" />
      {/* Header di sezione: sfondo carta con silhouette che derivano + cartoline */}
      <section className="relative overflow-hidden bg-carta bg-paper-grain border-b-2 border-ink/10">
        <DriftBackdrop tone="light" variant="section" />
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 relative z-10">
          <div className="flex items-center gap-3 mb-2 text-ink-soft">
            <WaveTaglia className="w-8 h-2.5 text-mare" aria-hidden="true" />
            <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em]">Riviera di Ponente · la carta del banco</p>
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="font-display text-3xl md:text-5xl text-ink leading-tight">
              I banchi <span className="imk-mark text-ink">della provincia</span>
            </h1>
            {!loading && operators.length > 0 && (
              <p className="imk-cartellino imk-cartellino--r px-3.5 py-1 font-hand font-bold text-xl leading-none">
                {operators.length} banc{operators.length === 1 ? 'o' : 'hi'}
              </p>
            )}
          </div>
          <p className="text-sm text-ink-soft mt-3 max-w-xl">
            Ogni venditore della Riviera con la sua figurina e i mercati che frequenta ogni settimana.
            Filtra per zona, comune o categoria per trovare subito quello che cerchi.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
      {/* Filtri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca banco, comune…"
            aria-label="Cerca banco o comune"
            className="w-full pl-10 pr-3 py-3 bg-white border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-mare"
          />
        </div>
        <select
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value)}
          aria-label="Filtra per zona"
          className="py-3 px-3 bg-white border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-mare"
        >
          <option value="all">Tutte le zone</option>
          {markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select
          value={comuneFilter}
          onChange={(e) => setComuneFilter(e.target.value)}
          aria-label="Filtra per comune"
          className="py-3 px-3 bg-white border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-mare"
        >
          <option value="all">Tutti i comuni</option>
          {comuni.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filtra per categoria"
          className="py-3 px-3 bg-white border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-mare"
        >
          <option value="all">Tutte le categorie</option>
          {categories.map((c) => <option key={c} value={c}>{CAT_LABEL[c] ?? c}</option>)}
        </select>
      </div>

      {/* Schede operatori */}
      {loading ? (
        <p className="text-center py-12 text-ink-muted text-sm">Caricamento…</p>
      ) : filtered.length === 0 ? (
        <div className="imk-water imk-edge bg-white border-2 border-ink/10 p-10 text-center text-ink-muted max-w-lg mx-auto">
          <p className="font-accent text-2xl text-mare-600">Nessun banco, per ora</p>
          <p className="mt-1 text-sm">Nessun operatore coi filtri correnti.</p>
          {operators.length === 0 && (
            <p className="text-xs mt-2">Gli admin di zona possono aggiungere banchi dall&apos;area di gestione.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((op, i) => {
            const sessions = op.schedules ?? []
            const preview = sessions.slice(0, 3)
            const more = sessions.length - preview.length
            const href = op.market ? `/${op.market.slug}/operators/${op.id}` : '#'
            return (
              <Link
                key={op.id}
                href={href}
                className={`imk-water imk-edge imk-lift ${i % 3 === 0 ? 'imk-tilt-l' : i % 3 === 2 ? 'imk-tilt-r' : ''} group bg-white border-2 border-ink/10 overflow-hidden flex flex-col hover:border-mare transition-colors`}
              >
                {/* Testata figurina: foto o placeholder duotone mare→sole */}
                <div className="relative">
                  {op.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={op.photos[0]} alt={op.name} className="w-full h-40 object-cover" />
                  ) : (
                    <BancoPlaceholder name={op.name} className="w-full h-40 border-b-2 border-ink/10" />
                  )}
                  {op.verified && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-sole text-ink rounded-full font-alt text-[11px] font-semibold uppercase tracking-wider shadow-sm">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verificato
                    </span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display text-[1.45rem] text-ink leading-tight group-hover:text-mare-600 transition-colors">{op.name.replace(/\.+$/, '')}.</h3>
                    <span className="flex-shrink-0 font-alt text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-sole/30 text-ink rounded-full">
                      {CAT_LABEL[op.category] ?? op.category}
                    </span>
                  </div>
                  {op.market && (
                    <p className="font-alt text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">{op.market.name}</p>
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
                          <CalendarDays className="w-3.5 h-3.5 text-mare flex-shrink-0" aria-hidden="true" />
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
                  {op.socialLinks?.whatsapp && (
                    <span
                      role="link"
                      tabIndex={0}
                      aria-label={`WhatsApp — ${op.name}`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.open(waHref(op.socialLinks!.whatsapp!), '_blank', 'noopener,noreferrer')
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          e.stopPropagation()
                          window.open(waHref(op.socialLinks!.whatsapp!), '_blank', 'noopener,noreferrer')
                        }
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 self-start px-3 py-1.5 bg-[#25D366] text-white rounded-full font-alt text-[11px] font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
      </div>
    </div>
  )
}
