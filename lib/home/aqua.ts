// Bollicine per l'hero: canvas TRASPARENTE sopra la foto ferma + velo blu.
// Niente increspature né aloni al mouse (rimossi su richiesta): restano le
// bollicine che salgono, ma INTERATTIVE — se il cursore le sfiora si gonfiano
// e scoppiano, poi rinascono dal fondo. Solo 2D (GPU-friendly).
// Reduced-motion safe: fotogramma statico, nessuna interazione.

interface AquaOpts {
  bubbles?: number
}

export function mountAqua(canvas: HTMLCanvasElement, host: HTMLElement, opts: AquaOpts = {}): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}
  const reduced = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  let w = 0, h = 0
  const resize = () => {
    w = host.clientWidth; h = host.clientHeight
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  // ResizeObserver: robusto anche se l'host ottiene la larghezza dopo il mount
  const ro = new ResizeObserver(() => resize())
  ro.observe(host)

  interface Bubble {
    x: number; phase: number; speed: number; r: number
    /** 0 = viva · >0 = sta scoppiando (progresso 0→1) */
    pop: number
  }
  const N = opts.bubbles ?? 30
  const mkBubble = (): Bubble => ({
    x: Math.random(), phase: Math.random(), speed: 0.015 + Math.random() * 0.045, r: 1.6 + Math.random() * 3.8, pop: 0,
  })
  const bubbles: Bubble[] = Array.from({ length: N }, mkBubble)

  // reduced-motion: un fotogramma statico di bollicine, niente loop né hover
  if (reduced) {
    ctx.fillStyle = 'rgba(207,232,236,0.32)'
    for (const b of bubbles) { const x = w * b.x, y = h * (1 - b.phase); ctx.beginPath(); ctx.arc(x, y, b.r, 0, Math.PI * 2); ctx.fill() }
    return () => ro.disconnect()
  }

  // posizione del mouse (per far scoppiare le bollicine sfiorate)
  let mx = -1e4, my = -1e4
  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    mx = e.clientX - rect.left; my = e.clientY - rect.top
  }
  const onLeave = () => { mx = -1e4; my = -1e4 }
  host.addEventListener('pointermove', onMove)
  host.addEventListener('pointerleave', onLeave)

  let visible = true
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting }, { threshold: 0 })
  io.observe(host)

  const HOVER_R = 46 // raggio entro cui la bollicina "sente" il cursore
  let raf = 0
  let last = performance.now()
  const render = () => {
    raf = requestAnimationFrame(render)
    if (!visible || document.hidden) return
    const now = performance.now()
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const t = now * 0.001
    ctx.clearRect(0, 0, w, h)

    for (const b of bubbles) {
      const y = h * (1 - ((t * b.speed + b.phase) % 1))
      const x = w * b.x + Math.sin(t + b.phase * 6) * 8

      if (b.pop === 0 && Math.hypot(x - mx, y - my) < HOVER_R) b.pop = 0.0001

      if (b.pop > 0) {
        // si gonfia e svanisce, poi rinasce dal fondo
        b.pop = Math.min(1, b.pop + dt * 2.6)
        const scale = 1 + b.pop * 3.2
        const alpha = 0.55 * (1 - b.pop)
        ctx.strokeStyle = `rgba(231,244,245,${alpha})`
        ctx.lineWidth = 1.4
        ctx.beginPath(); ctx.arc(x, y, b.r * scale, 0, Math.PI * 2); ctx.stroke()
        if (b.pop >= 1) {
          const nb = mkBubble()
          // riparte dal fondo, ora: phase tale che la y calcolata sia ≈ h
          nb.phase = ((-t * nb.speed) % 1 + 1) % 1
          Object.assign(b, nb)
        }
      } else {
        ctx.fillStyle = 'rgba(231,244,245,0.5)'
        ctx.beginPath(); ctx.arc(x, y, b.r, 0, Math.PI * 2); ctx.fill()
      }
    }
  }
  raf = requestAnimationFrame(render)

  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    host.removeEventListener('pointermove', onMove)
    host.removeEventListener('pointerleave', onLeave)
    io.disconnect()
  }
}
