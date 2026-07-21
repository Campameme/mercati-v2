import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Newspaper } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PostItNote } from '@/components/motion/PostItCollage'
import WaveDivider from '@/components/motion/WaveDivider'
import { COMUNI_NEWS } from '@/lib/markets/comuniNews'
import { fetchComuniNews, type ComuneNewsItem } from '@/lib/news/fetchComuniNews'
import { getLang } from '@/lib/i18n/getLang'
import type { Lang } from '@/lib/i18n/home'

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

// Etichette del blocco "Ultime dai comuni" nelle 4 lingue del sito
// (stesso schema leggero di lib/i18n: dizionario in chiaro, niente routing).
const COMUNI_LIVE_DICT: Record<Lang, { title: string; lead: string }> = {
  it: {
    title: 'Ultime dai comuni',
    lead: 'Le notizie sui mercati pubblicate dai siti ufficiali, raccolte in automatico.',
  },
  fr: {
    title: 'Dernières nouvelles des communes',
    lead: 'Les actualités des marchés publiées par les sites officiels, réunies automatiquement.',
  },
  de: {
    title: 'Aktuelles aus den Gemeinden',
    lead: 'Die Markt-Nachrichten der offiziellen Websites, automatisch gesammelt.',
  },
  en: {
    title: 'Latest from the towns',
    lead: 'Market news published by the official town websites, gathered automatically.',
  },
}

const DATE_LOCALES: Record<Lang, string> = { it: 'it-IT', fr: 'fr-FR', de: 'de-DE', en: 'en-GB' }

// Data contratta per le card compatte: "21 lug", con l'anno solo se diverso
// da quello corrente ("3 dic 2025").
function fmtDateShort(iso: string, lang: Lang) {
  try {
    const d = new Date(iso)
    const opts: Intl.DateTimeFormatOptions =
      d.getFullYear() === new Date().getFullYear()
        ? { day: 'numeric', month: 'short' }
        : { day: 'numeric', month: 'short', year: 'numeric' }
    return d.toLocaleDateString(DATE_LOCALES[lang], opts)
  } catch {
    return ''
  }
}

export default async function NotiziePage() {
  const lang = getLang()
  const supabase = createClient()
  const now = new Date().toISOString()
  // Notizie sui mercati dai feed ufficiali dei comuni (cache 1h, mai bloccante:
  // se tutte le fonti falliscono arriva [] e il blocco non viene mostrato).
  const comuniNews: ComuneNewsItem[] = await fetchComuniNews()
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
      {/* Testata su crema-2: l'onda fluida in fondo fa "salire" la crema
          degli avvisi dentro la testata (merge, come in home). */}
      <section className="relative bg-crema-2">
        <div className="container mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-2 max-w-5xl">
          <div className="relative">
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
          </div>
        </div>
        {/* onda piena: la prossima sezione (crema) sale in questa (merge) */}
        <WaveDivider fill className="relative z-10 text-crema" />
      </section>

      {/* Avvisi su crema; in fondo l'onda annuncia la sezione comuni (crema-2). */}
      <section className="relative bg-crema">
        <div className="container mx-auto px-4 md:px-6 pt-8 md:pt-10 pb-2 max-w-5xl">
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
        {/* onda piena: la sezione dei comuni (crema-2) sale in questa (merge) */}
        <WaveDivider fill className="relative z-10 text-crema-2" />
      </section>

      {/* Le bacheche ufficiali dei comuni: è lì che escono gli avvisi sul
          "mercato cittadino". Link diretti ai siti istituzionali (verificati). */}
      <section className="bg-crema-2">
        <div className="container mx-auto px-4 md:px-6 pt-8 md:pt-10 pb-14 md:pb-16 max-w-5xl">
          <h2 className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-ink-muted mb-2">Dai siti dei comuni</h2>
          <p className="text-sm text-ink-soft mb-5 max-w-xl">
            Ogni comune pubblica gli avvisi sul proprio mercato nella bacheca del sito istituzionale: qui trovi le porte d’ingresso ufficiali.
          </p>

          {/* Ultime dai comuni: notizie sui mercati pescate in automatico dai
              feed dei siti istituzionali. Se non c'è nulla (o le fonti sono
              giù), il blocco sparisce senza errori visibili. */}
          {comuniNews.length > 0 && (
            <div className="mb-8">
              <h3 className="font-display font-extrabold tracking-tight text-xl text-ink">
                {COMUNI_LIVE_DICT[lang].title}
              </h3>
              <p className="mt-1 text-sm text-ink-soft max-w-xl">{COMUNI_LIVE_DICT[lang].lead}</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {comuniNews.map((n) => (
                  <a
                    key={n.url}
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="imk-lift group flex flex-col bg-white rounded-xl border border-[#e0d7c1] hover:border-alga overflow-hidden transition-colors"
                  >
                    <span aria-hidden="true" className="mz-band" style={{ ['--band' as string]: '#46683B' }} />
                    <span className="flex flex-col gap-1.5 p-4">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-alt text-xs font-semibold uppercase tracking-[0.1em] text-alga-600 truncate">
                          {n.comune}
                        </span>
                        {n.date && (
                          <span className="text-[11px] text-ink-muted flex-shrink-0">{fmtDateShort(n.date, lang)}</span>
                        )}
                      </span>
                      <span className="font-display font-extrabold tracking-tight text-base leading-snug text-ink group-hover:text-alga-600 transition-colors">
                        {n.title}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

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
        </div>
      </section>
    </div>
  )
}
