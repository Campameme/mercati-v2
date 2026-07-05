'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LANGS, type Lang } from './home'

/**
 * Stato lingua condiviso da TUTTI i componenti client: localStorage
 * (`imk:lang`, storico) + cookie `imk_lang` (letto dalle pagine server) +
 * <html lang>. Il cambio lingua fa router.refresh() così anche i contenuti
 * renderizzati lato server (zone, comuni, tipici) cambiano subito.
 */
export function useLang(): [Lang, (l: Lang) => void] {
  const router = useRouter()
  const [lang, setLangState] = useState<Lang>('it')

  useEffect(() => {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('imk:lang')) as Lang | null
    if (saved && LANGS.includes(saved)) setLangState(saved)
  }, [])

  const setLang = useCallback(
    (l: Lang) => {
      if (!LANGS.includes(l)) return
      setLangState(l)
      try {
        localStorage.setItem('imk:lang', l)
        document.cookie = `imk_lang=${l}; path=/; max-age=31536000; samesite=lax`
        document.documentElement.lang = l
      } catch {
        /* storage non disponibile: pazienza */
      }
      router.refresh()
    },
    [router],
  )

  // Allinea cookie e <html lang> anche al primo caricamento (per chi aveva
  // già la preferenza nel solo localStorage).
  useEffect(() => {
    try {
      document.cookie = `imk_lang=${lang}; path=/; max-age=31536000; samesite=lax`
      document.documentElement.lang = lang
    } catch {
      /* ignore */
    }
  }, [lang])

  return [lang, setLang]
}
