'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, Shield, LogIn } from 'lucide-react'
import Logo from './Logo'
import NavMenu from './NavMenu'
import LangSwitcher from './LangSwitcher'
import { useMarketSlug } from '@/lib/markets/useMarketSlug'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/market'

export default function Navigation() {
  const pathname = usePathname()
  const marketSlug = useMarketSlug()
  const [role, setRole] = useState<UserRole | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const isHome = pathname === '/'
  const [pastHero, setPastHero] = useState(false)

  // I link di recupero password di Supabase atterrano sulla Site URL (root):
  // da qualunque pagina, portiamo l'utente al form "nuova password".
  useEffect(() => {
    // Link scaduto/non valido: Supabase mette l'errore nell'hash della root
    // (es. #error=access_denied&error_code=otp_expired). Invece di lasciare
    // l'utente sulla home con l'URL sporco, lo portiamo al login con un avviso.
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1)
      const params = new URLSearchParams(hash || window.location.search)
      const errCode = params.get('error_code') || params.get('error')
      if (errCode && !pathname.startsWith('/login')) {
        window.location.assign(`/login?autherror=${encodeURIComponent(errCode)}`)
        return
      }
    }
    const supabase = createClient()
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && !pathname.startsWith('/login')) {
        window.location.assign('/login?recovery=1')
      }
    })
    return () => sub.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (active) setRole(null); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      if (active) setRole((profile?.role ?? 'citizen') as UserRole)
    })()
    return () => { active = false }
  }, [pathname])

  // Sulla home la barra è nascosta finché si sta fermi sull'hero (che ha il
  // suo logo) e scivola dentro appena si scrolla: la "bussola di ritorno".
  useEffect(() => {
    if (!isHome) { setPastHero(false); return }
    const onScroll = () => setPastHero(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  return (
    <>
      <nav
        className={`bg-crema/95 backdrop-blur border-b border-ink/10 z-50 ${
          isHome
            ? `fixed inset-x-0 top-0 transition-transform duration-300 ${pastHero ? 'translate-y-0 visible' : '-translate-y-full pointer-events-none invisible'}`
            : 'sticky top-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: logo */}
            <Link href="/" aria-label="I Mercati della Riviera dei Fiori — home" className="text-ink text-[1.05rem]">
              <Logo inline />
            </Link>

            {/* Right: lingua + weather + quick admin + auth + menu (icona, ultima a destra) */}
            <div className="flex items-center gap-2">
              <LangSwitcher />
              {(role === 'super_admin' || role === 'market_admin') && marketSlug && (
                <Link
                  href={`/${marketSlug}/admin`}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 font-alt text-sm font-semibold text-ink-soft hover:text-alga transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Gestisci</span>
                </Link>
              )}
              {!role && (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 bg-ink text-crema rounded-full font-alt text-sm font-semibold hover:bg-alga transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Accedi</span>
                </Link>
              )}
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Apri menu"
                className="grid place-items-center w-10 h-10 rounded-full border border-[#e0d7c1] bg-white hover:border-alga text-ink transition-colors"
              >
                <Menu className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <NavMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
