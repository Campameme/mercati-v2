'use client'

import UnifiedMapClient from '@/components/UnifiedMapClient'
import type { UnifiedMapPin } from '@/components/UnifiedMap'

/**
 * Pin di mercato in ingresso. Coincide col vecchio `MarketPin` ma con `kind='market'` implicito.
 * I caller passano già un `UnifiedMapPin` con kind='market'.
 */
export type MarketViewerPin = UnifiedMapPin

interface Props {
  pins: MarketViewerPin[]
  /** Altezza mappa (default 460px) */
  mapHeight?: string
}

/**
 * Mappa unificata Leaflet/OSM con pin di uno o più mercati + poligoni area + parcheggi 1.5km.
 * Niente più Google Maps. Niente più lista parcheggi separata: i pin parcheggio
 * sono cliccabili direttamente sulla mappa con popup (nome, distanza, indicazioni).
 */
export default function MarketViewer({ pins, mapHeight = '460px' }: Props) {
  return (
    <div className="space-y-3">
      <UnifiedMapClient pins={pins} showParkingNearby={true} height={mapHeight} />
    </div>
  )
}
