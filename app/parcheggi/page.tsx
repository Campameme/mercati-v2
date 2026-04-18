import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OliveSprig, WaveDivider } from '@/components/decorations'

export const dynamic = 'force-dynamic'

export default async function ParcheggiHubPage() {
  const supabase = createClient()
  const { data: markets } = await supabase
    .from('markets')
    .select('id, slug, name, city, center_lat, center_lng')
    .eq('is_active', true)
    .order('name', { ascending: true })

  const { data: schedules } = await supabase
    .from('market_schedules')
    .select('market_id, comune')
    .eq('is_active', true)

  const comuniByMarket = new Map<string, string[]>()
  for (const s of schedules ?? []) {
    const arr = comuniByMarket.get(s.market_id) ?? []
    if (!arr.includes(s.comune)) arr.push(s.comune)
    comuniByMarket.set(s.market_id, arr)
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-5xl">
      <div className="mb-8 border-b border-cream-300 pb-6">
        <div className="flex items-center gap-3 mb-2 text-ink-soft">
          <OliveSprig className="w-8 h-2.5 text-olive-500" />
          <p className="text-[0.72rem] uppercase tracking-widest-plus">Provincia · panoramica</p>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl text-ink leading-tight">
          Parcheggi <span className="italic font-light text-olive-600">per zona</span>
        </h1>
        <p className="text-sm text-ink-soft mt-3 max-w-xl">
          Seleziona una zona per vedere i parcheggi vicini in tempo reale, con affluenza stimata e
          indicazioni dirette.
        </p>
      </div>

      <div className="flex items-end justify-between mb-4">
        <p className="text-xs uppercase tracking-widest-plus text-ink-muted">Scegli la zona</p>
        <WaveDivider className="w-24 text-sea-500 opacity-60" />
      </div>

      {(!markets || markets.length === 0) ? (
        <p className="text-ink-muted text-sm">Nessuna zona disponibile.</p>
      ) : (
        <ul className="border-y border-cream-300 divide-y divide-cream-300">
          {markets.map((m) => {
            const comuni = comuniByMarket.get(m.id) ?? []
            return (
              <li key={m.id}>
                <Link
                  href={`/${m.slug}/parking`}
                  className="group flex items-start gap-5 py-5 hover:bg-cream-50 -mx-3 px-3 rounded-sm transition-colors"
                >
                  <MapPin className="w-5 h-5 text-olive-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg text-ink leading-tight">{m.name}</h3>
                    <p className="text-sm text-ink-soft mt-0.5">
                      {comuni.length > 1 ? comuni.join(' · ') : m.city}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-ink group-hover:translate-x-0.5 transition-all mt-2 flex-shrink-0" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <p className="text-xs text-ink-muted mt-8 max-w-2xl leading-relaxed">
        I dati dei parcheggi arrivano da Google Places e variano per ogni zona. Per evitare chiamate
        massive a costo, la mappa dettagliata si apre entrando nella zona: un click e vedi i parcheggi,
        l&apos;affluenza e le indicazioni.
      </p>
    </div>
  )
}
