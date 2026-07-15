# I Mercati della Riviera dei Fiori — Brand & Motion System (Nodo × Mezzogiorno)

> Canonico, aggiornato al **2026-07-12**. Fonte: mockup di studio "Il Nodo ×
> Palette Mezzogiorno" (fuori repo, Desktop `nodo-mezzogiorno.html`). Voce e
> copy: [`brand-voice.md`](./brand-voice.md) · regole operative: [`../CLAUDE.md`](../CLAUDE.md).
> La migrazione dal sistema precedente ("Ponente", Italiana, mare/sole) è in
> corso sul branch `redesign/esperienza-riviera-fiori` — vedi §7.

## 1. Identità
- **Nome:** I Mercati della Riviera dei Fiori. Perimetro: **provincia di
  Imperia**, da Ventimiglia a Diano/Cervo. ("Riviera di Ponente" = naming
  precedente, in dismissione.)
- **Simbolo: il Nodo** — un tratto calligrafico che si annoda (uno schizzo, non
  un pittogramma), con il **capo in terracotta**. Nelle riduzioni piccole
  (≤56px, favicon) resta solo il tratto, senza capo colorato.
- **Lockup:** nodo + "I Mercati" (Bricolage 800) + "della Riviera dei Fiori"
  (Figtree italic, alga su chiaro / limone su alga / crema su terracotta).
- **Concetto: la rete dei banchi.** Non un abbonamento: un gruppo che si
  sceglie, con tre requisiti — banco pulito e curato · prodotti di qualità ·
  serietà con colleghi e clienti. Asset: **bollino/targa "RETE DEI BANCHI"**
  (cerchio alga, testo ad anello, nodo al centro).

## 2. Palette "Mezzogiorno" (ruoli fissi)
| Token | Hex | Ruolo |
|---|---|---|
| crema | `#FBF6EC` | fondo principale (crema-2 `#F3EBDA` per bande/superfici) |
| ink | `#26241E` | testo (ink-soft `#55503F` per il corpo secondario) |
| **alga** | `#46683B` (scuro `#35502C`) | **istituzionale**: nav, bollino, badge, giorno attivo |
| **terracotta** | `#C4593C` (scuro `#9A4029`) | **azione**: CTA, capo del nodo, stelle/preferiti, accenti |
| **limone** | `#EAC54F` (testo `#7A611A`) | **terza voce calda**: bollino in negativo, momenti caldi |
- Fondo esterno di pagina/frame: `#E8E1D2`. Bordi carta: `#d9d1bf`/`#e0d7c1`.
- Tono: mediterraneo e **da bottega** — "più mercato del sabato, meno
  associazione di categoria".

## 3. Tipografia (due caratteri)
- **Bricolage Grotesque** (display): titoli 800 con letter-spacing −0.02em;
  anche card-title e citazioni (500 italic, color alga-scuro).
- **Figtree** (tutto il resto): corpo, UI, badge; *italic* per sottotitoli del
  lockup e righe di servizio.
- Italiana e Caveat sono **dismessi** dal sistema: restano solo nelle pagine
  non ancora migrate (non usarli nel nuovo lavoro).

## 4. Componenti firmati
- **Tratteggio incrociato** diagonale (45°/−45°, tratto 1.5–2px, passo 30–36px,
  alga o terracotta al 5–6%): velo per hero e post social. È l'unica texture
  ammessa, sempre tenue.
- **Band di card**: fascia alta 10px — crosshatch alga (mercati), crosshatch
  terracotta (banchi), tinta piena alga (rete/istituzionale).
- **Badge** pill uppercase (alga su `#E4EBDF`, terracotta su `#F4E0D8`).
- **Chips dei giorni**: bordo alga, radius pieno; il giorno attivo è pieno alga
  con "· oggi" ("Mer · oggi").
- **Cerca**: pill bianca con bordo ink 2px + bottone terracotta.
- **Stella preferito** ★ terracotta; **nodo-elenco** (nodo piccolo terracotta
  come bullet dei requisiti).
- **Icona app**: nodo in negativo su quadrato alga (radius 22/96).

## 5. Motion — regole d'oro
- **Sfondi puliti e fermi**: l'animazione vive SOLO sul contenuto. Vietati:
  titoli-fantasma di sfondo in home, silhouette in deriva, marquee di nomi,
  canvas/acqua decorativi.
- Firma: **il nodo si annoda** (stroke-draw one-shot, `pathLength` + dashoffset;
  il capo terracotta parte dopo il tratto).
- Titoli cinetici parola per parola (maschera + translateY), chips/card in
  stagger, contatori che contano su, hover lift + freccia che marcia.
- Solo transform/opacity, reveal one-shot, tutto reduced-motion safe. Coordinate
  SVG calcolate vanno arrotondate (hydration). Lenis resta; scroll interni →
  `data-lenis-prevent`.

## 6. Interfacce (dal mockup)
- **Nav**: crema, nodo + lockup a sinistra; voci Mercati · Banchi · Calendario;
  **pill alga "La rete"** come voce distintiva.
- **Hero della home** (scelta B "L'Intreccio", implementata): crema PULITO
  (niente crosshatch né titoli-fantasma); eyebrow alga; H1 800 = claim storico
  "I mercati che profumano *di mare*." (em alga); sub storytelling; cerca
  grande con CTA terracotta; **chips dei giorni** con oggi attivo pieno alga;
  contatore "Oggi al mercato: N aperti" che conta su; a destra **pila di foto
  di mercato** (grande con parallasse + 2 polaroid inclinate).
- **Struttura della home** (2026-07-12): hero → **Il progetto** (storytelling
  emotivo: *Un'eredità / Una promessa / Una stretta di mano* + foto Brogi
  "Sanremo, piazza del mercato ~1880" + 3 card del "cosa": percorso di qualità,
  operatori facili da trovare, servizi in più + CTA "Vicino a me") → **Mercati
  tipici** (card bianche con mz-band e data nel colore della tipologia) →
  **Ti aspettano al banco** (racconto + 2 foto operatori + card banchi di
  fiducia) → **striscia rete** (alga: titolo + 3 requisiti + Bollino + CTA) →
  **Notizie** (scuro, ink) → footer. Le zone NON hanno sezione in home; la
  provincia di Savona è stata rimossa del tutto (dati e codice, migrazione
  0024_remove_savona): esistono solo le 8 zone di Imperia.
- **Card mercato**: band crosshatch alga, badge "Mercato", titolo `Comune —
  giorni`, piazza · orario · numero banchi, chips giorni + "N banchi di
  fiducia qui", stella preferito.
- **Card banco**: band crosshatch terracotta, badge categoria, "Il banco di
  Nome", descrizione col mestiere, **citazione in prima persona**, chips
  `giorni · comune`.
- **Card rete/adesione**: band alga piena, i 3 requisiti con nodo-bullet, CTA
  terracotta "Chiedi di entrare".
- **Post social**: quadrato crema + crosshatch terracotta, nodo, citazione 800
  con em terracotta, firma `Nome — giorni e comuni`, hashtag **#DietroIlBanco**.

## 7. Transizione dal sistema precedente
Mappa dei token per il re-skin (tailwind): carta→crema · notte/ink→ink ·
mare→alga (istituzionale) · sole→limone · fiore→terracotta. Asset dismessi:
logo borgo+onde+sole (→ nodo), `.imk-cartellino`/tendone/StringLights/aqua
(→ componenti §4), Italiana/Caveat (→ Bricolage/Figtree). Dove una pagina non è
ancora migrata valgono le vecchie regole solo lì; il codice obsoleto si elimina
al push.
