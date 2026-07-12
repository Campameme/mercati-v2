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

  if (loading || !operator) return <div className="min-h-screen bg-crema"><div className="container mx-auto px-4 py-8 text-ink-soft">Caricamento…</div></div>

  return (
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            {totalOwned > 1 && (
              <Link href="/operator" className="inline-flex items-center text-xs font-alt uppercase tracking-wider text-ink-muted hover:text-ink mb-1 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Tutti i banchi
              </Link>
            )}
            <p className="text-sm text-ink-muted">{operator.markets?.name}</p>
            <h1 className="font-alt font-bold text-3xl text-ink">{operator.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/operator/${operator.id}/products`} className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-ink/15 hover:border-alga text-ink rounded-full text-sm transition-colors">
              <Package className="w-4 h-4" /> <span>Prodotti</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-ink/15 hover:border-ink/30 text-ink rounded-full text-sm transition-colors">
              <LogOut className="w-4 h-4" /> <span>Esci</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-xl border-2 border-ink/10 p-6 space-y-4">
          <label className="block">
            <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Nome</span>
            <input value={operator.name} onChange={(e) => setOperator({ ...operator, name: e.target.value })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
          </label>

          <label className="block">
            <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Descrizione</span>
            <textarea value={operator.description ?? ''} onChange={(e) => setOperator({ ...operator, description: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
          </label>

          <div>
            <p className="text-xs font-alt uppercase tracking-wider text-ink-soft mb-2">Foto del banco</p>
            <PhotoUploader
              bucket="operator-photos"
              folder={operator.id}
              value={operator.photos ?? []}
              onChange={(photos) => setOperator({ ...operator, photos })}
            />
          </div>

          <div>
            <p className="text-xs font-alt uppercase tracking-wider text-ink-soft mb-2">Lingue parlate</p>
            <div className="flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <button
                  key={l} type="button"
                  onClick={() => setOperator({ ...operator, languages: toggleArr(operator.languages, l) })}
                  className={`px-3 py-1 rounded-full text-sm border-2 transition-colors ${operator.languages.includes(l) ? 'bg-alga/15 text-alga-600 border-alga/40' : 'bg-crema text-ink-soft border-ink/15 hover:border-ink/30'}`}
                >{l}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-alt uppercase tracking-wider text-ink-soft mb-2">Metodi di pagamento</p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m} type="button"
                  onClick={() => setOperator({ ...operator, payment_methods: toggleArr(operator.payment_methods, m) })}
                  className={`px-3 py-1 rounded-full text-sm border-2 transition-colors ${operator.payment_methods.includes(m) ? 'bg-alga/15 text-alga-600 border-alga/40' : 'bg-crema text-ink-soft border-ink/15 hover:border-ink/30'}`}
                >{m}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Instagram</span>
              <input value={operator.social_links?.instagram ?? ''} onChange={(e) => setOperator({ ...operator, social_links: { ...operator.social_links, instagram: e.target.value } })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
            </label>
            <label className="block">
              <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Facebook</span>
              <input value={operator.social_links?.facebook ?? ''} onChange={(e) => setOperator({ ...operator, social_links: { ...operator.social_links, facebook: e.target.value } })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
            </label>
            <label className="block">
              <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Sito web</span>
              <input value={operator.social_links?.website ?? ''} onChange={(e) => setOperator({ ...operator, social_links: { ...operator.social_links, website: e.target.value } })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-ink-soft">{msg}</div>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-alga text-white font-alt uppercase tracking-wider text-sm rounded-full hover:bg-alga-600 disabled:opacity-50 transition-colors">
              <Save className="w-4 h-4" /> <span>{saving ? 'Salvataggio…' : 'Salva'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
