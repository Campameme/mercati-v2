'use client'

// Gestione ruoli e persone (super admin). Chi è chi nella rete: si assegna il
// ruolo (le promozioni passano da route service-role, 0027), si danno al redattore
// i suoi mercati, si collega/scollega la scheda di un banco a un account.

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserCog, Search, Check, Store, Newspaper, Link2, Unlink, Send, ShieldCheck, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Role = 'citizen' | 'operator' | 'market_admin' | 'news_editor' | 'super_admin'

const ROLES: Role[] = ['citizen', 'operator', 'market_admin', 'news_editor', 'super_admin']
const ROLE_LABEL: Record<Role, string> = {
  citizen: 'Cittadino',
  operator: 'Operatore',
  market_admin: 'Amm. mercato',
  news_editor: 'Redattore',
  super_admin: 'Super admin',
}
const ROLE_BADGE: Record<Role, string> = {
  citizen: 'bg-crema text-ink-muted border-ink/15',
  operator: 'bg-alga/15 text-alga-600 border-alga/30',
  market_admin: 'bg-limone/25 text-ink border-limone',
  news_editor: 'bg-terracotta/15 text-terracotta-600 border-terracotta/30',
  super_admin: 'bg-ink text-crema border-ink',
}

interface OperatorMini { id: string; name: string }
interface UserRow {
  id: string
  email: string
  full_name: string | null
  role: Role
  operators: OperatorMini[]
  linkable: OperatorMini[]
  newsMarketIds: string[]
  created_at: string
}
interface MarketOpt { id: string; name: string; city: string }

