'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Store, LogOut, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface OperatorRow {
  id: string
  name: string
  category: string
  stall_number: string | null
  is_open: boolean
  photos: string[]
  markets: { slug: string; name: string }
}

export default function OperatorHub() {
  const router = useRouter()
  const [operators, setOperators] = useState<OperatorRow[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/operators/me')
    if (res.status === 401) { router.replace('/login?next=/operator'); return }
    const { data } = await res.json()
    const list: OperatorRow[] = data ?? []
    setOperators(list)
    setLoading(false)
    // If exactly one operator, skip the hub and go straight to its dashboard
    if (list.length === 1) router.replace(`/operator/${list[0].id}`)
  }
  useEffect(() => { load() }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (loading) return <div className="min-h-screen bg-paper"><div className="container mx-auto px-4 py-8 text-ink-soft">Caricamento…</div></div>
  if (operators.length === 0) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <h1 className="font-display text-2xl text-ink mb-4">Nessun banco collegato</h1>
          <p className="text-ink-soft mb-6">Non risulta nessuna scheda operatore associata al tuo account. Chiedi all&apos;amministratore del mercato di invitarti.</p>
          <button onClick={handleLogout} className="px-4 py-2 bg-paper border-2 border-ink/15 hover:border-ink/30 text-ink rounded-full font-alt uppercase tracking-wider text-sm transition-colors">Logout</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-alt uppercase tracking-[0.18em] text-pesto-600 mb-1">Area operatore</p>
            <h1 className="font-display text-3xl text-ink">I tuoi banchi</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-ink/15 hover:border-ink/30 text-ink rounded-full text-sm transition-colors">
            <LogOut className="w-4 h-4" /> <span>Esci</span>
          </button>
        </div>

        <p className="text-ink-soft mb-6">Sei operatore in {operators.length} {operators.length === 1 ? 'mercato' : 'mercati'}. Scegli quale gestire.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {operators.map((op) => (
            <Link key={op.id} href={`/operator/${op.id}`} className="bg-white rounded-xl border-2 border-ink/10 p-6 hover:border-pesto hover:-translate-y-0.5 transition-all flex items-start gap-4">
              {op.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={op.photos[0]} alt={op.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 bg-pesto/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Store className="w-10 h-10 text-pesto" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-muted flex items-center"><MapPin className="w-3 h-3 mr-1 text-pesto" />{op.markets?.name}</p>
                <h2 className="font-display text-xl text-ink mt-1 truncate">{op.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="px-2 py-0.5 bg-pesto/15 text-pesto-700 font-alt uppercase tracking-wider rounded-full">{op.category}</span>
                  {op.stall_number && <span className="text-ink-muted">• {op.stall_number}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
