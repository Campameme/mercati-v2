'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

const MarketAreaDrawer = dynamic(() => import('@/components/MarketAreaDrawer'), { ssr: false })

interface Place {
  id: string
  market_id: string
  comune: string
  luogo: string | null
  lat: number | null
  lng: number | null
  polygon_geojson: GeoJSON.Feature<GeoJSON.Polygon> | null
}

interface ScheduleSummary {
  id: string
  giorno: string
  orario: string | null
}

export default function AdminPlaceAreaPage() {
  const params = useParams<{ marketSlug: string; placeId: string }>()
  const slug = params?.marketSlug
  const placeId = params?.placeId

  const [place, setPlace] = useState<Place | null>(null)
  const [polygon, setPolygon] = useState<GeoJSON.Feature<GeoJSON.Polygon> | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([])

  useEffect(() => {
    if (!placeId) return
    fetch(`/api/places/${placeId}/area`)
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setPlace(j.data)
          setPolygon(j.data.polygon_geojson ?? null)
        }
      })
  }, [placeId])

  // Carica le sessioni che condividono questo place
  useEffect(() => {
    if (!place?.market_id || !placeId) return
    fetch(`/api/markets/${place.market_id}/places`)
      .then((r) => r.json())
      .then((j) => {
        const found = (j.data ?? []).find((p: any) => p.id === placeId)
        setSchedules(found?.schedules ?? [])
      })
  }, [place?.market_id, placeId])

  async function handleSave() {
    if (!placeId) return
    setSaving(true); setMsg(null)
    const res = await fetch(`/api/places/${placeId}/area`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polygon_geojson: polygon }),
    })
    const j = await res.json()
    if (!res.ok) setMsg(j.error ?? 'Errore')
    else setMsg('Area salvata.')
    setSaving(false)
  }

  async function handleClear() {
    if (!confirm('Rimuovere l\'area di questo luogo?')) return
    setPolygon(null)
    setSaving(true); setMsg(null)
    const res = await fetch(`/api/places/${placeId}/area`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polygon_geojson: null }),
    })
    const j = await res.json()
    if (!res.ok) setMsg(j.error ?? 'Errore')
    else setMsg('Area rimossa.')
    setSaving(false)
  }

  if (!place) return <div className="container mx-auto px-4 py-8">Caricamento…</div>

  const center: [number, number] =
    place.lat != null && place.lng != null ? [place.lat, place.lng] : [43.9, 7.85]

  const sharedDays = schedules.map((s) => s.giorno).filter(Boolean)

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-5xl">
      <Link
        href={`/${slug}/admin`}
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest-plus text-ink-muted hover:text-ink mb-3 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Gestione zona
      </Link>
      <h1 className="font-serif text-3xl md:text-4xl text-ink mb-2">Area del mercato</h1>
      <p className="text-sm text-ink-soft mb-2">
        {place.comune}{place.luogo ? ` · ${place.luogo}` : ''}
      </p>
      {sharedDays.length > 0 && (
        <p className="text-xs text-ink-muted mb-5">
          Quest'area è usata per: <strong className="text-ink">{sharedDays.join(', ')}</strong>
        </p>
      )}
      {sharedDays.length === 0 && (
        <p className="text-xs text-ink-muted mb-5">
          Nessuna sessione collegata a questo luogo al momento.
        </p>
      )}
      <p className="text-sm text-ink-soft mb-5 max-w-2xl">
        Disegna il poligono che delimita la zona del mercato. L'area è condivisa tra tutte le sessioni
        (giorni) di questo luogo.
      </p>

      <div className="bg-cream-50 border border-cream-300 rounded-sm p-1.5 mb-4">
        <MarketAreaDrawer
          center={center}
          zoom={17}
          initialPolygon={polygon}
          onPolygonChange={setPolygon}
        />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-ink-muted">{msg}</div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-cream-200 hover:bg-cream-300 text-ink rounded-sm text-sm"
          >
            <Trash2 className="w-3.5 h-3.5" /> Rimuovi area
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-cream-100 rounded-full text-sm hover:bg-ink/90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Salvataggio…' : 'Salva area'}
          </button>
        </div>
      </div>
    </div>
  )
}
