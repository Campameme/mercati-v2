'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Wallet, Search, Plus, Minus, Check } from 'lucide-react'

// Tessera lato operatore: cerca una carta dal token del QR, poi DÀ punti
// (scalando dal proprio budget) o li RISCUOTE (scala dalla carta). Ogni
// operazione passa dalle funzioni atomiche del DB via /api/operator/tessera.
export default function OperatorTesseraPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const [budget, setBudget] = useState<number | null>(null)
  const [token, setToken] = useState('')
  const [card, setCard] = useState<{ balance: number } | null>(null)
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function loadBudget() {
    if (!id) return
    const res = await fetch(`/api/operator/tessera?operatorId=${id}`, { cache: 'no-store' })
    if (res.status === 401 || res.status === 403) { router.replace(`/login?next=/operator/${id}/tessera`); return }
    const j = await res.json().catch(() => null)
    if (j?.data) setBudget(j.data.budget)
  }
  useEffect(() => { loadBudget() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function lookup() {
    setMsg(null); setCard(null)
    if (!token.trim()) return
    setBusy(true)
    const res = await fetch('/api/operator/tessera', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'lookup', operatorId: id, token: token.trim() }),
    })
    const j = await res.json().catch(() => null)
    setBusy(false)
    if (res.ok) setCard({ balance: j.data.balance })
    else setMsg({ ok: false, text: j?.error ?? 'Tessera non trovata' })
  }

  async function move(action: 'give' | 'redeem') {
    const n = Math.round(Number(points))
    if (!Number.isFinite(n) || n <= 0) { setMsg({ ok: false, text: 'Inserisci un numero di punti valido' }); return }
    setBusy(true); setMsg(null)
    const res = await fetch('/api/operator/tessera', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, operatorId: id, token: token.trim(), points: n, reason }),
    })
    const j = await res.json().catch(() => null)
    setBusy(false)
    if (res.ok) {
      setCard({ balance: j.balance })
      setPoints(''); setReason('')
      setMsg({ ok: true, text: action === 'give' ? `Dati +${n} punti. Nuovo saldo carta: ${j.balance}.` : `Riscossi ${n} punti. Nuovo saldo carta: ${j.balance}.` })
      loadBudget()
    } else {
      setMsg({ ok: false, text: j?.error ?? 'Operazione non riuscita' })
    }
  }

  return (
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-lg">
        <Link href={`/operator/${id}`} className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-alga mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Il mio banco
        </Link>

        <h1 className="font-display font-extrabold tracking-tight text-3xl text-ink">Tessera al banco</h1>
        <p className="inline-flex items-center gap-2 mt-2 bg-white border border-[#e0d7c1] rounded-full px-4 py-2 font-alt text-sm text-ink-soft">
          <Wallet className="w-4 h-4 text-alga" /> Budget punti del banco: <b className="text-ink">{budget ?? '·'}</b>
        </p>

        {/* Scan / inserimento token */}
        <div className="mt-6 bg-white border border-[#e0d7c1] rounded-xl p-5">
          <label className="block">
            <span className="font-alt text-xs font-bold uppercase tracking-wider text-ink-soft">Codice tessera (dal QR del cliente)</span>
            <div className="mt-1.5 flex gap-2">
              <input
                value={token}
                onChange={(e) => { setToken(e.target.value); setCard(null) }}
                placeholder="Incolla o digita il codice"
                className="flex-1 min-w-0 px-3 py-2.5 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors font-mono text-sm"
              />
              <button onClick={lookup} disabled={busy || !token.trim()} className="inline-flex items-center gap-1.5 bg-alga text-crema font-alt font-semibold text-sm px-4 rounded-xl hover:bg-alga-600 disabled:opacity-50 transition-colors">
                <Search className="w-4 h-4" /> Cerca
              </button>
            </div>
          </label>

          {card && (
            <div className="mt-4 pt-4 border-t border-ink/10">
              <p className="text-sm text-ink-soft">Saldo della carta</p>
              <p className="font-display font-extrabold tracking-tight text-4xl text-alga-600 leading-none mt-0.5">{card.balance}</p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <input
                  type="number" min="1" value={points} onChange={(e) => setPoints(e.target.value)}
                  placeholder="Punti"
                  className="px-3 py-2.5 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors"
                />
                <input
                  value={reason} onChange={(e) => setReason(e.target.value)}
                  placeholder="Causale (opz.)"
                  className="px-3 py-2.5 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors"
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button onClick={() => move('give')} disabled={busy} className="inline-flex items-center justify-center gap-1.5 bg-alga text-crema font-alt font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-alga-600 disabled:opacity-50 transition-colors">
                  <Plus className="w-4 h-4" /> Dai punti
                </button>
                <button onClick={() => move('redeem')} disabled={busy} className="inline-flex items-center justify-center gap-1.5 bg-terracotta text-crema font-alt font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-terracotta-600 disabled:opacity-50 transition-colors">
                  <Minus className="w-4 h-4" /> Riscuoti
                </button>
              </div>
            </div>
          )}

          {msg && (
            <p className={`mt-3 text-sm inline-flex items-center gap-1.5 ${msg.ok ? 'text-alga-600' : 'text-terracotta-600'}`}>
              {msg.ok && <Check className="w-4 h-4" />} {msg.text}
            </p>
          )}
        </div>

        <p className="text-xs text-ink-muted mt-4">Dai punti scala dal budget del banco. Riscuoti scala dalla carta del cliente: possibile solo se ha davvero quei punti.</p>
      </div>
    </div>
  )
}
