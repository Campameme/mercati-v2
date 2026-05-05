'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import OperatorFilters from '@/components/OperatorFilters'
import UnifiedMapClient from '@/components/UnifiedMapClient'
import type { UnifiedMapPin } from '@/components/UnifiedMap'
import { Operator, OperatorCategory } from '@/types/operator'
import { OliveSprig } from '@/components/decorations'

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
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const qs = new URLSearchParams({ marketSlug: slug })
        const res = await fetch(`/api/operators?${qs.toString()}`)
        const result = await res.json()
        if (cancelled) return
        if (result.success && Array.isArray(result.data)) {
          setOperators(result.data)
        } else {
          setError(result.error || 'Errore nel caricamento operatori')
        }
      } catch (err) {
        if (!cancelled) setError('Errore nel caricamento operatori')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  const filteredOperators = useMemo(() => {
    return operators.filter((op) => {
      if (selectedCategory !== 'all' && op.category !== selectedCategory) return false
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
  }, [operators, selectedCategory, searchQuery])

  const pins = useMemo<UnifiedMapPin[]>(() => {
    return filteredOperators
      .filter((op) => op.location?.lat && op.location?.lng)
      .map((op) => ({
        id: op.id,
        lat: op.location.lat,
        lng: op.location.lng,
        kind: 'operator',
        title: op.name,
        subtitle: CAT_LABEL[op.category] ?? op.category,
        href: `/${slug}/operators/${op.id}`,
      }))
  }, [filteredOperators, slug])

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
          Esplora gli operatori, filtra per categoria e trova i tuoi banchi preferiti.
        </p>
      </div>

      <OperatorFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

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
          <div className="mb-6">
            <UnifiedMapClient pins={pins} height={500} />
          </div>

          {filteredOperators.length > 0 && (
            <div className="bg-cream-50 border border-cream-300 rounded-sm p-6">
              <h2 className="font-serif text-xl text-ink mb-4">
                Operatori ({filteredOperators.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOperators.map((op) => (
                  <Link
                    key={op.id}
                    href={`/${slug}/operators/${op.id}`}
                    className="block border border-cream-300 rounded-sm p-4 bg-white hover:border-olive-500 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="font-serif text-base text-ink leading-tight">{op.name}</div>
                    {op.description && (
                      <p className="text-sm text-ink-soft line-clamp-2 mt-1">{op.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted mt-2">
                      <span className="uppercase tracking-wider">{CAT_LABEL[op.category] ?? op.category}</span>
                      {op.location?.stallNumber && <span>· Banco {op.location.stallNumber}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
