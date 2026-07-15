'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Power } from 'lucide-react'
import { IMPERIA_ZONE_SLUGS } from '@/lib/markets/zones'

interface Session {
  id: string
  marketId: string
  marketSlug: string | null
  marketName: string | null
  marketCity: string | null
  comune: string
  giorno: string
  orario: string | null
  luogo: string | null
  isActive?: boolean
}

interface Market {
  id: string
  slug: string
  name: string
  is_active: boolean
}

/**
 * Sezione "Accendi / Spegni mercati" — incorporata nel pannello /admin.
 * Toggle rapido di zone e singole sessioni (cascade zona → sessioni).
 * Solo provincia di Imperia: Savona resta nei dati ma fuori da gestione e UI.
 */
export default function MarketToggles() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [marketFilter, setMarketFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  async function loadAll() {
    setLoading(true)
    const [mRes, sRes] = await Promise.all([
      fetch('/api/markets').then((r) => r.json()),
      fetch('/api/admin/sessions').then((r) => r.json()).catch(() => ({ data: [] })),
    ])
    const imperia = new Set<string>(IMPERIA_ZONE_SLUGS as readonly string[])
    setMarkets((mRes.data ?? []).filter((m: Market) => imperia.has(m.slug)))
    setSessions((sRes.data ?? []).filter((s: Session) => s.marketSlug != null && imperia.has(s.marketSlug)))
    setLoading(false)
  }
  useEffect(() => { loadAll() }, [])

  async function toggleSession(id: string, isActive: boolean) {
    setBusyId(id)
    const r = await fetch(`/api/schedules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })
    setBusyId(null)
    if (r.ok) {
      setSessions((cur) => cur.map((s) => (s.id === id ? { ...s, isActive: !isActive } : s)))
    } else {
      const j = await r.json()
      alert(j.error ?? 'Errore')
    }
  }

  async function toggleMarket(id: string, isActive: boolean) {
    const m = markets.find((x) => x.id === id)
    const zoneSessions = sessions.filter((s) => s.marketId === id)
    if (isActive) {
      const ok = confirm(
        `Spegnere "${m?.name ?? 'questa zona'}"?\n\n` +
        `Tutte le ${zoneSessions.length} sessioni di mercato di questa zona ` +
        `verranno SPENTE in cascata. Per riattivarle dovrai riaccendere la zona ` +
        `(che le riaccende tutte) oppure attivarle una per una.`,
      )
      if (!ok) return
    } else if (zoneSessions.length > 0) {
      const ok = confirm(
        `Riaccendere "${m?.name ?? 'questa zona'}"?\n\n` +
        `Tutte le ${zoneSessions.length} sessioni della zona verranno riaccese.`,
      )
      if (!ok) return
    }
    setBusyId(id)
    const r = await fetch(`/api/markets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })
    setBusyId(null)
    if (r.ok) {
      setMarkets((cur) => cur.map((mm) => (mm.id === id ? { ...mm, is_active: !isActive } : mm)))
      setSessions((cur) => cur.map((s) => (s.marketId === id ? { ...s, isActive: !isActive } : s)))
    } else {
      const j = await r.json()
      alert(j.error ?? 'Errore')
    }
  }

  const filteredSessions = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return sessions.filter((s) => {
      if (marketFilter !== 'all' && s.marketId !== marketFilter) return false
      const active = s.isActive ?? true
      if (statusFilter === 'active' && !active) return false
      if (statusFilter === 'inactive' && active) return false
      if (needle) {
        const hay = `${s.comune} ${s.giorno} ${s.luogo ?? ''} ${s.marketName ?? ''}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
  }, [sessions, marketFilter, statusFilter, q])

  const groupedByMarket = useMemo(() => {
    const m = new Map<string, Session[]>()
    for (const s of filteredSessions) {
      const arr = m.get(s.marketId) ?? []
      arr.push(s)
      m.set(s.marketId, arr)
    }
    return m
  }, [filteredSessions])

  return (
    <div>
      {/* Zone (markets) */}
      <div className="mb-8">
        <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <p className="text-xs font-alt uppercase tracking-wider text-ink-muted">Zone aggregate</p>
          <p className="text-[11px] text-ink-muted italic">
            Spegnere una zona nasconde tutte le sue sessioni dal sito pubblico (cascade).
          </p>
        </div>
        {markets.length === 0 ? (
          <p className="text-sm text-ink-muted italic">Caricamento…</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {markets.map((m) => {
              const sessionsCount = sessions.filter((s) => s.marketId === m.id).length
              const activeSessionsCount = sessions.filter((s) => s.marketId === m.id && (s.isActive ?? true)).length
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => toggleMarket(m.id, m.is_active)}
                    disabled={busyId === m.id}
                    className={`w-full text-left px-3 py-2.5 rounded-2xl border-2 transition-all ${
                      m.is_active
                        ? 'bg-white border-alga/40 hover:border-alga'
                        : 'bg-crema border-ink/10 opacity-60 hover:opacity-100'
                    } disabled:opacity-40`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-alt text-sm text-ink truncate">{m.name}</span>
                      <span className={`text-[11px] font-alt uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        m.is_active ? 'bg-alga text-white' : 'bg-ink/10 text-ink-muted'
                      }`}>
                        {m.is_active ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5 tabular-nums">
                      {activeSessionsCount}/{sessionsCount} sessioni attive
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Filtri sessioni */}
      <div>
        <p className="text-xs font-alt uppercase tracking-wider text-ink-muted mb-3">Sessioni singole</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca comune, giorno, luogo…"
              className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-ink/15 rounded-full text-sm text-ink focus:outline-none focus:border-alga transition-colors"
            />
          </div>
          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="py-2.5 px-3 bg-white border-2 border-ink/15 rounded-full text-sm text-ink focus:outline-none focus:border-alga transition-colors"
          >
            <option value="all">Tutte le zone</option>
            {markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="py-2.5 px-3 bg-white border-2 border-ink/15 rounded-full text-sm text-ink focus:outline-none focus:border-alga transition-colors"
          >
            <option value="all">Tutti gli stati</option>
            <option value="active">Solo attivi</option>
            <option value="inactive">Solo inattivi</option>
          </select>
        </div>

        {loading ? (
          <p className="text-ink-muted text-sm">Caricamento sessioni…</p>
        ) : filteredSessions.length === 0 ? (
          <p className="text-ink-muted text-sm italic">Nessuna sessione coi filtri correnti.</p>
        ) : (
          <div className="space-y-6">
            {Array.from(groupedByMarket.entries()).map(([marketId, list]) => {
              const m = markets.find((x) => x.id === marketId)
              return (
                <div key={marketId}>
                  <p className="text-[11px] font-alt uppercase tracking-wider text-ink-muted mb-2">{m?.name ?? '—'}</p>
                  <ul className="bg-white border-2 border-ink/10 rounded-2xl divide-y divide-ink/10">
                    {list.map((s) => {
                      const active = s.isActive ?? true
                      return (
                        <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-alt text-base text-ink">{s.comune}</span>
                              <span className="text-sm text-ink-muted">· {s.giorno}</span>
                              {s.orario && <span className="text-xs text-ink-muted tabular-nums">{s.orario}</span>}
                            </div>
                            {s.luogo && <p className="text-xs text-ink-soft mt-0.5">{s.luogo}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {s.marketSlug && (
                              <Link
                                href={`/${s.marketSlug}/admin/s/${s.id}`}
                                className="text-xs text-ink-muted hover:text-alga-600 underline underline-offset-2"
                              >
                                Configura
                              </Link>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleSession(s.id, active)}
                              disabled={busyId === s.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-alt uppercase tracking-wider transition-colors ${
                                active
                                  ? 'bg-alga text-white hover:bg-alga-600'
                                  : 'bg-crema border-2 border-ink/15 text-ink-muted hover:border-ink/30'
                              } disabled:opacity-40`}
                            >
                              <Power className="w-3 h-3" />
                              {active ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
