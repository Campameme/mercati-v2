import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { newsEditorMarketIds } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

// Ambito della redazione per l'utente corrente: il super_admin vede tutti i
// mercati e le globali (marketIds vuoto = "tutti"); il news_editor SOLO i mercati
// assegnati (news_editor_markets) e mai le globali. La pagina /redazione (client)
// usa questo per filtrare filtro/select e nascondere "Tutta la rete".
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const role = profile?.role ?? 'citizen'
  if (role !== 'super_admin' && role !== 'news_editor') {
    return NextResponse.json({ error: 'Permessi insufficienti' }, { status: 403 })
  }

  const marketIds = role === 'news_editor' ? await newsEditorMarketIds(supabase, user.id) : []
  return NextResponse.json({ role, marketIds })
}
