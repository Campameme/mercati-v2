import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

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

export const metadata: Metadata = {
  title: 'IMercati — Mercati della provincia di Imperia',
  description: 'Mercatini, fiere e prodotti locali dalla costa all\u2019entroterra ligure. Provincia di Imperia.',
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
    <html lang="it" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans bg-cream-100 text-ink antialiased">
        <Providers>
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
