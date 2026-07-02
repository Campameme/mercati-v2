// Identità del sito in un punto solo: nome ufficiale del brand e URL base.
// L'URL viene da NEXT_PUBLIC_SITE_URL (da impostare nelle env del deploy,
// es. https://mercatidiponente.netlify.app); in locale cade su localhost.
export const SITE_NAME = 'Mercati della Riviera di Ponente'
export const SITE_TAGLINE = 'I mercati settimanali della Riviera dei Fiori, in provincia di Imperia'
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
