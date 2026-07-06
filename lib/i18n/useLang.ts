'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { LANGS, type Lang } from './home'

// Store GLOBALE della lingua: tutte le istanze del hook (navbar, hero della
// home, esploratori…) condividono lo stesso stato e si aggiornano insieme —
// prima ogni componente aveva il suo stato locale e i selettori "non si
// parlavano". Persistenza: localStorage (client) + cookie (pagine server).

let current: Lang = 'it'
let initialized = false
const listeners = new Set<() => void>()

function readInitial(): Lang {
  try {
    const saved = localStorage.getItem('imk:lang') as Lang | null
    if (saved && LANGS.includes(saved)) return saved
  } catch { /* ignore */ }
  return 'it'
}

function ensureInit() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  current = readInitial()
  try {
    document.cookie = `imk_lang=${current}; path=/; max-age=31536000; samesite=lax`
    document.documentElement.lang = current
  } catch { /* ignore */ }
  // sincronizza anche tra tab diverse
  window.addEventListener('storage', (e) => {
    if (e.key === 'imk:lang' && e.newValue && LANGS.includes(e.newValue as Lang) && e.newValue !== current) {
      current = e.newValue as Lang
      listeners.forEach((fn) => fn())
    }
  })
}

function subscribe(fn: () => void): () => void {
  ensureInit()
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function setGlobalLang(l: Lang) {
  if (!LANGS.includes(l) || l === current) return
  current = l
  try {
    localStorage.setItem('imk:lang', l)
    document.cookie = `imk_lang=${l}; path=/; max-age=31536000; samesite=lax`
    document.documentElement.lang = l
  } catch { /* ignore */ }
  listeners.forEach((fn) => fn())
}

export function useLang(): [Lang, (l: Lang) => void] {
  const router = useRouter()
  const lang = useSyncExternalStore(subscribe, () => (ensureInit(), current), () => 'it' as Lang)
  const setLang = useCallback(
    (l: Lang) => {
      setGlobalLang(l)
      // le pagine server leggono il cookie: rigenerale subito
      router.refresh()
    },
    [router],
  )
  return [lang, setLang]
}
