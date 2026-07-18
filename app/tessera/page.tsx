'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Ticket, LogOut, Sparkles, QrCode, Store, ArrowRight, Download, Trash2, ShieldCheck, BadgePercent } from 'lucide-react'
import { useLang } from '@/lib/i18n/useLang'
import { TESSERA_I18N, reasonLabel } from '@/lib/i18n/tessera'
import { discountFor } from '@/lib/tessera/discount'

// Stringhe dello sconto tessera (locali, per non incrociare lib/i18n/tessera.ts)
const DISC_I18N: Record<string, { label: string; max: string; toNext: (n: number, p: number) => string }> = {
  it: { label: 'Sconto al banco', max: 'Hai raggiunto lo sconto massimo. 🎉', toNext: (n, p) => `Mancano ${n.toLocaleString('it-IT')} punti per lo sconto del ${p}%.` },
  fr: { label: 'Remise à l’étal', max: 'Tu as atteint la remise maximale. 🎉', toNext: (n, p) => `Encore ${n.toLocaleString('fr-FR')} points pour la remise de ${p}%.` },
  de: { label: 'Rabatt am Stand', max: 'Du hast den maximalen Rabatt erreicht. 🎉', toNext: (n, p) => `Noch ${n.toLocaleString('de-DE')} Punkte bis ${p}% Rabatt.` },
  en: { label: 'Discount at the stall', max: 'You’ve reached the top discount. 🎉', toNext: (n, p) => `${n.toLocaleString('en-GB')} points to go for ${p}% off.` },
}

interface PointEvent { id: string; points: number; reason: string; created_at: string }
interface Coupon { id: string; code: string; label: string; status: string; created_at: string; used_at: string | null }
interface TesseraCard { token: string; qrSvg: string }
interface TesseraData { email: string; balance: number; events: PointEvent[]; coupons: Coupon[]; card: TesseraCard | null }

