'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Save, Mail, CheckCircle2 } from 'lucide-react'
import LocationFields from '@/components/LocationFields'

const CATEGORIES = ['food', 'clothing', 'accessories', 'electronics', 'home', 'books', 'flowers', 'other']

interface Operator {
  id: string
  market_id: string
  user_id: string | null
  name: string
  category: string
  description: string | null
  stall_number: string | null
  location_lat: number | null
  location_lng: number | null
  is_open: boolean
  photos: string[]
  languages: string[]
  payment_methods: string[]
  social_links: Record<string, string>
}

export default function AdminEditOperatorPage() {
  const params = useParams<{ marketSlug: string; id: string }>()
  const slug = params?.marketSlug
  const id = params?.id
  const [operator, setOperator] = useState<Operator | null>(null)
  const [market, setMarket] = useState<{ center_lat: number; center_lng: number; default_zoom: number } | null>(null)
  const [areaPositions, setAreaPositions] = useState<[number, number][] | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMsg, setInviteMsg] = useState<string | null>(null)

  async function load() {
    if (!slug || !id) return
    const m = await fetch(`/api/markets/by-slug/${encodeURIComponent(slug)}`).then(r => r.json())
    setMarket(m.data?.market)
    const ring = m.data?.area?.polygon_geojson?.geometry?.coordinates?.[0]
    setAreaPositions(Array.isArray(ring) ? ring.map((c: number[]) => [c[1], c[0]] as [number, number]) : null)

    const o = await fetch(`/api/operators/${id}`).then(r => r.json())
    setOperator(o.data)
  }
  useEffect(() => { load() }, [slug, id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!operator) return
    setSaving(true); setMsg(null)
    const res = await fetch(`/api/operators/${operator.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(operator),
    })
    const j = await res.json()
    if (!res.ok) setMsg(j.error ?? 'Errore')
    else setMsg('Salvato')
    setSaving(false)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteMsg(null)
    if (!id) return
    const res = await fetch(`/api/operators/${id}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    })
    const j = await res.json()
    if (!res.ok) setInviteMsg(j.error ?? 'Errore')
    else setInviteMsg(j.message ?? 'Invito inviato')
  }

  if (!operator || !market) return <div className="container mx-auto px-4 py-8">Caricamento…</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href={`/${slug}/admin/operators`} className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Torna agli operatori
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{operator.name}</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F label="Nome" value={operator.name} onChange={(v) => setOperator({ ...operator, name: v })} />
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Categoria</span>
            <select value={operator.category} onChange={(e) => setOperator({ ...operator, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <F label="Banco" value={operator.stall_number ?? ''} onChange={(v) => setOperator({ ...operator, stall_number: v })} />
          <label className="flex items-center space-x-2 mt-6">
            <input type="checkbox" checked={operator.is_open} onChange={(e) => setOperator({ ...operator, is_open: e.target.checked })} />
            <span className="text-sm">Aperto</span>
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Descrizione</span>
          <textarea value={operator.description ?? ''} onChange={(e) => setOperator({ ...operator, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </label>

        <LocationFields
          center={[market.center_lat, market.center_lng]}
          zoom={market.default_zoom}
          lat={operator.location_lat}
          lng={operator.location_lng}
          onChange={(lat, lng) => setOperator({ ...operator, location_lat: lat, location_lng: lng })}
          areaPositions={areaPositions}
          label="Posizione del banco"
        />

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">{msg}</div>
          <button type="submit" disabled={saving} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> <span>{saving ? 'Salvataggio…' : 'Salva'}</span>
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account operatore</h2>
        {operator.user_id ? (
          <p className="flex items-center text-green-700">
            <CheckCircle2 className="w-5 h-5 mr-2" /> Account collegato
          </p>
        ) : (
          <form onSubmit={handleInvite} className="flex items-center space-x-2">
            <input
              type="email"
              required
              placeholder="email@operatore.it"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button type="submit" className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
              <Mail className="w-4 h-4" /> <span>Invita</span>
            </button>
          </form>
        )}
        {inviteMsg && <p className="text-sm text-gray-700 mt-2">{inviteMsg}</p>}
        <p className="text-xs text-gray-500 mt-3">L&apos;operatore riceverà un&apos;email da Supabase per impostare la password e verrà collegato a questa scheda.</p>
      </div>
    </div>
  )
}

function F({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
    </label>
  )
}
