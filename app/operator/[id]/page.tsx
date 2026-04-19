'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Save, Package, ArrowLeft, LogOut } from 'lucide-react'
import PhotoUploader from '@/components/PhotoUploader'
import { createClient } from '@/lib/supabase/client'

const PAYMENT_METHODS = ['cash', 'card', 'digital']
const LANGS = ['it', 'en', 'fr', 'de', 'es']

interface OperatorMe {
  id: string
  market_id: string
  name: string
  category: string
  description: string | null
  stall_number: string | null
  location_lat: number | null
  location_lng: number | null
  photos: string[]
  languages: string[]
  payment_methods: string[]
  social_links: Record<string, string>
  is_open: boolean
  markets: { slug: string; name: string }
}

export default function OperatorMarketDashboard() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const [operator, setOperator] = useState<OperatorMe | null>(null)
  const [totalOwned, setTotalOwned] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function load() {
    if (!id) return
    setLoading(true)
    const res = await fetch('/api/operators/me')
    if (res.status === 401) { router.replace(`/login?next=/operator/${id}`); return }
    const { data } = await res.json()
    const list: OperatorMe[] = data ?? []
    setTotalOwned(list.length)
    const op = list.find((o) => o.id === id)
    if (!op) { router.replace('/operator'); return }
    setOperator(op)
    setLoading(false)
  }
  useEffect(() => { load() }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!operator) return
    setSaving(true); setMsg(null)
    const res = await fetch(`/api/operators/${operator.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: operator.name,
        description: operator.description,
        photos: operator.photos,
        languages: operator.languages,
        payment_methods: operator.payment_methods,
        social_links: operator.social_links,
        is_open: operator.is_open,
      }),
    })
    const j = await res.json()
    if (!res.ok) setMsg(j.error ?? 'Errore')
    else setMsg('Salvato')
    setSaving(false)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  function toggleArr<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
  }

  if (loading || !operator) return <div className="container mx-auto px-4 py-8">Caricamento…</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          {totalOwned > 1 && (
            <Link href="/operator" className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 mb-1">
              <ArrowLeft className="w-4 h-4 mr-1" /> Tutti i banchi
            </Link>
          )}
          <p className="text-sm text-gray-500">{operator.markets?.name}</p>
          <h1 className="text-3xl font-bold text-gray-900">{operator.name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/operator/${operator.id}/products`} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
            <Package className="w-4 h-4" /> <span>Prodotti</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
            <LogOut className="w-4 h-4" /> <span>Esci</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Nome</span>
            <input value={operator.name} onChange={(e) => setOperator({ ...operator, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </label>
          <label className="flex items-center space-x-2 mt-6">
            <input type="checkbox" checked={operator.is_open} onChange={(e) => setOperator({ ...operator, is_open: e.target.checked })} />
            <span className="text-sm">Aperto oggi</span>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Descrizione</span>
          <textarea value={operator.description ?? ''} onChange={(e) => setOperator({ ...operator, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </label>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Foto del banco</p>
          <PhotoUploader
            bucket="operator-photos"
            folder={operator.id}
            value={operator.photos ?? []}
            onChange={(photos) => setOperator({ ...operator, photos })}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Lingue parlate</p>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button
                key={l} type="button"
                onClick={() => setOperator({ ...operator, languages: toggleArr(operator.languages, l) })}
                className={`px-3 py-1 rounded-full text-sm border ${operator.languages.includes(l) ? 'bg-primary-100 text-primary-700 border-primary-300' : 'bg-white text-gray-600 border-gray-300'}`}
              >{l}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Metodi di pagamento</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m} type="button"
                onClick={() => setOperator({ ...operator, payment_methods: toggleArr(operator.payment_methods, m) })}
                className={`px-3 py-1 rounded-full text-sm border ${operator.payment_methods.includes(m) ? 'bg-primary-100 text-primary-700 border-primary-300' : 'bg-white text-gray-600 border-gray-300'}`}
              >{m}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Instagram</span>
            <input value={operator.social_links?.instagram ?? ''} onChange={(e) => setOperator({ ...operator, social_links: { ...operator.social_links, instagram: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Facebook</span>
            <input value={operator.social_links?.facebook ?? ''} onChange={(e) => setOperator({ ...operator, social_links: { ...operator.social_links, facebook: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Sito web</span>
            <input value={operator.social_links?.website ?? ''} onChange={(e) => setOperator({ ...operator, social_links: { ...operator.social_links, website: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </label>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-600">{msg}</div>
          <button type="submit" disabled={saving} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> <span>{saving ? 'Salvataggio…' : 'Salva'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
