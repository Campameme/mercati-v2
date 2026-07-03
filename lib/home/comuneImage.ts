// Recupero foto comune: PRIMA la selezione curata locale (public/zone — foto
// scelte una per una perché rappresentino davvero quel borgo/costa), poi il
// fallback via /api/comune-image (Wikipedia) per i luoghi non coperti.
// DEDUP + limite di CONCORRENZA: richieste identiche condividono una sola
// promessa e al massimo MAX richieste partono insieme (niente "thundering
// herd" su Wikipedia). I MISS non vengono memorizzati → retry futuro.
import { curatedPhoto } from '@/lib/zonePhotos'

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
  const curated = curatedPhoto(query) ?? (fallback ? curatedPhoto(fallback) : null)
  if (curated) return Promise.resolve(curated.src)

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
