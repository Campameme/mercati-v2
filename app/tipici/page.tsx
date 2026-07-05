import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { classifySchedule } from '@/lib/schedules/classify'
import TipiciExplorer, { type TipicoItem } from '@/components/TipiciExplorer'
import DriftBackdrop from '@/components/motion/DriftBackdrop'

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
  const supabase = createClient()
  const { data } = await supabase
    .from('market_schedules')
    .select('id, comune, giorno, orario, luogo, settori, markets!inner(slug, name, is_active)')
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
      marketSlug: s.markets.slug as string,
      marketName: s.markets.name as string,
      category: classifySchedule(s.settori),
    }))
    .filter((s) => s.category !== 'generale')

  return (
    <div className="relative overflow-hidden bg-carta bg-paper-grain min-h-screen">
      <DriftBackdrop tone="light" variant="section" />
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-5xl">
        <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-2">Oltre le merci varie</p>
        <h1 className="font-alt font-extrabold tracking-tight text-3xl md:text-5xl leading-[1.04] text-ink mb-3">Mercati tipici</h1>
        <p className="text-ink-soft max-w-2xl mb-10">
          Antiquariato e collezionismo, produttori e sapori, artigianato: i mercati speciali del Ponente,
          con le loro ricorrenze — la prima domenica, il terzo sabato, le sere d’estate. Da Ventimiglia a Varazze.
        </p>
        <TipiciExplorer items={items} />
      </div>
    </div>
  )
}
