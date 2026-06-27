import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import AdesioneForm from '@/components/AdesioneForm'
import { SunRay } from '@/components/decorations'
import Reveal from '@/components/Reveal'

export const metadata = {
  title: 'Aderisci — Mercati di Ponente',
  description: 'Sei un operatore di mercato della Riviera ligure di Ponente? Entra nei primi dieci banchi raccontati da Mercati di Ponente. Gratis per sempre.',
}

const SCHEDA = [
  {
    title: 'Una scheda vostra. Vera.',
    body: 'Foto del banco, vostra faccia, prodotti che vendete, dove e quando vi trovano. Non un profilo finto: la pagina che il cliente cerca quando vuole sapere dove andate sabato.',
  },
  {
    title: 'Vi raccontiamo noi, la prima volta.',
    body: 'La mattina al banco la passo io: faccio foto decenti, raccolgo due storie, le mettiamo per iscritto insieme. Voi continuate a vendere. Dalla seconda volta in poi, ve la cavate da soli.',
  },
  {
    title: 'Turismo di prossimità, non turisti di passaggio.',
    body: 'Mercati di Ponente arriva a chi vive a 15–60 minuti da voi: i cugini di Cuneo, i ponentini di Genova, i francesi della Costa Azzurra. Non promettiamo "tanti follower" — promettiamo persone che entrano al banco e vi chiamano per nome.',
  },
]

export default function AderisciPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-3xl py-10 md:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-mare-600 mb-6 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Homepage
      </Link>

      <Reveal>
        <div className="flex items-center gap-3 mb-4 text-ink-soft">
          <SunRay className="w-5 h-5 text-sole" aria-hidden="true" />
          <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em]">Per gli operatori</p>
        </div>
        <h1 className="font-display text-3xl md:text-5xl text-ink leading-[1.06] mb-5">
          State al mercato da anni.
          <br />
          <span className="text-mare-600">Fatevi trovare anche fuori.</span>
        </h1>
        <p className="text-base md:text-lg text-ink-soft leading-relaxed mb-3">
          Mercati di Ponente racconta i banchi della Riviera ligure di Ponente ai cittadini di prossimità
          — quelli che vivono a 15–60 minuti da voi. Persone che cercano una mattina diversa il
          sabato, non una vetrina online qualunque.
        </p>
        <p className="text-base text-ink-soft leading-relaxed mb-10">
          I primi dieci operatori entrano <strong className="text-ink">gratis</strong>.
          Restano gratis, per sempre. In cambio chiediamo una mattina al vostro banco e una
          storia da raccontare.
        </p>
      </Reveal>

      <Reveal delayMs={60}>
        <div className="border-t-2 border-ink/10 pt-10 mb-10">
          <h2 className="font-display text-2xl md:text-3xl text-ink leading-tight mb-2">
            Cosa cambia per voi,
            <br />
            <span className="text-mare-600">in concreto.</span>
          </h2>
          <p className="text-sm text-ink-muted mb-8">Non è marketing. È il lavoro che facciamo insieme nei primi tre mesi.</p>
          <ul className="space-y-7">
            {SCHEDA.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-4 items-start">
                <span className="font-display text-2xl text-mare tabular-nums leading-none pt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-display text-xl text-ink mb-1">{s.title}</p>
                  <p className="text-ink-soft leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal delayMs={120}>
        <div className="border-t-2 border-ink/10 pt-10">
          <h2 className="font-display text-2xl text-ink mb-1">Raccontateci di voi</h2>
          <p className="text-sm text-ink-muted mb-8">
            Cinque minuti. Risposte brevi vanno benissimo — al resto pensiamo insieme.
          </p>
          <AdesioneForm />
        </div>
      </Reveal>

      <Reveal delayMs={200}>
        <div className="mt-12 pt-8 border-t-2 border-ink/10 text-sm text-ink-soft">
          <p className="mb-2 font-medium text-ink">Preferite scriverci direttamente?</p>
          <p>
            Email:{' '}
            <a href="mailto:emanueleecampanini@gmail.com" className="text-mare-700 underline underline-offset-2 hover:text-mare-600">
              emanueleecampanini@gmail.com
            </a>
          </p>
          <p className="mt-3 text-ink-muted text-xs">
            Vi rispondiamo entro 48 ore. Sempre da una persona, mai da un autorisponditore.
          </p>
        </div>
      </Reveal>
    </div>
  )
}
