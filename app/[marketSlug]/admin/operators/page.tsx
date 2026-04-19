'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Plus, Pencil, Trash2, Mail, CheckCircle2 } from 'lucide-react'
import LocationFields from '@/components/LocationFields'
import ExcelOperatorsTools from '@/components/ExcelOperatorsTools'

interface OperatorRow {
  id: string
  name: string
  category: string
  stall_number: string | null
  user_id: string | null
}

const CATEGORIES = ['food', 'clothing', 'accessories', 'electronics', 'home', 'books', 'flowers', 'other']

export default function AdminMarketOperatorsPage() {
  const params = useParams<{ marketSlug: string }>()
  const slug = params?.marketSlug
  const [marketId, setMarketId] = useState<string | null>(null)
  const [marketCenter, setMarketCenter] = useState<[number, number] | null>(null)
  const [areaPositions, setAreaPositions] = useState<[number, number][] | null>(null)
  const [operators, setOperators] = useState<OperatorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '', category: 'food', stall_number: '', schedule_id: '',
    location_lat: null as number | null, location_lng: null as number | null,
  })
  const [sessions, setSessions] = useState<Array<{ id: string; comune: string; giorno: string; luogo: string | null; lat: number | null; lng: number | null }>>([])
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (!slug) return
    setLoading(true)
    const res = await fetch(`/api/markets/by-slug/${encodeURIComponent(slug)}`)
    const { data } = await res.json()
    setMarketId(data?.market?.id ?? null)
    if (data?.market) {
      setMarketCenter([data.market.center_lat, data.market.center_lng])
    }
    const ring = data?.area?.polygon_geojson?.geometry?.coordinates?.[0]
    setAreaPositions(Array.isArray(ring) ? ring.map((c: number[]) => [c[1], c[0]] as [number, number]) : null)

    const opsRes = await fetch(`/api/operators?marketSlug=${encodeURIComponent(slug)}`)
    const ops = await opsRes.json()
    // Public shape doesn't include user_id — do a second authenticated query via market id
    if (data?.market?.id) {
      const raw = await fetch(`/api/operators?marketSlug=${encodeURIComponent(slug)}`).then(r => r.json())
      // Public endpoint returns shaped; for admin list we use raw from operators-by-id if needed
    }
    setOperators((ops.data ?? []).map((o: any) => ({
      id: o.id,
      name: o.name,
      category: o.category,
      stall_number: o.location?.stallNumber ?? null,
      user_id: null, // filled on demand via /api/operators/[id]
    })))

    // Carica sessioni del mercato per popolare il selettore
    if (data?.market?.id) {
      const schRes = await fetch(`/api/markets/by-slug/${encodeURIComponent(slug)}`)
      // Usiamo direttamente market_schedules via supabase-js client (anon): fetch alternativo
      const schPub = await fetch(`/api/schedules/occurrences`) // solo per fallback: ritorna schedule_id nelle occorrenze
      // In realtà meglio esporre un endpoint dedicato, ma proviamo via occurrences deduplicate
      const { data: occs } = await schPub.json()
      const seen = new Map<string, { id: string; comune: string; giorno: string; luogo: string | null; lat: number | null; lng: number | null }>()
      for (const o of (occs ?? []) as any[]) {
        if (o.market_id !== data.market.id) continue
        if (!seen.has(o.schedule_id)) {
          seen.set(o.schedule_id, { id: o.schedule_id, comune: o.comune, giorno: o.giorno, luogo: o.luogo, lat: o.lat ?? null, lng: o.lng ?? null })
        }
      }
      setSessions(Array.from(seen.values()))
    }

    setLoading(false)
  }
  useEffect(() => { load() }, [slug])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!marketId) return
    const res = await fetch('/api/operators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        market_id: marketId,
        schedule_id: createForm.schedule_id || null,
        name: createForm.name,
        category: createForm.category,
        stall_number: createForm.stall_number || null,
        location_lat: createForm.location_lat,
        location_lng: createForm.location_lng,
      }),
    })
    if (!res.ok) {
      const j = await res.json()
      setError(j.error ?? 'Errore')
      return
    }
    setShowCreate(false)
    setCreateForm({ name: '', category: 'food', stall_number: '', schedule_id: '', location_lat: null, location_lng: null })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questo operatore? Anche i suoi prodotti verranno rimossi.')) return
    await fetch(`/api/operators/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/${slug}/admin`} className="text-sm text-gray-600 hover:text-primary-600">← Gestione mercato</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Operatori</h1>
        </div>
        <button onClick={() => setShowCreate((s) => !s)} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          <Plus className="w-4 h-4" /> <span>Nuovo operatore</span>
        </button>
      </div>

      <div className="mb-6">
        <ExcelOperatorsTools marketSlug={slug} onImported={load} />
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Nome</span>
            <input required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Categoria</span>
            <select value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Banco (opz.)</span>
            <input value={createForm.stall_number} onChange={(e) => setCreateForm({ ...createForm, stall_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </label>
          <label className="block md:col-span-3">
            <span className="text-sm font-medium text-gray-700">Sessione mercato (opz.)</span>
            <select
              value={createForm.schedule_id}
              onChange={(e) => {
                const scheduleId = e.target.value
                // Se sceglie una sessione e non ha ancora coord, centra sulle coord della sessione
                const s = sessions.find((x) => x.id === scheduleId)
                setCreateForm((prev) => ({
                  ...prev,
                  schedule_id: scheduleId,
                  location_lat: prev.location_lat ?? s?.lat ?? null,
                  location_lng: prev.location_lng ?? s?.lng ?? null,
                }))
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">— Tutta la zona (non legato a una sessione specifica)</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.comune} · {s.giorno}{s.luogo ? ` — ${s.luogo}` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Collega questo operatore a una sessione specifica (es. Imperia Martedì) per mostrarlo solo quando l&apos;utente apre quel mercato.
            </p>
          </label>

          {marketCenter && (
            <div className="md:col-span-3 border-t border-gray-200 pt-4">
              <LocationFields
                center={(() => {
                  // Se c'è una sessione selezionata con coord, centra lì; altrimenti centro zona
                  const s = sessions.find((x) => x.id === createForm.schedule_id)
                  if (s?.lat != null && s?.lng != null) return [s.lat, s.lng]
                  return marketCenter
                })()}
                zoom={17}
                lat={createForm.location_lat}
                lng={createForm.location_lng}
                onChange={(lat, lng) => setCreateForm({ ...createForm, location_lat: lat, location_lng: lng })}
                areaPositions={areaPositions}
                label="Posizione del banco"
                helperText="Clicca sulla mappa, trascina il marker, inserisci coord manualmente o premi Sono qui."
              />
            </div>
          )}

          {error && <p className="md:col-span-3 text-sm text-red-600">{error}</p>}
          <div className="md:col-span-3 flex justify-end space-x-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Crea</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-600">Caricamento…</p>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y">
          {operators.length === 0 && <p className="p-6 text-center text-gray-500">Nessun operatore ancora.</p>}
          {operators.map((o) => (
            <div key={o.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-semibold text-gray-900">{o.name}</h2>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{o.category}</span>
                  {o.stall_number && <span className="text-xs text-gray-500">• {o.stall_number}</span>}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Link href={`/${slug}/admin/operators/${o.id}`} className="p-2 text-gray-600 hover:text-primary-600" title="Modifica">
                  <Pencil className="w-5 h-5" />
                </Link>
                <button onClick={() => handleDelete(o.id)} className="p-2 text-gray-600 hover:text-red-600" title="Elimina">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
