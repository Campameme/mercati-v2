import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

/**
 * Returns the list of operator records bound to the logged-in user
 * (one per market). On first call, claims all pending invites for the
 * user's email, linking each operator row and promoting profile role.
 */
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  if (user.email) {
    const service = createServiceClient()
    const { data: invites } = await service
      .from('operator_invites')
      .select('id, operator_id, market_id')
      .eq('accepted', false)
      .ilike('email', user.email)

    if (invites && invites.length > 0) {
      for (const inv of invites) {
        if (inv.operator_id) {
          await service
            .from('operators')
            .update({ user_id: user.id })
            .eq('id', inv.operator_id)
            .is('user_id', null)
        }
        await service
          .from('operator_invites')
          .update({ accepted: true })
          .eq('id', inv.id)
      }
      await service
        .from('profiles')
        .update({ role: 'operator' })
        .eq('id', user.id)
        .eq('role', 'citizen')
    }
  }

  const { data: operators, error } = await supabase
    .from('operators')
    .select('*, markets!inner(slug, name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: operators ?? [] })
}
