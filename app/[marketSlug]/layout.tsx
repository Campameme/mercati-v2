import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function MarketLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { marketSlug: string }
}) {
  const supabase = createClient()
  const { data: market } = await supabase
    .from('markets')
    .select('id, is_active')
    .ilike('slug', params.marketSlug)
    .maybeSingle()

  if (!market || !market.is_active) notFound()

  return <>{children}</>
}
