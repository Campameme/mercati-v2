'use client'

import { useRef, useState } from 'react'
import { Download, FileDown, Upload, Check, AlertTriangle } from 'lucide-react'

interface Props {
  /** Se presente, export/template/import sono limitati a questa zona. Altrimenti super-admin globale. */
  marketSlug?: string
  onImported?: () => void
}

interface Preview {
  willCreate: number
  willUpdate: number
  totalPresences: number
  errors: Array<{ rowIndex: number; message: string }>
  groups: Array<{ operatorId: string | null; name: string; marketSlug: string; action: 'create' | 'update'; presencesCount: number }>
}

export default function ExcelOperatorsTools({ marketSlug, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<'export' | 'template' | 'import' | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [resultMsg, setResultMsg] = useState<string | null>(null)

  const exportUrl = marketSlug
    ? `/api/operators/export?marketSlug=${encodeURIComponent(marketSlug)}`
    : `/api/operators/export?all=1`
  const templateUrl = marketSlug
    ? `/api/operators/template?marketSlug=${encodeURIComponent(marketSlug)}`
    : `/api/operators/template`

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setResultMsg(null)
    setBusy('import')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/operators/import?dryRun=1', { method: 'POST', body: form })
      const j = await res.json()
      if (!res.ok && !j.preview) {
        setResultMsg(j.error ?? 'Errore analisi file')
        setPendingFile(null)
      } else {
        setPreview(j.preview)
      }
    } finally {
      setBusy(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function confirmImport() {
    if (!pendingFile) return
    setBusy('import')
    setResultMsg(null)
    try {
      const form = new FormData()
      form.append('file', pendingFile)
      const res = await fetch('/api/operators/import', { method: 'POST', body: form })
      const j = await res.json()
      if (!res.ok) {
        setResultMsg(j.error ?? 'Errore import')
      } else {
        setResultMsg(`Importati ${j.created} nuovi, ${j.updated} aggiornati, ${j.presencesSaved} presenze salvate.`)
        setPreview(null)
        setPendingFile(null)
        onImported?.()
      }
    } finally {
      setBusy(null)
    }
  }

  function cancelPreview() {
    setPreview(null)
    setPendingFile(null)
    setResultMsg(null)
  }

  return (
    <div className="bg-cream-50 border border-cream-300 rounded-sm p-4 md:p-5">
      <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-3">Excel · import / export</p>
      <div className="flex flex-wrap gap-2">
        <a
          href={exportUrl}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-ink text-cream-100 rounded-full text-xs hover:bg-ink/90"
        >
          <Download className="w-3.5 h-3.5" /> Esporta .xlsx
        </a>
        <a
          href={templateUrl}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-cream-200 hover:bg-cream-300 text-ink rounded-full text-xs"
        >
          <FileDown className="w-3.5 h-3.5" /> Template vuoto
        </a>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy === 'import'}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-olive-600 hover:bg-olive-700 text-cream-100 rounded-full text-xs disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" /> {busy === 'import' && !preview ? 'Analisi…' : 'Importa .xlsx'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileChosen}
        />
      </div>

      {resultMsg && (
        <p className="mt-3 text-sm text-ink flex items-center gap-1.5">
          <Check className="w-4 h-4 text-olive-600" /> {resultMsg}
        </p>
      )}

      {preview && (
        <div className="mt-4 border-t border-cream-300 pt-4">
          <p className="text-sm font-medium text-ink mb-2">Anteprima import</p>
          <div className="flex flex-wrap gap-4 text-xs text-ink-soft mb-3">
            <span>Nuovi: <strong className="text-ink tabular-nums">{preview.willCreate}</strong></span>
            <span>Aggiornati: <strong className="text-ink tabular-nums">{preview.willUpdate}</strong></span>
            <span>Presenze: <strong className="text-ink tabular-nums">{preview.totalPresences}</strong></span>
            {preview.errors.length > 0 && (
              <span className="text-terra-600">Errori: <strong className="tabular-nums">{preview.errors.length}</strong></span>
            )}
          </div>

          {preview.errors.length > 0 && (
            <ul className="bg-terra-100/40 border border-terra-500/40 rounded-sm p-3 mb-3 max-h-40 overflow-y-auto text-xs space-y-1">
              {preview.errors.slice(0, 20).map((e, i) => (
                <li key={i} className="flex items-start gap-1.5 text-ink">
                  <AlertTriangle className="w-3 h-3 text-terra-600 flex-shrink-0 mt-0.5" />
                  <span>Riga {e.rowIndex}: {e.message}</span>
                </li>
              ))}
              {preview.errors.length > 20 && (
                <li className="text-ink-muted italic">… e altri {preview.errors.length - 20}</li>
              )}
            </ul>
          )}

          {preview.groups.length > 0 && (
            <details className="mb-3">
              <summary className="text-xs text-ink-muted cursor-pointer hover:text-ink">
                Mostra {preview.groups.length} operator{preview.groups.length === 1 ? 'e' : 'i'} nell&apos;anteprima
              </summary>
              <ul className="mt-2 max-h-52 overflow-y-auto text-xs space-y-1">
                {preview.groups.map((g, i) => (
                  <li key={i} className="flex justify-between items-center gap-2 py-1 border-b border-cream-300 last:border-0">
                    <span className="truncate">
                      <strong className="text-ink">{g.name}</strong>
                      <span className="text-ink-muted"> · {g.marketSlug} · {g.presencesCount} presenz{g.presencesCount === 1 ? 'a' : 'e'}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-wider ${g.action === 'create' ? 'bg-olive-100 text-olive-700' : 'bg-sea-100 text-sea-600'}`}>
                      {g.action === 'create' ? 'nuovo' : 'aggiorna'}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelPreview}
              className="px-3 py-1.5 text-xs bg-cream-200 hover:bg-cream-300 text-ink rounded-sm"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={confirmImport}
              disabled={busy === 'import' || preview.errors.length > 0}
              className="px-3 py-1.5 text-xs bg-ink text-cream-100 rounded-full hover:bg-ink/90 disabled:opacity-50"
            >
              {busy === 'import' ? 'Importazione…' : 'Conferma import'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
