'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MapPin, Store, Newspaper, User, Calendar } from 'lucide-react'
import WeatherWidget from './WeatherWidget'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/parking', label: 'Parcheggio', icon: MapPin },
    { href: '/operators', label: 'Operator', icon: Store },
    { href: '/calendar', label: 'Calendario', icon: Calendar },
    { href: '/news', label: 'Notizie', icon: Newspaper },
  ]

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-primary-600">
            Market App
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            
            {/* Widget Meteo */}
            <WeatherWidget />
          </div>

          <div className="flex items-center space-x-3">
            {/* Widget Meteo Mobile */}
            <div className="md:hidden">
              <WeatherWidget />
            </div>
            
            <Link
              href="/operator-area"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="hidden md:inline">Area Operator</span>
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

