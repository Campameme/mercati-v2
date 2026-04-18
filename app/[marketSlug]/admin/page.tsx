import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapIcon, Store, Newspaper, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function MarketAdminHome({ params }: { params: { marketSlug: string } }) {
  const supabase = createClient()
  const { data: market } = await supabase
    .from('markets')
    .select('id, slug, name, city')
    .ilike('slug', params.marketSlug)
    .maybeSingle()
  if (!market) notFound()

  const cards: Array<{ href: string; icon: any; title: string; desc: string }> = [
    { href: `/${market.slug}/admin/area`,      icon: MapIcon,     title: 'Area del mercato',  desc: 'Disegna il poligono sulla mappa.' },
    { href: `/${market.slug}/admin/operators`, icon: Store,       title: 'Operatori',         desc: 'Crea, posiziona, invita i titolari.' },
    { href: `/${market.slug}/admin/news`,      icon: Newspaper,   title: 'News e avvisi',     desc: 'Pubblica notizie con finestra temporale.' },
    { href: `/${market.slug}/admin/events`,    icon: CalendarDays, title: 'Eventi',           desc: 'Crea eventi con categoria e orario.' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestione {market.name}</h1>
      <p className="text-gray-600 mb-8">{market.city}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Link key={c.href} href={c.href} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
              <Icon className="w-10 h-10 text-primary-500 mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{c.title}</h2>
              <p className="text-sm text-gray-600">{c.desc}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
