'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Cookie, BarChart3, Megaphone, ShieldCheck } from 'lucide-react'

// Consent Manager a categorie. Chiave versionata: cambiando la versione si
// forza di nuovo la scelta a tutti (utile se cambiano le finalità).
const STORAGE_KEY = 'imercati:consent:v2'

export type ConsentValue = {
  necessary: true
  analytics: boolean
  marketing: boolean
  ts: number
}

function readConsent(): ConsentValue | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<ConsentValue>
    if (typeof p !== 'object' || p === null) return null
    return {
      necessary: true,
      analytics: !!p.analytics,
      marketing: !!p.marketing,
      ts: typeof p.ts === 'number' ? p.ts : 0,
    }
  } catch {
    return null
  }
}

function writeConsent(analytics: boolean, marketing: boolean): ConsentValue {
  const value: ConsentValue = { necessary: true, analytics, marketing, ts: Date.now() }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)) } catch { /* incognito */ }
  // Avvisa il gating degli script (ConsentScripts) in tempo reale.
  try { window.dispatchEvent(new CustomEvent('imk:consent-changed', { detail: value })) } catch { /* ignore */ }
  return value
}

/**
 * Link "Preferenze cookie" (client) da usare nel Footer, che è un Server
 * Component. Riapre il pannello di dettaglio ovunque nel sito.
 */
export function CookiePreferencesLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => { try { window.dispatchEvent(new Event('imk:open-consent')) } catch { /* ignore */ } }}
      className={className ?? 'hover:text-alga transition-colors'}
    >
      Preferenze cookie
    </button>
  )
}

type Mode = 'hidden' | 'banner' | 'details'

// Interruttore accessibile (role=switch). Verde alga = attivo.
function Toggle({ checked, onChange, disabled, label }: {
  checked: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors motion-reduce:transition-none ${checked ? 'bg-alga' : 'bg-ink/20'} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  )
}

/**
 * Consent Manager (CMP) a tre categorie: Necessari (sempre attivi), Statistiche
 * (GA4), Marketing (Google Ads, Meta). Finché l'utente non sceglie, statistiche
 * e marketing restano negati. La scelta è salvata in localStorage e propagata a
 * ConsentScripts via l'evento `imk:consent-changed`. Il pannello si riapre da
 * qualunque punto con l'evento `imk:open-consent` (link nel Footer).
 */
