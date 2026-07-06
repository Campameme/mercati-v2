// Identità del sito in un punto solo: nome ufficiale del brand e URL base.
// Imposta NEXT_PUBLIC_SITE_URL=https://mercatidiponente.it nelle env del deploy.
export const SITE_NAME = 'Mercati della Riviera di Ponente'
export const SITE_TAGLINE = 'I mercati settimanali della Riviera dei Fiori, in provincia di Imperia'
// Ordine di fallback: variabile esplicita → dominio di produzione Vercel →
// variabile URL di Netlify → localhost. Così sitemap/metadata puntano sempre
// al dominio giusto qualunque sia l'hosting.
const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (vercelProd ? `https://${vercelProd}` : undefined) ??
  process.env.URL ??
  'http://localhost:3000'
).replace(/\/$/, '')
