'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Power, ArrowLeft } from 'lucide-react'

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

export default function AdminSessionsPage() {
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
      // /api/schedules/list filtra is_active=true di default; per admin serve TUTTE
      // → query Supabase server-side via /api/admin/all-sessions, oppure direct fetch su occurrences
      fetch('/api/admin/sessions').then((r) => r.json()).catch(() => ({ data: [] })),
    ])
    setMarkets(mRes.data ?? [])
    setSessions(sRes.data ?? [])
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
      // Aggiorna lo stato locale di market E delle sue sessioni (cascade)
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
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-6xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest-plus text-ink-muted hover:text-ink mb-3 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Dashboard admin
      </Link>
      <div className="mb-8 border-b border-cream-300 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Power className="w-5 h-5 text-olive-500" />
          <p className="text-[0.72rem] uppercase tracking-widest-plus text-ink-muted">Super-admin</p>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight">Accendi / Spegni mercati</h1>
        <p className="text-sm text-ink-soft mt-2 max-w-2xl">
          Toggle rapido per le zone (8) e le singole sessioni di mercato.
          I mercati spenti non appaiono in calendario, mappa pubblica e ricerca.
        </p>
      </div>

      {/* Zone (markets) */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <p className="text-xs uppercase tracking-widest-plus text-ink-muted">Zone aggregate</p>
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
                    className={`w-full text-left px-3 py-2.5 rounded-sm border transition-all ${
                      m.is_active
                        ? 'bg-olive-50 border-olive-300 hover:border-olive-500'
                        : 'bg-cream-100 border-cream-300 opacity-60 hover:opacity-100'
                    } disabled:opacity-40`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif text-sm text-ink truncate">{m.name}</span>
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm flex-shrink-0 ${
                        m.is_active ? 'bg-olive-600 text-cream-100' : 'bg-cream-300 text-ink-muted'
                      }`}>
                        {m.is_active ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[10px] text-ink-muted mt-0.5 tabular-nums">
                      {activeSessionsCount}/{sessionsCount} sessioni attive
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Filtri sessioni */}
      <section>
        <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-3">Sessioni singole</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca comune, giorno, luogo…"
              className="w-full pl-9 pr-3 py-2.5 bg-cream-50 border border-cream-300 rounded-sm text-sm focus:outline-none focus:border-olive-500"
            />
          </div>
          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="py-2.5 px-3 bg-cream-50 border border-cream-300 rounded-sm text-sm focus:outline-none focus:border-olive-500"
          >
            <option value="all">Tutte le zone</option>
            {markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="py-2.5 px-3 bg-cream-50 border border-cream-300 rounded-sm text-sm focus:outline-none focus:border-olive-500"
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
                  <p className="text-[10px] uppercase tracking-widest-plus text-ink-muted mb-2">{m?.name ?? '—'}</p>
                  <ul className="border-y border-cream-300 divide-y divide-cream-300">
                    {list.map((s) => {
                      const active = s.isActive ?? true
                      return (
                        <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-serif text-base text-ink">{s.comune}</span>
                              <span className="text-sm text-ink-muted">· {s.giorno}</span>
                              {s.orario && <span className="text-xs text-ink-muted tabular-nums">{s.orario}</span>}
                            </div>
                            {s.luogo && <p className="text-xs text-ink-soft mt-0.5">{s.luogo}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {s.marketSlug && (
                              <Link
                                href={`/${s.marketSlug}/admin/s/${s.id}`}
                                className="text-xs text-ink-muted hover:text-ink underline underline-offset-2"
                              >
                                Configura
                              </Link>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleSession(s.id, active)}
                              disabled={busyId === s.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
                                active
                                  ? 'bg-olive-600 text-cream-100 hover:bg-olive-700'
                                  : 'bg-cream-200 text-ink-muted hover:bg-cream-300'
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
      </section>
    </div>
  )
}
