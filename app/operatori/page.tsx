'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, CalendarDays, BadgeCheck, MessageCircle, ArrowRight } from 'lucide-react'
import BancoAvatar from '@/components/BancoAvatar'
import { PostItNote } from '@/components/motion/PostItCollage'
import WaveDivider from '@/components/motion/WaveDivider'
import { useLang } from '@/lib/i18n/useLang'
import { UI_I18N } from '@/lib/i18n/ui'
import { categoryLabel } from '@/lib/i18n/home'

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

function waHref(value: string): string {
  if (/^https?:\/\//i.test(value)) return value
  return `https://wa.me/${value.replace(/[^0-9]/g, '')}`
}

export default function OperatoriHubPage() {
  const [lang] = useLang()
  const ui = UI_I18N[lang]
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
    <div className="bg-crema min-h-screen">
      {/* Filo di brand in testa: la band terracotta dei banchi */}
      <div aria-hidden="true" className="mz-band" style={{ ['--band' as string]: '#C4593C' }} />

      {/* Header racconto: eyebrow alga, titolo display, il conto dei banchi.
          Sul lato, un post-it che galleggia: il banco com'è dal vivo. */}
      <section className="relative bg-crema-2 border-b border-[#e0d7c1] overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 md:px-6 pt-12 pb-10 md:pt-16 md:pb-12 max-w-6xl">
          <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-2">{ui.operatoriEyebrow}</p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="font-display font-extrabold tracking-tight text-4xl md:text-5xl leading-[1.04] text-ink">
              {ui.operatoriTitleLead} <span className="text-terracotta">{ui.operatoriTitleAccent}</span>
            </h1>
            {!loading && operators.length > 0 && (
              <p className="font-alt text-sm font-semibold text-ink-soft">
                <span className="font-display font-extrabold tracking-tight text-2xl text-ink">{operators.length}</span>{' '}
                {operators.length === 1 ? ui.operatoriCount.one : ui.operatoriCount.many}
              </p>
            )}
          </div>
          <p className="text-base text-ink-soft mt-4 max-w-xl leading-relaxed">
            {ui.operatoriLead}
          </p>
        </div>
        <div aria-hidden="true" className="hidden lg:block absolute right-10 -bottom-9 w-44 z-0 pointer-events-none">
          <PostItNote photo={{ src: '/zone/vita-banco-ortofrutta-ombrelloni.webp', alt: '' }} tilt={4} aspect="aspect-[4/3]" />
        </div>
        <WaveDivider className="relative z-10 text-terracotta/30" />
      </section>

      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-6xl">
      {/* Filtri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ui.operatoriSearchPlaceholder}
            aria-label={ui.operatoriSearchAria}
            className="w-full pl-10 pr-3 py-3 bg-white border border-[#e0d7c1] rounded-xl text-sm focus:outline-none focus:border-alga"
          />
        </div>
        <select
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value)}
          aria-label={ui.operatoriFilterZoneAria}
          className="py-3 px-3 bg-white border border-[#e0d7c1] rounded-xl text-sm focus:outline-none focus:border-alga"
        >
          <option value="all">{ui.operatoriAllZones}</option>
          {markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select
          value={comuneFilter}
          onChange={(e) => setComuneFilter(e.target.value)}
          aria-label={ui.operatoriFilterComuneAria}
          className="py-3 px-3 bg-white border border-[#e0d7c1] rounded-xl text-sm focus:outline-none focus:border-alga"
        >
          <option value="all">{ui.operatoriAllComuni}</option>
          {comuni.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label={ui.operatoriFilterCategoryAria}
          className="py-3 px-3 bg-white border border-[#e0d7c1] rounded-xl text-sm focus:outline-none focus:border-alga"
        >
          <option value="all">{ui.operatoriAllCategories}</option>
          {categories.map((c) => <option key={c} value={c}>{categoryLabel(c, lang)}</option>)}
        </select>
      </div>

      {/* Le card dei banchi: bianche, band terracotta in testa (come in home) */}
      {loading ? (
        <p className="text-center py-12 text-ink-muted text-sm">{ui.operatoriLoading}</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e0d7c1] shadow-[0_16px_30px_-24px_rgba(38,36,30,0.45)] p-10 text-center text-ink-muted max-w-lg mx-auto">
          <p className="font-display font-extrabold tracking-tight text-xl text-alga">{ui.operatoriEmptyTitle}</p>
          <p className="mt-1 text-sm">{ui.operatoriEmptyBody}</p>
          {operators.length === 0 && (
            <p className="text-xs mt-2">{ui.operatoriEmptyAdmin}</p>
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
                className="imk-lift group flex flex-col bg-white border border-[#e0d7c1] rounded-xl overflow-hidden hover:border-terracotta transition-colors"
              >
                <span aria-hidden="true" className="mz-band" style={{ ['--band' as string]: '#C4593C' }} />
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <div className="flex items-start gap-3.5">
                    <BancoAvatar name={op.name} size={48} className="border border-[#e0d7c1]" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-extrabold tracking-tight text-lg text-ink leading-tight group-hover:text-terracotta transition-colors">
                        {op.name.replace(/\.+$/, '')}.
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="inline-block font-alt text-[11px] font-bold uppercase tracking-wide text-terracotta-600 bg-terracotta-50 rounded-full px-2 py-0.5">
                          {categoryLabel(op.category, lang)}
                        </span>
                        {op.verified && (
                          <span className="inline-flex items-center gap-1 font-alt text-[11px] font-bold uppercase tracking-wide text-alga-600 bg-alga-50 rounded-full px-2 py-0.5">
                            <BadgeCheck className="w-3 h-3" aria-hidden="true" /> {ui.operatoriVerified}
                          </span>
                        )}
                      </div>
                      {op.market && <p className="text-xs text-ink-muted mt-1 truncate">{op.market.name}</p>}
                    </div>
                    <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-terracotta group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" aria-hidden="true" />
                  </div>
                  {op.description && (
                    <p className="text-sm text-ink-soft line-clamp-2 mt-3">{op.description}</p>
                  )}
                  {/* I mercati che frequenta ogni settimana */}
                  <div className="mt-auto pt-3 space-y-1.5">
                    {preview.length === 0 ? (
                      <p className="text-xs text-ink-muted italic">{ui.operatoriNoMarkets}</p>
                    ) : (
                      preview.map((s) => (
                        <div key={s.scheduleId} className="flex items-center gap-1.5 text-xs text-ink-soft">
                          <CalendarDays className="w-3.5 h-3.5 text-alga flex-shrink-0" aria-hidden="true" />
                          <span className="truncate">
                            <strong className="text-ink">{s.comune}</strong> · {s.giorno}
                            {s.luogo && <span className="text-ink-muted"> — {s.luogo}</span>}
                          </span>
                        </div>
                      ))
                    )}
                    {more > 0 && (
                      <p className="text-xs text-ink-muted italic">
                        {(more === 1 ? ui.operatoriMoreMarkets.one : ui.operatoriMoreMarkets.many).replace('{n}', String(more))}
                      </p>
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
                      className="mt-3 inline-flex items-center gap-1.5 self-start px-3 py-1.5 bg-alga text-crema rounded-full font-alt text-[11px] font-semibold uppercase tracking-wider hover:bg-alga-600 transition-colors cursor-pointer"
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
