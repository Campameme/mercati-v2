'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

const MarketAreaDrawer = dynamic(() => import('@/components/MarketAreaDrawer'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p className="mt-4 text-gray-600">Caricamento mappa…</p>
    </div>
  ),
})

export default function MarketAreaEditorPage() {
  const params = useParams<{ marketSlug: string }>()
  const router = useRouter()
  const [market, setMarket] = useState<{ id: string; name: string; center_lat: number; center_lng: number; default_zoom: number } | null>(null)
  const [existingPolygon, setExistingPolygon] = useState<GeoJSON.Feature<GeoJSON.Polygon> | null>(null)
  const [currentPolygon, setCurrentPolygon] = useState<GeoJSON.Feature<GeoJSON.Polygon> | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!params?.marketSlug) return
    ;(async () => {
      const res = await fetch(`/api/markets/by-slug/${encodeURIComponent(params.marketSlug)}`)
      if (!res.ok) { router.replace('/'); return }
      const { data } = await res.json()
      setMarket(data.market)
      if (data.area?.polygon_geojson) setExistingPolygon(data.area.polygon_geojson)
    })()
  }, [params?.marketSlug, router])

  async function handleSave() {
    if (!market || !currentPolygon) return
    setSaving(true); setMsg(null)
    const res = await fetch(`/api/markets/${market.id}/area`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polygon_geojson: currentPolygon }),
    })
    const j = await res.json()
    if (!res.ok) setMsg(j.error ?? 'Errore salvataggio')
    else setMsg('Area salvata')
    setSaving(false)
  }

  if (!market) return <div className="container mx-auto px-4 py-8">Caricamento…</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href={`/${params?.marketSlug}/admin`} className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Torna alla gestione
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Area del mercato</h1>
      <p className="text-gray-600 mb-6">Disegna un poligono per evidenziare l&apos;area di interesse. Usa la toolbar in alto a sinistra della mappa.</p>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <MarketAreaDrawer
          center={[market.center_lat, market.center_lng]}
          zoom={market.default_zoom}
          initialPolygon={existingPolygon}
          onPolygonChange={setCurrentPolygon}
        />
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">{msg}</div>
        <button
          onClick={handleSave}
          disabled={!currentPolygon || saving}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> <span>{saving ? 'Salvataggio…' : 'Salva area'}</span>
        </button>
      </div>
    </div>
  )
}
