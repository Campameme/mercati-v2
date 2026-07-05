'use client'

import { Globe, ChevronDown } from 'lucide-react'
import { LANGS, type Lang } from '@/lib/i18n/home'
import { useLang } from '@/lib/i18n/useLang'

const LANG_LABEL: Record<Lang, string> = { it: 'Italiano', fr: 'Français', de: 'Deutsch', en: 'English' }

/**
 * Selettore lingua a tendina, sempre presente nella barra di navigazione.
 * Cambia lingua per TUTTO il sito: componenti client (localStorage) e pagine
 * server (cookie + refresh) — vedi lib/i18n/useLang.
 */
export default function LangSwitcher({ compact = true }: { compact?: boolean }) {
  const [lang, setLang] = useLang()
  return (
    <div className="relative">
      <Globe className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" aria-hidden="true" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        aria-label="Lingua / Langue / Sprache / Language"
        className={`appearance-none font-alt text-sm font-semibold bg-white text-ink border-2 border-ink/15 rounded-full pl-8 pr-7 py-1.5 focus:outline-none focus:border-mare cursor-pointer hover:border-mare transition-colors ${compact ? 'uppercase' : ''}`}
      >
        {LANGS.map((l) => (
          <option key={l} value={l}>
            {compact ? l.toUpperCase() : LANG_LABEL[l]}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
    </div>
  )
}
