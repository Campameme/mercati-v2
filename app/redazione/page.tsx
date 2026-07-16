'use client'

// La redazione notizie: l'accesso a potere ridotto (ruolo news_editor, oltre al
// super admin) che carica le notizie come bozza, le prova con l'anteprima e le
// pubblica — per mercato/comune o per tutta la rete. Gate nel middleware.

import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Save, Pencil, X, Globe2, Eye, Send, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { NewsItem, NewsType, NewsPriority } from '@/types/news'

const TYPES: NewsType[] = ['schedule', 'notice', 'event', 'emergency']
const PRIORITIES: NewsPriority[] = ['low', 'medium', 'high']
const TYPE_LABEL: Record<NewsType, string> = { schedule: 'Orari', notice: 'Avviso', event: 'Evento', emergency: 'Emergenza' }
const PRIO_COLOR: Record<NewsPriority, string> = {
  low: 'bg-crema text-ink-muted border-2 border-ink/15',
  medium: 'bg-alga/15 text-alga-600 border-2 border-alga/30',
  high: 'bg-terracotta/15 text-terracotta-600 border-2 border-terracotta/30',
}

type MarketOpt = { id: string; name: string; city: string }
type Tab = 'tutte' | 'bozze' | 'pubblicate'

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

/** L'anteprima: la notizia come apparirà al pubblico su /notizie. */
function Anteprima({ n, marketLabel }: { n: Partial<NewsItem>; marketLabel: string }) {
  return (
    <div className="bg-crema rounded-xl border-2 border-dashed border-ink/20 p-5">
      <p className="text-[11px] font-alt uppercase tracking-wider text-ink-muted mb-3">Anteprima — come la vedrà chi legge</p>
      <article className="bg-white rounded-xl border border-[#e0d7c1] p-5 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-[11px] font-alt uppercase tracking-wider px-2 py-0.5 bg-crema border-2 border-ink/15 text-ink-soft rounded-full">{TYPE_LABEL[(n.type ?? 'notice') as NewsType]}</span>
          <span className="text-[11px] font-alt uppercase tracking-wider text-alga-600">{n.is_global ? 'Tutta la rete' : marketLabel}</span>
        </div>
        <h3 className="font-display font-extrabold tracking-tight text-xl text-ink">{n.title || 'Senza titolo'}</h3>
        <p className="mt-2 text-[15px] text-ink-soft leading-relaxed whitespace-pre-line">{n.content || '…'}</p>
        <p className="mt-3 text-xs text-ink-muted">
          {n.publish_from ? new Date(n.publish_from).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
        </p>
      </article>
    </div>
  )
}

export default function RedazionePage() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [markets, setMarkets] = useState<MarketOpt[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('tutte')
  const [marketFilter, setMarketFilter] = useState<string>('')
  const [editing, setEditing] = useState<Partial<NewsItem> | null>(null)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/news?all=1&admin=1')
    const { data } = await res.json()
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const supabase = createClient()
    supabase.from('markets').select('id, name, city').order('city').then(({ data }) => setMarkets((data ?? []) as MarketOpt[]))
  }, [])

  const marketLabel = (id: string | null | undefined) => {
    const m = markets.find((x) => x.id === id)
    return m ? `${m.city}` : '—'
  }

  const visible = useMemo(() => {
    let list = items
    if (tab === 'bozze') list = list.filter((n) => n.status === 'draft')
    if (tab === 'pubblicate') list = list.filter((n) => n.status !== 'draft')
    if (marketFilter === 'global') list = list.filter((n) => n.is_global)
    else if (marketFilter) list = list.filter((n) => n.market_id === marketFilter)
    return list
  }, [items, tab, marketFilter])

  const nBozze = items.filter((n) => n.status === 'draft').length

  function openNew() {
    setPreview(false)
    setError(null)
    setEditing({
      title: '', content: '',
      type: 'notice', priority: 'medium',
      is_global: false,
      market_id: marketFilter && marketFilter !== 'global' ? marketFilter : markets[0]?.id ?? null,
      status: 'draft',
      publish_from: new Date().toISOString(),
      publish_until: null,
    })
  }

  async function save(status: 'draft' | 'published') {
    if (!editing) return
    if (!editing.title?.trim() || !editing.content?.trim()) { setError('Titolo e contenuto sono obbligatori.'); return }
    if (!editing.is_global && !editing.market_id) { setError('Scegli il mercato, oppure segna la notizia per tutta la rete.'); return }
    setSaving(true)
    setError(null)
    const payload = {
      market_id: editing.is_global ? null : editing.market_id,
      is_global: !!editing.is_global,
      title: editing.title,
      content: editing.content,
      type: editing.type,
      priority: editing.priority,
      status,
      publish_from: editing.publish_from,
      publish_until: editing.publish_until,
    }
    const res = editing.id
      ? await fetch(`/api/news/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    if (res.ok) { setEditing(null); load() }
    else {
      const body = await res.json().catch(() => null)
      setError(body?.error ?? 'Salvataggio non riuscito.')
    }
  }

  async function setStatus(n: NewsItem, status: 'draft' | 'published') {
    await fetch(`/api/news/${n.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  async function remove(id: string) {
    if (!confirm('Eliminare questa notizia?')) return
    await fetch(`/api/news/${id}`, { method: 'DELETE' })
    load()
  }

  const tabCls = (active: boolean) =>
    `font-alt text-sm font-semibold px-4 py-2 rounded-full transition-colors ${active ? 'bg-alga text-crema' : 'text-ink-soft hover:text-ink'}`

  return (
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <div>
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga">La redazione</p>
            <h1 className="font-display font-extrabold tracking-tight text-3xl text-ink mt-1">Notizie dei mercati</h1>
            <p className="text-sm text-ink-soft mt-1">Scrivi in bozza, prova l’anteprima, pubblica — per mercato o per tutta la rete.</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-terracotta text-crema font-alt uppercase tracking-wider text-sm rounded-full hover:bg-terracotta-600 transition-colors">
            <Plus className="w-4 h-4" /> <span>Nuova notizia</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="inline-flex rounded-full border border-[#e0d7c1] bg-white p-1">
            <button type="button" onClick={() => setTab('tutte')} className={tabCls(tab === 'tutte')}>Tutte</button>
            <button type="button" onClick={() => setTab('bozze')} className={tabCls(tab === 'bozze')}>Bozze{nBozze > 0 ? ` · ${nBozze}` : ''}</button>
            <button type="button" onClick={() => setTab('pubblicate')} className={tabCls(tab === 'pubblicate')}>Pubblicate</button>
          </div>
          <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} className="px-3 py-2 bg-white border-2 border-ink/15 rounded-full text-sm text-ink focus:outline-none focus:border-alga transition-colors">
            <option value="">Tutti i mercati</option>
            <option value="global">Tutta la rete</option>
            {markets.map((m) => <option key={m.id} value={m.id}>{m.city} — {m.name}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="text-ink-soft">Caricamento…</p>
        ) : (
          <div className="bg-white rounded-xl border-2 border-ink/10 divide-y divide-ink/10">
            {visible.length === 0 && <p className="p-6 text-center text-ink-muted">Nessuna notizia qui.</p>}
            {visible.map((n) => {
              const now = Date.now()
              const from = new Date(n.publish_from).getTime()
              const until = n.publish_until ? new Date(n.publish_until).getTime() : Infinity
              const live = n.status !== 'draft' && from <= now && now <= until
              return (
                <div key={n.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {n.status === 'draft' ? (
                        <span className="text-[11px] font-alt uppercase tracking-wider px-2 py-0.5 rounded-full bg-limone/30 text-ink border-2 border-limone flex items-center gap-1"><FileText className="w-3 h-3" /> bozza</span>
                      ) : (
                        <span className={`text-xs ${live ? 'text-alga-600' : 'text-ink-muted'}`}>{live ? '● in pagina' : '○ programmata o scaduta'}</span>
                      )}
                      <span className="text-[11px] font-alt uppercase tracking-wider px-2 py-0.5 bg-crema border-2 border-ink/15 text-ink-soft rounded-full">{TYPE_LABEL[n.type]}</span>
                      <span className={`text-[11px] font-alt uppercase tracking-wider px-2 py-0.5 rounded-full ${PRIO_COLOR[n.priority]}`}>{n.priority}</span>
                      {n.is_global ? (
                        <span className="text-[11px] font-alt uppercase tracking-wider px-2 py-0.5 rounded-full bg-terracotta/20 text-ink border-2 border-terracotta flex items-center gap-1"><Globe2 className="w-3 h-3" /> tutta la rete</span>
                      ) : (
                        <span className="text-[11px] font-alt uppercase tracking-wider text-alga-600">{n.markets?.city ?? marketLabel(n.market_id)}</span>
                      )}
                    </div>
                    <h3 className="font-alt text-base text-ink">{n.title}</h3>
                    <p className="text-sm text-ink-soft line-clamp-2 mt-1">{n.content}</p>
                    <p className="text-xs text-ink-muted mt-2">
                      {new Date(n.publish_from).toLocaleString('it-IT')} → {n.publish_until ? new Date(n.publish_until).toLocaleString('it-IT') : 'indefinito'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {n.status === 'draft' ? (
                      <button onClick={() => setStatus(n, 'published')} className="flex items-center gap-1.5 px-3 py-1.5 bg-alga text-crema font-alt uppercase tracking-wider text-xs rounded-full hover:bg-alga-600 transition-colors" title="Pubblica"><Send className="w-3.5 h-3.5" /> Pubblica</button>
                    ) : (
                      <button onClick={() => setStatus(n, 'draft')} className="px-3 py-1.5 border-2 border-ink/15 text-ink-soft font-alt uppercase tracking-wider text-xs rounded-full hover:border-ink/30 transition-colors" title="Riporta in bozza">In bozza</button>
                    )}
                    <button onClick={() => { setPreview(false); setError(null); setEditing(n) }} className="p-2 text-ink-muted hover:text-alga-600 transition-colors" title="Modifica"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(n.id)} className="p-2 text-ink-muted hover:text-terracotta-600 transition-colors" title="Elimina"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border-2 border-ink/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b-2 border-ink/10">
                <h2 className="font-alt font-bold text-xl text-ink">{editing.id ? 'Modifica notizia' : 'Nuova notizia'}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPreview(!preview)} className={`flex items-center gap-1.5 px-3 py-1.5 font-alt uppercase tracking-wider text-xs rounded-full border-2 transition-colors ${preview ? 'bg-alga text-crema border-alga' : 'border-ink/15 text-ink-soft hover:border-ink/30'}`}>
                    <Eye className="w-3.5 h-3.5" /> Anteprima
                  </button>
                  <button onClick={() => setEditing(null)} className="text-ink-muted hover:text-ink transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>

              {preview ? (
                <div className="p-6">
                  <Anteprima n={editing} marketLabel={marketLabel(editing.market_id)} />
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                    <label className="block">
                      <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Mercato / comune</span>
                      <select
                        value={editing.is_global ? '' : editing.market_id ?? ''}
                        disabled={!!editing.is_global}
                        onChange={(e) => setEditing({ ...editing, market_id: e.target.value || null })}
                        className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors disabled:opacity-50"
                      >
                        {markets.map((m) => <option key={m.id} value={m.id}>{m.city} — {m.name}</option>)}
                      </select>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                      <input type="checkbox" checked={!!editing.is_global} onChange={(e) => setEditing({ ...editing, is_global: e.target.checked })} className="accent-alga w-4 h-4" />
                      <span className="text-sm font-alt uppercase tracking-wider text-ink flex items-center gap-1"><Globe2 className="w-4 h-4" /> Tutta la rete</span>
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Titolo</span>
                    <input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Contenuto</span>
                    <textarea value={editing.content ?? ''} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={6} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Tipo</span>
                      <select value={editing.type ?? 'notice'} onChange={(e) => setEditing({ ...editing, type: e.target.value as NewsType })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors">
                        {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Priorità</span>
                      <select value={editing.priority ?? 'medium'} onChange={(e) => setEditing({ ...editing, priority: e.target.value as NewsPriority })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors">
                        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Pubblica da</span>
                      <input type="datetime-local" value={toLocalInput(editing.publish_from)} onChange={(e) => setEditing({ ...editing, publish_from: fromLocalInput(e.target.value) ?? new Date().toISOString() })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Pubblica fino a (opz.)</span>
                      <input type="datetime-local" value={toLocalInput(editing.publish_until)} onChange={(e) => setEditing({ ...editing, publish_until: fromLocalInput(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 p-6 border-t-2 border-ink/10 bg-crema rounded-b-xl flex-wrap">
                <p className="text-xs text-terracotta-600 min-h-[1rem]">{error}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(null)} className="px-4 py-2 bg-white border-2 border-ink/15 hover:border-ink/30 text-ink-soft rounded-full transition-colors">Annulla</button>
                  <button onClick={() => save('draft')} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-alga text-alga-600 font-alt uppercase tracking-wider text-sm rounded-full hover:bg-alga/10 disabled:opacity-50 transition-colors">
                    <Save className="w-4 h-4" /> <span>Salva bozza</span>
                  </button>
                  <button onClick={() => save('published')} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-terracotta text-crema font-alt uppercase tracking-wider text-sm rounded-full hover:bg-terracotta-600 disabled:opacity-50 transition-colors">
                    <Send className="w-4 h-4" /> <span>{saving ? 'Salvo…' : 'Pubblica'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
