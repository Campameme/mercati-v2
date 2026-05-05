import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { slugifyName } from '@/lib/markets/slug'
import { OliveSprig } from '@/components/decorations'
import ZoneImage from '@/components/ZoneImage'
import Reveal from '@/components/Reveal'
import ComuneSessionsExplorer from '@/components/ComuneSessionsExplorer'

export const dynamic = 'force-dynamic'

export default async function ComunePage({
  params,
}: {
  params: { marketSlug: string; comuneSlug: string }
}) {
  const supabase = createClient()
  const { data: market } = await supabase
    .from('markets')
    .select('id, slug, name, city')
    .ilike('slug', params.marketSlug)
    .maybeSingle()
  if (!market) notFound()

  const { data: schedules } = await supabase
    .from('market_schedules')
    .select('id, comune, giorno, orario, luogo, settori, lat, lng, polygon_geojson')
    .eq('market_id', market.id)
    .eq('is_active', true)
    .order('comune', { ascending: true })

  const forComune = (schedules ?? []).filter((s) => slugifyName(s.comune) === params.comuneSlug)
  if (forComune.length === 0) notFound()

  const comune = forComune[0].comune

  // Lista comuni della zona ordinati — per prev/next
  const comuniOrdinati = Array.from(new Set((schedules ?? []).map((s) => s.comune)))
    .sort((a, b) => a.localeCompare(b, 'it'))
  const curIdx = comuniOrdinati.indexOf(comune)
  const prevComune = curIdx > 0 ? comuniOrdinati[curIdx - 1] : null
  const nextComune = curIdx < comuniOrdinati.length - 1 ? comuniOrdinati[curIdx + 1] : null

  // Operatori della zona (filtriamo per schedule_id lato client)
  const { data: operators } = await supabase
    .from('operators')
    .select('id, name, category, description, stall_number, schedule_id')
    .eq('market_id', market.id)

  return (
    <div>
      {/* HERO compatto: foto sx, titolo dx. Mappa è sotto in ComuneSessionsExplorer */}
      <section className="border-b border-cream-300">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-10 max-w-6xl">
          <div className="grid md:grid-cols-[220px_1fr] gap-6 md:gap-10 items-start">
            <Reveal>
              <Link
                href={`/${market.slug}`}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest-plus text-ink-muted hover:text-ink mb-3 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> {market.name}
              </Link>
              <div className="rounded-sm overflow-hidden border border-cream-300 shadow-sm bg-cream-50 p-1.5">
                <ZoneImage query={comune} alt={comune} aspect="aspect-[4/5]" priority />
              </div>
              <p className="mt-2 text-[11px] text-ink-muted italic">{comune} · via Wikipedia</p>
            </Reveal>

            <Reveal>
              <div className="flex items-center gap-3 mb-3 text-ink-soft">
                <OliveSprig className="w-8 h-2.5 text-olive-500" />
                <p className="text-[0.72rem] uppercase tracking-widest-plus">Comune</p>
              </div>
              <h1 className="font-serif text-3xl md:text-5xl text-ink leading-[1.04]">{comune}</h1>
              <p className="mt-3 text-sm text-ink-soft">
                {forComune.length} {forComune.length === 1 ? 'mercato' : 'mercati'} · {market.name}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-5xl">
        <ComuneSessionsExplorer
          marketSlug={market.slug}
          marketName={market.name}
          marketCity={market.city}
          comune={comune}
          sessions={forComune}
          operators={operators ?? []}
        />

        {/* Nav prev/next tra comuni della stessa zona */}
        {(prevComune || nextComune) && (
          <nav className="grid grid-cols-2 gap-3 mt-12 pt-8 border-t border-cream-300 text-sm">
            {prevComune ? (
              <Link
                href={`/${market.slug}/c/${slugifyName(prevComune)}`}
                className="group flex items-center gap-3 px-4 py-3 bg-cream-50 border border-cream-300 rounded-sm hover:border-olive-500 hover:-translate-y-0.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-olive-500 group-hover:-translate-x-0.5 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest-plus text-ink-muted">Comune precedente</p>
                  <p className="font-serif text-base text-ink truncate">{prevComune}</p>
                </div>
              </Link>
            ) : <div />}
            {nextComune ? (
              <Link
                href={`/${market.slug}/c/${slugifyName(nextComune)}`}
                className="group flex items-center justify-end gap-3 px-4 py-3 bg-cream-50 border border-cream-300 rounded-sm hover:border-olive-500 hover:-translate-y-0.5 transition-all text-right"
              >
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest-plus text-ink-muted">Comune successivo</p>
                  <p className="font-serif text-base text-ink truncate">{nextComune}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-olive-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : <div />}
          </nav>
        )}
      </div>
    </div>
  )
}
