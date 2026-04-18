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

  if (loading) return <div className="container mx-auto px-4 py-8">Caricamento…</div>
  if (!operatorId) return <div className="container mx-auto px-4 py-8">Nessun operatore collegato al tuo account.</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/operator/${operatorId}`} className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600">
            <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
          </Link>
          <p className="text-sm text-gray-500 mt-1">{operatorName}</p>
          <h1 className="text-3xl font-bold text-gray-900">Prodotti</h1>
        </div>
        <button onClick={addProduct} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          <Plus className="w-4 h-4" /> <span>Nuovo prodotto</span>
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-500 mb-4">Nessun prodotto ancora. Crea il primo!</p>
          <button onClick={addProduct} className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            <Plus className="w-4 h-4" /> <span>Crea prodotto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
              {p.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photos[0]} alt={p.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Nessuna foto</div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  {p.is_available ? (
                    <span className="text-xs text-green-700 flex items-center"><Eye className="w-3 h-3 mr-1" />Visibile</span>
                  ) : (
                    <span className="text-xs text-gray-500 flex items-center"><EyeOff className="w-3 h-3 mr-1" />Nascosto</span>
                  )}
                </div>
                {p.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2 flex-1">{p.description}</p>}
                {p.price !== null && (
                  <p className="text-primary-700 font-semibold mt-2">
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: p.currency }).format(p.price)}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => setEditing(p)} className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm">
                    <Pencil className="w-4 h-4" /> <span>Modifica</span>
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md" title="Elimina">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Modifica prodotto</h2>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Nome</span>
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Prezzo (€)</span>
                  <input
                    type="number" step="0.01"
                    value={editing.price ?? ''}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value === '' ? null : parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Descrizione</span>
                <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </label>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Foto</p>
                <PhotoUploader
                  bucket="product-photos"
                  folder={operatorId}
                  value={editing.photos ?? []}
                  onChange={(photos) => setEditing({ ...editing, photos })}
                />
              </div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={editing.is_available} onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })} />
                <span className="text-sm">Visibile al pubblico</span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t bg-gray-50 rounded-b-xl">
              <button onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">Annulla</button>
              <button onClick={saveProduct} disabled={saving} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
                <Save className="w-4 h-4" /> <span>{saving ? 'Salvataggio…' : 'Salva'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
