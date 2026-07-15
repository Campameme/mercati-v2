'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  X, Map as MapIcon, Store, Newspaper, Search, Shield, LogIn, Ticket, ArrowRight,
} from 'lucide-react'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/useLang'
import { UI_I18N } from '@/lib/i18n/ui'
import { HOME_I18N, type Lang } from '@/lib/i18n/home'
import type { UserRole } from '@/types/market'

// La voce distintiva del menu: la rete dei banchi (pill alga, come in home).
const RETE_LABEL: Record<Lang, string> = { it: 'La rete', fr: 'Le réseau', de: 'Das Netz', en: 'The network' }

interface Props {
  open: boolean
  onClose: () => void
}

export default function NavMenu({ open, onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<UserRole | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [q, setQ] = useState('')

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

  const [lang] = useLang()
  const ui = UI_I18N[lang]
  const links = [
    { href: '/mappa',     label: ui.navMap,       icon: MapIcon },
    { href: '/operatori', label: ui.navOperators, icon: Store },
    { href: '/notizie',   label: ui.footerNews,   icon: Newspaper },
  ]

  // La ricerca del menu porta alla mappa: è lei che sa trovare banchi e comuni.
  function submitSearch(e: FormEvent) {
    e.preventDefault()
    const needle = q.trim()
    router.push(needle ? `/mappa?q=${encodeURIComponent(needle)}` : '/mappa')
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`absolute top-0 right-0 h-full w-full max-w-md md:max-w-lg bg-crema shadow-2xl border-l border-ink/10 flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label="Menu di navigazione"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-7 h-16 border-b border-ink/10 flex-shrink-0">
          <Link href="/" onClick={onClose} className="group text-ink">
            <Logo inline className="text-[1.05rem]" />
          </Link>
          <button
            onClick={onClose}
            aria-label="Chiudi menu"
            className="p-2 rounded-full hover:bg-ink/5 text-ink-soft hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search → /mappa?q= */}
        <div className="px-5 md:px-7 pt-5 flex-shrink-0">
          <form onSubmit={submitSearch} className="group relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted transition-colors group-focus-within:text-terracotta" aria-hidden="true" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={HOME_I18N[lang].searchPlaceholder}
              aria-label={HOME_I18N[lang].searchPlaceholder}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#e0d7c1] rounded-full text-[15px] focus:outline-none focus:border-terracotta transition-all duration-300 focus:shadow-[0_14px_28px_-16px_rgba(196,89,60,0.45)]"
            />
          </form>
        </div>

        {/* Body scrollable (min-h-0: indispensabile per scrollare dentro un flex-col;
            data-lenis-prevent: altrimenti Lenis dirotta la rotella sulla finestra) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain imk-scroll px-5 md:px-7 py-6 space-y-8" data-lenis-prevent>
          {/* Il sito */}
          <section>
            <ul className="space-y-1.5">
              {links.map((l) => {
                const Icon = l.icon
                const active = pathname === l.href
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={onClose}
                      className={`group flex items-center gap-3 px-3 py-3 rounded-xl border transition-colors ${
                        active ? 'bg-alga text-crema border-alga' : 'border-transparent hover:border-[#e0d7c1] hover:bg-white text-ink'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-crema' : 'text-alga'}`} aria-hidden="true" />
                      <span className="font-alt text-sm font-semibold">{l.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
            <Link
              href="/aderisci"
              onClick={onClose}
              className="group mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-alga text-crema rounded-full font-alt text-sm font-semibold hover:bg-alga-600 transition-colors"
            >
              {RETE_LABEL[lang]} <ArrowRight className="imk-march w-4 h-4" aria-hidden="true" />
            </Link>
          </section>

          {/* Account / Admin */}
          <section>
            <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted mb-3">Account</p>
            {role ? (
              <div className="space-y-1.5">
                {userEmail && <p className="px-3 text-xs text-ink-muted mb-1">{userEmail}</p>}
                <Link href="/tessera" onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent hover:border-[#e0d7c1] hover:bg-white text-ink font-alt text-sm font-semibold">
                  <Ticket className="w-4 h-4 text-alga" aria-hidden="true" /> La mia tessera
                </Link>
                {role === 'super_admin' && (
                  <>
                    <Link href="/admin" onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent hover:border-[#e0d7c1] hover:bg-white text-ink font-alt text-sm font-semibold">
                      <Shield className="w-4 h-4 text-alga" aria-hidden="true" /> Admin — Dashboard
                    </Link>
                    <Link href="/admin/sessions" onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent hover:border-[#e0d7c1] hover:bg-white text-ink font-alt text-sm font-semibold">
                      <Shield className="w-4 h-4 text-alga" aria-hidden="true" /> Accendi / Spegni mercati
                    </Link>
                  </>
                )}
                <Link href="/operator" onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent hover:border-[#e0d7c1] hover:bg-white text-ink font-alt text-sm font-semibold">
                  <Store className="w-4 h-4 text-alga" aria-hidden="true" /> Area operatore
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-crema rounded-full font-alt text-sm font-semibold hover:bg-alga transition-colors w-fit"
              >
                <LogIn className="w-4 h-4" /> Accedi
              </Link>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 md:px-7 py-4 border-t border-ink/10 flex items-center gap-2 flex-shrink-0 text-ink">
          <Logo inline className="text-[0.9rem]" />
          <span className="text-[11px] text-ink-muted">· provincia di Imperia</span>
        </div>
      </aside>
    </div>
  )
}
