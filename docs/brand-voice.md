# Mercati della Riviera di Ponente — Brand Voice & Homepage

> Per **grafica e motion** vedi [`brand-system.md`](./brand-system.md).

## ⭑ Stato attuale (aggiornato 2026-07-02 — supera i dettagli più sotto dove divergono)
- **Nome ufficiale: "Mercati della Riviera di Ponente"** (deciso 2026-07-02, coerente col logo). Sostituisce "Mercato Riviera dei Fiori". *"Riviera dei Fiori"* resta come **descrittore geografico/heritage** (metadati SEO, sezione storia, pun dei fiori) — mai come nome del progetto.
- **Voce** (modello mercatosantambrogio.it): **prima persona plurale**, calda, ligure-pop, sensoriale (mare/sole/fiori/profumi), spiritosa con misura; **gli ambulanti sono il prodotto**; autenticità = persone + prodotto + filiera corta; **niente anglicismi**, niente foglie d'ulivo. 4 lingue IT/FR/DE/EN (`lib/i18n/homeCopy.ts` + `home.ts`).
- **Hero (definitivo):** headline *"Il mercato che profuma di mare."* + sottotitolo *"Da oltre 100 anni, la Liguria al mercato. I mercati della Riviera di Ponente."* + **chip pratici** *Oggi al mercato · Vicino a me · Sabato* (→ `/mappa` prefiltrata; target 55+/turisti: la risposta pratica senza scrollare).
- **Struttura HOME attuale** (vedi `brand-system.md §6`): Hero foto+acqua reattiva → **"Il progetto, in tre righe"** (storytelling, ogni riga con CTA verso un'attività: mappa / ricerca `#cerca` / ambulanti) → Borghi (8 tessere foto) → Il meglio del Ponente + **operatori con chip cliccabili** → Recap + ricerca typewriter → Notizie dai comuni → Eventi. La **mappa è la destinazione** (pagina `/mappa` + menu).
- **Heritage verificato:** Sanremo, **1882** primo mercato dei fiori; Ventimiglia tra i **più grandi mercati all'aperto d'Italia**; Bordighera palme al Vaticano dal **1586**; Pieve di Teco città mercatale (1233).
- **Posizionamento:** esperienza di **qualità e autoctona** ad **accesso aperto** (no "élite", no claim "banchi selezionati" finché non c'è selezione reale).
- I testi delle sezioni sono in `lib/i18n/homeCopy.ts` (4 lingue).

---

> Sotto: documento di lavoro originale (brainstorming + decisioni). Dove diverge da "Stato attuale", vale lo "Stato attuale".
> Legenda: ✅ deciso · 🟡 da confermare · 🧪 ipotesi · ❓ aperta.

## Decisioni prese (ultima revisione)
0. **Nome ufficiale del progetto: "Mercati della Riviera di Ponente"** ✅ (sostituisce "Mercati di Ponente"). → impatta logo/wordmark, metadati, footer, ecc. (vedi §7).
1. **Home** = **above-the-fold di spiegazione** con **animazione interattiva GSAP** in background che racconta l'esperienza al mercato → **barra di ricerca animata** (che porta alla mappa) → **blocco "interesse/valore"** → **sezione operatori**. La mappa si raggiunge **dalla ricerca** (e da un pulsante nell'header), non è più la prima cosa.
2. **Selezione banchi**: **aspirazionale, non ancora reale** → linguaggio **onesto**, niente claim "banchi selezionati/migliori" come fatto. Il "premium" è una **sensazione di qualità ed esperienza**, non un processo di vetting.
3. **Heritage/dati**: **verificati** e citabili (§3.2). **NON** in hero: diventano una **sezione di "attivazione" attorno alla barra di ricerca** (sotto), per spingere all'uso della ricerca.
4. **Target prioritario**: **55+ e turisti** → massima **leggibilità**, scorciatoie *oggi / vicino / aperto ora* in evidenza, poche scelte per schermata.
5. **Hero scelto** ✅ — **headline** *"Il mercato che profuma di mare."* + **sottotitolo** *"Da oltre 100 anni, la Liguria al mercato. I mercati della Riviera di Ponente."*

---

## 0. Riferimenti guardati nell'audio (cosa prendere / cosa no)

| Riferimento | Da prendere | Da NON prendere |
|---|---|---|
| **mercatosantambrogio.it** | Estetica; **copy per tipologia di operatore** caldo; **sito semplice (poche pagine)**; payoff **sensoriale** "*luogo di incontri, colori, sapori e profumi*" + autorità "*dal 1873*" | Struttura; testi piccoli a basso contrasto |
| **Mercato Centrale** (FI/MI/TO/RM) | Le illustrazioni danno **autenticità/cura del territorio**; **vivono di eventi** | Struttura; logo; quasi solo food; illustrazioni **troppo complesse** |
| Motore di ricerca con **query d'esempio in homepage** (nome incerto nell'audio → ❓) | **La ricerca che si auto-spiega** (placeholder/animazione di cosa puoi cercare) | — |
| **Google "Mi sento fortunato"** | **"Trova il mercato più vicino a te"** | — |
| **@piazzabenefica** (Torino, IG) | Forte presenza **social/eventi** | Grafiche |

