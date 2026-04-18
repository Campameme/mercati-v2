'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import OperatorFilters from '@/components/OperatorFilters'
import { OperatorCategory } from '@/types/operator'
import { OliveSprig } from '@/components/decorations'

const OperatorMap = dynamic(() => import('@/components/OperatorMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-cream-50 border border-cream-300 rounded-sm p-12 text-center">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-olive-500"></div>
      <p className="mt-4 text-ink-soft text-sm">Caricamento mappa…</p>
    </div>
  ),
})

export default function OperatorsPage() {
  const params = useParams<{ marketSlug: string }>()
  const slug = params?.marketSlug
  const [marketName, setMarketName] = useState<string | null>(null)
  const [marketCity, setMarketCity] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<OperatorCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

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

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-6xl">
      <div className="mb-8 border-b border-cream-300 pb-5">
        <div className="flex items-center gap-3 mb-2 text-ink-soft">
          <OliveSprig className="w-8 h-2.5 text-olive-500" />
          <p className="text-[0.72rem] uppercase tracking-widest-plus">{marketCity ?? 'Mercato'}</p>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight">
          Bancarelle {marketName ? <span className="italic font-light text-olive-600">· {marketName}</span> : ''}
        </h1>
        <p className="text-sm text-ink-soft mt-2 max-w-2xl">
          Esplora gli operatori, filtra per categoria e trova le tue bancarelle preferite.
        </p>
      </div>

      <OperatorFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <OperatorMap category={selectedCategory} searchQuery={searchQuery} />
    </div>
  )
}
