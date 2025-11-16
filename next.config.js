/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'maps.googleapis.com'],
  },
  // Le variabili NEXT_PUBLIC_* sono automaticamente esposte, non serve duplicarle qui
  // NOTA: i18n è stato rimosso perché non è supportato con App Router in Next.js 14
  // Se serve supporto multilingua, usa il nuovo sistema di routing con [locale]
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com; object-src 'none'; base-uri 'self';",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

