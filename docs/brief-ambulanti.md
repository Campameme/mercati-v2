# Brief — Integrazione ambulanti in IMercati

> Documento da incollare come primo messaggio in una nuova chat Claude per discutere
> di come integrare gli operatori ambulanti nel progetto. Contiene contesto, vincoli,
> obiettivi, stato attuale e domande aperte.

---

## Chi sono e cosa sto facendo

Mi chiamo Emanuele Campanini. Sto costruendo **IMercati**, una piattaforma
indipendente che raccoglie e racconta i mercati settimanali della provincia di
Imperia (Liguria). Il sito è in produzione su `mercati-fiere.netlify.app`.

Il progetto ha tre stakeholder potenziali:
1. **Cittadini e turisti** — vogliono sapere dove e quando ci sono i mercati.
2. **Operatori ambulanti** — vogliono più clienti, ma hanno bassa cultura digitale.
3. **Istituzioni** (Comune di Imperia, Confcommercio Imperia) — possibili clienti B2G/B2B
   se il progetto si dimostra utile.

Il mio modello mentale: gli operatori sono il cuore del progetto. Senza di loro, il
sito è un elenco telefonico. Con loro, diventa il posto dove "i mercati prendono vita".

## Stato del progetto (tecnico)

- **Stack**: Next.js 14 App Router, Supabase (Postgres + Auth + RLS), Leaflet/OSM,
  Tailwind, palette cream/olive/ink, font Fraunces + Inter.
- **Modello dati attuale**:
  - `markets` (8 zone aggregate della provincia: Val Nervia, Bordighera-Ospedaletti,
    Sanremo, Taggia e Costa, Imperia, Golfo Dianese, Entroterra, ecc.)
  - `market_schedules` (sessioni: 1 sessione = un mercato in un comune in un giorno)
  - `market_places` (luogo fisico — se Oneglia mer e Oneglia sab sono lo stesso
    "Piazza Goito", è un unico `place` con poligono condiviso)
  - `operators` (operatori ambulanti, associati a un market_id principale)
  - `operator_schedules` (M:N — un operatore può essere presente in più sessioni)
  - `products` (catalogo prodotti per operatore)
  - `adesioni_operatori` (richieste di adesione dal form pubblico)
  - `analytics_events` (tracking interno cookieless: views per market/operator)
- **Funzionalità già pronte**:
  - Profilo operatore con foto, descrizione, prodotti, presenze multi-mercato
  - Mappa unica Leaflet con aree mercato evidenziate (palette olive)
  - Dashboard admin con toggle on/off zone e singole sessioni
  - Form di adesione operatori (`/aderisci`) che invia email tramite Resend
  - Analytics interno cookieless (views per operatore, dashboard admin con top 30g)
  - Privacy policy + cookie policy + cookie banner sobrio
  - Import/export Excel operatori con dropdown precompilati (Categoria, Lingue, ecc.)
  - Sistema preferiti localStorage (mercati + operatori stellati)
  - Calendario unificato (FullCalendar) con ricorrenze (settimanale, "2^ domenica del mese")

## Audience di operatori — chi sono davvero

Profilo prevalente:
- Età 50–70, lavorano al mercato da 20+ anni (spesso attività di famiglia).
- Cultura digitale variabile: alcuni hanno WhatsApp e basta, altri hanno una pagina
  Facebook che aggiornano poco, una minoranza è già attiva su Instagram.
- Vedono i clienti calare ogni anno e ne soffrono, ma non sanno cosa fare.
- Diffidano di "soluzioni miracolose" e di chi vuole vendergli software.
- Si fidano del passaparola e di rapporti personali.
- Hanno poco tempo: la settimana è scandita da mercato/preparazione/forniture.
- Vendono cibo (frutta/verdura/pesce/formaggi/olio), abbigliamento, casalinghi,
  fiori, prodotti tipici.

Audience iniziale concreta: **10 operatori "ambasciatori"** convinti da mio padre,
che hanno accettato di partecipare a un primo incontro di presentazione del
progetto. Li ho usati come target principale per definire il go-to-market.

## Cosa ho già deciso per loro

1. **Gratuito per i primi 10**, per sempre. In cambio: storie, foto, testimonianze.
2. **Approccio "passo per passo"** in 4 mesi:
   - Mese 1 — Capirvi (form + chiacchierata)
   - Mese 1–2 — Metterlo a fuoco (profilo online, prime foto, primi contenuti)
   - Mese 2–4 — Provare (pubblicare e ascoltare)
   - Mese 4+ — Autonomia (camminano da soli)
3. **Posizionamento è la parola chiave**: non "fatevi i social", ma "decidiamo chi
   siete per il cliente e ripetiamolo con coerenza".
4. **IMercati è uno strumento, non il fine**. Gli asset principali sono loro stessi;
   il sito e i loro canali (FB/IG/WhatsApp) sono strumenti al servizio.
5. **Promessa che mantengono i contenuti** — anche se IMercati chiude, foto e testi
   restano loro.

## Modello di business (in costruzione, non ancora deciso)

Tre possibili strade, non mutuamente esclusive:

- **B2C/Community**: cittadini → newsletter, eventi, "cosa c'è al mercato sabato".
  Monetizzazione bassa, ma costruisce massa critica e legittimità.
