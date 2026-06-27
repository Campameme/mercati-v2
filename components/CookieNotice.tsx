'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const STORAGE_KEY = 'imercati:cookie-notice-dismissed:v1'

/**
 * Banner informativo, non bloccante.
 * Mercati di Ponente non usa cookie di tracciamento ne richiede consenso
 * preventivo, ma e doveroso informare l'utente sulla nostra scelta
 * privacy-friendly e sui cookie tecnici di Supabase per chi accede all'area
 * admin. Quando l'utente clicca "Ho capito", salviamo in localStorage e il
 * banner non compare piu su questo dispositivo.
 */
export default function CookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (!dismissed) setVisible(true)
    } catch {
      // localStorage non disponibile (incognito), mostra comunque
      setVisible(true)
    }
  }, [])

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Informativa privacy"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50 bg-white border-2 border-ink/15 rounded-xl shadow-lg p-4 md:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 text-sm text-ink-soft leading-relaxed">
          <p className="font-display text-base text-ink mb-1">Niente cookie di tracciamento.</p>
          <p>
            Mercati di Ponente raccoglie solo statistiche aggregate anonime (senza cookie, senza IP).
            Maggiori dettagli nella{' '}
            <Link href="/privacy" className="text-mare-700 underline underline-offset-2 hover:text-mare-600">
              Privacy Policy
            </Link>{' '}
            e nella{' '}
            <Link href="/cookie" className="text-mare-700 underline underline-offset-2 hover:text-mare-600">
              Cookie Policy
            </Link>.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Chiudi informativa"
          className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-ink/5 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-carta font-alt text-xs font-semibold hover:bg-mare transition-colors"
      >
        Ho capito
      </button>
    </div>
  )
}
