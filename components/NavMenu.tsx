'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  X, Map as MapIcon, Car, Store, Calendar, Newspaper, Cloud, MapPin, ChevronDown,
  Search, Shield, LogIn,
} from 'lucide-react'
import { OliveSprig } from './decorations'
import { slugifyName } from '@/lib/markets/slug'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/market'

interface MarketLite {
  id: string
  slug: string
  name: string
  city: string
}

interface ScheduleLite {
  market_id: string
  comune: string
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function NavMenu({ open, onClose }: Props) {
  const pathname = usePathname()
  const [markets, setMarkets] = useState<MarketLite[]>([])
  const [comuniByMarket, setComuniByMarket] = useState<Record<string, string[]>>({})
  const [role, setRole] = useState<UserRole | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [q, setQ] = useState('')

  // Load data once on first open (cached thereafter)
  useEffect(() => {
    if (!open || markets.length > 0) return
    ;(async () => {
      const [mRes, sRes] = await Promise.all([
        fetch('/api/markets').then((r) => r.json()),
        fetch('/api/schedules/occurrences').then((r) => r.json()),
      ])
      const m: MarketLite[] = (mRes.data ?? [])
        .filter((x: any) => x.is_active)
        .map((x: any) => ({ id: x.id, slug: x.slug, name: x.name, city: x.city }))
        .sort((a: MarketLite, b: MarketLite) => a.name.localeCompare(b.name, 'it'))
      setMarkets(m)
      const byMarket: Record<string, string[]> = {}
      for (const s of (sRes.data ?? []) as ScheduleLite[]) {
        const arr = byMarket[s.market_id] ?? (byMarket[s.market_id] = [])
        if (!arr.includes(s.comune)) arr.push(s.comune)
      }
      for (const id of Object.keys(byMarket)) byMarket[id].sort((a, b) => a.localeCompare(b, 'it'))
      setComuniByMarket(byMarket)
    })()
  }, [open, markets.length])

  // Auth role
  useEffect(() => {
    if (!open) return
    const supabase = createClient()
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setRole(null); setUserEmail(null); return }
      setUserEmail(user.email ?? null)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      setRole((profile?.role ?? 'citizen') as UserRole)
    })()
  }, [open])

  // Close on route change
  useEffect(() => {
    if (open) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Lock scroll + Escape
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const globalLinks = [
    { href: '/',           label: 'Mappa provincia',       icon: MapIcon },
    { href: '/parcheggi',  label: 'Parcheggi',             icon: Car },
    { href: '/operatori',  label: 'Bancarelle',            icon: Store },
    { href: '/calendar',   label: 'Calendario provincia',  icon: Calendar },
  ]

  // Filtro testuale su zone + comuni
  const filteredMarkets = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return markets
    return markets.filter((m) => {
      if (m.name.toLowerCase().includes(needle)) return true
      if (m.city.toLowerCase().includes(needle)) return true
      const c = comuniByMarket[m.id] ?? []
      return c.some((x) => x.toLowerCase().includes(needle))
    })
  }, [markets, comuniByMarket, q])

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`absolute top-0 right-0 h-full w-full max-w-md md:max-w-lg bg-cream-100 shadow-2xl border-l border-cream-300 flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label="Menu di navigazione"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-7 h-16 border-b border-cream-300 flex-shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5 group">
            <OliveSprig className="w-10 h-3 text-olive-500" />
            <span className="font-serif text-[1.55rem] leading-none text-ink tracking-tight">
              <span className="italic">i</span><span className="font-medium">Mercati</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Chiudi menu"
            className="p-2 rounded-full hover:bg-cream-200 text-ink-soft hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 md:px-7 pt-5 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca zona, comune, bancarella…"
              className="w-full pl-9 pr-3 py-2.5 bg-cream-50 border border-cream-300 rounded-sm text-sm focus:outline-none focus:border-olive-500"
            />
          </div>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto px-5 md:px-7 py-6 space-y-8">
          {/* Provincia */}
          <section>
            <p className="text-[0.72rem] uppercase tracking-widest-plus text-ink-muted mb-3">Provincia</p>
            <ul className="space-y-1">
              {globalLinks.map((l) => {
                const Icon = l.icon
                const active = pathname === l.href
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={onClose}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors ${
                        active ? 'bg-ink text-cream-100' : 'hover:bg-cream-200 text-ink'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-cream-100' : 'text-olive-500'}`} />
                      <span className="text-sm">{l.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Zone */}
          <section>
            <p className="text-[0.72rem] uppercase tracking-widest-plus text-ink-muted mb-3">
              Zone · {filteredMarkets.length}
            </p>
            {filteredMarkets.length === 0 ? (
              <p className="text-sm text-ink-muted">Nessuna zona trovata.</p>
            ) : (
              <ul className="space-y-1">
                {filteredMarkets.map((m) => {
                  const comuni = comuniByMarket[m.id] ?? []
                  const isAgg = comuni.length > 1
                  const isExpanded = expanded === m.id
                  return (
                    <li key={m.id} className="border-b border-cream-300 last:border-0">
                      <div className="flex items-stretch">
                        <Link
                          href={`/${m.slug}`}
                          onClick={onClose}
                          className="group flex-1 flex items-center justify-between gap-3 px-3 py-3 hover:bg-cream-200 rounded-sm transition-colors"
                        >
                          <div className="min-w-0">
                            <span className="font-serif text-base text-ink leading-tight block group-hover:text-olive-700 transition-colors">
                              {m.name}
                            </span>
                            {isAgg ? (
                              <span className="text-xs text-ink-muted">{comuni.length} comuni</span>
                            ) : (
                              <span className="text-xs text-ink-muted">{m.city}</span>
                            )}
                          </div>
                        </Link>
                        {isAgg && (
                          <button
                            onClick={() => setExpanded(isExpanded ? null : m.id)}
                            aria-label={isExpanded ? 'Nascondi comuni' : 'Mostra comuni'}
                            className="px-3 text-ink-muted hover:text-ink"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Comuni */}
                      {isAgg && isExpanded && (
                        <ul className="pl-4 pb-3 pt-1 space-y-0.5">
                          {comuni.map((c) => (
                            <li key={c}>
                              <Link
                                href={`/${m.slug}/c/${slugifyName(c)}`}
                                onClick={onClose}
                                className="flex items-center gap-2 px-2 py-1.5 text-sm text-ink-soft hover:text-ink hover:bg-cream-200 rounded-sm transition-colors"
                              >
                                <MapPin className="w-3.5 h-3.5 text-olive-500" />
                                {c}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Shortcut sotto ogni zona */}
                      {!isAgg && (
                        <div className="flex gap-1 pb-2 pl-3 text-xs">
                          <Link href={`/${m.slug}/parking`} onClick={onClose} className="px-2 py-0.5 rounded-sm bg-cream-200 text-ink hover:bg-cream-300">Parcheggi</Link>
                          <Link href={`/${m.slug}/operators`} onClick={onClose} className="px-2 py-0.5 rounded-sm bg-cream-200 text-ink hover:bg-cream-300">Bancarelle</Link>
                          <Link href={`/${m.slug}/calendar`} onClick={onClose} className="px-2 py-0.5 rounded-sm bg-cream-200 text-ink hover:bg-cream-300">Calendario</Link>
                          <Link href={`/${m.slug}/news`} onClick={onClose} className="px-2 py-0.5 rounded-sm bg-cream-200 text-ink hover:bg-cream-300">Notizie</Link>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Account / Admin */}
          <section>
            <p className="text-[0.72rem] uppercase tracking-widest-plus text-ink-muted mb-3">Account</p>
            {role ? (
              <div className="space-y-1">
                {userEmail && <p className="px-3 text-xs text-ink-muted mb-1">{userEmail}</p>}
                {role === 'super_admin' && (
                  <Link href="/admin/markets" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-cream-200 text-ink text-sm">
                    <Shield className="w-4 h-4 text-olive-500" /> Admin — Zone
                  </Link>
                )}
                <Link href="/operator" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-cream-200 text-ink text-sm">
                  <Store className="w-4 h-4 text-olive-500" /> Area operatore
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2.5 bg-ink text-cream-100 rounded-full text-sm hover:bg-ink/90 w-fit"
              >
                <LogIn className="w-4 h-4" /> Accedi
              </Link>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 md:px-7 py-4 border-t border-cream-300 text-[11px] text-ink-muted flex items-center gap-2 flex-shrink-0">
          <OliveSprig className="w-8 h-2.5 text-olive-500" />
          <span className="font-serif italic">iMercati</span>
          <span>· Liguria · Provincia di Imperia</span>
        </div>
      </aside>
    </div>
  )
}
