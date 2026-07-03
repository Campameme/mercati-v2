import Link from 'next/link'

// 404 brandizzata: tono del sito, rimanda ai due ingressi principali.
export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-carta bg-paper-grain flex items-center justify-center px-4">
      <div className="max-w-lg text-center py-20">
        <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-sole-600">
          Errore 404
        </p>
        <h1 className="font-display text-5xl md:text-6xl text-ink mt-3">
          Questa bancarella non c&rsquo;è.
        </h1>
        <p className="font-alt text-ink-soft mt-4">
          La pagina che cerchi non esiste o è stata spostata. I mercati, però, sono sempre al loro posto.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 bg-ink text-carta rounded-full font-alt text-sm font-semibold hover:bg-mare transition-colors"
          >
            Torna alla home
          </Link>
          <Link
            href="/mappa"
            className="px-6 py-3 border-2 border-ink/15 text-ink rounded-full font-alt text-sm font-semibold hover:border-mare hover:text-mare transition-colors"
          >
            Apri la mappa
          </Link>
        </div>
      </div>
    </div>
  )
}
