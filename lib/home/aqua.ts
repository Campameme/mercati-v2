// Effetto "acqua" leggero per l'hero (home e galleria). Canvas TRASPARENTE sopra
// la foto ferma + velo blu: bollicine che salgono, increspature che si espandono
// al passaggio del mouse, e un alone morbido che si espande (movimento) e si
// ritrae (fermo) seguendo il cursore. Niente fasci di luce, niente linea di sale.
// Solo 2D/transform (GPU-friendly). Reduced-motion safe.

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

  const N = opts.bubbles ?? 28
  const bubbles = Array.from({ length: N }, () => ({
    x: Math.random(), phase: Math.random(), speed: 0.015 + Math.random() * 0.045, r: 1 + Math.random() * 3.5,
  }))

  // reduced-motion: un fotogramma statico di bollicine, niente loop
  if (reduced) {
    ctx.fillStyle = 'rgba(207,232,236,0.32)'
    for (const b of bubbles) { const x = w * b.x, y = h * (1 - b.phase); ctx.beginPath(); ctx.arc(x, y, b.r, 0, Math.PI * 2); ctx.fill() }
    return () => ro.disconnect()
  }

  type Ripple = { x: number; y: number; start: number }
  const ripples: Ripple[] = []
  let cx = -1e4, cy = -1e4, bloom = 0, bloomT = 0, px = 0, py = 0, lastRipple = 0

  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left, y = e.clientY - rect.top
    const sp = Math.hypot(x - px, y - py); px = x; py = y; cx = x; cy = y
    bloomT = Math.min(1, bloomT + sp / 90) // più veloce il mouse → più si espande
    const now = performance.now()
    if (now - lastRipple > 95) { lastRipple = now; ripples.push({ x, y, start: now * 0.001 }); if (ripples.length > 16) ripples.shift() }
  }
  const onLeave = () => { bloomT = 0 }
  host.addEventListener('pointermove', onMove)
  host.addEventListener('pointerleave', onLeave)

  let visible = true
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting }, { threshold: 0 })
  io.observe(host)

  let raf = 0
  const render = () => {
    raf = requestAnimationFrame(render)
    if (!visible || document.hidden) return
    const t = performance.now() * 0.001
    ctx.clearRect(0, 0, w, h)

    // alone che si espande (al passaggio del mouse) e si ritrae (da fermo)
    bloomT *= 0.94
    bloom += (bloomT - bloom) * 0.12
    if (bloom > 0.012 && cx > -1e3) {
      const r = 50 + bloom * 150
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, `rgba(207,232,236,${0.16 * bloom + 0.03})`)
      g.addColorStop(1, 'rgba(207,232,236,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
    }

    // bollicine che salgono
    ctx.fillStyle = 'rgba(231,244,245,0.5)'
    for (const b of bubbles) {
      const y = h * (1 - ((t * b.speed + b.phase) % 1))
      const x = w * b.x + Math.sin(t + b.phase * 6) * 8
      ctx.beginPath(); ctx.arc(x, y, b.r, 0, Math.PI * 2); ctx.fill()
    }

    // increspature: si espandono e svaniscono
    ctx.lineWidth = 1.6
    for (let k = ripples.length - 1; k >= 0; k--) {
      const age = t - ripples[k].start
      if (age > 1.4) { ripples.splice(k, 1); continue }
      const r = age * 190
      ctx.strokeStyle = `rgba(207,232,236,${(1 - age / 1.4) * 0.45})`
      ctx.beginPath(); ctx.arc(ripples[k].x, ripples[k].y, r, 0, Math.PI * 2); ctx.stroke()
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
