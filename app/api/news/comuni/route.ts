// API delle notizie sui mercati dai siti ufficiali dei comuni.
// La logica vive in lib/news/fetchComuniNews (condivisa con /notizie):
// qui esponiamo solo il JSON, con cache di un'ora.
import { NextResponse } from 'next/server'
import { fetchComuniNews } from '@/lib/news/fetchComuniNews'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function GET() {
  const items = await fetchComuniNews()
  return NextResponse.json({ items })
}
