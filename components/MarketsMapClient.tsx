'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

// react-leaflet non funziona con SSR — wrapper dinamico
const MarketsMap = dynamic(() => import('./MarketsMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-sm border border-cream-300 bg-cream-50 flex items-center justify-center" style={{ height: 380 }}>
      <p className="text-xs text-ink-muted">Caricamento mappa…</p>
    </div>
  ),
})

export default function MarketsMapClient(props: ComponentProps<typeof MarketsMap>) {
  return <MarketsMap {...props} />
}
