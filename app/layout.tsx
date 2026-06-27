import type { Metadata } from 'next'
import { Inter, Fraunces, Archivo_Black, Bricolage_Grotesque, Caveat } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import CookieNotice from '@/components/CookieNotice'

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
  title: 'IMercati — Mercati della Riviera ligure di Ponente',
  description: 'Vicino, ma da scoprire. La guida ai mercati settimanali della Riviera ligure di Ponente \u2014 orari, luoghi, banchi e operatori, raccontati da chi ci va davvero.',
  openGraph: {
    title: 'IMercati \u2014 Vicino, ma da scoprire',
    description: 'I mercati settimanali della Riviera ligure di Ponente: orari, luoghi, banchi, persone. Scegli per giorno o per comune.',
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
