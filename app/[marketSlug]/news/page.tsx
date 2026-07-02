import { notFound } from 'next/navigation'
import { AlertTriangle, Calendar, Megaphone, Clock, Globe2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SunRay } from '@/components/decorations'
import type { NewsItem, NewsType, NewsPriority } from '@/types/news'

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<NewsType, string> = { schedule: 'Orari', notice: 'Avviso', event: 'Evento', emergency: 'Emergenza' }
const TYPE_ICON: Record<NewsType, React.ComponentType<{ className?: string }>> = {
  schedule: Clock, notice: Megaphone, event: Calendar, emergency: AlertTriangle,
}
// Priorità → colore bordo sinistro, in palette brand (mare/sole/fiore).
const PRIO_CLASS: Record<NewsPriority, string> = {
  low: 'border-l-ink/20 bg-white',
  medium: 'border-l-mare bg-marel/40',
  high: 'border-l-fiore bg-fiore/5',
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
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-3xl">
      <div className="flex items-center gap-3 mb-3 text-ink-soft">
        <SunRay className="w-5 h-5 text-sole" aria-hidden="true" />
        <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em]">{market.name} · notizie</p>
      </div>
      <h1 className="font-display text-3xl md:text-5xl text-ink leading-[1.06] mb-2">Notizie</h1>
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
                  <Icon className="w-4 h-4 text-mare" aria-hidden="true" />
                  <span className="font-alt font-semibold uppercase tracking-[0.08em]">{TYPE_LABEL[n.type]}</span>
                  {n.is_global && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sole/20 text-sole-600 font-alt font-semibold uppercase tracking-[0.08em] text-[10px]">
                      <Globe2 className="w-3 h-3" /> Mercati della Riviera di Ponente
                    </span>
                  )}
                  <span>· {new Date(n.publish_from).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <h2 className="font-display text-xl text-ink mb-1">{n.title}</h2>
                <p className="text-ink-soft whitespace-pre-wrap leading-relaxed">{n.content}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
