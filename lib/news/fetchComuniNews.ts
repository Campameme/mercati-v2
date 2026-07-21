// Aggregatore server-side delle notizie sui mercati pubblicate dai siti
// istituzionali dei comuni (fonti in ./comuniFeeds). Nessuna dipendenza:
// il parsing RSS/Atom è fatto con regex tolleranti (in Node non c'è
// DOMParser). Ogni fonte ha il suo timeout e il suo try/catch: una fonte
// rotta non deve rompere le altre, né il build.
import 'server-only'
import { COMUNI_FEEDS } from './comuniFeeds'

export interface ComuneNewsItem {
  /** Nome del comune (etichetta della card) */
  comune: string
  /** Titolo della notizia, già decodificato */
  title: string
  /** Link alla notizia sul sito istituzionale */
  url: string
  /** Data di pubblicazione in ISO, null se il feed non la espone */
  date: string | null
  /** Homepage della fonte (attribuzione) */
  source: string
}

/** Timeout per singola fonte (ms): oltre, la fonte viene semplicemente saltata */
const TIMEOUT_PER_FONTE = 6000
/** Massimo di notizie per singolo comune (evita che un feed prolifico domini) */
const MAX_PER_COMUNE = 8
/** Massimo complessivo restituito */
const MAX_TOTALE = 30
/** Cache dei feed lato Next (secondi): un'ora, come la route */
const REVALIDATE_FEED = 3600

// Parole chiave dei mercati (case-insensitive, su titolo + descrizione).
// Tenute strette per evitare falsi positivi: mercato/i, mercatino/i,
// ambulante/i (e "commercio ambulante"), fiera/e, bancarelle, antiquariato,
// produttori. Volutamente esclusi: "banchi" (ambiguo), "agricol*", "dehors".
const KEYWORDS =
  /\bmercat(?:o|i|ino|ini)\b|\bambulant\w*|\bfier[ae]\b|\bbancarell\w*|\bantiquariato\b|\bproduttori\b/i

/** Decodifica le entità HTML più comuni nei feed (incluse le numeriche). */
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
}

/** Toglie i wrapper CDATA, i tag HTML e normalizza gli spazi. */
function pulisci(s: string): string {
  const senzaCdata = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  return decodeEntities(senzaCdata)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Primo match di un tag (contenuto testuale), tollerante su attributi e newline. */
function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))
  return m ? m[1] : ''
}

/** Link di un item: RSS usa il testo di <link>, Atom l'attributo href. */
function estraiLink(block: string): string {
  const testo = pulisci(tag(block, 'link'))
  if (/^https?:\/\//i.test(testo)) return testo
  // Atom: <link href="..." rel="alternate"/> — preferisci rel=alternate
  const alt = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i)
  if (alt) return decodeEntities(alt[1])
  const href = block.match(/<link[^>]*href=["']([^"']+)["']/i)
  return href ? decodeEntities(href[1]) : ''
}

/** Data dell'item in ISO, null se assente o non interpretabile. */
function estraiData(block: string): string | null {
  const grezza =
    pulisci(tag(block, 'pubDate')) ||
    pulisci(tag(block, 'dc:date')) ||
    pulisci(tag(block, 'published')) ||
    pulisci(tag(block, 'updated'))
  if (!grezza) return null
  const d = new Date(grezza)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

/** Parsa un feed RSS (<item>) o Atom (<entry>) e filtra sui mercati. */
function parseFeed(xml: string, comune: string, homepage: string): ComuneNewsItem[] {
  const blocchi: string[] = []
  const re = /<(item|entry)[\s>][\s\S]*?<\/\1>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) blocchi.push(m[0])

  const out: ComuneNewsItem[] = []
  for (const b of blocchi) {
    const title = pulisci(tag(b, 'title'))
    const url = estraiLink(b)
    if (!title || !/^https?:\/\//i.test(url)) continue
    const descrizione = pulisci(tag(b, 'description') || tag(b, 'summary') || tag(b, 'content'))
    // filtro pertinenza: la notizia deve parlare di mercati
    if (!KEYWORDS.test(`${title} ${descrizione}`)) continue
    out.push({ comune, title, url, date: estraiData(b), source: homepage })
    if (out.length >= MAX_PER_COMUNE) break
  }
  return out
}

/** Scarica un singolo feed col suo timeout; su qualsiasi errore torna []. */
async function fetchFonte(feedUrl: string, comune: string, homepage: string): Promise<ComuneNewsItem[]> {
  try {
    const res = await fetch(feedUrl, {
      signal: AbortSignal.timeout(TIMEOUT_PER_FONTE),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MercatiRivieraFiori/1.0; +https://mercatidiponente.it)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        // ComWeb (Ventimiglia) risponde 404 sulle rotte /it-it/ senza lingua
        'Accept-Language': 'it-IT,it;q=0.9',
      },
      // cache dei dati anche dentro pagine force-dynamic
      next: { revalidate: REVALIDATE_FEED },
    })
    if (!res.ok) return []
    const xml = await res.text()
    return parseFeed(xml, comune, homepage)
  } catch {
    // fonte lenta o rotta: silenzio, le altre proseguono
    return []
  }
}

/**
 * Le ultime notizie sui mercati dai siti ufficiali dei comuni, già filtrate,
 * ordinate per data (più recenti prima, senza data in coda) e limitate.
 * Non lancia mai: nel peggiore dei casi torna [].
 */
export async function fetchComuniNews(): Promise<ComuneNewsItem[]> {
  try {
    const fonti = COMUNI_FEEDS.filter(
      (f): f is typeof f & { feedUrl: string } => typeof f.feedUrl === 'string'
    )
    const risultati = await Promise.allSettled(
      fonti.map((f) => fetchFonte(f.feedUrl, f.comune, f.homepage))
    )
    const tutte = risultati.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))

    // dedup per URL (qualche feed ripete lo stesso item)
    const visti = new Set<string>()
    const uniche = tutte.filter((n) => {
      if (visti.has(n.url)) return false
      visti.add(n.url)
      return true
    })

    uniche.sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return b.date.localeCompare(a.date)
    })
    return uniche.slice(0, MAX_TOTALE)
  } catch {
    return []
  }
}
