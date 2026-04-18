'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ParkingMap from '@/components/ParkingMap'
import ParkingList from '@/components/ParkingList'
import ParkingFilters, { ParkingFilter } from '@/components/ParkingFilters'
import { OliveSprig } from '@/components/decorations'

export default function ParkingPage() {
  const params = useParams<{ marketSlug: string }>()
  const slug = params?.marketSlug
  const [marketName, setMarketName] = useState<string | null>(null)
  const [marketCity, setMarketCity] = useState<string | null>(null)
  const [selectedParking, setSelectedParking] = useState<string | null>(null)
  const [filter, setFilter] = useState<ParkingFilter>({ type: 'all', crowding: 'all' })

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
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
      <div className="mb-8 border-b border-cream-300 pb-5">
        <div className="flex items-center gap-3 mb-2 text-ink-soft">
          <OliveSprig className="w-8 h-2.5 text-olive-500" />
          <p className="text-[0.72rem] uppercase tracking-widest-plus">{marketCity ?? 'Mercato'}</p>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight">
          Parcheggi {marketName ? <span className="italic font-light text-olive-600">· {marketName}</span> : ''}
        </h1>
        <p className="text-sm text-ink-soft mt-2 max-w-2xl">
          Parcheggi vicini, filtra per tipo e affluenza stimata in tempo reale.
        </p>
      </div>

      <ParkingFilters value={filter} onChange={setFilter} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ParkingMap onSelectParking={setSelectedParking} filter={filter} />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <ParkingList onSelectParking={setSelectedParking} filter={filter} />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-cream-300">
        <p className="text-xs text-ink-muted text-center max-w-3xl mx-auto">
          Dati parcheggi da Google Places. Tariffe e posti disponibili non sempre aggiornati.
          L&apos;affluenza è una stima da traffico live + giorno/ora.
        </p>
      </div>
    </div>
  )
}
