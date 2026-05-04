'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, Shield, LogIn } from 'lucide-react'
import WeatherWidget from './WeatherWidget'
import { OliveSprig } from './decorations'
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

  return (
    <>
      <nav className="bg-cream-100/85 backdrop-blur-sm border-b border-cream-300 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: menu button + logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Apri menu"
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-cream-300 bg-cream-50 hover:bg-cream-200 text-ink transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest-plus hidden sm:inline">Menu</span>
              </button>
              <Link href="/" className="flex items-center gap-2.5" aria-label="IMercati — home">
                <OliveSprig className="w-10 h-3 text-olive-500 -mb-1 hidden sm:block" />
                <span className="font-serif text-[1.5rem] leading-none text-ink tracking-tight">
                  <span className="italic">I</span><span className="font-medium">Mercati</span>
                </span>
              </Link>
            </div>

            {/* Right: weather + quick admin + auth */}
            <div className="flex items-center gap-2">
              <WeatherWidget />
              {(role === 'super_admin' || role === 'market_admin') && marketSlug && (
                <Link
                  href={`/${marketSlug}/admin`}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm text-ink-soft hover:text-ink"
                >
                  <Shield className="w-4 h-4" />
                  <span>Gestisci</span>
                </Link>
              )}
              {!role && (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-ink text-cream-100 rounded-full text-sm hover:bg-ink/90 transition-colors"
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
