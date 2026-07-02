import type { Metadata } from 'next'
import { Italiana, Figtree } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import CookieNotice from '@/components/CookieNotice'
import SmoothScroll from '@/components/motion/SmoothScroll'
import { SITE_NAME, SITE_URL } from '@/lib/site'

// Tipografia "Mercati della Riviera di Ponente" — sistema a due caratteri.
// Titolo principale: Italiana (serif display elegante, alto contrasto, un solo
// peso 400 → NIENTE font-bold/black sui titoli, userebbe un finto-grassetto).
// Tutto il resto (corpo, UI, accenti): Figtree con gerarchia di pesi/dimensioni.
const italiana = Italiana({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
})

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-alt',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — i mercati della Riviera dei Fiori`,
    template: `%s — ${SITE_NAME}`,
  },
  description: 'Il mercato che profuma di mare. Tutti i mercati settimanali della Riviera di Ponente — la Riviera dei Fiori, provincia di Imperia: dove e quando, cosa trovi, gli ambulanti e come arrivarci.',
  openGraph: {
    siteName: SITE_NAME,
    title: `${SITE_NAME} \u2014 il mercato che profuma di mare`,
    description: 'I mercati settimanali della Riviera dei Fiori su una mappa: giorni e orari, cosa trovi, ambulanti, eventi.',
    url: '/',
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — il mercato che profuma di mare`,
    description: 'I mercati settimanali della Riviera dei Fiori su una mappa: giorni e orari, cosa trovi, ambulanti, eventi.',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className={`${italiana.variable} ${figtree.variable}`}>
      <body className="font-sans bg-paper text-ink antialiased">
        <SmoothScroll />
        <Providers>
          <main className="min-h-screen">
            {children}
          </main>
          <CookieNotice />
        </Providers>
      </body>
    </html>
  )
}
