import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SITE_NAME } from '@/lib/site'

export const metadata = {
  title: 'Privacy Policy',
  description: `Come trattiamo i dati personali sul sito ${SITE_NAME}.`,
}

// Da completare prima del lancio, dopo revisione legale.
const LAST_UPDATE = '(da completare)'
// Contatto privacy dedicato: da attivare prima del lancio.
const PRIVACY_EMAIL = 'privacy@… (da completare)'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-3xl py-10 md:py-14">
      {/* NOTA: far revisionare a un legale prima del lancio */}
      <Link href="/" className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-alga mb-6 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> Homepage
      </Link>

      <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-3">Informativa</p>

      <h1 className="font-display font-extrabold tracking-tight text-3xl md:text-5xl text-ink leading-[1.06] mb-3">
        Privacy <span className="text-alga">Policy</span>
      </h1>
      <p className="text-sm text-ink-muted mb-10">Ultimo aggiornamento: {LAST_UPDATE}</p>

      <div className="max-w-none space-y-8 text-ink-soft leading-relaxed">
        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Titolare del trattamento</h2>
          <p>
            {SITE_NAME} è un progetto che raccoglie e racconta i mercati settimanali della provincia di Imperia.
            Il titolare del trattamento dei dati personali è <strong>{SITE_NAME}</strong>. Per esercitare i tuoi
            diritti o per qualsiasi richiesta sulla privacy puoi scrivere a{' '}
            <span className="font-semibold text-ink">{PRIVACY_EMAIL}</span>.
          </p>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Quali dati trattiamo</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Statistiche di visita</strong>. Con il tuo consenso usiamo <strong>Google Analytics 4</strong>
              (tramite Google Tag Manager) per capire, in forma aggregata, quali pagine funzionano. In assenza di
              consenso i tag restano in modalità &laquo;consenso negato&raquo; e non impostano cookie. In parallelo
              raccogliamo una statistica interna aggregata e senza cookie, basata su un identificatore tecnico che
              ruota ogni giorno e non consente di identificarti.</li>
            <li><strong>Dati di registrazione (tessera)</strong>. Se crei un account cittadino: email e, se aderisci
              alla tessera, i dati legati ai punti. L&apos;accesso avviene con un codice usa-e-getta via email (nessuna
              password).</li>
            <li><strong>Consenso marketing</strong>. Se ti registri e presti il consenso, trattiamo la tua email e le
              informazioni sul tuo account per finalità di marketing (offerte e novità dei mercati). È facoltativo e
              revocabile in ogni momento.</li>
            <li><strong>Dati del form di adesione</strong>. Per gli operatori che chiedono di entrare nella rete dei
              banchi: nome, email, telefono opzionale, tipo di attività, mercati frequentati, messaggio.</li>
            <li><strong>Account staff</strong>. Per operatori e amministratori: email e ruolo, gestiti da Supabase Auth.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Cookie e strumenti di tracciamento</h2>
          <p className="mb-3">
            Con il tuo consenso usiamo strumenti di statistica e di marketing di terze parti, orchestrati tramite
            <strong> Google Tag Manager</strong>:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Google Analytics 4</strong> — statistiche di utilizzo del sito.</li>
            <li><strong>Google Ads</strong> — misurazione delle conversioni e remarketing sulle campagne.</li>
            <li><strong>Meta Ads (Pixel)</strong> — misurazione delle conversioni e remarketing su Facebook e Instagram.</li>
          </ul>
          <p className="mt-3">
            Questi strumenti sono attivati <strong>solo dopo il tuo consenso</strong>, raccolto tramite il pannello
            &laquo;Preferenze cookie&raquo;, e usano il <strong>Consent Mode v2</strong> di Google: finché non
            acconsenti, i tag non memorizzano cookie né identificatori. L&apos;elenco completo dei cookie è nella{' '}
            <Link href="/cookie" className="text-alga-600 underline underline-offset-2 hover:text-alga">Cookie Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Finalità e basi giuridiche</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Statistiche con Google Analytics 4 e marketing (Google Ads, Meta Ads)</strong>:
              <em> consenso</em> dell&apos;interessato (art. 6.1.a GDPR). Puoi darlo o negarlo dal pannello preferenze,
              e revocarlo in qualsiasi momento.</li>
            <li><strong>Uso dei dati per finalità di marketing degli utenti registrati</strong> (offerte, novità):
              <em> consenso</em> esplicito prestato in fase di registrazione. Senza consenso non usiamo i tuoi dati a
              scopo di marketing.</li>
            <li><strong>Statistica interna aggregata e senza cookie</strong>: <em>legittimo interesse</em>
              (art. 6.1.f GDPR) a capire cosa funziona, senza identificare i visitatori.</li>
            <li><strong>Form di adesione</strong>: <em>consenso</em> prestato inviando il form, per essere ricontattati.</li>
            <li><strong>Account (tessera e staff)</strong>: esecuzione del servizio richiesto e legittimo interesse del titolare.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">A chi comunichiamo i dati</h2>
          <p className="mb-3">I tuoi dati non vengono venduti. Sono trattati, come responsabili o autonomi titolari, da:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Supabase</strong> — database e autenticazione (server nell&apos;Unione Europea). Responsabile del trattamento.</li>
            <li><strong>Vercel</strong> — hosting del sito. Riceve i log tecnici di accesso, standard per ogni web server.</li>
            <li><strong>Google</strong> (Google Analytics 4, Google Ads) e <strong>Meta</strong> (Meta Ads / Pixel) —
              solo se presti il consenso agli strumenti di statistica e marketing.</li>
            <li><strong>Resend</strong> — invio delle email (codice di accesso, risposte alle adesioni).</li>
          </ul>
          <p className="mt-3">
            Alcuni di questi fornitori (Google, Meta) possono trattare dati anche <strong>fuori dall&apos;Unione
            Europea</strong>. In quei casi il trasferimento avviene con le garanzie previste dal GDPR (clausole
            contrattuali standard e misure equivalenti).
          </p>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Per quanto tempo conserviamo i dati</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Statistiche di visita</strong>: conservate in forma aggregata per il periodo necessario a
              valutarne l&apos;andamento, poi cancellate. Per GA4 valgono anche i tempi di conservazione impostati
              su Google.</li>
            <li><strong>Account e consenso marketing</strong>: finché l&apos;account è attivo o finché non revochi il
              consenso.</li>
            <li><strong>Adesioni operatori</strong>: finché non revochi la richiesta, e comunque per un tempo limitato
              dall&apos;ultimo contatto.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">I tuoi diritti</h2>
          <p className="mb-3">In qualsiasi momento hai il diritto di:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sapere quali tuoi dati trattiamo (<strong>accesso</strong>).</li>
            <li>Correggerli se sono sbagliati (<strong>rettifica</strong>).</li>
            <li>Chiederne la <strong>cancellazione</strong>.</li>
            <li>Limitarne o opporti al trattamento.</li>
            <li>Riceverli in un formato leggibile da macchina (portabilità).</li>
            <li><strong>Revocare il consenso</strong> (agli strumenti di statistica/marketing e all&apos;uso dei dati
              per marketing) in ogni momento, senza pregiudicare la liceità del trattamento precedente. Per gli
              strumenti del sito basta il pannello{' '}
              <span className="font-semibold text-ink">&laquo;Preferenze cookie&raquo;</span> a fondo pagina.</li>
            <li>Reclamare al <strong>Garante Privacy</strong> italiano
              (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-alga-600 underline underline-offset-2 hover:text-alga">garanteprivacy.it</a>).</li>
          </ul>
          <p className="mt-3">
            Per esercitare questi diritti scrivi a <span className="font-semibold text-ink">{PRIVACY_EMAIL}</span>.
          </p>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">La mappa</h2>
          <p>
            La mappa del sito usa le mappe di sfondo (&laquo;tiles&raquo;) di <strong>CARTO</strong> basate su dati
            <strong> OpenStreetMap</strong>: <strong>non</strong> usa Google Maps né i suoi script, quindi non richiede
            un consenso separato per essere consultata.
          </p>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Modifiche a questa policy</h2>
          <p>
            Se modifichiamo questa informativa aggiorneremo la data in cima. Per i cambiamenti sostanziali daremo un
            avviso evidente sul sito e, se abbiamo la tua email, te lo comunicheremo.
          </p>
        </section>
      </div>
    </div>
  )
}
