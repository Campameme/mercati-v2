import { notFound } from 'next/navigation'
import { AlertTriangle, Calendar, Megaphone, Clock, Globe2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { fetchLiveNews, zoneNewsQuery } from '@/lib/news/live'
import { ZONE_BY_SLUG } from '@/lib/markets/zones'
import type { NewsItem, NewsType, NewsPriority } from '@/types/news'

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<NewsType, string> = { schedule: 'Orari', notice: 'Avviso', event: 'Evento', emergency: 'Emergenza' }
const TYPE_ICON: Record<NewsType, React.ComponentType<{ className?: string }>> = {
  schedule: Clock, notice: Megaphone, event: Calendar, emergency: AlertTriangle,
}
// Priorità → colore bordo sinistro, in palette brand (mare/sole/fiore).
const PRIO_CLASS: Record<NewsPriority, string> = {
  low: 'border-l-ink/20 bg-white',
  medium: 'border-l-alga bg-crema-2/40',
  high: 'border-l-terracotta bg-terracotta/5',
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
    .eq('status', 'published')
    .lte('publish_from', nowIso)
    .or(`publish_until.is.null,publish_until.gte.${nowIso}`)
    .order('priority', { ascending: false })
    .order('publish_from', { ascending: false })

  const items: NewsItem[] = (data ?? []) as NewsItem[]

  // Notizie vive dalla stampa locale e dai comuni della zona
  const zoneMeta = ZONE_BY_SLUG[params.marketSlug]
  const live = zoneMeta ? await fetchLiveNews(zoneNewsQuery(zoneMeta.borghi), 6) : []

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-3xl">
      <div className="flex items-center gap-3 mb-3 text-ink-soft">
        <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em]">{market.name} · notizie</p>
      </div>
      <h1 className="font-display font-extrabold text-3xl md:text-5xl text-ink leading-[1.06] mb-2">Notizie</h1>
      <p className="text-sm text-ink-soft mb-8">Aggiornamenti e avvisi dal mercato di {market.name}.</p>

      {items.length === 0 ? (
        <div className="bg-white border-2 border-ink/10 rounded-xl p-8 text-center text-ink-muted">
          Nessuna notizia pubblicata al momento.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((n) => {
            const Icon = TYPE_ICON[n.type]
            return (
              <div key={n.id} className={`rounded-xl border-2 border-ink/10 border-l-4 p-5 ${PRIO_CLASS[n.priority]}`}>
                <div className="flex items-center gap-2 mb-2 text-xs text-ink-muted flex-wrap">
                  <Icon className="w-4 h-4 text-alga" aria-hidden="true" />
                  <span className="font-alt font-semibold uppercase tracking-[0.08em]">{TYPE_LABEL[n.type]}</span>
                  {n.is_global && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-terracotta/20 text-terracotta-600 font-alt font-semibold uppercase tracking-[0.08em] text-[11px]">
                      <Globe2 className="w-3 h-3" /> I Mercati della Riviera dei Fiori
                    </span>
                  )}
                  <span>· {new Date(n.publish_from).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <h2 className="font-alt font-bold text-xl text-ink mb-1">{n.title}</h2>
                <p className="text-ink-soft whitespace-pre-wrap leading-relaxed">{n.content}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Dalla stampa e dai siti dei comuni (aggiornate automaticamente) */}
      {live.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-4 text-ink-muted">
            <Globe2 className="w-4 h-4" aria-hidden="true" />
            <h2 className="font-alt text-xs font-semibold uppercase tracking-[0.14em]">Dalla stampa e dai comuni</h2>
          </div>
          <ul className="divide-y divide-ink/10 border-y-2 border-ink/10">
            {live.map((n) => (
              <li key={n.link}>
                <a href={n.link} target="_blank" rel="noopener noreferrer" className="group flex items-baseline justify-between gap-4 py-3.5 hover:bg-white -mx-2 px-2 transition-colors">
                  <span className="min-w-0">
                    <span className="block font-alt font-semibold text-[15px] text-ink leading-snug group-hover:text-alga-600 transition-colors">{n.title}</span>
                    <span className="block text-xs text-ink-muted mt-1">
                      {n.source ?? ''}
                      {n.publishedAt ? ` · ${new Date(n.publishedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}` : ''}
                    </span>
                  </span>
                  <span className="text-ink-muted group-hover:text-alga-600 flex-shrink-0">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