export default function TesseraPage() {
  const router = useRouter()
  const [lang] = useLang()
  const t = TESSERA_I18N[lang]
  const [data, setData] = useState<TesseraData | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  function load() {
    fetch('/api/tessera', { cache: 'no-store' })
      .then((r) => (r.status === 401 ? (router.replace('/login?next=/tessera'), null) : r.json()))
      .then((j) => { if (j?.data) setData(j.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [router]) // eslint-disable-line react-hooks/exhaustive-deps

  async function join() {
    setBusy(true)
    await fetch('/api/tessera/join', { method: 'POST' })
    setBusy(false)
    load()
  }

  async function eraseTessera() {
    if (!confirm(t.gdprDeleteConfirm)) return
    setBusy(true)
    await fetch('/api/tessera', { method: 'DELETE' })
    setBusy(false)
    load()
  }

  async function logout() {
    await createClient().auth.signOut()
    router.replace('/')
    router.refresh()
  }

  function fmtDate(iso: string) {
    try { return new Date(iso).toLocaleDateString(lang === 'it' ? 'it-IT' : lang, { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return '' }
  }

  const couponStatus: Record<string, { label: string; cls: string }> = {
    active: { label: t.couponActive, cls: 'bg-limone text-ink' },
    used: { label: t.couponUsed, cls: 'bg-ink/10 text-ink-muted line-through' },
    void: { label: t.couponVoid, cls: 'bg-ink/10 text-ink-muted' },
  }

  return (
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-2xl">
        {/* La tessera: pannello ink con la band della rete, saldo in limone */}
        <div className="relative overflow-hidden rounded-xl bg-ink text-crema">
          <div aria-hidden="true" className="mz-band" style={{ ['--band' as string]: '#46683B' }} />
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-1.5 font-alt text-xs font-bold uppercase tracking-[0.14em] text-limone">
                  <Ticket className="w-4 h-4" /> {t.eyebrow}
                </p>
                {data && <p className="text-crema/70 text-sm mt-1">{data.email}</p>}
              </div>
              <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs text-crema/60 hover:text-crema transition-colors">
                <LogOut className="w-3.5 h-3.5" /> {t.logout}
              </button>
            </div>
            <div className="mt-6 flex items-end gap-3">
              <span className="font-display font-extrabold tracking-tight text-7xl md:text-8xl leading-none text-limone">
                {loading ? '·' : data?.balance ?? 0}
              </span>
              <span className="font-alt uppercase tracking-[0.14em] text-crema/70 text-sm mb-3">{t.pointsLabel}</span>
            </div>

            {/* Sconto della tessera: cresce coi punti (1 € speso = 10 punti) */}
            {data && (() => {
              const d = discountFor(data.balance)
              const dl = DISC_I18N[lang] ?? DISC_I18N.it
              return (
                <div className="mt-5 pt-4 border-t border-crema/15">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 font-alt text-sm text-crema/80">
                      <BadgePercent className="w-4 h-4 text-limone" /> {dl.label}
                    </span>
                    <span className="font-display font-extrabold tracking-tight text-2xl text-crema leading-none">
                      {d.percent > 0 ? `−${d.percent}%` : '—'}
                    </span>
                  </div>
                  {d.next ? (
                    <div className="mt-2.5">
                      <div className="h-1.5 rounded-full bg-crema/15 overflow-hidden">
                        <div className="h-full bg-limone rounded-full" style={{ width: `${Math.round(d.progress * 100)}%` }} />
                      </div>
                      <p className="text-xs text-crema/60 mt-1.5">{dl.toNext(d.toNext, d.next.percent)}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-limone/90 mt-2">{dl.max}</p>
                  )}
                </div>
              )
            })()}
          </div>
        </div>

        {/* QR della carta — oppure adesione (consenso GDPR) se non attiva */}
        <section className="mt-6">
          {data?.card ? (
            <div className="bg-white border border-[#e0d7c1] rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
              <div
                className="w-40 h-40 flex-shrink-0 [&_svg]:w-full [&_svg]:h-full"
                aria-label={t.qrTitle}
                dangerouslySetInnerHTML={{ __html: data.card.qrSvg }}
              />
              <div className="text-center sm:text-left min-w-0">
                <p className="inline-flex items-center gap-2 font-display font-extrabold tracking-tight text-xl text-ink">
                  <QrCode className="w-5 h-5 text-alga" /> {t.qrTitle}
                </p>
                <p className="text-sm text-ink-soft mt-1 max-w-xs">{t.qrHint}</p>
                <p className="mt-2 font-mono text-[11px] text-ink-muted break-all select-all">{data.card.token}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#e0d7c1] rounded-xl p-6">
              <p className="inline-flex items-center gap-2 font-display font-extrabold tracking-tight text-xl text-ink">
                <QrCode className="w-5 h-5 text-alga" /> {t.joinTitle}
              </p>
              <p className="text-sm text-ink-soft mt-1.5 max-w-md">{t.joinLead}</p>
              <p className="text-xs text-ink-muted mt-3 max-w-md">{t.joinConsent}</p>
              <button
                onClick={join}
                disabled={busy}
                className="mt-4 inline-flex items-center gap-2 bg-terracotta text-crema font-alt font-semibold text-sm px-6 py-3 rounded-full hover:bg-terracotta-600 disabled:opacity-50 transition-colors"
              >
                {t.joinCta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

        {/* Shop dei punti */}
        <Link href="/tessera/shop" className="imk-lift group mt-4 flex items-center justify-between gap-4 bg-alga text-crema rounded-xl px-6 py-5 hover:bg-alga-600 transition-colors">
          <span className="min-w-0">
            <span className="inline-flex items-center gap-2 font-display font-extrabold tracking-tight text-xl"><Store className="w-5 h-5" /> {t.shopTitle}</span>
            <span className="block text-sm text-crema/85 mt-0.5">{t.shopLead}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-alt font-semibold text-sm flex-shrink-0">{t.shopCta} <ArrowRight className="imk-march w-4 h-4" /></span>
        </Link>

        {/* Coupon */}
        <section className="mt-8">
          <h2 className="font-display font-extrabold tracking-tight text-xl text-ink mb-3">{t.couponsTitle}</h2>
          {!loading && (data?.coupons.length ?? 0) === 0 ? (
            <p className="text-sm text-ink-muted italic bg-white border border-[#e0d7c1] rounded-xl px-5 py-6">{t.couponsEmpty}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {data?.coupons.map((c) => (
                <div key={c.id} className="group bg-white border border-[#e0d7c1] rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-alt font-bold text-ink leading-tight">{c.label}</p>
                    <p className="font-display font-extrabold tracking-tight text-lg text-alga-600 leading-none mt-1.5">{c.code}</p>
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
          <h2 className="font-display font-extrabold tracking-tight text-xl text-ink mb-3">{t.historyTitle}</h2>
          {!loading && (data?.events.length ?? 0) === 0 ? (
            <p className="text-sm text-ink-muted italic bg-white border border-[#e0d7c1] rounded-xl px-5 py-6">{t.historyEmpty}</p>
          ) : (
            <ul className="bg-white border border-[#e0d7c1] rounded-xl overflow-hidden divide-y divide-ink/10">
              {data?.events.map((e) => (
                <li key={e.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-ink">
                    {e.reason === 'welcome' && <Sparkles className="w-4 h-4 text-terracotta" />}
                    <span>
                      <span className="block text-sm">{reasonLabel(e.reason, lang)}</span>
                      <span className="block text-xs text-ink-muted">{fmtDate(e.created_at)}</span>
                    </span>
                  </span>
                  <span className={`font-display font-extrabold tracking-tight text-2xl leading-none ${e.points >= 0 ? 'text-alga-600' : 'text-terracotta-600'}`}>
                    {e.points >= 0 ? '+' : ''}{e.points}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* GDPR — i tuoi dati: esporta o cancella la tessera */}
        <section className="mt-8 border-t border-[#e0d7c1] pt-6">
          <p className="inline-flex items-center gap-2 font-alt text-xs font-bold uppercase tracking-[0.14em] text-ink-muted mb-3">
            <ShieldCheck className="w-4 h-4" /> {t.gdprTitle}
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/tessera/export"
              className="inline-flex items-center gap-1.5 bg-white border border-[#e0d7c1] hover:border-alga text-ink-soft font-alt text-sm font-semibold px-4 py-2 rounded-full transition-colors"
            >
              <Download className="w-4 h-4" /> {t.gdprExport}
            </a>
            {data?.card && (
              <button
                onClick={eraseTessera}
                disabled={busy}
                className="inline-flex items-center gap-1.5 bg-white border border-terracotta/40 hover:border-terracotta text-terracotta-600 font-alt text-sm font-semibold px-4 py-2 rounded-full disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> {t.gdprDelete}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