export default function AdminUtentiPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [markets, setMarkets] = useState<MarketOpt[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [meId, setMeId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/utenti', { cache: 'no-store' })
    const { data } = await res.json()
    setUsers((data ?? []) as UserRow[])
    setLoading(false)
  }
  useEffect(() => {
    load()
    const supabase = createClient()
    supabase.from('markets').select('id, name, city').order('city').then(({ data }) => setMarkets((data ?? []) as MarketOpt[]))
    supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id ?? null))
  }, [])

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase()
    if (!n) return users
    return users.filter((u) => u.email.toLowerCase().includes(n) || (u.full_name ?? '').toLowerCase().includes(n))
  }, [users, q])

  const selected = useMemo(() => users.find((u) => u.id === selectedId) ?? null, [users, selectedId])

  async function changeRole(u: UserRow, role: Role) {
    if (role === u.role) return
    if (u.id === meId && u.role === 'super_admin' && role !== 'super_admin') {
      if (!confirm('Stai per toglierti il ruolo di super admin: perderai l’accesso a questo pannello. Continuare?')) return
    }
    setBusy(true); setMsg(null); setError(null)
    const res = await fetch('/api/admin/utenti', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: u.id, role }),
    })
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) { setError(j.error ?? 'Cambio di ruolo non riuscito.'); return }
    setMsg(`Ruolo aggiornato: ${ROLE_LABEL[role]}.`)
    await load()
  }

  async function toggleNewsMarket(u: UserRow, marketId: string, on: boolean) {
    setBusy(true); setMsg(null); setError(null)
    const res = await fetch('/api/admin/utenti/news-markets', {
      method: on ? 'POST' : 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: u.id, marketId }),
    })
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) { setError(j.error ?? 'Operazione non riuscita.'); return }
    await load()
  }

  async function linkOperator(op: OperatorMini) {
    setBusy(true); setMsg(null); setError(null)
    const res = await fetch('/api/admin/operatori/link', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId: op.id }),
    })
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) { setError(j.error ?? 'Collegamento non riuscito.'); return }
    setMsg(j.message ?? 'Link di accesso inviato.')
    await load()
  }

  async function unlinkOperator(op: OperatorMini) {
    if (!confirm(`Scollegare il banco “${op.name}” da questo account? L’operatore perderà l’accesso alla sua area.`)) return
    setBusy(true); setMsg(null); setError(null)
    const res = await fetch('/api/admin/operatori/unlink', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId: op.id }),
    })
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) { setError(j.error ?? 'Scollegamento non riuscito.'); return }
    setMsg('Banco scollegato.')
    await load()
  }

  return (
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-6xl">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-alt font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-alga mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <div className="mb-6 border-b-2 border-ink/10 pb-4">
          <p className="text-xs font-alt uppercase tracking-[0.14em] text-alga-600 mb-1">La rete, dietro le quinte</p>
          <h1 className="font-alt font-bold text-3xl text-ink flex items-center gap-2"><UserCog className="w-6 h-6 text-alga" /> Ruoli e persone</h1>
          <p className="text-sm text-ink-soft mt-1">Chi è chi: assegna i ruoli, dai al redattore i suoi mercati, collega o scollega i banchi.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
          {/* Elenco utenti */}
          <div>
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca per email…" className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-ink/15 rounded-xl text-sm focus:outline-none focus:border-alga" />
            </div>
            {loading ? (
              <p className="text-sm text-ink-muted py-8 text-center">Caricamento…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-ink-muted italic py-8 text-center">Nessun utente{q ? ' trovato' : ''}.</p>
            ) : (
              <ul className="bg-white border-2 border-ink/10 rounded-xl divide-y divide-ink/10 max-h-[72vh] overflow-auto imk-scroll">
                {filtered.map((u) => (
                  <li key={u.id}>
                    <button onClick={() => { setSelectedId(u.id); setMsg(null); setError(null) }} className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-crema ${selectedId === u.id ? 'bg-crema-2/40' : ''}`}>
                      <span className="min-w-0">
                        <span className="block font-alt font-semibold text-ink truncate">{u.email || '(senza email)'}</span>
                        <span className="block text-[11px] text-ink-muted truncate">
                          {u.full_name ?? '—'}{u.operators.length > 0 ? ` · ${u.operators.length} banc${u.operators.length === 1 ? 'o' : 'hi'}` : ''}
                        </span>
                      </span>
                      <span className={`flex-shrink-0 text-[10px] font-alt uppercase tracking-wider px-2 py-0.5 rounded-full border-2 ${ROLE_BADGE[u.role]}`}>{ROLE_LABEL[u.role]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Dettaglio utente */}
          <div>
            {!selected ? (
              <div className="bg-white border-2 border-dashed border-ink/15 rounded-xl p-10 text-center text-ink-muted text-sm">
                Scegli una persona dall’elenco per gestirne ruolo, mercati e banchi.
              </div>
            ) : (
              <div className="bg-white border-2 border-ink/10 rounded-xl p-5 space-y-6">
                <div>
                  <h2 className="font-alt font-bold text-xl text-ink break-all">{selected.email || '(senza email)'}</h2>
                  <p className="text-sm text-ink-muted">{selected.full_name ?? '—'}</p>
                </div>

                {/* Ruolo */}
                <div className="border-t-2 border-ink/10 pt-4">
                  <p className="font-alt text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-alga" /> Ruolo</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ROLES.map((r) => {
                      const on = selected.role === r
                      return (
                        <button key={r} onClick={() => changeRole(selected, r)} disabled={busy || on} className={`px-3 py-1.5 rounded-full text-xs font-alt font-semibold border-2 transition-colors ${on ? 'bg-alga text-white border-alga cursor-default' : 'bg-white text-ink-soft border-ink/15 hover:border-alga disabled:opacity-50'}`}>
                          {ROLE_LABEL[r]}
                        </button>
                      )
                    })}
                  </div>
                  {selected.role === 'market_admin' && (
                    <p className="text-[11px] text-ink-muted mt-2">I mercati dell’amministratore si assegnano dalla pagina del mercato (Gestione zone → admin del mercato).</p>
                  )}
                </div>

                {/* Mercati del redattore */}
                {selected.role === 'news_editor' && (
                  <div className="border-t-2 border-ink/10 pt-4">
                    <p className="font-alt text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5"><Newspaper className="w-3.5 h-3.5 text-alga" /> Mercati di competenza (notizie)</p>
                    {selected.newsMarketIds.length === 0 && (
                      <p className="text-[12px] text-terracotta-600 bg-terracotta/10 rounded-lg px-3 py-2 mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> Nessun mercato assegnato: il redattore non può ancora scrivere nulla.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {markets.map((m) => {
                        const on = selected.newsMarketIds.includes(m.id)
                        return (
                          <button key={m.id} onClick={() => toggleNewsMarket(selected, m.id, !on)} disabled={busy} className={`px-3 py-1.5 rounded-full text-xs font-alt font-semibold border-2 transition-colors disabled:opacity-50 ${on ? 'bg-alga text-white border-alga' : 'bg-white text-ink-soft border-ink/15 hover:border-alga'}`}>
                            {on && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}{m.city} — {m.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Banchi (operatori) */}
                <div className="border-t-2 border-ink/10 pt-4">
                  <p className="font-alt text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5"><Store className="w-3.5 h-3.5 text-alga" /> Banchi collegati</p>
                  {selected.operators.length === 0 ? (
                    <p className="text-[12px] text-ink-muted italic mb-2">Nessun banco collegato a questo account.</p>
                  ) : (
                    <ul className="space-y-2 mb-2">
                      {selected.operators.map((op) => (
                        <li key={op.id} className="flex items-center gap-2 rounded-xl border-2 border-ink/10 px-3 py-2">
                          <span className="font-alt text-sm text-ink flex-1 min-w-0 truncate">{op.name}</span>
                          <button onClick={() => unlinkOperator(op)} disabled={busy} className="inline-flex items-center gap-1 text-xs font-alt font-semibold text-terracotta-600 hover:text-terracotta px-2.5 py-1 rounded-full bg-terracotta/10 disabled:opacity-50">
                            <Unlink className="w-3.5 h-3.5" /> Scollega
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {selected.linkable.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[11px] text-ink-muted mb-1.5">Schede con questa email, non ancora collegate:</p>
                      <ul className="space-y-2">
                        {selected.linkable.map((op) => (
                          <li key={op.id} className="flex items-center gap-2 rounded-xl border-2 border-dashed border-ink/15 px-3 py-2">
                            <span className="font-alt text-sm text-ink flex-1 min-w-0 truncate">{op.name}</span>
                            <button onClick={() => linkOperator(op)} disabled={busy} className="inline-flex items-center gap-1 text-xs font-alt font-semibold text-alga-600 hover:text-alga px-2.5 py-1 rounded-full bg-alga/10 disabled:opacity-50">
                              <Link2 className="w-3.5 h-3.5" /> Collega (invia link)
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-[11px] text-ink-muted mt-3">
                    Per creare un banco o assegnargli i mercati e la posizione, vai a{' '}
                    <Link href="/admin/operatori" className="text-alga-600 hover:underline">Gestione operatori</Link>.
                  </p>
                </div>

                {(msg || error) && (
                  <p className={`text-sm rounded-lg px-3 py-2 flex items-center gap-1.5 ${error ? 'text-terracotta-600 bg-terracotta/10' : 'text-alga-600 bg-crema-2/40'}`}>
                    {error ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <Send className="w-4 h-4 flex-shrink-0" />}
                    {error ?? msg}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
