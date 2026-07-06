import { NextRequest, NextResponse } from 'next/server'
import { fetchLiveNews, generalNewsQuery, zoneNewsQuery } from '@/lib/news/live'
import { ZONE_BY_SLUG } from '@/lib/markets/zones'

// Notizie vive (Google News) per la home e i client: ?zone=<slug> per una
// zona, altrimenti bacheca generale. Cache upstream 2h (lib) + CDN 1h.
export async function GET(request: NextRequest) {
  const zone = new URL(request.url).searchParams.get('zone')
  const meta = zone ? ZONE_BY_SLUG[zone] : null
  const query = meta ? zoneNewsQuery(meta.borghi) : generalNewsQuery()
  const data = await fetchLiveNews(query, 6)
  return NextResponse.json(
    { data },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } },
  )
}
