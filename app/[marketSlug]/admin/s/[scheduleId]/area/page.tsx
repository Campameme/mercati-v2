import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ScheduleAreaRedirect({
  params,
}: {
  params: { marketSlug: string; scheduleId: string }
}) {
  const supabase = createClient()
  const { data } = await supabase
    .from('market_schedules')
    .select('place_id')
    .eq('id', params.scheduleId)
    .maybeSingle()
  if (data?.place_id) {
    redirect(`/${params.marketSlug}/admin/places/${data.place_id}/area`)
  }
  redirect(`/${params.marketSlug}/admin/s/${params.scheduleId}`)
}
