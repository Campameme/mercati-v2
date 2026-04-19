'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Globe } from 'lucide-react'
import type { Market } from '@/types/market'
import DaySelector from '@/components/DaySelector'
import ExcelOperatorsTools from '@/components/ExcelOperatorsTools'

export default function AdminMarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<{
    slug: string; name: string; city: string; description: string;
    center_lat: string; center_lng: string; default_zoom: string; default_zoom_operators: string;
    market_days: number[]; is_active: boolean;
  }>({
    slug: '', name: '', city: '', description: '',
    center_lat: '', center_lng: '', default_zoom: '15', default_zoom_operators: '17',
    market_days: [], is_active: true,
  })
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/markets')
    const { data } = await res.json()
    setMarkets(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/markets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: form.slug,
        name: form.name,
        city: form.city,
        description: form.description || null,
        center_lat: parseFloat(form.center_lat),
        center_lng: parseFloat(form.center_lng),
        default_zoom: parseInt(form.default_zoom, 10) || 15,
        default_zoom_operators: parseInt(form.default_zoom_operators, 10) || 17,
        market_days: form.market_days,
        is_active: form.is_active,
      }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      setError(error ?? 'Errore')
      return
    }
    setShowForm(false)
    setForm({ slug: '', name: '', city: '', description: '', center_lat: '', center_lng: '', default_zoom: '15', default_zoom_operators: '17', market_days: [], is_active: true })
    load()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mercati</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" /> <span>Nuovo mercato</span>
        </button>
      </div>

      <div className="mb-6">
        <ExcelOperatorsTools />
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Slug (URL)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required placeholder="es. ventimiglia" />
            <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Città" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-700 block mb-2">Giorni di mercato</span>
              <DaySelector value={form.market_days} onChange={(market_days) => setForm({ ...form, market_days })} />
            </div>
            <Field label="Latitudine centro" value={form.center_lat} onChange={(v) => setForm({ ...form, center_lat: v })} required placeholder="43.7885" />
            <Field label="Longitudine centro" value={form.center_lng} onChange={(v) => setForm({ ...form, center_lng: v })} required placeholder="7.6065" />
            <Field label="Zoom parcheggi" value={form.default_zoom} onChange={(v) => setForm({ ...form, default_zoom: v })} placeholder="15" />
            <Field label="Zoom operatori" value={form.default_zoom_operators} onChange={(v) => setForm({ ...form, default_zoom_operators: v })} placeholder="17" />
            <label className="flex items-center space-x-2 mt-6">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <span className="text-sm">Attivo</span>
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Descrizione</span>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Crea</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-600">Caricamento…</p>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y">
          {markets.length === 0 && (
            <p className="p-6 text-center text-gray-500">Nessun mercato. Crea il primo!</p>
          )}
          {markets.map((m) => (
            <div key={m.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-semibold text-gray-900">{m.name}</h2>
                  {!m.is_active && <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">inattivo</span>}
                </div>
                <p className="text-sm text-gray-600">{m.city} • /{m.slug}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Link href={`/${m.slug}`} className="p-2 text-gray-600 hover:text-primary-600" title="Visita">
                  <Globe className="w-5 h-5" />
                </Link>
                <Link href={`/admin/markets/${m.id}`} className="p-2 text-gray-600 hover:text-primary-600" title="Modifica">
                  <Pencil className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </label>
  )
}
