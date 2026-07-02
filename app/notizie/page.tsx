import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Newspaper } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import WaterCard from '@/components/motion/WaterCard'
import DriftBackdrop from '@/components/motion/DriftBackdrop'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Notizie dalla Riviera',
  description:
    'Gli avvisi dei comuni e le novità dai mercati della Riviera di Ponente: spostamenti, orari straordinari, comunicazioni ufficiali.',
}

interface NewsRow {
  id: string
  title: string
  content: string | null
  publish_from: string
  markets: { slug: string; name: string; city: string } | null
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

export default async function NotiziePage() {
  const supabase = createClient()
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('news')
    .select('id, title, content, publish_from, markets(slug, name, city)')
    .lte('publish_from', now)
    .or(`publish_until.is.null,publish_until.gte.${now}`)
    .order('publish_from', { ascending: false })
    .limit(60)
  const news = (data ?? []) as unknown as NewsRow[]

  return (
    <div className="relative overflow-hidden bg-paper bg-paper-grain min-h-[70vh]">
      <DriftBackdrop tone="light" variant="hero" />
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-14 md:py-20 max-w-5xl">
        <div className="max-w-2xl mb-10">
          <p className="font-alt text-xs font-semibold uppercase tracking-[0.2em] text-mare-600 mb-2">Dai comuni</p>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.04] text-ink">Notizie dalla Riviera</h1>
          <p className="mt-3 text-base text-ink-soft">
            Avvisi, spostamenti e novità dai mercati e dai comuni del Ponente, in ordine di pubblicazione.
          </p>
        </div>

        {news.length === 0 ? (
          <WaterCard className="px-6 py-12 text-center max-w-lg">
            <Newspaper className="w-8 h-8 text-mare mx-auto mb-3" aria-hidden="true" />
            <p className="font-accent text-2xl text-mare-600">Presto nuove notizie</p>
            <p className="mt-2 text-sm text-ink-soft">Gli avvisi dei comuni e dei mercati compariranno qui.</p>
          </WaterCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {news.map((n, i) => (
              <WaterCard key={n.id} tilt={i % 2 === 0 ? 'l' : 'r'} className="p-6">
                <span className="font-alt text-xs font-semibold uppercase tracking-[0.1em] text-mare-600">
                  {fmtDate(n.publish_from)}
                  {n.markets?.name ? ` · ${n.markets.name}` : ''}
                </span>
                <h2 className="font-display text-xl text-ink leading-tight mt-2">{n.title}</h2>
                {n.content && <p className="mt-2 text-sm text-ink-soft leading-relaxed whitespace-pre-line">{n.content}</p>}
                {n.markets?.slug && (
                  <Link
                    href={`/${n.markets.slug}/news`}
                    className="group mt-4 inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.1em] text-mare-600 hover:text-mare-700 transition-colors"
                  >
                    La zona di {n.markets.name} <ArrowRight className="imk-march w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                )}
              </WaterCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
