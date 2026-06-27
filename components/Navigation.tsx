'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, Shield, LogIn } from 'lucide-react'
import WeatherWidget from './WeatherWidget'
import { WaveTaglia } from './decorations'
import NavMenu from './NavMenu'
import { useMarketSlug } from '@/lib/markets/useMarketSlug'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/market'

export default function Navigation() {
  const pathname = usePathname()
  const marketSlug = useMarketSlug()
  const [role, setRole] = useState<UserRole | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

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

  // La home (mappa-centrica) ha la propria hero/barra: niente vecchio header lì.
  if (pathname === '/') return null

  return (
    <>
      <nav className="bg-paper/90 backdrop-blur-sm border-b-2 border-ink/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: menu button + logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Apri menu"
                className="flex items-center gap-2 px-3.5 py-2 rounded-full border-2 border-ink/15 bg-white hover:border-pesto text-ink transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span className="font-alt text-xs font-semibold uppercase tracking-[0.12em] hidden sm:inline">Menu</span>
              </button>
              <Link href="/" className="flex items-center gap-2.5" aria-label="iMercati — home">
                <WaveTaglia className="w-10 h-3 text-pesto -mb-0.5 hidden sm:block" aria-hidden="true" />
                <span className="font-display text-[1.4rem] leading-none text-ink">
                  i<span className="text-pesto">M</span>ercati
                </span>
              </Link>
            </div>

            {/* Right: weather + quick admin + auth */}
            <div className="flex items-center gap-2">
              <WeatherWidget />
              {(role === 'super_admin' || role === 'market_admin') && marketSlug && (
                <Link
                  href={`/${marketSlug}/admin`}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 font-alt text-sm font-semibold text-ink-soft hover:text-pesto-600 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Gestisci</span>
                </Link>
              )}
              {!role && (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 bg-ink text-paper rounded-full font-alt text-sm font-semibold hover:bg-pesto transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Accedi</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <NavMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
