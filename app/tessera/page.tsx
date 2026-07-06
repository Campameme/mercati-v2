'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Ticket, LogOut, Sparkles } from 'lucide-react'
import { CanopyEdge } from '@/components/decorations'
import { useLang } from '@/lib/i18n/useLang'
import { TESSERA_I18N, reasonLabel } from '@/lib/i18n/tessera'

interface PointEvent { id: string; points: number; reason: string; created_at: string }
interface Coupon { id: string; code: string; label: string; status: string; created_at: string; used_at: string | null }
interface TesseraData { email: string; balance: number; events: PointEvent[]; coupons: Coupon[] }

export default function TesseraPage() {
  const router = useRouter()
  const [lang] = useLang()
  const t = TESSERA_I18N[lang]
  const [data, setData] = useState<TesseraData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tessera', { cache: 'no-store' })
      .then((r) => (r.status === 401 ? (router.replace('/login?next=/tessera'), null) : r.json()))
      .then((j) => { if (j?.data) setData(j.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  async function logout() {
    await createClient().auth.signOut()
    router.replace('/')
    router.refresh()
  }

  function fmtDate(iso: string) {
    try { return new Date(iso).toLocaleDateString(lang === 'it' ? 'it-IT' : lang, { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return '' }
  }

  const couponStatus: Record<string, { label: string; cls: string }> = {
    active: { label: t.couponActive, cls: 'bg-sole text-ink' },
    used: { label: t.couponUsed, cls: 'bg-ink/10 text-ink-muted line-through' },
    void: { label: t.couponVoid, cls: 'bg-ink/10 text-ink-muted' },
  }

  return (
    <div className="min-h-screen bg-carta">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-2xl">
        {/* La tessera: pannello notte col tendone, saldo scritto a mano */}
        <div className="relative overflow-hidden imk-edge border-2 border-notte bg-notte text-carta">
          <div aria-hidden="true" className="imk-awning h-2.5" />
          <CanopyEdge color="#F7EFDD" className="h-3 md:h-3.5 -mt-px" />
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-1.5 font-alt text-xs font-bold uppercase tracking-[0.14em] text-sole">
                  <Ticket className="w-4 h-4" /> {t.eyebrow}
                </p>
                {data && <p className="text-marel/80 text-sm mt-1">{data.email}</p>}
              </div>
              <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs text-marel/70 hover:text-carta transition-colors">
                <LogOut className="w-3.5 h-3.5" /> {t.logout}
              </button>
            </div>
            <div className="mt-6 flex items-end gap-3">
              <span className="font-hand font-bold text-7xl md:text-8xl leading-none text-sole -rotate-2">
                {loading ? '·' : data?.balance ?? 0}
              </span>
              <span className="font-alt uppercase tracking-[0.14em] text-marel/80 text-sm mb-3">{t.pointsLabel}</span>
            </div>
          </div>
        </div>

        {/* Coupon su cartellino */}
        <section className="mt-8">
          <h2 className="font-alt font-bold text-lg text-ink mb-3">{t.couponsTitle}</h2>
          {!loading && (data?.coupons.length ?? 0) === 0 ? (
            <p className="text-sm text-ink-muted italic bg-white border-2 border-ink/10 imk-edge px-5 py-6">{t.couponsEmpty}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {data?.coupons.map((c) => (
                <div key={c.id} className="group bg-white border-2 border-ink/10 imk-edge p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-alt font-bold text-ink leading-tight">{c.label}</p>
                    <p className="font-hand text-xl text-mare-600 leading-none mt-1">{c.code}</p>
                  </div>
                  <span className={`flex-shrink-0 font-alt text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${couponStatus[c.status]?.cls ?? ''}`}>
                    {couponStatus[c.status]?.label ?? c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Movimenti punti */}
        <section className="mt-8">
          <h2 className="font-alt font-bold text-lg text-ink mb-3">{t.historyTitle}</h2>
          {!loading && (data?.events.length ?? 0) === 0 ? (
            <p className="text-sm text-ink-muted italic bg-white border-2 border-ink/10 imk-edge px-5 py-6">{t.historyEmpty}</p>
          ) : (
            <ul className="bg-white border-2 border-ink/10 imk-edge divide-y divide-ink/10">
              {data?.events.map((e) => (
                <li key={e.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-ink">
                    {e.reason === 'welcome' && <Sparkles className="w-4 h-4 text-sole" />}
                    <span>
                      <span className="block text-sm">{reasonLabel(e.reason, lang)}</span>
                      <span className="block text-xs text-ink-muted">{fmtDate(e.created_at)}</span>
                    </span>
                  </span>
                  <span className={`font-hand font-bold text-2xl leading-none ${e.points >= 0 ? 'text-mare-600' : 'text-fiore-600'}`}>
                    {e.points >= 0 ? '+' : ''}{e.points}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
