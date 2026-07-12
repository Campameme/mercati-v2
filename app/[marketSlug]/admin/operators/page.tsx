'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Pencil, Trash2, Store, ArrowRight } from 'lucide-react'
import ExcelOperatorsTools from '@/components/ExcelOperatorsTools'

interface OperatorRow { id: string; name: string; category: string; stall_number: string | null }

export default function AdminMarketOperatorsPage() {
  const params = useParams<{ marketSlug: string }>()
  const slug = params?.marketSlug
  const [operators, setOperators] = useState<OperatorRow[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!slug) return
    setLoading(true)
    const ops = await fetch(`/api/operators?marketSlug=${encodeURIComponent(slug)}`).then((r) => r.json())
    setOperators((ops.data ?? []).map((o: any) => ({
      id: o.id, name: o.name, category: o.category, stall_number: o.location?.stallNumber ?? null,
    })))
    setLoading(false)
  }
  useEffect(() => { load() }, [slug])

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questo operatore? Anche i suoi prodotti verranno rimossi.')) return
    await fetch(`/api/operators/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Link href={`/${slug}/admin`} className="text-xs font-alt uppercase tracking-wider text-ink-muted hover:text-ink transition-colors">← Gestione mercato</Link>
          <h1 className="font-alt font-bold text-3xl text-ink mt-1">Operatori in questo mercato</h1>
        </div>

        {/* La creazione ora è centralizzata: un operatore può stare in più mercati. */}
        <Link href="/admin/operatori" className="group flex items-center gap-4 bg-ink text-crema border-2 border-ink p-5 mb-6 hover:border-terracotta transition-colors">
          <Store className="w-8 h-8 text-terracotta flex-shrink-0" />
          <span className="flex-1 min-w-0">
            <span className="block font-alt font-bold text-lg">Crea e assegna dall’area operatori</span>
            <span className="block text-sm text-crema-2/85">Gli operatori si creano una volta e si assegnano a uno o più mercati, con la posizione sulla mappa e il link di accesso.</span>
          </span>
          <ArrowRight className="w-5 h-5 text-terracotta group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </Link>

        <div className="mb-6">
          <ExcelOperatorsTools marketSlug={slug} onImported={load} />
        </div>

        {loading ? (
          <p className="text-ink-soft">Caricamento…</p>
        ) : (
          <div className="bg-white rounded-xl border-2 border-ink/10 divide-y divide-ink/10">
            {operators.length === 0 && <p className="p-6 text-center text-ink-muted">Nessun operatore in questo mercato.</p>}
            {operators.map((o) => (
              <div key={o.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-alt text-base text-ink">{o.name}</h2>
                  <span className="text-[11px] font-alt uppercase tracking-wider px-2 py-0.5 bg-alga/15 text-alga-600 rounded-full">{o.category}</span>
                  {o.stall_number && <span className="text-xs text-ink-muted">• {o.stall_number}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/${slug}/admin/operators/${o.id}`} className="p-2 text-ink-muted hover:text-alga-600 transition-colors" title="Modifica">
                    <Pencil className="w-5 h-5" />
                  </Link>
                  <button onClick={() => handleDelete(o.id)} className="p-2 text-ink-muted hover:text-terracotta-600 transition-colors" title="Elimina">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
