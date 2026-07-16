import Link from 'next/link'
import { ChevronLeft, ArrowRight } from 'lucide-react'
import AdesioneForm from '@/components/AdesioneForm'
import Reveal from '@/components/Reveal'
import Bollino from '@/components/Bollino'
import { PostItNote } from '@/components/motion/PostItCollage'
import WaveDivider from '@/components/motion/WaveDivider'
import { LogoMark } from '@/components/Logo'

export const metadata = {
  title: 'Entra nella rete dei banchi',
  description:
    'Hai un banco in provincia di Imperia, da Ventimiglia a Diano? La rete dei banchi di fiducia non è un abbonamento: è un gruppo che si sceglie. Tre requisiti: banco pulito e curato, prodotti di qualità, serietà con colleghi e clienti.',
}

// I tre requisiti della rete — sempre con queste parole (docs/brand-voice.md).
const REQUISITI = [
  {
    title: 'Banco pulito e curato',
    body: 'L’ordine si vede da tre metri: merce esposta con cura, prezzi chiari, il banco a posto dall’apertura alla chiusura.',
  },
  {
    title: 'Prodotti di qualità',
    body: 'Merce scelta e dichiarata per quella che è: la stagione quando è stagione, la provenienza quando te la chiedono.',
  },
  {
    title: 'Serietà con colleghi e clienti',
    body: 'La parola data vale, col cliente come col banco accanto. Al mercato ci si rivede ogni settimana: la fiducia è tutto.',
  },
]

// Cosa ci guadagna il banco: vantaggi concreti, senza promesse da agenzia.
const VANTAGGI = [
  {
    title: 'Una vetrina vera',
    body: 'La pagina del tuo banco con la tua storia raccontata: chi ci sta dietro, cosa vendi, dove e quando ti si trova.',
    tag: '#DietroIlBanco',
  },
  {
    title: 'Clienti che arrivano già informati',
    body: 'Chi ti trova sul sito arriva al banco sapendo cosa vendi, che giorno ci sei e in che piazza. Resta solo da servirlo bene.',
  },
  {
    title: 'Tessera punti e offerte',
    body: 'Le tue offerte arrivano a chi ha la tessera, e i punti riportano i clienti al banco la settimana dopo.',
  },
  {
    title: 'La rete dà valore a chi lavora bene',
    body: 'Il bollino dice a colpo d’occhio come tieni il banco. E stare accanto ad altri banchi seri dà valore anche al tuo.',
  },
]

