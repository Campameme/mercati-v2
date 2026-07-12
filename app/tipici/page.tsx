import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { classifySchedule } from '@/lib/schedules/classify'
import { IMPERIA_ZONE_SLUGS } from '@/lib/markets/zones'
import TipiciExplorer, { type TipicoItem } from '@/components/TipiciExplorer'
import { getLang } from '@/lib/i18n/getLang'
import type { Lang } from '@/lib/i18n/home'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mercati tipici',
  description:
    'Antiquariato, produttori, artigianato: i mercati speciali della Riviera dei Fiori con le loro ricorrenze — mensili, stagionali, straordinarie — da Ventimiglia a Diano.',
}

// Header racconto della pagina (copy locale: la versione condivisa in
// lib/i18n/ui.ts usa ancora il naming precedente del territorio).
const HEAD: Record<Lang, { eyebrow: string; title: string; lead: string }> = {
  it: {
    eyebrow: 'Oltre le merci varie',
    title: 'Mercati tipici',
    lead: 'C’è il mercato di ogni settimana, e poi ci sono i giorni speciali: l’antiquariato sotto i portici, i produttori in piazza, l’artigianato nelle sere d’estate. Sono le ricorrenze che scandiscono l’anno della Riviera dei Fiori — la prima domenica, il terzo sabato — da Ventimiglia a Diano.',
  },
  fr: {
    eyebrow: 'Au-delà du tout-venant',
    title: 'Marchés typiques',
    lead: 'Il y a le marché de chaque semaine, et puis il y a les jours spéciaux : les antiquités sous les arcades, les producteurs sur la place, l’artisanat les soirs d’été. Ce sont les rendez-vous qui rythment l’année de la Riviera dei Fiori — le premier dimanche, le troisième samedi — de Vintimille à Diano.',
  },
  de: {
    eyebrow: 'Mehr als Allerlei',
    title: 'Typische Märkte',
    lead: 'Es gibt den Markt jeder Woche — und dann die besonderen Tage: Antiquitäten unter den Arkaden, Erzeuger auf dem Platz, Handwerk an Sommerabenden. Diese Termine geben dem Jahr der Riviera dei Fiori den Takt — erster Sonntag, dritter Samstag — von Ventimiglia bis Diano.',
  },
  en: {
    eyebrow: 'Beyond the everyday market',
    title: 'Typical markets',
    lead: 'There’s the weekly market — and then there are the special days: antiques under the arcades, growers in the square, crafts on summer evenings. These are the dates that mark the year of the Riviera dei Fiori — first Sunday, third Saturday — from Ventimiglia to Diano.',
  },
}

// I "mercati tipici": tutto ciò che NON è il mercato generico di merci varie —
// antiquariato e collezionismo, produttori/alimentare, artigianato — con le
// loro ricorrenze (spesso mensili o stagionali, non settimanali).
export default async function TipiciPage() {
  const head = HEAD[getLang()]
  const supabase = createClient()
  const { data } = await supabase
    .from('market_schedules')
    .select('id, comune, giorno, orario, luogo, settori, lat, lng, markets!inner(slug, name, is_active)')
    .eq('is_active', true)
    .eq('markets.is_active', true)
    .in('markets.slug', [...IMPERIA_ZONE_SLUGS])
    .order('comune', { ascending: true })

  const items: TipicoItem[] = ((data ?? []) as any[])
    .map((s) => ({
      id: s.id as string,
      comune: s.comune as string,
      giorno: s.giorno as string,
      orario: (s.orario ?? null) as string | null,
      luogo: (s.luogo ?? null) as string | null,
      settori: (s.settori ?? null) as string | null,
      lat: (s.lat ?? null) as number | null,
      lng: (s.lng ?? null) as number | null,
      marketSlug: s.markets.slug as string,
      marketName: s.markets.name as string,
      category: classifySchedule(s.settori),
    }))
    .filter((s) => s.category !== 'generale')

  return (
    <div className="bg-crema min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-5xl">
        <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-terracotta mb-2">{head.eyebrow}</p>
        <h1 className="font-display font-extrabold tracking-tight text-4xl md:text-5xl leading-[1.04] text-ink mb-3">{head.title}</h1>
        <p className="text-ink-soft max-w-2xl mb-10 leading-relaxed">{head.lead}</p>
        <TipiciExplorer items={items} />
      </div>
    </div>
  )
}
