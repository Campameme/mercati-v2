'use client'

import { useState } from 'react'

const STATI = [
  { value: 'nuovo',       label: 'Nuovo' },
  { value: 'in_contatto', label: 'In contatto' },
  { value: 'aderito',     label: 'Aderito' },
  { value: 'scartato',    label: 'Scartato' },
]

export default function AdesioneStatoToggle({ id, initialStato }: {
  id: string; initialStato: string
}) {
  const [stato, setStato] = useState(initialStato)
  const [busy, setBusy] = useState(false)

  async function change(newStato: string) {
    if (newStato === stato) return
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/adesioni/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stato: newStato }),
      })
      if (r.ok) setStato(newStato)
      else alert('Errore aggiornamento')
    } finally {
      setBusy(false)
    }
  }

  return (
    <select
      value={stato}
      onChange={(e) => change(e.target.value)}
      disabled={busy}
      className="text-xs px-3 py-1.5 bg-cream-100 border border-cream-300 rounded-full text-ink-soft focus:outline-none focus:border-mare disabled:opacity-50"
    >
      {STATI.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  )
}
