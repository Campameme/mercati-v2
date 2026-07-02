// Recupero foto comune con DEDUP + limite di CONCORRENZA: richieste identiche
// condividono una sola promessa (la galleria riusa le query dei borghi) e al
// massimo MAX richieste partono insieme (niente "thundering herd" su Wikipedia,
// che altrimenti rallenta/scarta). I MISS non vengono memorizzati → retry futuro.
const cache = new Map<string, Promise<string | null>>()

const MAX = 4
let active = 0
const waiters: Array<() => void> = []
function acquire(): Promise<void> {
  if (active < MAX) { active++; return Promise.resolve() }
  return new Promise<void>((res) => waiters.push(() => { active++; res() }))
}
function release() {
  active--
  const next = waiters.shift()
  if (next) next()
}

export function getComuneImage(query: string, fallback?: string): Promise<string | null> {
  const key = `${query}|${fallback ?? ''}`
  const hit = cache.get(key)
  if (hit) return hit

  const run = (async (): Promise<string | null> => {
    await acquire()
    try {
      const tryQ = async (q: string): Promise<string | null> => {
        try {
          const r = await fetch(`/api/comune-image?q=${encodeURIComponent(q)}`)
          const d = await r.json()
          return d.originalUrl ?? d.imageUrl ?? null
        } catch {
          return null
        }
      }
      let u = await tryQ(query)
      if (!u && fallback) u = await tryQ(fallback)
      return u
    } finally {
      release()
    }
  })()

  // non "congelare" un fallimento: se null, libera la chiave per un retry futuro
  run.then((u) => { if (u == null) cache.delete(key) }).catch(() => cache.delete(key))
  cache.set(key, run)
  return run
}
