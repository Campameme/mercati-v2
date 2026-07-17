'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Store, Gift, Check } from 'lucide-react'
import { useLang } from '@/lib/i18n/useLang'
import { TESSERA_I18N } from '@/lib/i18n/tessera'
import type { Lang } from '@/lib/i18n/home'

interface Reward {
  id: string
  label: string
  description: string | null
  cost_points: number
  stock: number | null
  markets: { name: string; city: string } | null
}

const UI: Record<Lang, {
  back: string; title: string; lead: string; balance: string; cost: string; redeem: string
  redeeming: string; done: string; yourCode: string; empty: string; notEnough: string; login: string; soldout: string
}> = {
  it: { back: 'La tessera', title: 'Lo shop dei punti', lead: 'Trasforma i punti in buoni regalo dei banchi della rete.', balance: 'Hai', cost: 'punti', redeem: 'Riscatta', redeeming: 'Riscatto…', done: 'Fatto! Il buono è nella tua tessera.', yourCode: 'Il tuo codice', empty: 'Ancora nessun premio in catalogo. Torna presto.', notEnough: 'Punti insufficienti', login: 'Accedi per usare i punti', soldout: 'Esaurito' },
  fr: { back: 'La carte', title: 'La boutique des points', lead: 'Transformez les points en bons cadeaux des étals du réseau.', balance: 'Vous avez', cost: 'points', redeem: 'Échanger', redeeming: 'Échange…', done: 'Fait ! Le bon est dans votre carte.', yourCode: 'Votre code', empty: 'Aucun cadeau au catalogue pour l’instant. Revenez bientôt.', notEnough: 'Points insuffisants', login: 'Connectez-vous pour utiliser les points', soldout: 'Épuisé' },
  de: { back: 'Die Karte', title: 'Der Punkte-Shop', lead: 'Verwandle Punkte in Gutscheine der Stände im Netz.', balance: 'Du hast', cost: 'Punkte', redeem: 'Einlösen', redeeming: 'Einlösen…', done: 'Fertig! Der Gutschein ist in deiner Karte.', yourCode: 'Dein Code', empty: 'Noch keine Prämien im Katalog. Schau bald wieder vorbei.', notEnough: 'Nicht genug Punkte', login: 'Zum Punkte-Einsatz anmelden', soldout: 'Ausverkauft' },
  en: { back: 'The card', title: 'The points shop', lead: 'Turn your points into gift vouchers from the network’s stalls.', balance: 'You have', cost: 'points', redeem: 'Redeem', redeeming: 'Redeeming…', done: 'Done! The voucher is in your card.', yourCode: 'Your code', empty: 'No rewards in the catalogue yet. Check back soon.', notEnough: 'Not enough points', login: 'Sign in to use points', soldout: 'Sold out' },
}

export default function ShopPage() {
  const router = useRouter()
  const [lang] = useLang()
  const t = TESSERA_I18N[lang]
  const u = UI[lang]
  const [rewards, setRewards] = useState<Reward[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [loggedIn, setLoggedIn] = useState(true)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [justBought, setJustBought] = useState<{ id: string; code: string } | null>(null)

  function load() {
    fetch('/api/shop', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        setRewards(j.data?.rewards ?? [])
        setBalance(j.data?.balance ?? null)
        setLoggedIn(!!j.data?.loggedIn)
      })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function redeem(id: string) {
    if (!loggedIn) { router.push('/login?next=/tessera/shop'); return }
    setBusyId(id)
    const res = await fetch('/api/shop', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rewardId: id }) })
    const j = await res.json().catch(() => null)
    setBusyId(null)
    if (res.ok) {
      setJustBought({ id, code: j.code })
      setBalance(j.balance ?? balance)
      load()
    } else {
      alert(j?.error ?? 'Errore')
    }
  }

  return (
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-3xl">
        <Link href="/tessera" className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-alga mb-6 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> {u.back}
        </Link>

        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <p className="inline-flex items-center gap-2 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink"><Store className="w-7 h-7 text-alga" /> {u.title}</p>
            <p className="text-ink-soft mt-1 max-w-lg">{u.lead}</p>
          </div>
          {balance != null && (
            <p className="font-alt text-sm text-ink-soft">{u.balance} <span className="font-display font-extrabold text-2xl text-alga-600">{balance}</span> {u.cost}</p>
          )}
        </div>

        {loading ? (
          <p className="text-ink-muted text-sm">…</p>
        ) : rewards.length === 0 ? (
          <div className="bg-white border border-[#e0d7c1] rounded-xl px-6 py-12 text-center">
            <Gift className="w-8 h-8 text-alga/60 mx-auto mb-3" aria-hidden="true" />
            <p className="text-ink-soft">{u.empty}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {rewards.map((r) => {
              const bought = justBought?.id === r.id
              const affordable = balance == null || balance >= r.cost_points
              const soldout = r.stock != null && r.stock <= 0
              return (
                <div key={r.id} className="flex flex-col bg-white border border-[#e0d7c1] rounded-xl overflow-hidden">
                  <span aria-hidden="true" className="mz-band block" style={{ ['--band' as string]: '#46683B' }} />
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-display font-extrabold tracking-tight text-lg text-ink leading-tight">{r.label}</h3>
                    {r.description && <p className="text-sm text-ink-soft mt-1">{r.description}</p>}
                    {r.markets?.name && <p className="text-xs text-ink-muted mt-1">{r.markets.name}</p>}
                    <p className="font-display font-extrabold tracking-tight text-2xl text-alga-600 mt-3">{r.cost_points} <span className="text-sm text-ink-muted font-alt">{u.cost}</span></p>

                    {bought ? (
                      <div className="mt-3 rounded-lg bg-limone/30 border border-limone px-3 py-2.5">
                        <p className="inline-flex items-center gap-1.5 font-alt text-xs font-bold uppercase tracking-wider text-ink"><Check className="w-3.5 h-3.5" /> {u.done}</p>
                        <p className="text-xs text-ink-soft mt-1">{u.yourCode}: <span className="font-display font-extrabold text-alga-600">{justBought!.code}</span></p>
                      </div>
                    ) : (
                      <button
                        onClick={() => redeem(r.id)}
                        disabled={busyId === r.id || soldout || (loggedIn && !affordable)}
                        className="mt-4 inline-flex items-center justify-center gap-2 bg-terracotta text-crema font-alt font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-terracotta-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {busyId === r.id ? u.redeeming : soldout ? u.soldout : !loggedIn ? u.login : !affordable ? u.notEnough : u.redeem}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
