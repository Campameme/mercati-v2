'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/motion/gsap'
import { prefersReduced } from '@/lib/motion/tokens'

/**
 * Smooth scroll (Lenis) sincronizzato con GSAP/ScrollTrigger — vedi
 * docs/brand-system.md §7.2. Disattivato sotto prefers-reduced-motion.
 * Non avvolge nulla: agisce sullo scroll della finestra. Montalo una volta.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReduced()) return

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return null
}
