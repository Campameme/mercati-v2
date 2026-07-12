'use client'

import { useState } from 'react'
import { Check, Loader2, AlertCircle } from 'lucide-react'

export default function AdesioneForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError(null)
    const fd = new FormData(e.currentTarget)
    const payload = {
      nome: fd.get('nome'),
      email: fd.get('email'),
      telefono: fd.get('telefono'),
      attivita: fd.get('attivita'),
      mercatiFrequentati: fd.get('mercatiFrequentati'),
      messaggio: fd.get('messaggio'),
      website: fd.get('website'), // honeypot
    }
    try {
      const res = await fetch('/api/adesioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Errore inatteso')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch (err) {
      setError('Connessione fallita. Riprova o scrivi a emanueleecampanini@gmail.com')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white border border-[#e0d7c1] rounded-xl p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-alga text-crema flex items-center justify-center">
          <Check className="w-6 h-6" />
        </div>
        <h3 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-2">Richiesta ricevuta</h3>
        <p className="text-sm text-ink-soft max-w-md mx-auto">
          Grazie. Ti rispondiamo entro <strong>48 ore</strong> all&apos;email che hai indicato.
          Nel frattempo, dai un&apos;occhiata ai banchi che sono già nella rete.
        </p>
      </div>
    )
  }

  const inputClass = "w-full px-3.5 py-3 bg-white border border-[#e0d7c1] rounded-xl text-sm text-ink focus:outline-none focus:border-alga transition-colors"
  const labelClass = "block font-alt text-xs uppercase tracking-[0.12em] text-ink-muted mb-1.5 font-semibold"

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Honeypot — invisibile, bot lo riempiono */}
      <input
        type="text" name="website" tabIndex={-1} autoComplete="off"
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        aria-hidden="true"
      />

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nome" className={labelClass}>Nome e cognome *</label>
          <input id="nome" name="nome" type="text" required minLength={2} maxLength={100} className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email *</label>
          <input id="email" name="email" type="email" required maxLength={200} className={inputClass} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="telefono" className={labelClass}>Telefono</label>
          <input id="telefono" name="telefono" type="tel" maxLength={30} className={inputClass} />
        </div>
        <div>
          <label htmlFor="attivita" className={labelClass}>Cosa vendi *</label>
          <input id="attivita" name="attivita" type="text" required minLength={2} maxLength={200} placeholder="es. Frutta e verdura, olio, pesce…" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="mercatiFrequentati" className={labelClass}>A quali mercati vai</label>
        <input id="mercatiFrequentati" name="mercatiFrequentati" type="text" maxLength={300} placeholder="es. Oneglia mer/sab, Bordighera ven…" className={inputClass} />
      </div>

      <div>
        <label htmlFor="messaggio" className={labelClass}>Raccontaci qualcosa di te</label>
        <textarea id="messaggio" name="messaggio" rows={5} maxLength={2000} placeholder="Da quanto lavori al mercato, cosa rende diverso il tuo banco…" className={inputClass + ' resize-y'}></textarea>
      </div>

      {status === 'error' && error && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-terracotta-50 border border-terracotta/40 rounded-xl text-sm text-terracotta-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="imk-lift inline-flex items-center gap-2 px-6 py-3 rounded-full bg-terracotta text-crema font-alt text-sm font-semibold hover:bg-terracotta-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Invio...
            </>
          ) : (
            'Chiedi di entrare'
          )}
        </button>
        <p className="text-xs text-ink-muted">
          Ti rispondiamo entro 48 ore. I dati sono trattati secondo la{' '}
          <a href="/privacy" className="underline underline-offset-2 hover:text-ink">Privacy Policy</a>.
        </p>
      </div>
    </form>
  )
}
