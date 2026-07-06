// 'unsafe-eval' serve SOLO al dev server di Next (react-refresh): in produzione
// va tolto. 'unsafe-inline' resta perché l'App Router inietta script inline di
// idratazione senza nonce (rimuoverlo romperebbe il sito).
const isDev = process.env.NODE_ENV === 'development'
const csp = [
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join('; ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Le vecchie pagine-stub /parcheggi e /[slug]/parking sono redirect di
  // piattaforma: i parcheggi vivono sulla mappa (dati statici OSM, niente Google).
  async redirects() {
    return [
      { source: '/eventi', destination: '/tipici', permanent: true },
      { source: '/calendar', destination: '/tipici', permanent: true },
      { source: '/parcheggi', destination: '/mappa', permanent: true },
      { source: '/:marketSlug/parking', destination: '/:marketSlug', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
