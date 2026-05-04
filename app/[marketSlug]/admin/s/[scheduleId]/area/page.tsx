'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

const MarketAreaDrawer = dynamic(() => import('@/components/MarketAreaDrawer'), { ssr: false })

interface Session {
  id: string
  comune: string
  giorno: string
  luogo: string | null
  lat: number | null
  lng: number | null
  polygon_geojson: GeoJSON.Feature<GeoJSON.Polygon> | null
}

export default function AdminScheduleAreaPage() {
  const router = useRouter()
  const params = useParams<{ marketSlug: string; scheduleId: string }>()
  const slug = params?.marketSlug
  const scheduleId = params?.scheduleId

  const [session, setSession] = useState<Session | null>(null)
  const [polygon, setPolygon] = useState<GeoJSON.Feature<GeoJSON.Polygon> | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!scheduleId) return
    fetch(`/api/schedules/${scheduleId}/area`)
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setSession(j.data)
          setPolygon(j.data.polygon_geojson ?? null)
        }
      })
  }, [scheduleId])

  async function handleSave() {
    if (!scheduleId) return
    setSaving(true); setMsg(null)
    const res = await fetch(`/api/schedules/${scheduleId}/area`, {
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
    if (!confirm('Rimuovere l\'area di questa sessione?')) return
    setPolygon(null)
    setSaving(true); setMsg(null)
    const res = await fetch(`/api/schedules/${scheduleId}/area`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polygon_geojson: null }),
    })
    const j = await res.json()
    if (!res.ok) setMsg(j.error ?? 'Errore')
    else setMsg('Area rimossa.')
    setSaving(false)
  }

  if (!session) return <div className="container mx-auto px-4 py-8">Caricamento…</div>

  const center: [number, number] =
    session.lat != null && session.lng != null ? [session.lat, session.lng] : [43.9, 7.85]

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-5xl">
      <Link
        href={`/${slug}/admin/s/${scheduleId}`}
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest-plus text-ink-muted hover:text-ink mb-3 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Sessione {session.comune} · {session.giorno}
      </Link>
      <h1 className="font-serif text-3xl md:text-4xl text-ink mb-2">Area del mercato</h1>
      <p className="text-sm text-ink-soft mb-5">
        Disegna il poligono che delimita la zona del mercato per questa sessione. Verrà mostrato sulle mappe pubbliche
        (zona, comune, sessione).
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
