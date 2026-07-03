'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, Shield, LogIn } from 'lucide-react'
import WeatherWidget from './WeatherWidget'
import Logo from './Logo'
import NavMenu from './NavMenu'
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

  // Sulla home la barra è nascosta sopra l'hero (che ha il suo logo) e
  // ricompare scivolando quando si scrolla oltre: la "bussola di ritorno".
  useEffect(() => {
    if (!isHome) { setPastHero(false); return }
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.7)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  return (
    <>
      <nav
        className={`bg-carta/90 backdrop-blur-sm border-b-2 border-ink/10 z-50 ${
          isHome
            ? `fixed inset-x-0 top-0 transition-transform duration-300 ${pastHero ? 'translate-y-0 visible' : '-translate-y-full pointer-events-none invisible'}`
            : 'sticky top-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: logo */}
            <Link href="/" aria-label="Mercati della Riviera di Ponente — home" className="text-ink text-[1.05rem]">
              <Logo inline />
            </Link>

            {/* Right: weather + quick admin + auth + menu (icona, ultima a destra) */}
            <div className="flex items-center gap-2">
              <WeatherWidget />
              {(role === 'super_admin' || role === 'market_admin') && marketSlug && (
                <Link
                  href={`/${marketSlug}/admin`}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 font-alt text-sm font-semibold text-ink-soft hover:text-mare-600 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Gestisci</span>
                </Link>
              )}
              {!role && (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 bg-ink text-carta rounded-full font-alt text-sm font-semibold hover:bg-mare transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Accedi</span>
                </Link>
              )}
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Apri menu"
                className="grid place-items-center w-10 h-10 rounded-full border-2 border-ink/15 bg-white hover:border-mare text-ink transition-colors"
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
