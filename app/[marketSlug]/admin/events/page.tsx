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
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href={`/${slug}/admin`} className="text-xs font-alt uppercase tracking-wider text-ink-muted hover:text-ink flex items-center transition-colors"><ArrowLeft className="w-4 h-4 mr-1" /> Gestione mercato</Link>
            <h1 className="font-alt font-bold text-3xl text-ink mt-1">Eventi</h1>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-alga text-white font-alt uppercase tracking-wider text-sm rounded-full hover:bg-alga-600 transition-colors">
            <Plus className="w-4 h-4" /> <span>Nuovo evento</span>
          </button>
        </div>

        {loading ? (
          <p className="text-ink-soft">Caricamento…</p>
        ) : (
          <div className="bg-white rounded-xl border-2 border-ink/10 divide-y divide-ink/10">
            {items.length === 0 && <p className="p-6 text-center text-ink-muted">Nessun evento.</p>}
            {items.map((e) => (
              <div key={e.id} className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-alt uppercase tracking-wider px-2 py-0.5 bg-alga/15 text-alga-600 rounded-full">{CAT_LABEL[e.category] ?? e.category}</span>
                    {e.is_recurring && <span className="text-xs text-ink-muted flex items-center"><Repeat className="w-3 h-3 mr-1" />ricorrente</span>}
                  </div>
                  <h3 className="font-alt text-base text-ink">{e.title}</h3>
                  {e.description && <p className="text-sm text-ink-soft line-clamp-2 mt-1">{e.description}</p>}
                  <p className="text-xs text-ink-muted mt-2">
                    {new Date(e.start_at).toLocaleString('it-IT')}{e.end_at ? ` → ${new Date(e.end_at).toLocaleString('it-IT')}` : ''}
                    {e.location ? ` • ${e.location}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setEditing(e)} className="p-2 text-ink-muted hover:text-alga-600 transition-colors" title="Modifica"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(e.id)} className="p-2 text-ink-muted hover:text-terracotta-600 transition-colors" title="Elimina"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border-2 border-ink/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b-2 border-ink/10">
                <h2 className="font-alt font-bold text-xl text-ink">{editing.id ? 'Modifica evento' : 'Nuovo evento'}</h2>
                <button onClick={() => setEditing(null)} className="text-ink-muted hover:text-ink transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <label className="block">
                  <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Titolo</span>
                  <input value={editing.title ?? ''} onChange={(ev) => setEditing({ ...editing, title: ev.target.value })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
                </label>
                <label className="block">
                  <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Descrizione</span>
                  <textarea value={editing.description ?? ''} onChange={(ev) => setEditing({ ...editing, description: ev.target.value })} rows={3} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Categoria</span>
                    <select value={editing.category ?? 'other'} onChange={(ev) => setEditing({ ...editing, category: ev.target.value })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Luogo</span>
                    <input value={editing.location ?? ''} onChange={(ev) => setEditing({ ...editing, location: ev.target.value })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Inizio</span>
                    <input type="datetime-local" value={toLocalInput(editing.start_at)} onChange={(ev) => setEditing({ ...editing, start_at: fromLocalInput(ev.target.value) ?? new Date().toISOString() })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Fine (opz.)</span>
                    <input type="datetime-local" value={toLocalInput(editing.end_at)} onChange={(ev) => setEditing({ ...editing, end_at: fromLocalInput(ev.target.value) })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
                  </label>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={editing.is_recurring ?? false} onChange={(ev) => setEditing({ ...editing, is_recurring: ev.target.checked })} className="accent-mare w-4 h-4" />
                  <span className="text-sm text-ink">Evento ricorrente</span>
                </label>
                {editing.is_recurring && (
                  <label className="block">
                    <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Regola ricorrenza (testo libero)</span>
                    <input value={editing.recurrence_rule ?? ''} onChange={(ev) => setEditing({ ...editing, recurrence_rule: ev.target.value })} placeholder="es. ogni venerdì 8:00-14:00" className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
                  </label>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 p-6 border-t-2 border-ink/10 bg-crema rounded-b-xl">
                <button onClick={() => setEditing(null)} className="px-4 py-2 bg-white border-2 border-ink/15 hover:border-ink/30 text-ink-soft rounded-full transition-colors">Annulla</button>
                <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-alga text-white font-alt uppercase tracking-wider text-sm rounded-full hover:bg-alga-600 disabled:opacity-50 transition-colors">
                  <Save className="w-4 h-4" /> <span>{saving ? 'Salvo…' : 'Salva'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