---

## 1. Posizionamento

### 1.1 La Liguria è la **cornice**, non l'etichetta del singolo banco ✅
Non forziamo ogni ambulante nello storytelling ligure. La "liguricità" è la **cornice** dell'esperienza — *mare, sole, mattina, vita lenta, il caruggio, il mercato bello, il parcheggio facile* — e **dentro quella cornice ogni operatore valorizza ciò che vende**.
- **Alimentare/agricolo** → autenticità che "lavora da sola": l'orto di Imperia, i ravioli alla savonese, il formaggio di Pieve di Teco. Protagonista = il **prodotto**.
- **Non alimentare** (abbigliamento, tendaggi, casa…) → autenticità sulla **persona e la relazione**: chi è, da quanti anni è in quel mercato, la cura verso i clienti.
- La comunicazione editoriale aggancia comunque i prodotti alla vita ligure ("fa caldo, esci in canotta — passa dal banco di Claudio").
> *"Se usiamo l'essere liguri come cornice, ogni operatore si valorizza per quello che vende e va bene così."*

### 1.2 Esperienza di **qualità e autoctona**, aperta a tutti ✅
Promettiamo un'**esperienza di mercato di qualità, autentica e del territorio**. Il "premium" è una **sensazione** (cura, qualità, autoctonia), **non** un claim di banchi selezionati: **la selezione non esiste (ancora)** → usiamo **linguaggio onesto**.
- ✅ Sì: *"il meglio della Riviera di Ponente"*, *"prodotti autentici e di stagione"*, *"l'esperienza del mercato, curata e a portata di mano"*.
- ❌ No (per ora): *"banchi selezionati"*, *"i migliori banchi"*, *"esclusivo"* come fatti verificabili.
> Il nostro valore concreto, oggi, è **curare l'informazione e la scoperta** (dove, quando, chi c'è, come arrivarci) e **raccontare** l'autenticità — non certificare i banchi.
> ✅ **"Esclusiva" = sensazione premium ad accesso aperto** (confermato): trasmettiamo qualità e cura, ma il mercato resta **per tutti**. Mai posizionamento d'élite.

### 1.3 Gli ambulanti sono il prodotto, la Liguria è la promessa ✅
Portare (anche) i giovani al mercato puntando su **prodotti autentici, cura, affidabilità**, con la Liguria come promessa esperienziale. → da qui la **sezione operatori** in home (§4).

---

## 2. Brand Voice

### 2.1 Personalità
Accogliente, calda, **terra-terra e riconoscibile** (non sofisticata), un po' **coraggiosa**, viva. Parla come un ligure che ti invita: diretta, concreta, col sorriso.