- **B2B (operatori)**: dopo i primi 10 gratuiti, abbonamenti per features premium —
  generatore contenuti AI personalizzato, statistiche avanzate, fotografo
  professionale on-demand. Prezzo target ipotetico 15–25 €/mese.
- **B2G (istituzioni)**: vendita del progetto a Comune di Imperia o Confcommercio
  come strumento ufficiale di valorizzazione mercati + turismo. Possibile contratto
  annuale, ordine di grandezza 5–20k €/anno.

Nessuna delle tre è ancora confermata. I primi 10 operatori sono la *validazione*
che mi serve per presentarmi credibile a istituzioni e per definire il modello B2B.

## Cosa ho NON ancora risolto sull'integrazione degli ambulanti

Queste sono le domande aperte che vorrei esplorare nella chat dedicata:

1. **Onboarding tecnico**: il form di adesione raccoglie info base, ma come
   trasformo "ho ricevuto la richiesta" in "ha un profilo vivo sul sito" senza
   che diventi un collo di bottiglia per me?
2. **Verifica identità**: come confermo che chi compila il form è davvero
   l'operatore e non un terzo? Senza creare attrito eccessivo.
3. **Autogestione vs gestione assistita**: l'operatore medio NON userà mai un'area
   admin con login. Devo gestirgli io l'aggiornamento (e a quel punto non scalo)
   o trovo un modo "WhatsApp-first" per aggiornamenti rapidi?
4. **Contenuti**: foto e testi inizialmente li faccio io. Come passo
   gradualmente la palla a loro senza che la qualità crolli?
5. **Engagement post-onboarding**: come tengo viva la relazione dopo i primi 4 mesi?
   Cosa li fa restare interessati al progetto invece di disinteressarsi?
6. **Differenziazione**: cosa rende IMercati diverso da una pagina Facebook
   curata o da Google My Business? Devo articolare meglio il valore unico.
7. **Effetto rete**: il valore di IMercati cresce con più operatori. Come arrivo
   da 10 a 50 senza perdere qualità?
8. **Operatore difficile**: cosa faccio con un operatore che aderisce ma poi è
   irraggiungibile, non risponde, non mi dà materiale? Lo rimuovo? Lo lascio "vuoto"?
9. **Operatori "ostili" all'AI**: parte del mio modello B2B include un generatore
   contenuti AI. Come introduco questa idea a chi vede l'AI come minaccia?
10. **Conflitti tra operatori**: cosa succede se due operatori della stessa
    categoria si lamentano di essere "concorrenti svantaggiati" sulla mia
    visibilità (es. ordine di display)?

## Cose che vorrei dalla chat dedicata

- Aiutami a **strutturare un playbook operativo** per onboardare 10 operatori
  nei primi 4 mesi, con check-list, milestones, e cosa fare quando le cose
  vanno male.
- Aiutami a **definire metriche** che mi dicano se il progetto sta funzionando
  per loro (non solo views — anche cose come "ha ricevuto un cliente nuovo che
  ha detto 'vi ho trovato su IMercati'").
- Aiutami a **scrivere materiali di supporto** che possa lasciare loro: pillole
  brevi tipo "come fare una foto buona del banco", "5 idee di post per la
  settimana", scritti nel loro registro linguistico (diretto, semplice, niente
  buzzword digitali).
- Aiutami a **anticipare obiezioni** che potrebbero emergere strada facendo
  (oltre alle 15 FAQ che ho già preparato per la presentazione iniziale).
- Aiutami a **immaginare scenari evolutivi a 12 mesi**: cosa succede se va molto
  bene, cosa se va così così, cosa se va male. Pre-mortem strategico.

## Vincoli importanti

- **Sono solo io** (più mio padre come ponte di fiducia con gli operatori). Niente
  team, niente budget per dipendenti.
- **Budget tempo**: dedico al progetto circa 15–20 ore/settimana, sopra al mio
  lavoro principale.
- **Budget soldi**: investimento personale, ordine di grandezza basso (centinaia
  di euro/mese per hosting, servizi). Non posso permettermi spese ricorrenti
  significative finché non monetizzo.
- **Territorio**: provincia di Imperia. Non voglio espandermi geograficamente
  finché qui non funziona davvero.
- **Stagionalità**: estate (giugno-settembre) i mercati raddoppiano di affluenza
  per turismo. È la finestra in cui devo essere "pronto".

## Cosa non voglio discutere

- Aspetti tecnici di sviluppo del sito (gestiti separatamente in altra chat).
- Logo / brand identity visuale (sto iterando per conto mio).
- Aspetti legali pure (privacy, contratti) oltre il livello di compliance già
  raggiunto. Se servono, li delegherò a un legale.

## Come voglio che mi rispondi

- Tono diretto e concreto, niente buzzword.
- Quando proponi qualcosa, spiega il *perché* e il *trade-off*.
- Se una mia ipotesi è debole, dimmelo.
- Preferisco un piano a 3 step ben argomentato a una lista di 20 idee superficiali.
- Quando non sai qualcosa di specifico, chiedimi invece di inventare.

---

**Prima domanda che ti faccio:** dato questo quadro, qual è il *singolo* rischio
maggiore che vedi nel mio approccio agli operatori, e cosa cambieresti per primo?
