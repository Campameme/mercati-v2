'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Wallet, Search, Receipt, Check, Clock, X, Plus, Minus } from 'lucide-react'
import { pointsForCents } from '@/lib/tessera/discount'

type Req = { id: string; amount_cents: number; points: number; status: 'pending' | 'approved' | 'rejected'; created_at: string }

// Tessera lato OPERATORE. Il gesto principale: scansiona il QR del cliente,
// registra l'importo dello scontrino → parte una RICHIESTA di punti che il
// super admin approva (1 € = 10 punti). In coda, gli strumenti promozionali
// (dai/riscuoti dal budget del banco). Tutto via /api/operator/tessera.
export default function OperatorTesseraPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const [budget, setBudget] = useState<number | null>(null)
  const [requests, setRequests] = useState<Req[]>([])
  const [token, setToken] = useState('')
  const [card, setCard] = useState<{ balance: number } | null>(null)
  const [euro, setEuro] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [showPromo, setShowPromo] = useState(false)
  const [promoPoints, setPromoPoints] = useState('')

  async function loadState() {
    if (!id) return
    const res = await fetch(`/api/operator/tessera?operatorId=${id}`, { cache: 'no-store' })
    if (res.status === 401 || res.status === 403) { router.replace(`/login?next=/operator/${id}/tessera`); return }
    const j = await res.json().catch(() => null)
    if (j?.data) { setBudget(j.data.budget); setRequests(j.data.requests ?? []) }
  }
  useEffect(() => { loadState() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const euroNum = Number(euro.replace(',', '.'))
  const previewPoints = Number.isFinite(euroNum) && euroNum > 0 ? pointsForCents(Math.round(euroNum * 100)) : 0

  async function submitReceipt() {
    if (!(previewPoints > 0)) { setMsg({ ok: false, text: 'Inserisci l’importo dello scontrino' }); return }
    setBusy(true); setMsg(null)
    const res = await fetch('/api/operator/tessera', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request', operatorId: id, token: token.trim(), amountCents: Math.round(euroNum * 100), note }),
    })
    const j = await res.json().catch(() => null)
    setBusy(false)
    if (res.ok) {
      setEuro(''); setNote('')
      setMsg({ ok: true, text: `Richiesta inviata: ${j.request?.points ?? previewPoints} punti in attesa di approvazione.` })
      loadState()
    } else setMsg({ ok: false, text: j?.error ?? 'Richiesta non inviata' })
  }

  async function promo(action: 'give' | 'redeem') {
    const n = Math.round(Number(promoPoints))
    if (!Number.isFinite(n) || n <= 0) { setMsg({ ok: false, text: 'Numero di punti non valido' }); return }
    setBusy(true); setMsg(null)
    const res = await fetch('/api/operator/tessera', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, operatorId: id, token: token.trim(), points: n }),
    })
    const j = await res.json().catch(() => null)
    setBusy(false)
    if (res.ok) {
      setCard({ balance: j.balance }); setPromoPoints('')
      setMsg({ ok: true, text: action === 'give' ? `Dati +${n} punti. Saldo carta: ${j.balance}.` : `Riscossi ${n} punti. Saldo carta: ${j.balance}.` })
      loadState()
    } else setMsg({ ok: false, text: j?.error ?? 'Operazione non riuscita' })
  }

  const fmtEuro = (cents: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cents / 100)
  const STATUS: Record<Req['status'], { label: string; cls: string; Icon: typeof Clock }> = {
    pending: { label: 'In attesa', cls: 'text-ink-soft bg-limone/30 border-limone', Icon: Clock },
    approved: { label: 'Approvata', cls: 'text-alga-600 bg-alga/10 border-alga/30', Icon: Check },
    rejected: { label: 'Rifiutata', cls: 'text-terracotta-600 bg-terracotta/10 border-terracotta/30', Icon: X },
  }

  return (
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-lg">
        <Link href={`/operator/${id}`} className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-alga mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Il mio banco
        </Link>

        <h1 className="font-display font-extrabold tracking-tight text-3xl text-ink">Punti al banco</h1>
        <p className="text-sm text-ink-soft mt-1.5">Scansiona il QR del cliente e registra lo scontrino: 1&nbsp;€ = 10 punti. La richiesta va in approvazione all’amministratore.</p>

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

              {/* Registra scontrino → richiesta punti */}
              <div className="mt-4">
                <span className="font-alt text-xs font-bold uppercase tracking-wider text-ink-soft">Importo dello scontrino</span>
                <div className="mt-1.5 flex gap-2 items-stretch">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">€</span>
                    <input
                      inputMode="decimal" value={euro}
                      onChange={(e) => setEuro(e.target.value.replace(/[^0-9.,]/g, ''))}
                      placeholder="12,40"
                      className="w-full pl-7 pr-3 py-2.5 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors"
                    />
                  </div>
                  <span className="inline-flex items-center px-3 rounded-xl bg-crema-2 font-alt text-sm font-semibold text-alga-600 whitespace-nowrap">
                    = {previewPoints} punti
                  </span>
                </div>
                <input
                  value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota (opz.)"
                  className="w-full mt-2 px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink text-sm focus:outline-none focus:border-alga transition-colors"
                />
                <button onClick={submitReceipt} disabled={busy || !(previewPoints > 0)} className="mt-2 w-full inline-flex items-center justify-center gap-1.5 bg-terracotta text-crema font-alt font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-terracotta-600 disabled:opacity-50 transition-colors">
                  <Receipt className="w-4 h-4" /> Registra scontrino
                </button>
              </div>

              {/* Strumenti promozionali (dal budget del banco) — secondari */}
              <button onClick={() => setShowPromo((s) => !s)} className="mt-3 text-xs font-alt font-semibold uppercase tracking-wider text-ink-muted hover:text-alga transition-colors">
                {showPromo ? '− Nascondi' : '+ Punti promozionali (budget banco)'}
              </button>
              {showPromo && (
                <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-2">
                  <input type="number" min="1" value={promoPoints} onChange={(e) => setPromoPoints(e.target.value)} placeholder="Punti" className="px-3 py-2 bg-crema border-2 border-ink/15 rounded-xl text-ink text-sm focus:outline-none focus:border-alga transition-colors" />
                  <button onClick={() => promo('give')} disabled={busy} className="inline-flex items-center gap-1 bg-alga text-crema font-alt font-semibold text-xs px-3 rounded-full hover:bg-alga-600 disabled:opacity-50 transition-colors"><Plus className="w-3.5 h-3.5" /> Dai</button>
                  <button onClick={() => promo('redeem')} disabled={busy} className="inline-flex items-center gap-1 bg-white border-2 border-terracotta/40 text-terracotta-600 font-alt font-semibold text-xs px-3 rounded-full hover:border-terracotta disabled:opacity-50 transition-colors"><Minus className="w-3.5 h-3.5" /> Riscuoti</button>
                </div>
              )}
            </div>
          )}

          {msg && (
            <p className={`mt-3 text-sm inline-flex items-center gap-1.5 ${msg.ok ? 'text-alga-600' : 'text-terracotta-600'}`}>
              {msg.ok && <Check className="w-4 h-4" />} {msg.text}
            </p>
          )}
        </div>

        {/* Budget promozionale */}
        <p className="inline-flex items-center gap-2 mt-4 bg-white border border-[#e0d7c1] rounded-full px-4 py-2 font-alt text-sm text-ink-soft">
          <Wallet className="w-4 h-4 text-alga" /> Budget promozionale del banco: <b className="text-ink">{budget ?? '·'}</b>
        </p>

        {/* Storico richieste scontrino */}
        {requests.length > 0 && (
          <div className="mt-6">
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-ink-muted mb-2">Ultime richieste scontrino</p>
            <ul className="bg-white border border-[#e0d7c1] rounded-xl divide-y divide-ink/10 overflow-hidden">
              {requests.map((r) => {
                const s = STATUS[r.status]
                return (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="text-sm text-ink"><b className="font-alt">{fmtEuro(r.amount_cents)}</b> · {r.points} punti</span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-alt font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${s.cls}`}>
                      <s.Icon className="w-3 h-3" /> {s.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
