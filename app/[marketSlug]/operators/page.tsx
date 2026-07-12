'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Map as MapIcon, X, Star, BadgeCheck, MessageCircle } from 'lucide-react'
import OperatorFilters from '@/components/OperatorFilters'
import UnifiedMapClient from '@/components/UnifiedMapClient'
import FavoriteButton from '@/components/FavoriteButton'
import BancoAvatar from '@/components/BancoAvatar'
import type { UnifiedMapPin } from '@/components/UnifiedMap'
import { Operator, OperatorCategory } from '@/types/operator'
import { useFavorites } from '@/lib/favorites'

const CAT_LABEL: Record<string, string> = {
  food: 'Cibo',
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

export default function OperatorsPage() {
  const params = useParams<{ marketSlug: string }>()
  const slug = params?.marketSlug
  const [marketName, setMarketName] = useState<string | null>(null)
  const [marketCity, setMarketCity] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<OperatorCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [onlyFavs, setOnlyFavs] = useState(false)

  // Mappa: id degli operatori "fissati" sulla mappa. Vuota = nessuna mappa visibile.
  const [pinned, setPinned] = useState<Set<string>>(new Set())
  const { isFav } = useFavorites()

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/markets/by-slug/${encodeURIComponent(slug)}`)
        const { data } = await res.json()
        if (cancelled || !data?.market) return
        setMarketName(data.market.name)
        setMarketCity(data.market.city)
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [slug])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true); setError(null)
        const qs = new URLSearchParams({ marketSlug: slug })
        const res = await fetch(`/api/operators?${qs.toString()}`)
        const result = await res.json()
        if (cancelled) return
        if (result.success && Array.isArray(result.data)) setOperators(result.data)
        else setError(result.error || 'Errore nel caricamento operatori')
      } catch { if (!cancelled) setError('Errore nel caricamento operatori') }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [slug])

  const filteredOperators = useMemo(() => {
    return operators.filter((op) => {
      if (selectedCategory !== 'all' && op.category !== selectedCategory) return false
      if (onlyFavs && !isFav('operator', op.id)) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          op.name.toLowerCase().includes(q) ||
          (op.description ?? '').toLowerCase().includes(q) ||
          (op.location?.stallNumber ?? '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [operators, selectedCategory, searchQuery, onlyFavs, isFav])

  const pins = useMemo<UnifiedMapPin[]>(() => {
    return filteredOperators
      .filter((op) => pinned.has(op.id) && op.location?.lat && op.location?.lng)
      .map((op) => ({
        id: op.id,
        lat: op.location.lat,
        lng: op.location.lng,
        kind: 'operator',
        title: op.name,
        subtitle: CAT_LABEL[op.category] ?? op.category,
        href: `/${slug}/operators/${op.id}`,
      }))
  }, [filteredOperators, pinned, slug])

  function togglePin(opId: string) {
    setPinned((cur) => {
      const next = new Set(cur)
      if (next.has(opId)) next.delete(opId)
      else next.add(opId)
      return next
    })
  }

  function pinAllVisible() {
    setPinned(new Set(filteredOperators.filter((op) => op.location?.lat && op.location?.lng).map((op) => op.id)))
  }

  function clearPinned() { setPinned(new Set()) }

  const showMap = pins.length > 0

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-6xl">
      <div className="mb-8 border-b-2 border-ink/10 pb-6">
        <div className="flex items-center gap-3 mb-2 text-ink-soft">
          <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em]">{marketCity ?? 'Mercato'} · la carta del banco</p>
        </div>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-ink leading-tight">
          I banchi {marketName ? <span className="text-alga-600">di {marketName}</span> : ''}
        </h1>
        <p className="text-sm text-ink-soft mt-3 max-w-2xl">
          Sfoglia i venditori. Clicca <strong>Vedi sulla mappa</strong> su una o più figurine per
          posizionarle geograficamente, oppure aggiungile ai preferiti con la stella.
        </p>
      </div>

      <OperatorFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          type="button"
          onClick={() => setOnlyFavs((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-alt font-semibold uppercase tracking-wider border-2 transition-colors ${
            onlyFavs ? 'bg-terracotta/30 border-terracotta text-ink' : 'bg-white border-ink/15 text-ink-soft hover:border-alga'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${onlyFavs ? 'fill-terracotta text-terracotta' : ''}`} />
          Solo preferiti
        </button>
        {filteredOperators.some((op) => op.location?.lat && op.location?.lng) && (
          <button
            type="button"
            onClick={pinAllVisible}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-alt font-semibold uppercase tracking-wider bg-white border-2 border-ink/15 text-ink-soft hover:border-alga transition-colors"
          >
            <MapIcon className="w-3.5 h-3.5" />
            Mostra tutti sulla mappa
          </button>
        )}
        {showMap && (
          <button
            type="button"
            onClick={clearPinned}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-alt font-semibold uppercase tracking-wider bg-ink text-crema hover:bg-alga transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Chiudi mappa ({pins.length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white border-2 border-ink/10 rounded-xl p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-alga"></div>
          <p className="mt-4 text-ink-soft text-sm">Caricamento operatori…</p>
        </div>
      ) : error ? (
        <div className="bg-terracotta/10 border-2 border-terracotta/30 rounded-xl p-4">
          <p className="text-terracotta-600 font-semibold mb-2">Errore</p>
          <p className="text-ink-soft text-sm">{error}</p>
        </div>
      ) : (
        <>
          {showMap && (
            <div className="mb-6 rounded-xl overflow-hidden border-2 border-ink/10">
              <UnifiedMapClient pins={pins} height={460} />
            </div>
          )}

          {filteredOperators.length === 0 ? (
            <div className="bg-white border-2 border-ink/10 rounded-xl p-10 text-center text-ink-muted">
              Nessun operatore con i filtri correnti.
            </div>
          ) : (
            <>
              <h2 className="font-alt font-bold text-2xl text-ink mb-4">
                Carte del banco <span className="text-ink-muted font-sans text-base font-normal">({filteredOperators.length})</span>
              </h2>
              <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOperators.map((op) => {
                  const onMap = pinned.has(op.id)
                  const hasCoords = !!(op.location?.lat && op.location?.lng)
                  const whatsapp = op.socialLinks?.whatsapp
                  const verified = (op as { verified?: boolean }).verified === true
                  return (
                    <li
                      key={op.id}
                      className={`imk-lift relative bg-white border-2 rounded-xl p-4 transition-colors ${
                        onMap ? 'border-alga' : 'border-ink/10 hover:border-alga'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <BancoAvatar name={op.name} size={48} />
                        <Link
                          href={`/${slug}/operators/${op.id}`}
                          className="min-w-0 flex-1 group"
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-alt font-bold text-base text-ink leading-tight group-hover:text-alga-600 transition-colors">
                              {op.name}
                            </span>
                            {verified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-terracotta text-ink rounded-full font-alt text-[9px] font-semibold uppercase tracking-wider">
                                <BadgeCheck className="w-3 h-3" /> Verificato
                              </span>
                            )}
                          </div>
                          {op.description && (
                            <p className="text-sm text-ink-soft line-clamp-2 mt-1">{op.description}</p>
                          )}
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted mt-2">
                            <span className="font-alt font-semibold uppercase tracking-wider text-alga-600">{CAT_LABEL[op.category] ?? op.category}</span>
                            {op.location?.stallNumber && <span>· Banco {op.location.stallNumber}</span>}
                          </div>
                        </Link>
                        <FavoriteButton kind="operator" id={op.id} label={op.name} size="sm" />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {hasCoords && (
                          <button
                            type="button"
                            onClick={() => togglePin(op.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-alt font-semibold uppercase tracking-wider transition-colors ${
                              onMap
                                ? 'bg-alga text-white hover:bg-alga-600'
                                : 'bg-crema text-ink hover:bg-crema-2 border border-ink/10'
                            }`}
                          >
                            <MapIcon className="w-3 h-3" />
                            {onMap ? 'Sulla mappa' : 'Vedi sulla mappa'}
                          </button>
                        )}
                        {whatsapp && (
                          <a
                            href={waHref(whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`WhatsApp — ${op.name}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-alt font-semibold uppercase tracking-wider bg-[#25D366] text-white hover:opacity-90 transition-opacity"
                          >
                            <MessageCircle className="w-3 h-3" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  )
}
