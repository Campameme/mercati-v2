import type { Metadata } from 'next'
import MarketExplorer from '@/components/home/MarketExplorer'
import { loadPins } from '@/lib/markets/loadPins'
import PageviewTracker from '@/components/analytics/PageviewTracker'
import DriftBackdrop from '@/components/motion/DriftBackdrop'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'La mappa dei mercati',
  description:
    'Tutti i mercati settimanali della Riviera dei Fiori su una mappa interattiva: cerca per comune, giorno o prodotto e scopri orari, banchi e come arrivarci.',
}

// Token giorno per i chip rapidi della home (?d=oggi | dom…sab, JS: 0=dom … 6=sab)
const DAY_TOKEN: Record<string, number> = { dom: 0, lun: 1, mar: 2, mer: 3, gio: 4, ven: 5, sab: 6 }

export default async function MappaPage({
  searchParams,
}: {
  searchParams: { q?: string; zone?: string; d?: string; vicino?: string }
}) {
  const pins = await loadPins()
  const dTokens = (searchParams.d ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  const initialToday = dTokens.includes('oggi')
  const initialDays = dTokens.map((t) => DAY_TOKEN[t]).filter((n): n is number => n !== undefined)
  return (
    <>
      <PageviewTracker type="view_homepage" />
      {/* Cornice carta: silhouette liguri in ombra dietro a barra/lista, senza
          disturbare la mappa Leaflet (che vive in un layer opaco). */}
      <div className="relative overflow-hidden bg-carta bg-paper-grain">
        <DriftBackdrop tone="light" variant="section" />
        <div className="relative z-10">
          <MarketExplorer
            pins={pins}
            initialQuery={searchParams.q ?? ''}
            initialZone={searchParams.zone ?? 'all'}
            initialToday={initialToday}
            initialDays={initialDays}
            initialNear={searchParams.vicino === '1'}
          />
        </div>
      </div>
    </>
  )
}
