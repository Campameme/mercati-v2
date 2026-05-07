'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Map as MapIcon, X, Star } from 'lucide-react'
import OperatorFilters from '@/components/OperatorFilters'
import UnifiedMapClient from '@/components/UnifiedMapClient'
import FavoriteButton from '@/components/FavoriteButton'
import type { UnifiedMapPin } from '@/components/UnifiedMap'
import { Operator, OperatorCategory } from '@/types/operator'
import { OliveSprig } from '@/components/decorations'
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
      <div className="mb-8 border-b border-cream-300 pb-5">
        <div className="flex items-center gap-3 mb-2 text-ink-soft">
          <OliveSprig className="w-8 h-2.5 text-olive-500" />
          <p className="text-[0.72rem] uppercase tracking-widest-plus">{marketCity ?? 'Mercato'}</p>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight">
          Banchi {marketName ? <span className="italic font-light text-olive-600">· {marketName}</span> : ''}
        </h1>
        <p className="text-sm text-ink-soft mt-2 max-w-2xl">
          Sfoglia gli operatori. Clicca <strong>Vedi sulla mappa</strong> su uno o più banchi per
          posizionarli geograficamente, oppure aggiungili ai preferiti con la stella.
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
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
            onlyFavs ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-cream-50 border-cream-300 text-ink-soft hover:border-olive-500'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${onlyFavs ? 'fill-amber-500 text-amber-500' : ''}`} />
          Solo preferiti
        </button>
        {filteredOperators.some((op) => op.location?.lat && op.location?.lng) && (
          <button
            type="button"
            onClick={pinAllVisible}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-cream-50 border border-cream-300 text-ink-soft hover:border-olive-500 transition-colors"
          >
            <MapIcon className="w-3.5 h-3.5" />
            Mostra tutti sulla mappa
          </button>
        )}
        {showMap && (
          <button
            type="button"
            onClick={clearPinned}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-ink text-cream-100 hover:bg-ink/90"
          >
            <X className="w-3.5 h-3.5" />
            Chiudi mappa ({pins.length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-cream-50 border border-cream-300 rounded-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-olive-500"></div>
          <p className="mt-4 text-ink-soft text-sm">Caricamento operatori…</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-sm p-4">
          <p className="text-red-800 font-semibold mb-2">Errore</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      ) : (
        <>
          {showMap && (
            <div className="mb-6 rounded-sm overflow-hidden">
              <UnifiedMapClient pins={pins} height={460} />
            </div>
          )}

          {filteredOperators.length === 0 ? (
            <div className="bg-cream-50 border border-cream-300 rounded-sm p-10 text-center text-ink-muted">
              Nessun operatore con i filtri correnti.
            </div>
          ) : (
            <div className="bg-cream-50 border border-cream-300 rounded-sm p-5 md:p-6">
              <h2 className="font-serif text-xl text-ink mb-4">
                Operatori ({filteredOperators.length})
              </h2>
              <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredOperators.map((op) => {
                  const onMap = pinned.has(op.id)
                  const hasCoords = !!(op.location?.lat && op.location?.lng)
                  return (
                    <li
                      key={op.id}
                      className={`relative bg-white border rounded-sm p-4 transition-all ${
                        onMap ? 'border-olive-500 shadow-sm' : 'border-cream-300 hover:border-olive-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Link
                          href={`/${slug}/operators/${op.id}`}
                          className="min-w-0 flex-1 group"
                        >
                          <div className="font-serif text-base text-ink leading-tight group-hover:text-olive-700 transition-colors">
                            {op.name}
                          </div>
                          {op.description && (
                            <p className="text-sm text-ink-soft line-clamp-2 mt-1">{op.description}</p>
                          )}
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted mt-2">
                            <span className="uppercase tracking-wider">{CAT_LABEL[op.category] ?? op.category}</span>
                            {op.location?.stallNumber && <span>· Banco {op.location.stallNumber}</span>}
                          </div>
                        </Link>
                        <FavoriteButton kind="operator" id={op.id} label={op.name} size="sm" />
                      </div>
                      {hasCoords && (
                        <button
                          type="button"
                          onClick={() => togglePin(op.id)}
                          className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider transition-colors ${
                            onMap
                              ? 'bg-olive-600 text-cream-100 hover:bg-olive-700'
                              : 'bg-cream-100 text-ink hover:bg-cream-200 border border-cream-300'
                          }`}
                        >
                          <MapIcon className="w-3 h-3" />
                          {onMap ? 'Sulla mappa' : 'Vedi sulla mappa'}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
