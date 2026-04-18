'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft, Pencil, X, Globe2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { NewsItem, NewsType, NewsPriority } from '@/types/news'
import type { UserRole } from '@/types/market'

const TYPES: NewsType[] = ['schedule', 'notice', 'event', 'emergency']
const PRIORITIES: NewsPriority[] = ['low', 'medium', 'high']
const TYPE_LABEL: Record<NewsType, string> = { schedule: 'Orari', notice: 'Avviso', event: 'Evento', emergency: 'Emergenza' }
const PRIO_COLOR: Record<NewsPriority, string> = { low: 'bg-gray-100 text-gray-700', medium: 'bg-blue-100 text-blue-700', high: 'bg-red-100 text-red-700' }

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

export default function AdminNewsPage() {
  const params = useParams<{ marketSlug: string }>()
  const slug = params?.marketSlug
  const [marketId, setMarketId] = useState<string | null>(null)
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<NewsItem> | null>(null)
  const [saving, setSaving] = useState(false)
  const [role, setRole] = useState<UserRole | null>(null)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setRole(null); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      setRole((profile?.role ?? 'citizen') as UserRole)
    })()
  }, [])

  async function load() {
    if (!slug) return
    setLoading(true)
    const m = await fetch(`/api/markets/by-slug/${encodeURIComponent(slug)}`).then(r => r.json())
    setMarketId(m.data?.market?.id ?? null)
    const res = await fetch(`/api/news?marketSlug=${encodeURIComponent(slug)}&admin=1`)
    const { data } = await res.json()
    setItems(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [slug])

  function openNew() {
    setEditing({
      title: '', content: '',
      type: 'notice', priority: 'medium',
      is_global: false,
      publish_from: new Date().toISOString(),
      publish_until: null,
    })
  }

  async function save() {
    if (!editing || !marketId) return
    setSaving(true)
    const payload = {
      market_id: editing.is_global ? null : marketId,
      is_global: !!editing.is_global,
      title: editing.title,
      content: editing.content,
      type: editing.type,
      priority: editing.priority,
      publish_from: editing.publish_from,
      publish_until: editing.publish_until,
    }
    const res = editing.id
      ? await fetch(`/api/news/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    if (res.ok) { setEditing(null); load() }
  }

  async function remove(id: string) {
    if (!confirm('Eliminare questa news?')) return
    await fetch(`/api/news/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/${slug}/admin`} className="text-sm text-gray-600 hover:text-primary-600 flex items-center"><ArrowLeft className="w-4 h-4 mr-1" /> Gestione mercato</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">News e avvisi</h1>
        </div>
        <button onClick={openNew} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          <Plus className="w-4 h-4" /> <span>Nuova news</span>
        </button>
      </div>

      {loading ? (
        <p>Caricamento…</p>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y">
          {items.length === 0 && <p className="p-6 text-center text-gray-500">Nessuna news.</p>}
          {items.map((n) => {
            const now = Date.now()
            const from = new Date(n.publish_from).getTime()
            const until = n.publish_until ? new Date(n.publish_until).getTime() : Infinity
            const live = from <= now && now <= until
            return (
              <div key={n.id} className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{TYPE_LABEL[n.type]}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${PRIO_COLOR[n.priority]}`}>{n.priority}</span>
                    {n.is_global && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Globe2 className="w-3 h-3" /> globale
                      </span>
                    )}
                    <span className={`text-xs ${live ? 'text-green-700' : 'text-gray-500'}`}>{live ? '● pubblicata' : '○ non visibile ora'}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{n.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{n.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(n.publish_from).toLocaleString('it-IT')} → {n.publish_until ? new Date(n.publish_until).toLocaleString('it-IT') : 'indefinito'}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setEditing(n)} className="p-2 text-gray-600 hover:text-primary-600" title="Modifica"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(n.id)} className="p-2 text-gray-600 hover:text-red-600" title="Elimina"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">{editing.id ? 'Modifica news' : 'Nuova news'}</h2>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {role === 'super_admin' && (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editing.is_global}
                      onChange={(e) => setEditing({ ...editing, is_global: e.target.checked })}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-sm font-semibold text-amber-900 flex items-center gap-1">
                        <Globe2 className="w-4 h-4" /> Notizia globale
                      </div>
                      <p className="text-xs text-amber-800 mt-0.5">Visibile su <b>tutti i mercati</b>. Solo super-admin.</p>
                    </div>
                  </label>
                </div>
              )}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Titolo</span>
                <input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Contenuto</span>
                <textarea value={editing.content ?? ''} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Tipo</span>
                  <select value={editing.type ?? 'notice'} onChange={(e) => setEditing({ ...editing, type: e.target.value as NewsType })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Priorità</span>
                  <select value={editing.priority ?? 'medium'} onChange={(e) => setEditing({ ...editing, priority: e.target.value as NewsPriority })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Pubblica da</span>
                  <input type="datetime-local" value={toLocalInput(editing.publish_from)} onChange={(e) => setEditing({ ...editing, publish_from: fromLocalInput(e.target.value) ?? new Date().toISOString() })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Pubblica fino a (opz.)</span>
                  <input type="datetime-local" value={toLocalInput(editing.publish_until)} onChange={(e) => setEditing({ ...editing, publish_until: fromLocalInput(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </label>
              </div>
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
