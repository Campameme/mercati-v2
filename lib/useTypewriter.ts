'use client'

import { useEffect, useRef, useState } from 'react'
import { prefersReduced } from '@/lib/motion/tokens'

/**
 * Effetto "macchina da scrivere": digita e cancella a ciclo una lista di frasi.
 * Usato come placeholder animato della ricerca, così la barra è viva PRIMA che
 * l'utente scriva. Reduced-motion → mostra la prima frase, statica.
 */
export function useTypewriter(
  words: string[],
  { typeMs = 65, deleteMs = 30, holdMs = 1400, gapMs = 350 }: { typeMs?: number; deleteMs?: number; holdMs?: number; gapMs?: number } = {},
): string {
  // Parte VUOTO (stesso valore su server e client → niente flash della prima
  // frase a ogni ciclo). Reduced-motion mostra la prima frase, statica.
  const [text, setText] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!words.length) return
    if (prefersReduced()) { setText(words[0]); return }
    let i = 0
    let j = 0
    let deleting = false
    setText('')
    const tick = () => {
      const w = words[i % words.length]
      if (!deleting) {
        j++
        setText(w.slice(0, j))
        if (j >= w.length) { deleting = true; timer.current = setTimeout(tick, holdMs); return }
        timer.current = setTimeout(tick, typeMs)
      } else {
        j--
        setText(w.slice(0, Math.max(0, j)))
        if (j <= 0) { deleting = false; i++; timer.current = setTimeout(tick, gapMs); return }
        timer.current = setTimeout(tick, deleteMs)
      }
    }
    timer.current = setTimeout(tick, 500)
    return () => { if (timer.current) clearTimeout(timer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.join('|')])

  return text
}
