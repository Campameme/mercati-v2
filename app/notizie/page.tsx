import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Newspaper } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { fetchLiveNews, generalNewsQuery } from '@/lib/news/live'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Notizie dalla Riviera',
  description:
    'Gli avvisi dei comuni e le novità dai mercati della Riviera dei Fiori: spostamenti, orari straordinari, comunicazioni ufficiali.',
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
  const live = await fetchLiveNews(generalNewsQuery(), 8)

  return (
    <div className="bg-crema min-h-[70vh]">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-5xl">
        <div className="max-w-2xl mb-10">
          <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-2">Dai comuni</p>
          <h1 className="font-display font-extrabold tracking-tight text-4xl md:text-5xl leading-[1.04] text-ink">
            Notizie dalla Riviera
          </h1>
          <p className="mt-3 text-base text-ink-soft">
            La bacheca della Riviera dei Fiori: le ultime dalla stampa e dai comuni, più gli avvisi ufficiali dei mercati.
          </p>
        </div>

        {/* Bacheca generale: notizie vive dalla stampa e dai siti dei comuni */}
        {live.length > 0 && (
          <section className="mb-12">
            <h2 className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-ink-muted mb-4">La bacheca della Riviera</h2>
            <div className="bg-white rounded-xl border border-[#e0d7c1] overflow-hidden">
              <span aria-hidden="true" className="mz-band block" style={{ ['--band' as string]: '#46683B' }} />
              <ul className="divide-y divide-ink/10">
                {live.map((n) => (
                  <li key={n.link}>
                    <a href={n.link} target="_blank" rel="noopener noreferrer" className="group flex items-baseline justify-between gap-4 py-3.5 px-4 md:px-5 hover:bg-crema transition-colors">
                      <span className="min-w-0">
                        <span className="block font-alt font-semibold text-[15px] text-ink leading-snug group-hover:text-alga-600 transition-colors">{n.title}</span>
                        <span className="block text-xs text-ink-muted mt-1">
                          {n.source ?? ''}
                          {n.publishedAt ? ` · ${fmtDate(n.publishedAt)}` : ''}
                        </span>
                      </span>
                      <span className="text-ink-muted group-hover:text-alga-600 flex-shrink-0">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <h2 className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-ink-muted mb-4">Avvisi ufficiali dei mercati</h2>

        {news.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e0d7c1] px-6 py-12 text-center max-w-lg">
            <Newspaper className="w-8 h-8 text-alga mx-auto mb-3" aria-hidden="true" />
            <p className="font-display font-extrabold tracking-tight text-xl text-alga">Presto nuove notizie</p>
            <p className="mt-2 text-sm text-ink-soft">Gli avvisi dei comuni e dei mercati compariranno qui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {news.map((n) => (
              <article key={n.id} className="flex flex-col bg-white rounded-xl border border-[#e0d7c1] overflow-hidden">
                <span aria-hidden="true" className="mz-band" style={{ ['--band' as string]: '#46683B' }} />
                <div className="p-6">
                  <span className="font-alt text-xs font-semibold uppercase tracking-[0.1em] text-alga-600">
                    {fmtDate(n.publish_from)}
                    {n.markets?.name ? ` · ${n.markets.name}` : ''}
                  </span>
                  <h2 className="font-display font-extrabold tracking-tight text-xl text-ink leading-tight mt-2">{n.title}</h2>
                  {n.content && <p className="mt-2 text-sm text-ink-soft leading-relaxed whitespace-pre-line">{n.content}</p>}
                  {n.markets?.slug && (
                    <Link
                      href={`/${n.markets.slug}/news`}
                      className="group mt-4 inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.1em] text-alga-600 hover:text-alga transition-colors"
                    >
                      La zona di {n.markets.name} <ArrowRight className="imk-march w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
