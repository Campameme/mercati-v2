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

  if (loading) return <div className="container mx-auto px-4 py-8">Caricamento…</div>
  if (operators.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-4">Nessun banco collegato</h1>
        <p className="text-gray-600 mb-6">Non risulta nessuna scheda operatore associata al tuo account. Chiedi all&apos;amministratore del mercato di invitarti.</p>
        <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 rounded-md">Logout</button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">I tuoi banchi</h1>
        <button onClick={handleLogout} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
          <LogOut className="w-4 h-4" /> <span>Esci</span>
        </button>
      </div>

      <p className="text-gray-600 mb-6">Sei operatore in {operators.length} {operators.length === 1 ? 'mercato' : 'mercati'}. Scegli quale gestire.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {operators.map((op) => (
          <Link key={op.id} href={`/operator/${op.id}`} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow flex items-start space-x-4">
            {op.photos?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={op.photos[0]} alt={op.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Store className="w-10 h-10 text-primary-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 flex items-center"><MapPin className="w-3 h-3 mr-1" />{op.markets?.name}</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-1 truncate">{op.name}</h2>
              <div className="flex items-center space-x-2 mt-1 text-xs">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{op.category}</span>
                {op.stall_number && <span className="text-gray-500">• {op.stall_number}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
