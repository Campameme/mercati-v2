'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Ticket, Plus, Search, Check, X, Wallet, Gift } from 'lucide-react'

interface UserRow { id: string; email: string; balance: number; activeCoupons: number; createdAt: string }
interface Coupon { id: string; user_id: string; code: string; label: string; status: string; created_at: string }
interface OperatorRow { id: string; name: string; market: string | null; budget: number }
interface RewardRow { id: string; label: string; description: string | null; cost_points: number; stock: number | null; is_active: boolean }

export default function AdminTesseraPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [operators, setOperators] = useState<OperatorRow[]>([])
  const [rewards, setRewards] = useState<RewardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<UserRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // form
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')
  const [couponLabel, setCouponLabel] = useState('')
  const [opQ, setOpQ] = useState('')
  const [rechargeById, setRechargeById] = useState<Record<string, string>>({})
  const [rw, setRw] = useState({ label: '', description: '', cost_points: '', stock: '' })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/tessera', { cache: 'no-store' })
    const { data } = await res.json()
    setUsers(data?.users ?? [])
    setCoupons(data?.coupons ?? [])
    setOperators(data?.operators ?? [])
    setRewards(data?.rewards ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filteredOps = useMemo(() => {
    const n = opQ.trim().toLowerCase()
    return n ? operators.filter((o) => o.name.toLowerCase().includes(n) || (o.market ?? '').toLowerCase().includes(n)) : operators
  }, [operators, opQ])

  async function recharge(operatorId: string) {
    const val = rechargeById[operatorId]
    if (!val) return
    setBusy(true)
    const res = await fetch('/api/admin/tessera', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recharge', operatorId, points: Number(val) }),
    })
    setBusy(false)
    if (res.ok) { setRechargeById((m) => ({ ...m, [operatorId]: '' })); load() }
  }

  async function createReward() {
    if (!rw.label.trim() || !rw.cost_points) return
    setBusy(true)
    const res = await fetch('/api/admin/tessera', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reward', label: rw.label, description: rw.description, cost_points: Number(rw.cost_points), stock: rw.stock === '' ? null : Number(rw.stock) }),
    })
    setBusy(false)
    if (res.ok) { setRw({ label: '', description: '', cost_points: '', stock: '' }); load() }
  }

  async function toggleReward(rewardId: string, is_active: boolean) {
    setBusy(true)
    await fetch('/api/admin/tessera', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rewardId, is_active }) })
    setBusy(false)
    load()
  }

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase()
    return n ? users.filter((u) => u.email.toLowerCase().includes(n)) : users
  }, [users, q])

  const selCoupons = useMemo(() => coupons.filter((c) => c.user_id === selected?.id), [coupons, selected])

  async function assignPoints() {
    if (!selected || !points) return
    setBusy(true); setMsg(null)
    const res = await fetch('/api/admin/tessera', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'points', userId: selected.id, points: Number(points), reason }),
    })
    const j = await res.json()
    setBusy(false)
    if (!res.ok) { setMsg(j.error ?? 'Errore'); return }
    setPoints(''); setReason(''); setMsg('Punti assegnati.')
    await load()
    setSelected((s) => s && { ...s, balance: s.balance + Number(points) })
  }

  async function issueCoupon() {
    if (!selected || !couponLabel.trim()) return
    setBusy(true); setMsg(null)
    const res = await fetch('/api/admin/tessera', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'coupon', userId: selected.id, label: couponLabel }),
    })
    const j = await res.json()
    setBusy(false)
    if (!res.ok) { setMsg(j.error ?? 'Errore'); return }
    setCouponLabel(''); setMsg(`Coupon emesso: ${j.code}`)
    await load()
  }

  async function setCouponStatus(couponId: string, status: string) {
    setBusy(true)
    await fetch('/api/admin/tessera', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponId, status }),
    })
    setBusy(false)
    await load()
  }

  return (
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-6xl">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-alt font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-alga mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <div className="mb-6 border-b-2 border-ink/10 pb-4">
          <p className="text-xs font-alt uppercase tracking-[0.14em] text-alga-600 mb-1">Tessera del mercato</p>
          <h1 className="font-alt font-bold text-3xl text-ink flex items-center gap-2"><Ticket className="w-6 h-6 text-alga" /> Punti e coupon</h1>
          <p className="text-sm text-ink-soft mt-1">I punti raccolti da ogni iscritto. Assegna punti, emetti o annulla coupon.</p>
        </div>

        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
          {/* Elenco utenti */}
          <div>
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca per email…" className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
            </div>
            {loading ? (
              <p className="text-sm text-ink-muted py-8 text-center">Caricamento…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-ink-muted italic py-8 text-center">Nessun iscritto{q ? ' con questa email' : ' ancora'}.</p>
            ) : (
              <ul className="bg-white border-2 border-ink/10 rounded-xl divide-y divide-ink/10 max-h-[70vh] overflow-auto imk-scroll">
                {filtered.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => { setSelected(u); setMsg(null) }}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-crema transition-colors ${selected?.id === u.id ? 'bg-crema-2/40' : ''}`}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm text-ink truncate">{u.email}</span>
                        {u.activeCoupons > 0 && <span className="block text-[11px] text-ink-muted">{u.activeCoupons} coupon attiv{u.activeCoupons === 1 ? 'o' : 'i'}</span>}
                      </span>
                      <span className="font-alt font-bold text-2xl text-alga-600 leading-none flex-shrink-0">{u.balance}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pannello azioni */}
          <div>
            {!selected ? (
              <div className="bg-white border-2 border-dashed border-ink/15 rounded-xl p-8 text-center text-ink-muted text-sm">
                Scegli un iscritto per gestire punti e coupon.
              </div>
            ) : (
              <div className="bg-white border-2 border-ink/10 rounded-xl p-5 space-y-5">
                <div>
                  <p className="text-sm text-ink truncate">{selected.email}</p>
                  <p className="font-alt font-bold text-4xl text-alga-600 leading-none mt-1">{selected.balance} <span className="font-alt text-xs uppercase tracking-wider text-ink-muted">punti</span></p>
                </div>

                {msg && <p className="text-sm text-alga-600 bg-crema-2/40 rounded-lg px-3 py-2">{msg}</p>}

                {/* Assegna punti */}
                <div className="border-t-2 border-ink/10 pt-4">
                  <p className="font-alt text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Assegna punti</p>
                  <div className="flex gap-2">
                    <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="±punti" className="w-24 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
                    <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Causale (es. spesa di sabato)" className="flex-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
                  </div>
                  <button onClick={assignPoints} disabled={busy || !points} className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-alga text-white rounded-full text-sm font-alt font-semibold hover:bg-alga-600 disabled:opacity-50">
                    <Plus className="w-4 h-4" /> Aggiungi al saldo
                  </button>
                </div>

                {/* Emetti coupon */}
                <div className="border-t-2 border-ink/10 pt-4">
                  <p className="font-alt text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Emetti un coupon</p>
                  <input value={couponLabel} onChange={(e) => setCouponLabel(e.target.value)} placeholder="Es. −10% dal banco di Rita" className="w-full px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
                  <button onClick={issueCoupon} disabled={busy || !couponLabel.trim()} className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-terracotta text-ink rounded-full text-sm font-alt font-semibold hover:bg-terracotta-600 disabled:opacity-50">
                    <Ticket className="w-4 h-4" /> Emetti (codice automatico)
                  </button>
                </div>

                {/* Coupon esistenti */}
                {selCoupons.length > 0 && (
                  <div className="border-t-2 border-ink/10 pt-4 space-y-2">
                    <p className="font-alt text-xs font-semibold uppercase tracking-wider text-ink-muted">Coupon</p>
                    {selCoupons.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="min-w-0">
                          <span className="block text-ink truncate">{c.label}</span>
                          <span className="font-alt text-lg text-alga-600 leading-none">{c.code}</span>
                        </span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                          {c.status === 'active' ? (
                            <>
                              <button onClick={() => setCouponStatus(c.id, 'used')} title="Segna usato" className="p-1.5 rounded-full bg-alga/10 text-alga-600 hover:bg-alga/20"><Check className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setCouponStatus(c.id, 'void')} title="Annulla" className="p-1.5 rounded-full bg-terracotta/10 text-terracotta-600 hover:bg-terracotta/20"><X className="w-3.5 h-3.5" /></button>
                            </>
                          ) : (
                            <span className="text-[11px] font-alt uppercase tracking-wider text-ink-muted">{c.status === 'used' ? 'usato' : 'annullato'}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Budget punti degli operatori + catalogo premi dello shop */}
        <div className="grid lg:grid-cols-2 gap-6 mt-10 pt-8 border-t-2 border-ink/10">
          {/* Ricarica budget operatori */}
          <div>
            <h2 className="font-alt font-bold text-xl text-ink flex items-center gap-2 mb-1"><Wallet className="w-5 h-5 text-alga" /> Budget punti dei banchi</h2>
            <p className="text-sm text-ink-soft mb-3">I punti che ogni banco può distribuire ai clienti. Ricaricali qui.</p>
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input value={opQ} onChange={(e) => setOpQ(e.target.value)} placeholder="Cerca banco…" className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
            </div>
            <ul className="bg-white border-2 border-ink/10 rounded-xl divide-y divide-ink/10 max-h-[60vh] overflow-auto imk-scroll">
              {filteredOps.length === 0 ? (
                <li className="px-4 py-6 text-sm text-ink-muted italic text-center">Nessun banco.</li>
              ) : filteredOps.map((o) => (
                <li key={o.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-sm text-ink truncate">{o.name}</span>
                    {o.market && <span className="block text-[11px] text-ink-muted">{o.market}</span>}
                  </span>
                  <span className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-alt font-bold text-lg text-alga-600 leading-none tabular-nums w-10 text-right">{o.budget}</span>
                    <input type="number" min="1" value={rechargeById[o.id] ?? ''} onChange={(e) => setRechargeById((m) => ({ ...m, [o.id]: e.target.value }))} placeholder="+" className="w-16 px-2 py-1.5 bg-crema border-2 border-ink/15 rounded-lg text-sm focus:outline-none focus:border-alga" />
                    <button onClick={() => recharge(o.id)} disabled={busy || !rechargeById[o.id]} className="p-1.5 rounded-full bg-alga/10 text-alga-600 hover:bg-alga/20 disabled:opacity-40"><Plus className="w-4 h-4" /></button>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Premi dello shop */}
          <div>
            <h2 className="font-alt font-bold text-xl text-ink flex items-center gap-2 mb-1"><Gift className="w-5 h-5 text-alga" /> Premi dello shop</h2>
            <p className="text-sm text-ink-soft mb-3">I buoni regalo che i clienti riscattano con i punti.</p>
            <div className="bg-white border-2 border-ink/10 rounded-xl p-4 space-y-2 mb-3">
              <input value={rw.label} onChange={(e) => setRw({ ...rw, label: e.target.value })} placeholder="Nome del premio (es. Buono 5€)" className="w-full px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
              <input value={rw.description} onChange={(e) => setRw({ ...rw, description: e.target.value })} placeholder="Descrizione (opz.)" className="w-full px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
              <div className="flex gap-2">
                <input type="number" min="1" value={rw.cost_points} onChange={(e) => setRw({ ...rw, cost_points: e.target.value })} placeholder="Costo in punti" className="flex-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
                <input type="number" min="0" value={rw.stock} onChange={(e) => setRw({ ...rw, stock: e.target.value })} placeholder="Stock (∞)" className="w-24 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
              </div>
              <button onClick={createReward} disabled={busy || !rw.label.trim() || !rw.cost_points} className="inline-flex items-center gap-1.5 px-4 py-2 bg-terracotta text-crema rounded-full text-sm font-alt font-semibold hover:bg-terracotta-600 disabled:opacity-50">
                <Plus className="w-4 h-4" /> Aggiungi premio
              </button>
            </div>
            <ul className="bg-white border-2 border-ink/10 rounded-xl divide-y divide-ink/10">
              {rewards.length === 0 ? (
                <li className="px-4 py-6 text-sm text-ink-muted italic text-center">Nessun premio ancora.</li>
              ) : rewards.map((r) => (
                <li key={r.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-sm text-ink truncate">{r.label}</span>
                    <span className="block text-[11px] text-ink-muted">{r.cost_points} punti{r.stock != null ? ` · ${r.stock} pezzi` : ''}</span>
                  </span>
                  <button onClick={() => toggleReward(r.id, !r.is_active)} className={`text-[11px] font-alt uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 ${r.is_active ? 'bg-alga/15 text-alga-600' : 'bg-ink/10 text-ink-muted'}`}>
                    {r.is_active ? 'attivo' : 'sospeso'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
