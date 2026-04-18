'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map as MapIcon, Store, Car, Calendar, Newspaper, Shield, LogIn } from 'lucide-react'
import WeatherWidget from './WeatherWidget'
import { OliveSprig } from './decorations'
import { useMarketSlug } from '@/lib/markets/useMarketSlug'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/market'

export default function Navigation() {
  const pathname = usePathname()
  const marketSlug = useMarketSlug()
  const [role, setRole] = useState<UserRole | null>(null)

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

  // Voci globali (hub provincia)
  const hubItems = [
    { href: '/',           label: 'Mappa',      icon: MapIcon },
    { href: '/parcheggi',  label: 'Parcheggi',  icon: Car },
    { href: '/operatori',  label: 'Bancarelle', icon: Store },
    { href: '/calendar',   label: 'Calendario', icon: Calendar },
  ]

  // Voci della zona quando sei dentro un marketSlug
  const base = marketSlug ? `/${marketSlug}` : ''
  const zoneItems = marketSlug
    ? [
        { href: `${base}`,           label: 'Panoramica', icon: MapIcon },
        { href: `${base}/parking`,   label: 'Parcheggi',  icon: Car },
        { href: `${base}/operators`, label: 'Bancarelle', icon: Store },
        { href: `${base}/news`,      label: 'Notizie',    icon: Newspaper },
      ]
    : []

  const isActive = (href: string) => pathname === href

  return (
    <nav className="bg-cream-100/85 backdrop-blur-sm border-b border-cream-300 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6">
        {/* Top row: logo + weather + auth */}
        <div className="flex items-center justify-between h-14 border-b border-cream-300/60">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="iMercati — home">
            <OliveSprig className="w-10 h-3 text-olive-500 -mb-1" />
            <span className="font-serif text-[1.55rem] leading-none text-ink tracking-tight">
              <span className="italic">i</span>
              <span className="font-medium">Mercati</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <WeatherWidget />
            {(role === 'super_admin' || role === 'market_admin') && marketSlug && (
              <Link href={`/${marketSlug}/admin`} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-ink-soft hover:text-ink">
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Gestisci</span>
              </Link>
            )}
            {role === 'super_admin' && (
              <Link href="/admin/markets" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-ink-soft hover:text-ink">
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}
            {!role && (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-ink text-cream-100 rounded-full text-sm hover:bg-ink/90 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline">Accedi</span>
              </Link>
            )}
          </div>
        </div>

        {/* Bottom row: contesto (hub provincia oppure zona corrente) */}
        <div className="flex items-center justify-between gap-4 h-12 overflow-x-auto">
          <div className="flex items-center gap-1 text-sm">
            {marketSlug ? (
              <>
                <Link
                  href="/"
                  className="text-xs uppercase tracking-widest-plus text-ink-muted hover:text-ink whitespace-nowrap pr-3 border-r border-cream-300"
                >
                  Provincia
                </Link>
                {zoneItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                        active ? 'text-ink font-medium border-b-2 border-olive-500 -mb-[2px]' : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </Link>
                  )
                })}
              </>
            ) : (
              <>
                {hubItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                        active ? 'text-ink font-medium border-b-2 border-olive-500 -mb-[2px]' : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </Link>
                  )
                })}
              </>
            )}
          </div>

          {/* Quick jump al calendario globale anche da dentro una zona */}
          {marketSlug && (
            <Link
              href="/calendar"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" /> Calendario provincia
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
