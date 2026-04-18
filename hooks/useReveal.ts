'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Hook di reveal-on-scroll: applica una classe quando l'elemento entra nel viewport.
 * `shown` resta true una volta attivato (no re-animate su scroll out/in).
 */
export function useReveal<T extends HTMLElement>(opts?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return }
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          ob.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px', ...opts },
    )
    ob.observe(ref.current)
    return () => ob.disconnect()
  }, [])

  return { ref, shown }
}
