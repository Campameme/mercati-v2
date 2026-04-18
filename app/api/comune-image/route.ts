import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Recupera la thumbnail di un comune dalla Wikipedia italiana tramite la REST API
 * summary (https://it.wikipedia.org/api/rest_v1/page/summary/<title>). Se la pagina
 * non esiste o non ha un'immagine principale, ritorna imageUrl=null in modo che il
 * client possa mostrare un placeholder.
 *
 * Cache 24h lato Next.js per evitare di martellare Wikipedia.
 */
export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ error: 'q richiesto' }, { status: 400 })

  try {
    const res = await fetch(
      `https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`,
      { next: { revalidate: 86400 }, headers: { 'User-Agent': 'iMercati/1.0' } },
    )
    if (!res.ok) return NextResponse.json({ imageUrl: null, originalUrl: null, title: q })
    const d = await res.json()
    // `thumbnail` è ~320px, `originalimage` è full-res; per hero cards preferiamo original
    return NextResponse.json({
      imageUrl: d.thumbnail?.source ?? d.originalimage?.source ?? null,
      originalUrl: d.originalimage?.source ?? d.thumbnail?.source ?? null,
      title: d.title ?? q,
      pageUrl: d.content_urls?.desktop?.page ?? null,
    })
  } catch {
    return NextResponse.json({ imageUrl: null, originalUrl: null, title: q })
  }
}