### 2.2 I 5 sensi come struttura del messaggio ✅
Il mercato è **esperienza sensoriale** (modello del payoff di Sant'Ambrogio):
- **Tatto/incontro** — stringere le mani, gli abbracci. · **Vista** — i colori, il mare, la costa. · **Gusto** — i sapori, l'autoctono. · **Olfatto** — il pane, i profumi. · **Udito** — *"quando entri in un mercato, lo senti."*
→ Declinare con elementi **riconoscibilmente liguri** (il mare su tutto) al posto del generico "incontri, colori, sapori, profumi".

### 2.3 Tono — sì / no
**SÌ**: frasi brevi e concrete; imperativo gentile ("scopri", "trova", "vieni"); riferimenti sensoriali e al mare; calore; ironia ligure misurata.
**NO**: **anglicismi** (✅ esplicito — niente "experience/feeling lucky"); tono corporate o élitario; testi lunghi; dati/gergo tecnico in prima pagina.

### 2.4 Lessico
- **Sì:** mare, mattina, banco, ambulante, caruggio, Riviera di Ponente, Ponente, fresco, autentico, di stagione, a portata di mano, vicino a te, vita.
- **Con cura:** "premium" → preferire *"di qualità / il meglio"*; **"esclusivo" → evitare** (contraddice l'accesso aperto).
- **Vietato:** motivi a **foglia d'ulivo**. (Basilico/pesto invece ok.)

### 2.5 Multilingua ✅
**IT · FR · DE · EN**, senza calchi anglofoni in italiano. Micro-copy pensato per la traduzione (§6).

---

## 3. Messaggi chiave & Payoff

### 3.1 USP ✅
> *"I mercati della Riviera di Ponente, a portata di mano: dove, quando, chi c'è al banco."*

### 3.2 Payoff = **autorità + sensorialità (mare)** — dati VERIFICATI ✅
- **Ventimiglia** — il **mercato del venerdì** è **tra i più grandi mercati all'aperto** (spesso indicato come **il più grande d'Italia**), lungo il lungomare e il fiume Roia; meta storica anche dei francesi della Costa Azzurra. *(fonti: italian-riviera.com, ventimiglia.it)*
- **Sanremo** — **1882**: nasce il **primo mercato dei fiori** della Riviera (piazza presso l'ex stazione); sede permanente dal **1914**. Sanremo "Città dei Fiori". *(fonti: sanremo365.it, florcoop.it)*
- **Bordighera** — dal **1586** il privilegio di inviare al Vaticano le **palme bianche** per la Domenica delle Palme. *(tradizione storica documentata)*
- **Pieve di Teco** — borgo nato come **città mercatale** (1233), portici cinquecenteschi, fiere secolari.

**Uso dei dati heritage**: NON in hero. Diventano una **sezione di "attivazione" attorno alla barra di ricerca** (sotto l'above-the-fold), che incuriosisce e spinge a cercare. Spunti:
- *"Dal 1882 la Riviera ha il suo mercato dei fiori."* → *"Cerca cosa trovi oggi."*
- *"Uno dei mercati più grandi d'Italia è a Ventimiglia. E con lui, tutti gli altri."* → ricerca.

### 3.3 Hero scelto ✅ (definitivo)
- **Headline: "Il mercato che profuma di mare."**
- **Sottotitolo: "Da oltre 100 anni, la Liguria al mercato. I mercati della Riviera di Ponente."**
  - heritage onesto e prudente ("oltre 100 anni" è verificato: primo mercato dei fiori 1882, fiere secolari) + **nome del progetto** integrato nel sottotitolo.

### 3.4 Sottotitolo — alternative da keyword (📦 archivio, NON usate)
> Scartate a favore del sottotitolo heritage di §3.3. Tenute solo come serbatoio per micro-copy interno/social. *("shopping" → reso in italiano per la regola anti-anglicismi.)*
1. *"Tutti i mercati della Riviera di Ponente, dalla costa ai borghi dell'entroterra: dove, quando e cosa trovi."*
2. *"Sole, colori pastello e profumi: dai borghi dell'entroterra ai banchi sulla costa."*
3. *"Dalla costa all'entroterra: i colori e le sensazioni della Riviera, e le cose buone da portarti a casa."*
4. *"Mare, sole, borghi: i mercati della Riviera di Ponente."*
5. *"Colori pastello, profumi di banco, il sole sulla costa e i borghi dell'entroterra: vivi la Riviera al mercato."*

### 3.5 Inviti (claim brevi) ✅
- *"Non sai cosa fare oggi? Cercati un mercato."* · *"Vieni al mercato: il mercato è bello, il mercato è vita."* · *"Trova il tuo mercato, i tuoi ambulanti e le info per arrivarci."*

---

## 4. Homepage — struttura definitiva ✅

Mappata su **AIDA** e sul target **55+/turisti** (testi grandi, poche scelte per schermata, scorciatoie *oggi/vicino/aperto*).

### Blocco 1 — Above the fold · *spiegazione + esperienza* (Attention)
- **Sfondo: animazione interattiva GSAP** che **mostra l'esperienza al mercato** (la passeggiata, lo scambio al banco, il mare/la costa). Reattiva (cursore/scroll), reduced-motion safe. *(Quando ci saranno le riprese → video; intanto animazione/`SeaCanvas`.)*
- **In primo piano: la spiegazione** del progetto — *cosa* offriamo e *perché vale* — in poche parole grandi e leggibili. Non una barra di ricerca: prima si capisce, poi si cerca.
- Payoff (§3.2) + **welcome** caldo + **selettore lingua** (IT/FR/DE/EN).
- (Opzionale per 55+/turisti) micro-scorciatoie leggibili *Oggi · Vicino a me · Aperti ora*.

### Blocco 2 — *Barra di ricerca animata* (Action → mappa)
- **Subito sotto l'above-the-fold**: una **barra di ricerca** con **placeholder animato/rotante** che mostra cosa puoi cercare: **prodotti**, **operatori**, **zone**, **provincia**.
- **Invio → porta alla mappa** col risultato (ricerca universale già esistente, con la giustificazione del *perché* compare).

### Blocco 3 — *Interesse / valore* (Interest)
- **Sotto la ricerca**: il testo che **genera interesse** → il **valore per l'utente** di un'esperienza di mercato **di qualità e autoctona** (sensorialità §2.2, cornice Liguria §1.1). Semplice, evocativo, niente storia densa.

### Blocco 4 — *Operatori* (Desire)
- **Più sotto, sezione dedicata agli operatori**: il **valore unico** che danno (le persone del mercato, la cura, la relazione). Copy caldo per tipologia (§5.7). CTA → *Gli ambulanti*.

### La mappa (pagina/destinazione)
- La **mappa è la destinazione della ricerca** (e di un pulsante "Mappa" nell'header), **vista pubblica principale** e ben fatta. Resta tutto ciò che già funziona (pin per tipologia, zone, scheda, parcheggi). Vedi §5 per i ritocchi.

---

## 5. Decisioni di prodotto / UX

### 5.1 Architettura ✅ (vedi §4)
Home editoriale → ricerca → mappa. La mappa **non** è più la prima schermata.

### 5.2 Filtri per tipologia ✅ (già fatti, ok)
I 4 filtri-tipologia vanno bene. Da sistemare solo l'**icona "banco"** (§5.8).

### 5.3 Ricerca che si auto-spiega ✅
**Placeholder rotante** con esempi reali: *"Cerca un prodotto…" → "…un ambulante" → "…una zona" → "…un mercato della provincia"*. Poi la ricerca funziona davvero.
**Reference: `thememedex.com`** (la ricerca che mostra cosa puoi chiedere) — ma **adattata alla nostra brand voice** (esempi liguri, niente anglicismi).

### 5.4 "Più vicini a me" — consolidare ✅
- **Togliere** l'opzione "Più vicini" **dall'ordinamento** della lista.
- **Sostituire** il pulsante **"La mia posizione"** con **"Più vicini a me"**: è lui che **chiede la posizione** e **ordina per vicinanza**. (Un solo controllo, non due.)
- Resta valida l'idea "trova il mercato più vicino a te" come scorciatoia.

### 5.5 Eventi / articoli ✅
Sezione che rimanda ad **articoli/eventi** ("gli eventi portano gente").
**Fonte**: canali ufficiali del **Comune di Imperia** (già previsti) → **estendere a tutta la provincia di Imperia** (eventi/mercati straordinari di tutti i comuni). 🟡 Meccanismo di importazione (feed/RSS/API/manuale) da definire.

### 5.6 Hero video 🟡 → placeholder ✅
Riprese in Liguria (DJI + POV): nero, "qualcuno digita" → "sei al mercato" → POV nel mercato, scambi, abbracci, arrivo in auto con la costa. **Due proporzioni** (orizzontale/verticale). Collega il **digitare** (ricerca) al **vivere** ("è qua che lo trovi").
Riprese da girare (tempi da definire). **Fino ad allora: l'animazione GSAP del Blocco 1 fa da placeholder (confermato ✅).**

### 5.7 Calendario: **non per il pubblico** ✅
Il calendario fitto è strumento **interno**, non si mostra all'utente (specie mobile). La **mappa** è la vista pubblica.

### 5.8 Icona "banco" da rendere chiara ✅
L'icona attuale "non si capisce / sembra un ombrellone": renderla **riconoscibile come banco** (dettaglio → `brand-system.md`).

### 5.9 Copy per tipologia di operatore ✅
Come Sant'Ambrogio: descrivere le **tipologie** con copy caldo, da usare nella sezione operatori e nelle schede.

### 5.10 Navbar a forma di Liguria — ❌ accantonata
Idea valutata e **scartata** (decisione presa): non sviluppiamo la navbar a sagoma della Liguria.

---

## 6. Micro-copy proposto (bozza, 4 lingue)

**Hero — headline** — IT *Il mercato che profuma di mare.* · EN *The market with the scent of the sea.* · FR *Le marché qui sent la mer.* · DE *Der Markt, der nach Meer duftet.*

**Hero — sottotitolo (heritage + nome)**
- IT *Da oltre 100 anni, la Liguria al mercato. I mercati della Riviera di Ponente.*
- EN *For over 100 years, Liguria at the market. The markets of the Riviera di Ponente.*
- FR *Depuis plus de 100 ans, la Ligurie au marché. Les marchés de la Riviera di Ponente.*
- DE *Seit über 100 Jahren: Ligurien auf dem Markt. Die Märkte der Riviera di Ponente.*

**CTA** — IT *Trova il tuo mercato* · *Gli ambulanti* — EN *Find your market* · *The vendors* — FR *Trouve ton marché* · *Les marchands* — DE *Finde deinen Markt* · *Die Händler*

**"Più vicini a me"** — IT *Più vicini a me* · EN *Nearest to me* · FR *Les plus proches* · DE *In meiner Nähe*

**Placeholder ricerca (rotante)** — IT *Cerca un prodotto… / un ambulante… / una zona… / un mercato* · EN *Search a product… / a vendor… / an area… / a market* · FR *Cherche un produit… / un marchand… / une zone… / un marché* · DE *Suche ein Produkt… / einen Händler… / eine Zone… / einen Markt*

**Welcome** — IT *Benvenuto. Ti accogliamo con un buongiorno detto col sorriso.* · EN *Welcome — a smiling good morning to you.* · FR *Bienvenue — un bonjour souriant.* · DE *Willkommen — ein herzliches Guten Morgen.*

---

## 7. Istruzioni operative per il sito (checklist)

> **Stato implementazione (fatto & verificato, tsc-clean, 0 errori console):** rename a "Mercato Riviera dei Fiori" (logo, metadati, footer, pagine legali/email); home editoriale (hero headline+sottotitolo+animazione "Mare liquido" → storia → zone → **blocco valore con la ricerca** → sezione operatori); **mappa spostata su `/mappa`** (auto-seleziona il miglior risultato da `?q=`, accetta `?zone=`); **"Mappa dei mercati" nel menu**; ricerca della home con **placeholder rotante** che porta a `/mappa?q=`; le **zone** portano a `/mappa?zone=`; **"Più vicini a me"** consolidato (sostituisce "La mia posizione", tolto dall'ordinamento). · **Da fare:** import eventi province-wide; hero video reale; (eventuale) calendario fuori dal flusso pubblico.

Rispetto al codice attuale (`components/home/MapHome.tsx` + sezioni già costruite):

- [ ] **Rinominare il progetto** "Mercati di Ponente" → **"Mercati della Riviera di Ponente"** ovunque: `components/Logo.tsx` (wordmark più lungo → verificare resa), `app/layout.tsx` (metadati/title/OG), footer, testi. ⚠️ nome più lungo: valutare versione corta del wordmark per spazi stretti.
- [ ] **Riarchitettura home (§4)** — la home diventa editoriale: **Blocco 1** (ATF spiegazione + animazione GSAP esperienza) → **Blocco 2** (ricerca animata → mappa) → **Blocco 3** (interesse/valore) → **Blocco 4** (operatori). Spostare l'explorer-mappa su destinazione dedicata (es. `app/mappa/page.tsx`) raggiunta da ricerca + header.
- [ ] **Animazione GSAP esperienza (Blocco 1)** — set-piece "esperienza al mercato" (vedi `brand-system.md`: "Mare liquido"/POV). Reduced-motion safe.
- [ ] **Ricerca animata (Blocco 2)** — placeholder rotante i18n (prodotti/operatori/zone/provincia); submit → mappa con risultato.
- [ ] **Blocco interesse (Blocco 3)** — riscrivere `StorySection` come "valore dell'esperienza" (qualità + autoctonia + sensorialità), non solo storia.
- [ ] **Sezione operatori (Blocco 4)** — nuovo blocco "il valore unico degli ambulanti" + CTA `/operatori`, copy per tipologia.
- [ ] **Mappa: "Più vicini a me" (§5.4)** — rimuovere il toggle "near" dall'ordinamento; il pulsante "La mia posizione" diventa "Più vicini a me" (chiede posizione + ordina).
- [ ] **Icona banco leggibile (§5.8)**.
- [ ] **Calendario fuori dal flusso pubblico (§5.7)**.
- [ ] **Payoff/heritage (§3.2)** — inserire i dati verificati (1882 fiori, Ventimiglia tra i più grandi d'Italia) nel copy.
- [ ] **Multilingua** — nuove stringhe in IT/FR/DE/EN (`lib/i18n/home.ts`).
- [ ] **Navbar-Liguria (§5.10)** — prototipo **se** confermata (§9).

---

## 8. Cosa NON è stato deciso qui
**Grafica/estetica** (colori definitivi, illustrazioni, stile icone, look navbar-Liguria, trattamento video): **registrazione dedicata** → confluirà in [`brand-system.md`](./brand-system.md). Indizi: outline semplici (basilico, cipolla, gruccia) ma **meno sofisticati** di Mercato Centrale; "terra-terra"; un po' coraggioso.

---

## 9. Stato decisioni
**✅ Risolte:** "esclusiva" = sensazione premium ad accesso aperto · hero video → animazione GSAP come placeholder · **navbar-Liguria scartata** · eventi → canali ufficiali Comune di Imperia, da **estendere a tutta la provincia** · reference ricerca = **thememedex.com** (adattato alla nostra voce).

**⏳ Da scegliere ora:** il **payoff principale** (vedi §3.2 e la proposta che ti ho mandato in chat).

**🟡 Minori (decisi salvo tua obiezione):** evitare la parola "premium" nel copy visibile → uso "di qualità / il meglio"; welcome con tono "buongiorno col sorriso".

**🟡 Tecnica da definire:** meccanismo di import eventi (feed/RSS/API/manuale) dai canali della provincia.
