import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Newspaper } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PostItNote } from '@/components/motion/PostItCollage'
import WaveDivider from '@/components/motion/WaveDivider'
import { COMUNI_NEWS } from '@/lib/markets/comuniNews'

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
    .eq('status', 'published')
    .lte('publish_from', now)
    .or(`publish_until.is.null,publish_until.gte.${now}`)
    .order('publish_from', { ascending: false })
    .limit(60)
  const news = (data ?? []) as unknown as NewsRow[]

  return (
    <div className="bg-crema min-h-[70vh]">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-5xl">
        <div className="relative mb-10">
          <div className="max-w-2xl">
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-2">Dai comuni</p>
            <h1 className="font-display font-extrabold tracking-tight text-4xl md:text-5xl leading-[1.04] text-ink">
              Notizie dalla Riviera
            </h1>
            <p className="mt-3 text-base text-ink-soft">
              Gli avvisi ufficiali dei mercati e dei comuni della provincia di Imperia: spostamenti, orari straordinari, comunicazioni.
            </p>
          </div>
          <div aria-hidden="true" className="hidden md:block absolute right-2 -top-2 w-36 pointer-events-none">
            <PostItNote photo={{ src: '/zone/vita-piazza-mercato-sanremo-1880.webp', alt: '' }} tilt={3} aspect="aspect-[4/3]" />
          </div>
          <WaveDivider className="mt-8 text-alga/25" />
        </div>

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

        {/* Le bacheche ufficiali dei comuni: è lì che escono gli avvisi sul
            "mercato cittadino". Link diretti ai siti istituzionali (verificati). */}
        <section className="mt-14">
          <h2 className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-ink-muted mb-2">Dai siti dei comuni</h2>
          <p className="text-sm text-ink-soft mb-5 max-w-xl">
            Ogni comune pubblica gli avvisi sul proprio mercato nella bacheca del sito istituzionale: qui trovi le porte d’ingresso ufficiali.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {COMUNI_NEWS.map((c) => (
              <a
                key={c.comune}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="imk-lift group flex items-center justify-between gap-2 bg-white border border-[#e0d7c1] hover:border-alga rounded-xl px-4 py-3 transition-colors"
              >
                <span className="min-w-0">
                  <span className="block font-alt font-semibold text-sm text-ink leading-tight truncate group-hover:text-alga-600 transition-colors">{c.comune}</span>
                  <span className="block text-[11px] text-ink-muted mt-0.5">Bacheca del Comune</span>
                </span>
                <span className="text-ink-muted group-hover:text-alga-600 flex-shrink-0 transition-colors">↗</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
