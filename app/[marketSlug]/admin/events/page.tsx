'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft, Pencil, X, Repeat } from 'lucide-react'
import type { MarketEvent } from '@/types/event'

const CATEGORIES = ['market', 'fair', 'food', 'music', 'art', 'sport', 'other']
const CAT_LABEL: Record<string, string> = { market: 'Mercato', fair: 'Fiera', food: 'Gastronomia', music: 'Musica', art: 'Arte', sport: 'Sport', other: 'Altro' }

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function fromLocalInput(s: string): string | null {
  if (!s) return null
  return new Date(s).toISOString()
}

export default function AdminEventsPage() {
  const params = useParams<{ marketSlug: string }>()
  const slug = params?.marketSlug
  const [marketId, setMarketId] = useState<string | null>(null)
  const [items, setItems] = useState<MarketEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<MarketEvent> | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!slug) return
    setLoading(true)
    const m = await fetch(`/api/markets/by-slug/${encodeURIComponent(slug)}`).then(r => r.json())
    setMarketId(m.data?.market?.id ?? null)
    const res = await fetch(`/api/events?marketSlug=${encodeURIComponent(slug)}`)
    const { data } = await res.json()
    setItems(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [slug])

  function openNew() {
    const now = new Date(); now.setMinutes(0, 0, 0); now.setHours(now.getHours() + 1)
    const end = new Date(now); end.setHours(end.getHours() + 2)
    setEditing({
      title: '', description: '', category: 'other', location: '',
      start_at: now.toISOString(), end_at: end.toISOString(),
      is_recurring: false, recurrence_rule: null,
    })
  }

  async function save() {
    if (!editing || !marketId || !editing.start_at) return
    setSaving(true)
    const payload = {
      market_id: marketId,
      title: editing.title,
      description: editing.description,
      category: editing.category,
      location: editing.location,
      start_at: editing.start_at,
      end_at: editing.end_at,
      is_recurring: editing.is_recurring,
      recurrence_rule: editing.recurrence_rule,
    }
    const res = editing.id
      ? await fetch(`/api/events/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    if (res.ok) { setEditing(null); load() }
  }

  async function remove(id: string) {
    if (!confirm('Eliminare questo evento?')) return
    await fetch(`/api/events/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/${slug}/admin`} className="text-sm text-gray-600 hover:text-primary-600 flex items-center"><ArrowLeft className="w-4 h-4 mr-1" /> Gestione mercato</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Eventi</h1>
        </div>
        <button onClick={openNew} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          <Plus className="w-4 h-4" /> <span>Nuovo evento</span>
        </button>
      </div>

      {loading ? (
        <p>Caricamento…</p>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y">
          {items.length === 0 && <p className="p-6 text-center text-gray-500">Nessun evento.</p>}
          {items.map((e) => (
            <div key={e.id} className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded">{CAT_LABEL[e.category] ?? e.category}</span>
                  {e.is_recurring && <span className="text-xs text-gray-500 flex items-center"><Repeat className="w-3 h-3 mr-1" />ricorrente</span>}
                </div>
                <h3 className="font-semibold text-gray-900">{e.title}</h3>
                {e.description && <p className="text-sm text-gray-600 line-clamp-2 mt-1">{e.description}</p>}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(e.start_at).toLocaleString('it-IT')}{e.end_at ? ` → ${new Date(e.end_at).toLocaleString('it-IT')}` : ''}
                  {e.location ? ` • ${e.location}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setEditing(e)} className="p-2 text-gray-600 hover:text-primary-600" title="Modifica"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(e.id)} className="p-2 text-gray-600 hover:text-red-600" title="Elimina"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">{editing.id ? 'Modifica evento' : 'Nuovo evento'}</h2>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Titolo</span>
                <input value={editing.title ?? ''} onChange={(ev) => setEditing({ ...editing, title: ev.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Descrizione</span>
                <textarea value={editing.description ?? ''} onChange={(ev) => setEditing({ ...editing, description: ev.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Categoria</span>
                  <select value={editing.category ?? 'other'} onChange={(ev) => setEditing({ ...editing, category: ev.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Luogo</span>
                  <input value={editing.location ?? ''} onChange={(ev) => setEditing({ ...editing, location: ev.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Inizio</span>
                  <input type="datetime-local" value={toLocalInput(editing.start_at)} onChange={(ev) => setEditing({ ...editing, start_at: fromLocalInput(ev.target.value) ?? new Date().toISOString() })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Fine (opz.)</span>
                  <input type="datetime-local" value={toLocalInput(editing.end_at)} onChange={(ev) => setEditing({ ...editing, end_at: fromLocalInput(ev.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </label>
              </div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={editing.is_recurring ?? false} onChange={(ev) => setEditing({ ...editing, is_recurring: ev.target.checked })} />
                <span className="text-sm">Evento ricorrente</span>
              </label>
              {editing.is_recurring && (
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Regola ricorrenza (testo libero)</span>
                  <input value={editing.recurrence_rule ?? ''} onChange={(ev) => setEditing({ ...editing, recurrence_rule: ev.target.value })} placeholder="es. ogni venerdì 8:00-14:00" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </label>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t bg-gray-50 rounded-b-xl">
              <button onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">Annulla</button>
              <button onClick={save} disabled={saving} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
                <Save className="w-4 h-4" /> <span>{saving ? 'Salvo…' : 'Salva'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