export default function AderisciPage() {
  return (
    <div>
      {/* HERO: crema con velo di tratteggio, il bollino della rete a fianco */}
      <section className="relative overflow-hidden bg-crema border-b border-ink/10">
        <div aria-hidden="true" className="mz-hatch absolute inset-0" />
        <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-5xl py-10 md:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-alga mb-8 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Homepage
          </Link>

          <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center">
            <Reveal>
              <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-4">
                Per chi tiene banco · da Ventimiglia a Diano
              </p>
              <h1 className="font-display font-extrabold tracking-tight text-4xl md:text-6xl text-ink leading-[1.04] mb-5">
                Entra nella <span className="text-alga">rete dei banchi</span>.
              </h1>
              <p className="font-alt font-semibold text-lg md:text-xl text-ink mb-3">
                Non è un abbonamento: è un gruppo che si sceglie.
              </p>
              <p className="max-w-xl text-base md:text-lg text-ink-soft leading-relaxed">
                La rete raccoglie i banchi di fiducia dei mercati della provincia di Imperia.
                Si entra in un modo solo: tenendo fede a tre requisiti, ogni giorno di mercato.
              </p>
              <div className="mt-7">
                <a
                  href="#richiesta"
                  className="group imk-lift inline-flex items-center gap-2 font-alt font-semibold text-sm bg-alga text-crema px-6 py-3.5 rounded-full hover:bg-alga-600 transition-colors"
                >
                  Chiedi di entrare <ArrowRight className="imk-march w-4 h-4" />
                </a>
              </div>
            </Reveal>

            <Reveal delayMs={80} className="hidden md:block">
              <div className="relative">
                <Bollino className="w-44 lg:w-52" />
                <div aria-hidden="true" className="absolute -left-24 -bottom-14 w-32 pointer-events-none">
                  <PostItNote photo={{ src: '/zone/vita-artigianato-borse.webp', alt: '' }} tilt={-5} aspect="aspect-[4/3]" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
        <WaveDivider className="relative z-10 text-alga/30" />
      </section>

      {/* I TRE REQUISITI: card bianche con band alga piena e nodo-bullet */}
      <section id="requisiti" className="bg-crema-2">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl py-12 md:py-16">
          <Reveal>
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-terracotta mb-2">I tre requisiti</p>
            <h2 className="font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink leading-[1.05] mb-3">
              Si entra così, e così si resta.
            </h2>
            <p className="max-w-2xl text-ink-soft leading-relaxed mb-8">
              Valgono uguali per tutti, dal banco dei fiori a quello del pesce. Facili da dire, seri da mantenere.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {REQUISITI.map((r, i) => (
              <Reveal key={r.title} delayMs={i * 60} className="h-full">
                <div className="h-full flex flex-col bg-white rounded-xl border border-[#e0d7c1] overflow-hidden">
                  <span aria-hidden="true" className="mz-band mz-band--solid" style={{ ['--band' as string]: '#46683B' }} />
                  <div className="flex flex-col gap-2 p-5">
                    <LogoMark className="w-6 h-5 text-terracotta" capo={false} />
                    <h3 className="font-display font-extrabold tracking-tight text-lg text-ink leading-tight">{r.title}</h3>
                    <p className="text-[15px] text-ink-soft leading-relaxed">{r.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* I VANTAGGI: cosa ci guadagna il banco, punto per punto */}
      <section id="vantaggi" className="bg-crema">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl py-12 md:py-16">
          <Reveal>
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-2">Cosa ci guadagna il banco</p>
            <h2 className="font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink leading-[1.05] mb-3">
              Vantaggi concreti.
            </h2>
            <p className="max-w-2xl text-ink-soft leading-relaxed mb-8">
              Quello che la rete dà a ogni banco, dal giorno in cui entra.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-5">
            {VANTAGGI.map((v, i) => (
              <Reveal key={v.title} delayMs={i * 60} className="h-full">
                <div className="h-full flex flex-col bg-white rounded-xl border border-[#e0d7c1] overflow-hidden">
                  <span aria-hidden="true" className="mz-band" style={{ ['--band' as string]: '#C4593C' }} />
                  <div className="flex flex-col gap-2 p-5">
                    <h3 className="font-display font-extrabold tracking-tight text-lg text-ink leading-tight">{v.title}</h3>
                    <p className="text-[15px] text-ink-soft leading-relaxed">{v.body}</p>
                    {v.tag && (
                      <span className="mt-1 w-fit font-alt text-[11px] font-bold uppercase tracking-wide text-terracotta-600 bg-terracotta-50 rounded-full px-2 py-0.5">
                        {v.tag}
                      </span>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* LA RICHIESTA: il form di adesione (logica invariata) */}
      <section id="richiesta" className="relative overflow-hidden bg-crema-2">
        <div aria-hidden="true" className="mz-band absolute top-0 inset-x-0" />
        <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-3xl py-12 md:py-16">
          <Reveal>
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-terracotta mb-2">La richiesta</p>
            <h2 className="font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink leading-[1.05] mb-2">
              Chiedi di entrare.
            </h2>
            <p className="text-sm text-ink-muted mb-8">
              Cinque minuti. Risposte brevi vanno benissimo — al resto pensiamo insieme.
            </p>
            <AdesioneForm />
          </Reveal>

          <Reveal delayMs={120}>
            <div className="mt-12 pt-8 border-t border-ink/10 text-sm text-ink-soft">
              <p className="mb-2 font-alt font-semibold text-ink">Preferisci scrivere direttamente?</p>
              <p>
                Email:{' '}
                <a
                  href="mailto:emanueleecampanini@gmail.com"
                  className="text-alga-600 underline underline-offset-2 hover:text-alga"
                >
                  emanueleecampanini@gmail.com
                </a>
              </p>
              <p className="mt-3 text-ink-muted text-xs">
                Ti rispondiamo entro 48 ore. Sempre una persona, mai un autorisponditore.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
