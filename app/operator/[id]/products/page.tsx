'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft, Eye, EyeOff, Pencil, X } from 'lucide-react'
import PhotoUploader from '@/components/PhotoUploader'
import type { Product } from '@/types/product'

export default function OperatorProductsPage() {
  const params = useParams<{ id: string }>()
  const operatorId = params?.id
  const router = useRouter()
  const [operatorName, setOperatorName] = useState<string>('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!operatorId) return
    setLoading(true)
    const me = await fetch('/api/operators/me')
    if (me.status === 401) { router.replace(`/login?next=/operator/${operatorId}/products`); return }
    const { data: list } = await me.json()
    const op = (list ?? []).find((o: any) => o.id === operatorId)
    if (!op) { router.replace('/operator'); return }
    setOperatorName(op.name)
    const pr = await fetch(`/api/operators/${operatorId}/products`).then(r => r.json())
    setProducts(pr.data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [operatorId])

  async function addProduct() {
    if (!operatorId) return
    const res = await fetch(`/api/operators/${operatorId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Nuovo prodotto' }),
    })
    const j = await res.json()
    if (res.ok) {
      setProducts([j.data, ...products])
      setEditing(j.data)
    }
  }

  async function saveProduct() {
    if (!editing) return
    setSaving(true)
    const res = await fetch(`/api/products/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editing.name,
        description: editing.description,
        price: editing.price,
        currency: editing.currency,
        photos: editing.photos,
        is_available: editing.is_available,
        sort_order: editing.sort_order,
      }),
    })
    const j = await res.json()
    setSaving(false)
    if (res.ok) {
      setProducts(products.map((p) => (p.id === editing.id ? j.data : p)))
      setEditing(null)
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Eliminare il prodotto?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setProducts(products.filter((p) => p.id !== id))
    if (editing?.id === id) setEditing(null)
  }

  if (loading) return <div className="min-h-screen bg-crema"><div className="container mx-auto px-4 py-8 text-ink-soft">Caricamento…</div></div>
  if (!operatorId) return <div className="min-h-screen bg-crema"><div className="container mx-auto px-4 py-8 text-ink-soft">Nessun operatore collegato al tuo account.</div></div>

  return (
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href={`/operator/${operatorId}`} className="inline-flex items-center text-xs font-alt uppercase tracking-wider text-ink-muted hover:text-ink transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
            </Link>
            <p className="text-sm text-ink-muted mt-1">{operatorName}</p>
            <h1 className="font-alt font-bold text-3xl text-ink">Prodotti</h1>
          </div>
          <button onClick={addProduct} className="flex items-center gap-2 px-4 py-2.5 bg-alga text-white font-alt uppercase tracking-wider text-sm rounded-full hover:bg-alga-600 transition-colors">
            <Plus className="w-4 h-4" /> <span>Nuovo prodotto</span>
          </button>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-ink/10 p-8 text-center">
            <p className="text-ink-muted mb-4">Nessun prodotto ancora. Crea il primo!</p>
            <button onClick={addProduct} className="inline-flex items-center gap-2 px-4 py-2 bg-alga text-white font-alt uppercase tracking-wider text-sm rounded-full hover:bg-alga-600 transition-colors">
              <Plus className="w-4 h-4" /> <span>Crea prodotto</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border-2 border-ink/10 overflow-hidden flex flex-col">
                {p.photos?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photos[0]} alt={p.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-crema flex items-center justify-center text-ink-muted text-sm">Nessuna foto</div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between">
                    <h3 className="font-alt text-base text-ink">{p.name}</h3>
                    {p.is_available ? (
                      <span className="text-xs text-alga-600 flex items-center"><Eye className="w-3 h-3 mr-1" />Visibile</span>
                    ) : (
                      <span className="text-xs text-ink-muted flex items-center"><EyeOff className="w-3 h-3 mr-1" />Nascosto</span>
                    )}
                  </div>
                  {p.description && <p className="text-sm text-ink-soft mt-1 line-clamp-2 flex-1">{p.description}</p>}
                  {p.price !== null && (
                    <p className="text-alga-600 font-alt font-bold text-lg mt-2">
                      {new Intl.NumberFormat('it-IT', { style: 'currency', currency: p.currency }).format(p.price)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => setEditing(p)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-crema border-2 border-ink/15 hover:border-alga text-ink rounded-full text-sm transition-colors">
                      <Pencil className="w-4 h-4" /> <span>Modifica</span>
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="px-3 py-2 text-terracotta-600 hover:bg-terracotta/10 rounded-full transition-colors" title="Elimina">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border-2 border-ink/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b-2 border-ink/10">
                <h2 className="font-alt font-bold text-xl text-ink">Modifica prodotto</h2>
                <button onClick={() => setEditing(null)} className="text-ink-muted hover:text-ink transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="block md:col-span-2">
                    <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Nome</span>
                    <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Prezzo (€)</span>
                    <input
                      type="number" step="0.01"
                      value={editing.price ?? ''}
                      onChange={(e) => setEditing({ ...editing, price: e.target.value === '' ? null : parseFloat(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-alt uppercase tracking-wider text-ink-soft">Descrizione</span>
                  <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors" />
                </label>
                <div>
                  <p className="text-xs font-alt uppercase tracking-wider text-ink-soft mb-2">Foto</p>
                  <PhotoUploader
                    bucket="product-photos"
                    folder={operatorId}
                    value={editing.photos ?? []}
                    onChange={(photos) => setEditing({ ...editing, photos })}
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={editing.is_available} onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })} className="accent-alga w-4 h-4" />
                  <span className="text-sm text-ink">Visibile al pubblico</span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 p-6 border-t-2 border-ink/10 bg-crema rounded-b-xl">
                <button onClick={() => setEditing(null)} className="px-4 py-2 bg-white border-2 border-ink/15 hover:border-ink/30 text-ink-soft rounded-full transition-colors">Annulla</button>
                <button onClick={saveProduct} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-alga text-white font-alt uppercase tracking-wider text-sm rounded-full hover:bg-alga-600 disabled:opacity-50 transition-colors">
                  <Save className="w-4 h-4" /> <span>{saving ? 'Salvataggio…' : 'Salva'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
