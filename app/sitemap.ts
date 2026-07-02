import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/site'

// Rigenerata al più ogni ora: le rotte statiche + una voce per ogni zona attiva.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/mappa`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/operatori`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/eventi`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/notizie`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/calendar`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/aderisci`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${SITE_URL}/cookie`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
  ]

  // Zone/mercati attivi dal DB. Client anon "nudo" (niente cookie: la sitemap
  // può essere generata anche fuori da una request). Se il DB non risponde,
  // pubblichiamo comunque le rotte statiche.
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && key) {
      const supabase = createClient(url, key, { auth: { persistSession: false } })
      // NB: markets non ha updated_at (solo created_at)
      const { data: markets, error } = await supabase
        .from('markets')
        .select('slug')
        .eq('is_active', true)
      if (error) console.warn('[sitemap] query zone fallita:', error.message)
      for (const m of markets ?? []) {
        entries.push({
          url: `${SITE_URL}/${m.slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    }
  } catch (err) {
    console.warn('[sitemap] impossibile leggere le zone dal DB:', err)
  }

  return entries
}
