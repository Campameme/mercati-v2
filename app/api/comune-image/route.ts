import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Restituisce una foto di luogo (non stemma) per un comune italiano, interrogando
 * MediaWiki. Strategia:
 *   1. action=query&generator=images raccoglie TUTTI i file della pagina Wikipedia
 *      con mime/size/thumburl.
 *   2. Scarta stemmi, bandiere, gonfaloni, mappe, SVG e icone piccole.
 *   3. Ordina per area (w*h) e ritorna la più grande — di solito è una foto di panorama.
 *
 * Fallback: prova anche "<q> (comune)" e la variante con underscore, poi /api/rest_v1/summary.
 * Cache 24h via Next.js revalidate.
 */

function isCoatOfArms(filename: string): boolean {
  const s = filename.toLowerCase()
  return (
    /stemma/.test(s) ||
    /coat.of.arms/.test(s) ||
    /\bcoa\b/.test(s) ||
    /gonfalone/.test(s) ||
    /crest/.test(s) ||
    /escutcheon/.test(s) ||
    /bandiera/.test(s) ||
    /flag.of/.test(s)
  )
}

function isGenericIcon(filename: string): boolean {
  const s = filename.toLowerCase().replace(/^file:/, '')
  return (
    /^map[._ ]of/.test(s) ||
    /^italy[._ ]provincial/.test(s) ||
    /^location[._ ]map/.test(s) ||
    /^map\b/.test(s) ||
    /logo[._]/.test(s) ||
    /regione[._ ]liguria/.test(s) ||
    /provincia[._ ]di[._ ]imperia/.test(s) ||
    /^italy[._ ]relief/.test(s) ||
    /wikidata.logo/.test(s) ||
    /^commons/.test(s)
  )
}

async function wikiFetch(url: string) {
  return fetch(url, {
    next: { revalidate: 86400 },
    headers: { 'User-Agent': 'IMercati/1.0', Accept: 'application/json' },
  })
}

interface PhotoCandidate {
  url: string
  area: number
  score: number
  filename: string
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[àáâã]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìí]/g, 'i')
    .replace(/[òóôõ]/g, 'o').replace(/[ùú]/g, 'u')
}

/** Score qualitativo: filename con riferimenti al luogo vince sulle foto generiche (statue, oggetti). */
function scoreFilename(filename: string, comune: string): number {
  const fn = normalize(filename).replace(/^file:/, '')
  const nc = normalize(comune)
  let s = 0
  if (fn.includes(nc)) s += 50
  if (/panorama|vista|veduta|skyline/.test(fn)) s += 40
  if (/centro.storico|borgo|piazza|lungomare|porto|castello|spiaggia/.test(fn)) s += 20
  if (/chiesa|cattedrale|abbazia|basilica/.test(fn)) s += 10
  if (/caruggio|carrugio|via[._ ]/.test(fn)) s += 8
  if (/statua|monumento|tomba|lapide/.test(fn)) s -= 30
  return s
}

async function getBestPhotoForTitle(title: string, comune: string): Promise<PhotoCandidate | null> {
  const url =
    `https://it.wikipedia.org/w/api.php?action=query&generator=images&gimlimit=50` +
    `&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1200` +
    `&redirects=1` + // segue redirect es. "Vallecrosia" → "Vallecrosia al Mare"
    `&titles=${encodeURIComponent(title)}&format=json&formatversion=2&origin=*`
  try {
    const res = await wikiFetch(url)
    if (!res.ok) return null
    const d = await res.json()
    const pages: any[] = d?.query?.pages ?? []
    const candidates: PhotoCandidate[] = []
    for (const p of pages) {
      const filename: string = p.title ?? ''
      if (isCoatOfArms(filename) || isGenericIcon(filename)) continue
      const ii = p.imageinfo?.[0]
      if (!ii) continue
      const mime: string = ii.mime ?? ''
      if (!/^image\/(jpeg|png|webp)$/i.test(mime)) continue
      // size può arrivare da thumbwidth o width
      const w: number = ii.thumbwidth ?? ii.width ?? 0
      const h: number = ii.thumbheight ?? ii.height ?? 0
      if (w < 600 || h < 400) continue
      const picked: string | undefined = ii.thumburl ?? ii.url
      if (!picked) continue
      candidates.push({ url: picked, area: w * h, filename, score: scoreFilename(filename, comune) })
    }
    // Ordiniamo per score (qualitativo) poi per area (dimensione) come tie-breaker
    candidates.sort((a, b) => (b.score - a.score) || (b.area - a.area))
    return candidates[0] ?? null
  } catch {
    return null
  }
}

async function getSummaryFallback(title: string): Promise<string | null> {
  // Ultimo tentativo: la thumbnail del summary (potrebbe comunque essere uno stemma,
  // quindi filtriamo per filename).
  try {
    const res = await wikiFetch(`https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
    if (!res.ok) return null
    const d = await res.json()
    const src: string | undefined = d.originalimage?.source ?? d.thumbnail?.source
    if (!src) return null
    if (isCoatOfArms(src) || /\.svg$/i.test(src)) return null
    return src
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ error: 'q richiesto' }, { status: 400 })

  // Prova prima le varianti disambiguate: se la pagina "Nome (Italia)" esiste,
  // è quasi sempre il comune (es. "Cervo (Italia)" vs "Cervo" = animale).
  // Se non esiste il fetch ritorna 0 pagine e passiamo al nome nudo.
  const tries = [`${q} (Italia)`, `${q} (comune)`, q]
  for (const t of tries) {
    const photo = await getBestPhotoForTitle(t, q)
    if (photo) {
      return NextResponse.json({
        imageUrl: photo.url,
        originalUrl: photo.url,
        title: t,
        filename: photo.filename,
        pageUrl: `https://it.wikipedia.org/wiki/${encodeURIComponent(t.replace(/ /g, '_'))}`,
      })
    }
  }

  // Fallback sul summary (meno affidabile ma a volte basta)
  for (const t of tries) {
    const src = await getSummaryFallback(t)
    if (src) return NextResponse.json({ imageUrl: src, originalUrl: src, title: t, filename: null, pageUrl: null })
  }

  return NextResponse.json({ imageUrl: null, originalUrl: null, title: q, filename: null, pageUrl: null })
}
