import 'server-only'

// Notizie VIVE dai siti dei comuni e dalla stampa locale, via Google News RSS
// (nessuna chiave richiesta). Ogni zona ha le sue notizie (query sui suoi
// comuni), più una bacheca generale della Riviera. Cache: 2 ore per query.

export interface LiveNewsItem {
  title: string
  link: string
  source: string | null
  publishedAt: string | null
}

const UA = { 'User-Agent': 'MercatiPonente/1.0 (+https://mercati-fiere.netlify.app)' }

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&apos;/g, "'")
    .trim()
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))
  return m ? decodeEntities(m[1]) : null
}

/**
 * Ultime notizie per una query libera (es. "mercato Sanremo").
 * Ritorna [] su qualunque errore: le notizie vive non devono mai rompere la pagina.
 */
export async function fetchLiveNews(query: string, limit = 6): Promise<LiveNewsItem[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=it&gl=IT&ceid=IT:it`
    const res = await fetch(url, { headers: UA, next: { revalidate: 7200 } })
    if (!res.ok) return []
    const xml = await res.text()
    const out: LiveNewsItem[] = []
    const seen = new Set<string>()
    for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const block = m[1]
      let title = tag(block, 'title') ?? ''
      const source = tag(block, 'source')
      // Google News accoda " - Fonte" al titolo: togliamolo se ridondante
      if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3))
      const link = tag(block, 'link') ?? ''
      const pub = tag(block, 'pubDate')
      const key = title.toLowerCase().slice(0, 80)
      if (!title || !link || seen.has(key)) continue
      seen.add(key)
      out.push({
        title,
        link,
        source,
        publishedAt: pub ? new Date(pub).toISOString() : null,
      })
      if (out.length >= limit) break
    }
    return out
  } catch {
    return []
  }
}

/** Bacheca generale della Riviera di Ponente. */
export function generalNewsQuery(): string {
  return 'mercato settimanale (Imperia OR "Riviera dei Fiori" OR Ponente ligure)'
}

/** Query per le notizie di UNA zona: i suoi comuni in OR. */
export function zoneNewsQuery(comuni: string[]): string {
  const list = comuni
    .slice(0, 6)
    .map((c) => (c.includes(' ') ? `"${c}"` : c))
    .join(' OR ')
  return `mercato (${list})`
}