export default function CookieNotice() {
  const [mode, setMode] = useState<Mode>('hidden')
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  const decide = useCallback((a: boolean, m: boolean) => {
    setAnalytics(a); setMarketing(m)
    writeConsent(a, m)
    setMode('hidden')
  }, [])

  useEffect(() => {
    const stored = readConsent()
    if (stored) {
      setAnalytics(stored.analytics)
      setMarketing(stored.marketing)
      setMode('hidden')
    } else {
      setMode('banner')
    }
    // Riapertura (Footer o altrove): mostra il dettaglio con le scelte correnti.
    const open = () => {
      const cur = readConsent()
      setAnalytics(cur?.analytics ?? false)
      setMarketing(cur?.marketing ?? false)
      setMode('details')
    }
    window.addEventListener('imk:open-consent', open)
    return () => window.removeEventListener('imk:open-consent', open)
  }, [])

  if (mode === 'hidden') return null

  if (mode === 'details') {
    const hasChoice = !!readConsent()
    return (
      <div
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-ink/40"
        role="dialog"
        aria-modal="true"
        aria-label="Preferenze cookie"
      >
        <div className="w-full max-w-lg bg-white rounded-2xl border border-[#e0d7c1] shadow-xl max-h-[88vh] overflow-y-auto">
          <div className="p-5 md:p-6">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink">Preferenze cookie</h2>
              <button
                type="button"
                onClick={() => setMode(hasChoice ? 'hidden' : 'banner')}
                aria-label="Chiudi"
                className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-ink/5 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <p className="text-sm text-ink-soft leading-relaxed mb-5">
              Scegli quali strumenti attivare. Puoi cambiare idea quando vuoi dal link
              &laquo;Preferenze cookie&raquo; a fondo pagina.
            </p>

            <div className="space-y-3">
              {/* Necessari — sempre attivi */}
              <div className="flex items-start gap-3 rounded-xl border border-[#e0d7c1] bg-crema/60 p-4">
                <ShieldCheck className="w-5 h-5 text-alga flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-alt font-semibold text-ink">Necessari</p>
                  <p className="text-sm text-ink-soft leading-relaxed mt-0.5">
                    Fanno funzionare il sito: accesso all&apos;area riservata, sicurezza, memoria delle tue scelte.
                    Non si possono disattivare.
                  </p>
                </div>
                <Toggle checked disabled label="Necessari (sempre attivi)" />
              </div>

              {/* Statistiche */}
              <div className="flex items-start gap-3 rounded-xl border border-[#e0d7c1] bg-white p-4">
                <BarChart3 className="w-5 h-5 text-alga flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-alt font-semibold text-ink">Statistiche</p>
                  <p className="text-sm text-ink-soft leading-relaxed mt-0.5">
                    Ci dicono, in forma aggregata, quali pagine funzionano (Google Analytics 4).
                    Le attiviamo solo col tuo consenso.
                  </p>
                </div>
                <Toggle checked={analytics} onChange={setAnalytics} label="Statistiche" />
              </div>

              {/* Marketing */}
              <div className="flex items-start gap-3 rounded-xl border border-[#e0d7c1] bg-white p-4">
                <Megaphone className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-alt font-semibold text-ink">Marketing</p>
                  <p className="text-sm text-ink-soft leading-relaxed mt-0.5">
                    Ci permettono di farci conoscere e di misurare le campagne (Google Ads, Meta).
                    Nessun uso senza il tuo consenso.
                  </p>
                </div>
                <Toggle checked={marketing} onChange={setMarketing} label="Marketing" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <button
                type="button"
                onClick={() => decide(true, true)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-alga text-crema font-alt text-sm font-semibold hover:bg-alga-600 transition-colors"
              >
                Accetta tutti
              </button>
              <button
                type="button"
                onClick={() => decide(analytics, marketing)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-ink text-crema font-alt text-sm font-semibold hover:bg-alga transition-colors"
              >
                Salva preferenze
              </button>
              <button
                type="button"
                onClick={() => decide(false, false)}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border-2 border-ink/15 text-ink font-alt text-sm font-semibold hover:border-alga hover:text-alga transition-colors"
              >
                Rifiuta tutti
              </button>
            </div>

            <p className="text-xs text-ink-muted mt-4 leading-relaxed">
              Dettagli nella{' '}
              <Link href="/cookie" className="text-alga-600 underline underline-offset-2 hover:text-alga">Cookie Policy</Link>{' '}
              e nella{' '}
              <Link href="/privacy" className="text-alga-600 underline underline-offset-2 hover:text-alga">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // mode === 'banner' — prima scelta, non bloccante.
  return (
    <div
      role="region"
      aria-label="Informativa cookie"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:bottom-6 md:max-w-md z-50 bg-white border border-[#e0d7c1] rounded-2xl shadow-xl p-5"
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <Cookie className="w-5 h-5 text-alga flex-shrink-0" aria-hidden="true" />
        <p className="font-display font-extrabold tracking-tight text-lg text-ink">Cookie e privacy</p>
      </div>
      <p className="text-sm text-ink-soft leading-relaxed mb-4">
        Usiamo cookie tecnici necessari e, solo col tuo consenso, strumenti di statistica e marketing
        per capire come va il sito e farci conoscere. Decidi tu.{' '}
        <Link href="/cookie" className="text-alga-600 underline underline-offset-2 hover:text-alga">Cookie Policy</Link>.
      </p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => decide(true, true)}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-alga text-crema font-alt text-sm font-semibold hover:bg-alga-600 transition-colors"
        >
          Accetta tutti
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => decide(false, false)}
            title="Rifiuta i cookie non essenziali"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full border-2 border-ink/15 text-ink font-alt text-sm font-semibold hover:border-alga hover:text-alga transition-colors"
          >
            Rifiuta tutti
          </button>
          <button
            type="button"
            onClick={() => setMode('details')}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full border-2 border-ink/15 text-ink font-alt text-sm font-semibold hover:border-alga hover:text-alga transition-colors"
          >
            Personalizza
          </button>
        </div>
      </div>
    </div>
  )
}
