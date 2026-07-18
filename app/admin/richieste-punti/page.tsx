'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, X, Receipt, Clock } from 'lucide-react'

type Req = {
  id: string
  email: string
  operator: string
  amountCents: number
  points: number
  note: string | null
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

// Approvazione delle richieste punti da scontrino (super admin). Il cliente
// accumula punti comprando dai banchi; qui l'amministratore conferma o rifiuta.
export default function RichiestePuntiPage() {
  const [tab, setTab] = useState<'pending' | 'all'>('pending')
  const [items, setItems] = useState<Req[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/point-requests?status=${tab}`, { cache: 'no-store' })
    const j = await res.json().catch(() => null)
    setItems(j?.data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  async function decide(id: string, approve: boolean) {
    setBusy(id)
    await fetch('/api/admin/point-requests', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id, approve }),
    })
    setBusy(null)
    load()
  }

  const fmtEuro = (c: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(c / 100)
  const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) } catch { return '' } }
  const pendingCount = items.filter((i) => i.status === 'pending').length

  const STATUS: Record<Req['status'], { label: string; cls: string }> = {
    pending: { label: 'In attesa', cls: 'bg-limone/30 text-ink border-limone' },
    approved: { label: 'Approvata', cls: 'bg-alga/10 text-alga-600 border-alga/30' },
    rejected: { label: 'Rifiutata', cls: 'bg-terracotta/10 text-terracotta-600 border-terracotta/30' },
  }
  const tabCls = (active: boolean) => `font-alt text-sm font-semibold px-4 py-2 rounded-full transition-colors ${active ? 'bg-alga text-crema' : 'text-ink-soft hover:text-ink'}`

  return (
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">
        <Link href="/admin" className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-alga mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Pannello
        </Link>
        <h1 className="font-display font-extrabold tracking-tight text-3xl text-ink flex items-center gap-2">
          <Receipt className="w-7 h-7 text-alga" /> Richieste punti
        </h1>
        <p className="text-sm text-ink-soft mt-1">Scontrini registrati dai banchi: 1&nbsp;€ = 10 punti. Approva per accreditare i punti al cliente.</p>

        <div className="inline-flex rounded-full border border-[#e0d7c1] bg-white p-1 my-5">
          <button onClick={() => setTab('pending')} className={tabCls(tab === 'pending')}>In attesa{pendingCount > 0 && tab === 'pending' ? ` · ${pendingCount}` : ''}</button>
          <button onClick={() => setTab('all')} className={tabCls(tab === 'all')}>Tutte</button>
        </div>

        {loading ? (
          <p className="text-ink-soft text-sm">Caricamento…</p>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e0d7c1] px-6 py-12 text-center">
            <Clock className="w-8 h-8 text-alga mx-auto mb-3" />
            <p className="font-display font-extrabold tracking-tight text-lg text-alga">Nessuna richiesta {tab === 'pending' ? 'in attesa' : ''}</p>
          </div>
        ) : (
          <ul className="bg-white rounded-xl border border-[#e0d7c1] divide-y divide-ink/10 overflow-hidden">
            {items.map((r) => (
              <li key={r.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-alt font-semibold text-ink">
                    {fmtEuro(r.amountCents)} <span className="text-alga-600">· {r.points} punti</span>
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">{r.email} · {r.operator} · {fmtDate(r.createdAt)}</p>
                  {r.note && <p className="text-xs text-ink-soft italic mt-0.5">“{r.note}”</p>}
                </div>
                {r.status === 'pending' ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => decide(r.id, true)} disabled={busy === r.id} className="inline-flex items-center gap-1.5 bg-alga text-crema font-alt font-semibold text-sm px-4 py-2 rounded-full hover:bg-alga-600 disabled:opacity-50 transition-colors">
                      <Check className="w-4 h-4" /> Approva
                    </button>
                    <button onClick={() => decide(r.id, false)} disabled={busy === r.id} className="inline-flex items-center gap-1.5 bg-white border-2 border-terracotta/40 text-terracotta-600 font-alt font-semibold text-sm px-4 py-2 rounded-full hover:border-terracotta disabled:opacity-50 transition-colors">
                      <X className="w-4 h-4" /> Rifiuta
                    </button>
                  </div>
                ) : (
                  <span className={`flex-shrink-0 font-alt text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS[r.status].cls}`}>
                    {STATUS[r.status].label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
