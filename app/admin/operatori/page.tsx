'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, Store, Plus, Trash2, MapPin, Send, Check, X, Search } from 'lucide-react'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false })

interface Market { id: string; slug: string; name: string; city: string; center_lat: number; center_lng: number; default_zoom: number }
interface Assign { marketId: string; lat: number | null; lng: number | null; stall: string | null }
interface Operator { id: string; name: string; category: string; description: string; email: string; linked: boolean; hasPhoto: boolean; markets: Assign[] }

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'fruit_vegetables', label: 'Frutta e verdura' },
  { value: 'food', label: 'Alimentari' },
  { value: 'meat_fish', label: 'Carne e pesce' },
  { value: 'dairy', label: 'Formaggi e latticini' },
  { value: 'bakery', label: 'Pane e forno' },
  { value: 'flowers', label: 'Fiori e piante' },
  { value: 'clothing', label: 'Abbigliamento' },
  { value: 'accessories', label: 'Accessori e pelletteria' },
  { value: 'home', label: 'Casa e casalinghi' },
  { value: 'books', label: 'Libri' },
  { value: 'other', label: 'Altro' },
]

type Editing = { id: string | null } | null

export default function AdminOperatoriPage() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  const [editing, setEditing] = useState<Editing>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('fruit_vegetables')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [assigns, setAssigns] = useState<Record<string, Assign>>({})
  const [activeMarket, setActiveMarket] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/operatori', { cache: 'no-store' })
    const { data } = await res.json()
    setMarkets(data?.markets ?? [])
    setOperators(data?.operators ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const marketById = useMemo(() => new Map(markets.map((m) => [m.id, m])), [markets])
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase()
    return n ? operators.filter((o) => o.name.toLowerCase().includes(n)) : operators
  }, [operators, q])

  function startNew() {
    setEditing({ id: null }); setName(''); setCategory('fruit_vegetables'); setDescription(''); setEmail('')
    setAssigns({}); setActiveMarket(null); setMsg(null)
  }
  function startEdit(o: Operator) {
    setEditing({ id: o.id }); setName(o.name); setCategory(o.category); setDescription(o.description); setEmail(o.email)
    const a: Record<string, Assign> = {}
    for (const m of o.markets) a[m.marketId] = m
    setAssigns(a); setActiveMarket(o.markets[0]?.marketId ?? null); setMsg(null)
  }
  function cancel() { setEditing(null); setMsg(null) }

  function toggleMarket(id: string) {
    setAssigns((prev) => {
      const next = { ...prev }
      if (next[id]) { delete next[id]; if (activeMarket === id) setActiveMarket(null) }
      else { next[id] = { marketId: id, lat: null, lng: null, stall: null }; setActiveMarket(id) }
      return next
    })
  }
  function setPos(id: string, lat: number, lng: number) {
    setAssigns((prev) => ({ ...prev, [id]: { ...prev[id], marketId: id, lat, lng } }))
  }
  function setStall(id: string, stall: string) {
    setAssigns((prev) => ({ ...prev, [id]: { ...prev[id], marketId: id, stall } }))
  }

  async function save() {
    const list = Object.values(assigns)
    if (!name.trim()) { setMsg('Il nome è obbligatorio.'); return }
    if (list.length === 0) { setMsg('Assegna almeno un mercato.'); return }
    setBusy(true); setMsg(null)
    const payload = { id: editing?.id ?? undefined, name, category, description, email, markets: list }
    const res = await fetch('/api/admin/operatori', {
      method: editing?.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const j = await res.json()
    setBusy(false)
    if (!res.ok) { setMsg(j.error ?? 'Errore'); return }
    await load()
    if (editing?.id) setMsg('Salvato.')
    else { setEditing({ id: j.id }); setMsg('Operatore creato.') }
  }

  async function remove(id: string) {
    if (!confirm('Eliminare questo operatore? L’azione non è reversibile.')) return
    setBusy(true)
    await fetch(`/api/admin/operatori?id=${id}`, { method: 'DELETE' })
    setBusy(false)
    setEditing(null)
    await load()
  }

  async function sendLink() {
    if (!editing?.id) return
    if (!email.trim()) { setMsg('Aggiungi e salva un’email prima di inviare il link.'); return }
    setBusy(true); setMsg(null)
    const res = await fetch('/api/admin/operatori/link', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId: editing.id }),
    })
    const j = await res.json()
    setBusy(false)
    setMsg(res.ok ? j.message : (j.error ?? 'Errore invio link'))
  }

  const active = activeMarket ? marketById.get(activeMarket) : null
  const activeAssign = activeMarket ? assigns[activeMarket] : null

  return (
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-6xl">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-alt font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-alga mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <div className="mb-6 border-b-2 border-ink/10 pb-4 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-alt uppercase tracking-[0.14em] text-alga-600 mb-1">I banchi di fiducia</p>
            <h1 className="font-alt font-bold text-3xl text-ink flex items-center gap-2"><Store className="w-6 h-6 text-alga" /> Gestione operatori</h1>
            <p className="text-sm text-ink-soft mt-1">Crea un operatore, assegnalo a uno o più mercati con la posizione sulla mappa, invia il link di accesso.</p>
          </div>
          <button onClick={startNew} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-alga text-white rounded-full text-sm font-alt font-semibold hover:bg-alga-600">
            <Plus className="w-4 h-4" /> Nuovo operatore
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
          {/* Elenco */}
          <div>
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca operatore…" className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
            </div>
            {loading ? (
              <p className="text-sm text-ink-muted py-8 text-center">Caricamento…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-ink-muted italic py-8 text-center">Nessun operatore{q ? ' trovato' : ' ancora. Creane uno.'}</p>
            ) : (
              <ul className="bg-white border-2 border-ink/10 rounded-xl divide-y divide-ink/10 max-h-[70vh] overflow-auto imk-scroll">
                {filtered.map((o) => (
                  <li key={o.id}>
                    <button onClick={() => startEdit(o)} className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-crema ${editing?.id === o.id ? 'bg-crema-2/40' : ''}`}>
                      <span className="min-w-0">
                        <span className="block font-alt font-semibold text-ink truncate">{o.name}</span>
                        <span className="block text-[11px] text-ink-muted">
                          {o.markets.length} mercat{o.markets.length === 1 ? 'o' : 'i'}{o.linked ? ' · accesso attivo' : o.email ? ' · invito da mandare' : ''}
                        </span>
                      </span>
                      {o.linked && <Check className="w-4 h-4 text-alga flex-shrink-0" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Editor */}
          <div>
            {!editing ? (
              <div className="bg-white border-2 border-dashed border-ink/15 rounded-xl p-10 text-center text-ink-muted text-sm">
                Scegli un operatore dall’elenco o creane uno nuovo.
              </div>
            ) : (
              <div className="bg-white border-2 border-ink/10 rounded-xl p-5 space-y-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-alt uppercase tracking-wider text-ink-muted">Nome del banco</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Da Rita — Frutta e Verdura" className="mt-1 w-full px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-alt uppercase tracking-wider text-ink-muted">Categoria</span>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga">
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-alt uppercase tracking-wider text-ink-muted">Email (per l’accesso)</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operatore@email.it" className="mt-1 w-full px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-alt uppercase tracking-wider text-ink-muted">Descrizione</span>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Cosa vende, da quanti anni, la sua specialità…" className="mt-1 w-full px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
                  </label>
                </div>

                {/* Mercati assegnati */}
                <div className="border-t-2 border-ink/10 pt-4">
                  <p className="font-alt text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Mercati (provincia di Imperia)</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {markets.map((m) => {
                      const on = !!assigns[m.id]
                      return (
                        <button key={m.id} onClick={() => toggleMarket(m.id)} className={`px-3 py-1.5 rounded-full text-xs font-alt font-semibold border-2 transition-colors ${on ? 'bg-alga text-white border-alga' : 'bg-white text-ink-soft border-ink/15 hover:border-alga'}`}>
                          {m.name}
                        </button>
                      )
                    })}
                  </div>

                  {Object.keys(assigns).length > 0 && (
                    <div className="space-y-2 mb-3">
                      {Object.values(assigns).map((a) => {
                        const m = marketById.get(a.marketId)
                        const placed = a.lat != null && a.lng != null
                        return (
                          <div key={a.marketId} className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 ${activeMarket === a.marketId ? 'border-alga bg-crema-2/30' : 'border-ink/10'}`}>
                            <span className="font-alt text-sm text-ink flex-1 min-w-0 truncate">{m?.name ?? '—'}</span>
                            <input value={a.stall ?? ''} onChange={(e) => setStall(a.marketId, e.target.value)} placeholder="banco n." className="w-20 px-2 py-1 bg-crema border-2 border-ink/15 rounded-lg text-xs focus:outline-none focus:border-alga" />
                            <button onClick={() => setActiveMarket(a.marketId)} className={`inline-flex items-center gap-1 text-xs font-alt font-semibold px-2.5 py-1 rounded-full ${placed ? 'text-alga-600 bg-alga/10' : 'text-terracotta-600 bg-terracotta/10'}`}>
                              <MapPin className="w-3.5 h-3.5" /> {placed ? 'posizionato' : 'posiziona'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {active && (
                    <div>
                      <p className="text-xs text-ink-muted mb-1.5">Clicca sulla mappa per posizionare il banco a <strong className="text-ink">{active.name}</strong> (puoi trascinare il segnaposto).</p>
                      <div className="rounded-xl overflow-hidden border-2 border-ink/10">
                        <LocationPicker
                          key={active.id}
                          center={[active.center_lat, active.center_lng]}
                          zoom={active.default_zoom ?? 16}
                          value={activeAssign?.lat != null && activeAssign?.lng != null ? [activeAssign.lat, activeAssign.lng] : null}
                          onChange={([lat, lng]) => setPos(active.id, lat, lng)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {msg && <p className="text-sm text-alga-600 bg-crema-2/40 rounded-lg px-3 py-2">{msg}</p>}

                <div className="flex flex-wrap items-center gap-2 border-t-2 border-ink/10 pt-4">
                  <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-alga text-white rounded-full text-sm font-alt font-semibold hover:bg-alga-600 disabled:opacity-50">
                    <Check className="w-4 h-4" /> {editing.id ? 'Salva modifiche' : 'Crea operatore'}
                  </button>
                  {editing.id && (
                    <button onClick={sendLink} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-terracotta text-ink rounded-full text-sm font-alt font-semibold hover:bg-terracotta-600 disabled:opacity-50">
                      <Send className="w-4 h-4" /> Invia link di accesso
                    </button>
                  )}
                  <span className="flex-1" />
                  <button onClick={cancel} className="inline-flex items-center gap-1.5 px-3 py-2 text-ink-muted hover:text-ink text-sm">
                    <X className="w-4 h-4" /> Chiudi
                  </button>
                  {editing.id && (
                    <button onClick={() => remove(editing.id!)} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2 text-terracotta-600 hover:text-terracotta text-sm">
                      <Trash2 className="w-4 h-4" /> Elimina
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
