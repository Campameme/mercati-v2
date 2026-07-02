import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SunRay } from '@/components/decorations'

export const metadata = {
  title: 'Privacy Policy — Mercati della Riviera di Ponente',
  description: 'Come trattiamo i dati personali su Mercati della Riviera di Ponente.',
}

const LAST_UPDATE = '14 maggio 2026'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-3xl py-10 md:py-14">
      <Link href="/" className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-mare-600 mb-6 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> Homepage
      </Link>

      <div className="flex items-center gap-3 mb-4 text-ink-soft">
        <SunRay className="w-5 h-5 text-sole" aria-hidden="true" />
        <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em]">Informativa</p>
      </div>

      <h1 className="font-display text-3xl md:text-5xl text-ink leading-[1.06] mb-3">
        Privacy <span className="text-mare-600">Policy</span>
      </h1>
      <p className="text-sm text-ink-muted mb-10">Ultimo aggiornamento: {LAST_UPDATE}</p>

      <div className="max-w-none space-y-8 text-ink-soft leading-relaxed">
        <section>
          <h2 className="font-display text-2xl text-ink mb-3">Chi siamo</h2>
          <p>
            Mercati della Riviera di Ponente è un progetto indipendente che raccoglie e racconta i mercati settimanali
            della provincia di Imperia. Il titolare del trattamento dei dati è <strong>Emanuele Campanini</strong>,
            contattabile all&apos;indirizzo <a href="mailto:emanueleecampanini@gmail.com" className="text-mare-700 underline underline-offset-2 hover:text-mare-600">emanueleecampanini@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink mb-3">Cosa raccogliamo</h2>
          <p className="mb-3">Mercati della Riviera di Ponente raccoglie il minimo indispensabile per funzionare. Specificamente:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Statistiche di visita anonime</strong>: ogni pagina pubblica registra una view aggregata
              (tipo evento, pagina, dispositivo generico). Per evitare doppi conteggi, generiamo un
              identificatore tecnico calcolato come hash crittografico del tuo IP + browser + data,
              che ruota ogni giorno. <strong>Non memorizziamo il tuo IP in chiaro</strong>, non possiamo
              risalire alla tua identità, e l&apos;identificatore non sopravvive oltre la giornata corrente.</li>
            <li><strong>Dati che ci fornisci nel form di adesione</strong>: nome, email, telefono opzionale,
              tipo di attività, mercati frequentati, messaggio libero. Servono solo a metterci in contatto
              con te e a valutare la tua adesione al progetto.</li>
            <li><strong>Se hai un account admin</strong>: email e ruolo (gestiti da Supabase Auth).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink mb-3">Cookie e tecnologie simili</h2>
          <p className="mb-3">
            Mercati della Riviera di Ponente <strong>non usa cookie di tracciamento, profilazione o pubblicità</strong>.
            Le statistiche di visita non sono basate su cookie, quindi non hai bisogno di prestare consenso.
          </p>
          <p>
            Usiamo solo storage tecnico strettamente necessario:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Cookie tecnici di Supabase</strong>: solo se accedi come amministratore.
              Servono a mantenere la sessione di login. Non profilano.</li>
            <li><strong>localStorage del browser</strong>: per memorizzare i tuoi mercati e operatori preferiti
              (la stellina). Restano sul tuo dispositivo, non vengono inviati a noi.</li>
          </ul>
          <p className="mt-3 text-sm">
            Per i dettagli completi: <Link href="/cookie" className="text-mare-700 underline underline-offset-2 hover:text-mare-600">Cookie Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink mb-3">Per quanto tempo conserviamo i dati</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Statistiche di visita</strong>: conservate aggregate per 24 mesi, poi cancellate.</li>
            <li><strong>Adesioni operatori</strong>: conservate finché non revochi la richiesta o per massimo 36 mesi
              dall&apos;ultimo contatto.</li>
            <li><strong>Account admin</strong>: cancellati su richiesta.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink mb-3">Su quali basi giuridiche trattiamo i dati</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Statistiche anonime</strong>: legittimo interesse (art. 6.1.f GDPR) — capire cosa funziona
              senza profilare i visitatori. Il trattamento è proporzionato perché non identifichiamo nessuno.</li>
            <li><strong>Form adesione</strong>: consenso esplicito che presti compilando e inviando il form.</li>
            <li><strong>Account admin</strong>: esecuzione di un contratto / interesse legittimo del titolare.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink mb-3">A chi diamo i dati</h2>
          <p className="mb-3">I tuoi dati non vengono venduti, ceduti o usati per pubblicità. Sono accessibili a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Il titolare</strong> (Emanuele Campanini), che gestisce il progetto.</li>
            <li><strong>Supabase</strong> (provider hosting database/auth, server in UE — Francoforte).
              Responsabile esterno del trattamento.</li>
            <li><strong>Netlify</strong> (hosting del sito, server globali). Riceve solo log di accesso al sito,
              standard per qualsiasi web server.</li>
            <li><strong>Resend</strong> (servizio email transazionali) quando ti rispondiamo o invii il form adesione.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink mb-3">I tuoi diritti</h2>
          <p className="mb-3">Hai il diritto di:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sapere quali tuoi dati abbiamo (accesso).</li>
            <li>Correggerli se sono sbagliati (rettifica).</li>
            <li>Cancellarli (oblio).</li>
            <li>Limitarne il trattamento.</li>
            <li>Riceverli in un formato leggibile da macchina (portabilità).</li>
            <li>Opporti al trattamento.</li>
            <li>Reclamare al Garante Privacy italiano (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-mare-700 underline underline-offset-2 hover:text-mare-600">garanteprivacy.it</a>).</li>
          </ul>
          <p className="mt-3">
            Per esercitare uno qualunque di questi diritti, scrivi a <a href="mailto:emanueleecampanini@gmail.com" className="text-mare-700 underline underline-offset-2 hover:text-mare-600">emanueleecampanini@gmail.com</a>.
            Rispondiamo entro 30 giorni.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink mb-3">Modifiche a questa policy</h2>
          <p>
            Se modifichiamo questa policy, lo segnaleremo aggiornando la data in cima. Se i cambiamenti
            sono sostanziali, te lo comunicheremo via email (se abbiamo il tuo indirizzo) o con un
            avviso evidente sul sito.
          </p>
        </section>
      </div>
    </div>
  )
}
