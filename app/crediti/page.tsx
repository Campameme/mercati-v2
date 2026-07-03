import type { Metadata } from 'next'
import Link from 'next/link'
import { PHOTO_CREDITS } from '@/lib/zonePhotos'

export const metadata: Metadata = {
  title: 'Crediti fotografici',
  description: 'Le fotografie dei borghi e delle coste del Ponente: autori e licenze (Wikimedia Commons).',
}

// Attribuzione delle foto curate dei borghi (public/zone): obbligo delle
// licenze Creative Commons e ringraziamento dovuto a chi le ha scattate.
export default function CreditiPage() {
  return (
    <div className="bg-carta bg-paper-grain min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-14 md:py-20 max-w-3xl">
        <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-mare-600 mb-2">Il sito</p>
        <h1 className="font-alt font-extrabold tracking-tight text-3xl md:text-4xl text-ink mb-3">Crediti fotografici</h1>
        <p className="text-ink-soft leading-relaxed mb-10 max-w-2xl">
          Le fotografie dei borghi e delle coste vengono da Wikimedia Commons, scelte una per una
          perché mostrino davvero quei luoghi. Grazie a chi le ha scattate e condivise con licenza libera.
        </p>

        <ul className="divide-y divide-ink/10 border-y-2 border-ink/10">
          {PHOTO_CREDITS.map((p) => (
            <li key={p.file} className="py-3.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-alt font-semibold text-sm text-ink flex-1 min-w-[12rem]">{p.alt}</span>
              <span className="text-xs text-ink-muted">{p.artist} · {p.license}</span>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-alt text-xs font-semibold text-mare-600 hover:text-mare underline underline-offset-2">
                Commons →
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs text-ink-muted">
          Le altre immagini di luogo sono caricate da Wikipedia (con link alla pagina di origine).
          Mappa: © OpenStreetMap contributors, tile CARTO.
        </p>

        <Link href="/" className="mt-10 inline-flex font-alt text-sm font-semibold text-mare-600 hover:text-mare underline underline-offset-2">
          ← Torna alla home
        </Link>
      </div>
    </div>
  )
}
