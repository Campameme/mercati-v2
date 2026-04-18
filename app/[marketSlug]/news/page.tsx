import { notFound } from 'next/navigation'
import { AlertTriangle, Calendar, Megaphone, Clock, Globe2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { NewsItem, NewsType, NewsPriority } from '@/types/news'

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<NewsType, string> = { schedule: 'Orari', notice: 'Avviso', event: 'Evento', emergency: 'Emergenza' }
const TYPE_ICON: Record<NewsType, React.ComponentType<{ className?: string }>> = {
  schedule: Clock, notice: Megaphone, event: Calendar, emergency: AlertTriangle,
}
const PRIO_CLASS: Record<NewsPriority, string> = {
  low: 'border-gray-200 bg-white',
  medium: 'border-blue-200 bg-blue-50',
  high: 'border-red-200 bg-red-50',
}

export default async function NewsPage({ params }: { params: { marketSlug: string } }) {
  const supabase = createClient()
  const { data: market } = await supabase
    .from('markets')
    .select('id, name')
    .ilike('slug', params.marketSlug)
    .maybeSingle()
  if (!market) notFound()

  const nowIso = new Date().toISOString()
  const { data } = await supabase
    .from('news')
    .select('*')
    .or(`market_id.eq.${market.id},is_global.eq.true`)
    .lte('publish_from', nowIso)
    .or(`publish_until.is.null,publish_until.gte.${nowIso}`)
    .order('priority', { ascending: false })
    .order('publish_from', { ascending: false })

  const items: NewsItem[] = (data ?? []) as NewsItem[]

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">Notizie</h1>
      <p className="text-gray-600 mb-6">Aggiornamenti e avvisi dal mercato di {market.name}.</p>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          Nessuna notizia pubblicata al momento.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((n) => {
            const Icon = TYPE_ICON[n.type]
            return (
              <div key={n.id} className={`rounded-xl shadow p-5 border-l-4 ${PRIO_CLASS[n.priority]}`}>
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 flex-wrap">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium uppercase tracking-wide">{TYPE_LABEL[n.type]}</span>
                  {n.is_global && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold uppercase tracking-wide text-[10px]">
                      <Globe2 className="w-3 h-3" /> IMercati
                    </span>
                  )}
                  <span>• {new Date(n.publish_from).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{n.title}</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{n.content}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
