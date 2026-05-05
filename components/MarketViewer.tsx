'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import ParkingFilters, { type ParkingFilter } from '@/components/ParkingFilters'
import type { MarketPin } from '@/components/ParkingMap'

const ParkingMap = dynamic(() => import('@/components/ParkingMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-cream-50 border border-cream-300 rounded-sm flex items-center justify-center" style={{ height: 460 }}>
      <p className="text-sm text-ink-muted">Caricamento mappa…</p>
    </div>
  ),
})
const ParkingList = dynamic(() => import('@/components/ParkingList'), { ssr: false })

interface Props {
  pins: MarketPin[]
  /** Altezza mappa (default 460px) */
  mapHeight?: string
  /** Mostra il pannello laterale con la lista dei parcheggi (default true) */
  showList?: boolean
}

/**
 * Componente unificato: mappa Google con pin di uno o più mercati (luoghi precisi)
 * + poligoni area sessione + parcheggi entro 2km. Lista parcheggi a card a fianco.
 */
export default function MarketViewer({ pins, mapHeight = '460px', showList = true }: Props) {
  const [filter, setFilter] = useState<ParkingFilter>({ type: 'all', crowding: 'all' })
  const [, setSelectedParking] = useState<string | null>(null)
  const listPins = pins.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, label: p.label }))

  return (
    <div className="space-y-4">
      <ParkingFilters value={filter} onChange={setFilter} />
      <div className={showList ? 'grid grid-cols-1 lg:grid-cols-3 gap-4' : ''}>
        <div className={showList ? 'lg:col-span-2' : ''}>
          <ParkingMap
            marketPins={pins}
            onSelectParking={setSelectedParking}
            filter={filter}
            height={mapHeight}
          />
        </div>
        {showList && (
          <div className="lg:col-span-1">
            <div className="sticky top-4 max-h-[640px] overflow-y-auto">
              <ParkingList
                marketPins={listPins}
                onSelectParking={setSelectedParking}
                filter={filter}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
