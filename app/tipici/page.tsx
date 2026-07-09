import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { classifySchedule } from '@/lib/schedules/classify'
import TipiciExplorer, { type TipicoItem } from '@/components/TipiciExplorer'
import { getLang } from '@/lib/i18n/getLang'
import { UI_I18N } from '@/lib/i18n/ui'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mercati tipici',
  description:
    'Antiquariato, produttori, artigianato: i mercati speciali della Riviera di Ponente con le loro ricorrenze — mensili, stagionali, straordinarie — da Ventimiglia a Varazze.',
}

// I "mercati tipici": tutto ciò che NON è il mercato generico di merci varie —
// antiquariato e collezionismo, produttori/alimentare, artigianato — con le
// loro ricorrenze (spesso mensili o stagionali, non settimanali).
export default async function TipiciPage() {
  const ui = UI_I18N[getLang()]
  const supabase = createClient()
  const { data } = await supabase
    .from('market_schedules')
    .select('id, comune, giorno, orario, luogo, settori, lat, lng, markets!inner(slug, name, is_active)')
    .eq('is_active', true)
    .eq('markets.is_active', true)
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
    <div className="relative overflow-hidden bg-carta min-h-screen">
      {/* banda-tendone: filo di brand in cima */}
      <div className="imk-awning h-2" aria-hidden="true" />
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-5xl">
        <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-2">{ui.tipiciEyebrow}</p>
        <h1 className="font-alt font-extrabold tracking-tight text-3xl md:text-5xl leading-[1.04] text-ink mb-3">{ui.tipiciTitle}</h1>
        <p className="text-ink-soft max-w-2xl mb-10">{ui.tipiciLead}</p>
        <TipiciExplorer items={items} />
      </div>
    </div>
  )
}
