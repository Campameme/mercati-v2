'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Save, Trash2, UserPlus, ArrowLeft } from 'lucide-react'
import type { Market } from '@/types/market'
import DaySelector from '@/components/DaySelector'

export default function AdminMarketEditPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [market, setMarket] = useState<Market | null>(null)
  const [admins, setAdmins] = useState<Array<{ user_id: string; profiles: { full_name: string | null } | null }>>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMsg, setInviteMsg] = useState<string | null>(null)

  async function load() {
    const [m, a] = await Promise.all([
      fetch(`/api/markets/${id}`).then((r) => r.json()),
      fetch(`/api/markets/${id}/admins`).then((r) => r.json()),
    ])
    setMarket(m.data)
    setAdmins(a.data ?? [])
  }
  useEffect(() => { if (id) load() }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!market) return
    setSaving(true); setError(null)
    const res = await fetch(`/api/markets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(market),
    })
    if (!res.ok) {
      const { error } = await res.json()
      setError(error ?? 'Errore nel salvataggio')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Sicuro di voler eliminare questo mercato? Tutti i dati collegati verranno rimossi.')) return
    await fetch(`/api/markets/${id}`, { method: 'DELETE' })
    window.location.href = '/admin/markets'
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteMsg(null)
    const res = await fetch(`/api/markets/${id}/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    })
    const j = await res.json()
    if (!res.ok) { setInviteMsg(j.error ?? 'Errore'); return }
    setInviteEmail('')
    setInviteMsg('Admin assegnato')
    load()
  }

  async function handleRemoveAdmin(userId: string) {
    await fetch(`/api/markets/${id}/admins?user_id=${encodeURIComponent(userId)}`, { method: 'DELETE' })
    load()
  }

  if (!market) return <div className="container mx-auto px-4 py-8">Caricamento…</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/admin/markets" className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Torna ai mercati
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">{market.name}</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F label="Slug" value={market.slug} onChange={(v) => setMarket({ ...market, slug: v })} />
          <F label="Nome" value={market.name} onChange={(v) => setMarket({ ...market, name: v })} />
          <F label="Città" value={market.city} onChange={(v) => setMarket({ ...market, city: v })} />
          <div className="md:col-span-2">
            <span className="text-sm font-medium text-gray-700 block mb-2">Giorni di mercato</span>
            <DaySelector value={market.market_days ?? []} onChange={(market_days) => setMarket({ ...market, market_days })} />
          </div>
          <F label="Latitudine" value={market.center_lat.toString()} onChange={(v) => setMarket({ ...market, center_lat: parseFloat(v) || 0 })} />
          <F label="Longitudine" value={market.center_lng.toString()} onChange={(v) => setMarket({ ...market, center_lng: parseFloat(v) || 0 })} />
          <F label="Zoom parcheggi" value={market.default_zoom.toString()} onChange={(v) => setMarket({ ...market, default_zoom: parseInt(v, 10) || 15 })} />
          <F label="Zoom operatori" value={(market.default_zoom_operators ?? 17).toString()} onChange={(v) => setMarket({ ...market, default_zoom_operators: parseInt(v, 10) || 17 })} />
          <label className="flex items-center space-x-2 mt-6">
            <input type="checkbox" checked={market.is_active} onChange={(e) => setMarket({ ...market, is_active: e.target.checked })} />
            <span className="text-sm">Attivo</span>
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Descrizione</span>
          <textarea value={market.description ?? ''} onChange={(e) => setMarket({ ...market, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-between">
          <button type="button" onClick={handleDelete} className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100">
            <Trash2 className="w-4 h-4" /> <span>Elimina</span>
          </button>
          <button type="submit" disabled={saving} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> <span>{saving ? 'Salvataggio…' : 'Salva'}</span>
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Amministratori del mercato</h2>
        <form onSubmit={handleInvite} className="flex items-center space-x-2 mb-4">
          <input
            type="email"
            required
            placeholder="email@utente.it (deve essere già registrato)"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button type="submit" className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            <UserPlus className="w-4 h-4" /> <span>Aggiungi</span>
          </button>
        </form>
        {inviteMsg && <p className="text-sm text-gray-700 mb-2">{inviteMsg}</p>}
        <ul className="divide-y">
          {admins.map((a) => (
            <li key={a.user_id} className="py-2 flex items-center justify-between">
              <span className="text-sm text-gray-800">{a.profiles?.full_name ?? a.user_id}</span>
              <button onClick={() => handleRemoveAdmin(a.user_id)} className="text-sm text-red-600 hover:underline">rimuovi</button>
            </li>
          ))}
          {admins.length === 0 && <li className="py-2 text-sm text-gray-500">Nessun admin assegnato</li>}
        </ul>
        <p className="text-xs text-gray-500 mt-3">Gli utenti devono registrarsi su <code>/login</code> prima di poter essere nominati admin.</p>
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
