import type { Metadata } from 'next'
import { Inter, Fraunces, Archivo_Black, Bricolage_Grotesque, Caveat } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import CookieNotice from '@/components/CookieNotice'
import SmoothScroll from '@/components/motion/SmoothScroll'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  axes: ['SOFT', 'opsz'],
  style: ['normal', 'italic'],
})

// Brand "bold" v2 — display espressivo, accento manoscritto
const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-alt',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-accent',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mercati di Ponente — i mercati della provincia di Imperia',
  description: 'La mappa dei mercati della provincia di Imperia, Riviera di Ponente: dove e quando, cosa trovi, gli ambulanti e i parcheggi. La mattina, vicino a te.',
  openGraph: {
    title: 'Mercati di Ponente \u2014 la mattina, vicino a te',
    description: 'I mercati della provincia di Imperia su una mappa: giorni e orari, cosa trovi, ambulanti, parcheggi.',
    locale: 'it_IT',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className={`${inter.variable} ${fraunces.variable} ${archivoBlack.variable} ${bricolage.variable} ${caveat.variable}`}>
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
