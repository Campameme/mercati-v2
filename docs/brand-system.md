# IMercati — Brand System

> Documento canonico del brand. Sostituisce il framing "Slow Compass editorial magazine"
> emerso dal workflow di rethink UX. Da qui in poi, ogni decisione di voce/visivo/copy
> si misura contro questo doc.

---

## Posizionamento

IMercati è **la cura premium dell'esperienza-mercato in Riviera ligure di Ponente**,
trattata come merita ma **mai venduta come esclusiva**. Il progetto serve due
audience principali al tempo stesso:

1. **Il cittadino di prossimità** — chi vive nelle valli, sulla costa, nei comuni
   limitrofi (Cuneo, Savona, Costa Azzurra francese). Per loro IMercati è la guida
   che ti fa scoprire che il mercato del paese accanto vale una mattina del sabato.
2. **L'operatore di mercato** — per cui IMercati è lo strumento che trasforma "il
   banco di sempre" in una destinazione narrabile, prenotabile, riconoscibile.

### USP (Unique Selling Proposition)

Proponiamo **tre formulazioni** in ordine di forza. Implementiamo la #1 come copy
principale; le altre restano disponibili per testare in versione B/C.

#### 1 · Vicino. Ma da scoprire. *(scelta primaria)*

> **Vicino. Ma da scoprire.**
> *I mercati settimanali della Riviera ligure di Ponente — quelli buoni, raccontati da chi ci va davvero.*

**Perché funziona**:
- `Vicino` apre la promessa di prossimità (anti-vacanza-lunga).
- `Ma da scoprire` apre il bias di novità nello spazio noto (chi ci vive scopre
  che non conosce davvero il mercato di Diano; chi ci passa scopre che a 15
  minuti c'è Pieve di Teco).
- `Quelli buoni` segnala curation senza dire "premium".
- `Da chi ci va davvero` segnala autenticità senza dire "autentico".

#### 2 · Una mattina al mercato vale un pomeriggio in centro.

> **Una mattina al mercato vale un pomeriggio in centro.**
> *I mercati della Riviera, trattati come destinazioni: dove, quando, con chi.*

Più diretto sul reframe turismo-prossimità: la mattinata al mercato è una
mini-gita di valore equivalente a "visitare il centro".

#### 3 · Mercato di Riviera.

> **Mercato di Riviera.**
> *Otto comuni, otto mattine, una sola rivista da consultare.*

(Quasi-naming, asciutto, da usare in micro-momenti — favicon, OG image, header
mobile). Evita "otto" hardcoded: usa solo come stand-in di brand, non in copy
operativo.

---

## Voce

### Pilastri (3, gerarchici)

#### 1 · Sapere insider, non claim astratti

Il mercato è una mattina viva. La parola "autentico" sul sito non compare mai;
**si dimostra** con dettagli concreti.

- ❌ "Mercati autentici della Liguria"
- ✓ "Mario taglia il prosciutto dalle 7. Alle 11 ha già finito."

#### 2 · Direttezza, non ornamentalità

Il framing editoriale precedente abusava di corsivo e parole sospese. Il nuovo
brand parla con frasi compiute, dichiarative.

- ❌ *"Mercati di terra e di mare"* (poetico, vago)
- ✓ "Sabato a Sanremo, 8–12. In piazza Eroi Sanremesi."

#### 3 · Prossimità come fatto, non come slogan

Non diciamo "scopri vicino a casa". Diciamo **dove**, **quando**, **a che ora
arrivare**, **dove parcheggiare**.

- ❌ "Vicino a te, qualcosa da scoprire"
- ✓ "20 minuti dall'autostrada, uscita Imperia Ovest."

### Cosa NON facciamo mai

- Parole `premium`, `esclusivo`, `selezionato`, `unico` (sviliscono parlando
  troppo di sé).
- Italici a punteggiatura emotiva (ok solo per nomi di persona, luogo, prodotto).
- Hero magniloquenti senza una risposta utile a 2 cm sotto.
- Buzzword digitali (`platform`, `experience`, `discover the journey`).

### Esempi di copy che useremo

```
Hero homepage
─────────────
Vicino. Ma da scoprire.

I mercati della Riviera ligure di Ponente — quelli buoni,
raccontati da chi ci va davvero. Sceglili per giorno, per
comune, o lasciati guidare dalla settimana.

[Cerca un mercato →]   [Sei un operatore? →]
```

```
Manifesto homepage (3 punti)
────────────────────────────
Ogni mercato è una mattina.
Non un'app, non un evento: due ore, un caffè, un giro,
quattro buste piene. Lo trattiamo per quello che è.

Le persone, prima del prodotto.
Mario, Maria, il pesce di Anselmo, l'olio di Pieve. I banchi
qui non sono "categorie": sono volti, orari, storie verificate.

Vicino non vuol dire ovvio.
A 15 km da casa tua c'è un mercato che non conosci. A 30 km
c'è un comune con una sagra che non ti aspetti. IMercati te
li mette in fila.
```

```
Card zona (sintesi giorno-mercato)
──────────────────────────────────
SANREMO · MARTEDÌ
8.00 — 13.00 · Piazza Eroi Sanremesi
24 banchi · 4 di cibo, 12 abbigliamento, 8 vari
"Il più grande della costa di ponente. Vienici alle 8."
```

```
Footer
──────
IMercati — guida indipendente ai mercati di Riviera.
Aggiornata ogni settimana, scritta da chi ci vive.
[Aderisci come operatore]  [Privacy]  [Cookie]
```

---

## Sistema visivo

### Palette — invariata, usata diversamente

I 5 toni esistenti restano canonici. Il **come** cambia.

| Token | HEX | Uso primario |
|-------|-----|--------------|
| `cream-50` / `cream-100` | `#FAF7F1` / `#F4EDE0` | Sfondi (warmth, anti-luxury bianco-clinico) |
| `olive-500` / `olive-600` / `olive-700` | `#7D8F4E` / `#5D6E3B` / `#44522A` | Brand color principale, CTA, link, accenti |
| `ink` / `ink-soft` / `ink-muted` | `#2A2620` / `#4A4339` / `#7A6F60` | Tutta la tipografia |
| `sea-500` | `#4A7A8C` | Solo per riferimenti marini (mercati costieri) |
| `terra` | `#B85C3A` | Solo per badge "nuovo" / call-out limitati |

**Cambio chiave vs prima**: l'`olive-600` diventa colore **identitario** anche
fuori dai CTA: bordi sottili, divisori, timbri. Smettiamo di trattarlo come
"accento accidentale" e lo eleviamo a marchio del brand.

### Tipografia — gerarchia ridotta

| Uso | Font | Peso | Stile |
|-----|------|------|-------|
| Display (hero, h1) | Fraunces | 500 | Roman (NON italic salvo USP secondaria) |
| Subhead (h2/h3) | Fraunces | 500–600 | Roman |
| Body | Inter | 400 | Roman |
| Eyebrow / label | Inter | 600 uppercase | tracking-widest (`0.18em`) |
| Quantità / orari | Inter | 500 | `tabular-nums` |
| Nome operatore in copy | Fraunces | 500 | **Roman**, non corsivo |

**Cambio chiave vs prima**: smettiamo di mettere le parole-chiave in corsivo
("*terra e di mare*", "*posizionamento*"). Le parole forti reggono da sole in
Fraunces roman. Il corsivo torna a essere un'eccezione (es. citazione vera).

### Iconografia: il timbro

Aggiungiamo un **motivo timbro** come marchio di autenticità visivo. Non un
logo, un **sigillo di affidabilità**:

```
┌──────────────┐
│   MARTEDÌ    │
│   SANREMO    │
│   8 — 13     │
└──────────────┘
```

Bordo doppio sottile in `olive-600`, font Inter all-caps tracking aperto,
dimensione compatta (~80×40px). Compare:
- Sulle card delle zone (1 timbro per giorno-mercato)
- Sui badge "questa settimana"
- Come marker compatto nelle mappe (sostituisce il pin generico quando ha senso)

Componente: `<DaySeal day="martedì" comune="Sanremo" hours="8–13" />`.

### Illustrazioni — uso più rado, più rituale

`OliveSprig`, `MountainSea`, `WaveDivider` restano. **Usati meno, mai
decorativi**. Regola: l'illustrazione compare solo se l'header sotto è
particolarmente importante (hero, fine sezione "Le zone", footer firmato).

Mai più: illustrazione + filo divisore + label tutto insieme. Una cosa per
spazio.

### Mappa

La mappa Leaflet è già personalizzata (CARTO Voyager + filtri caldi). Si
mantiene così. **Aggiunta**: i pin dei mercati diventano `DaySeal` quando lo
zoom è alto (>14); restano cerchi olive a zoom basso (overview).

### Foto Wikipedia

Sostituire dove possibile con foto **dei mercati veri** (saranno scattate durante
gli onboarding operatori). Nel frattempo, Wikipedia continua, ma il badge
"foto via Wikipedia" si rimpicciolisce e va in fondo, fuori dal flusso di
lettura — è una nota tecnica, non una caption editoriale.

---

## Architettura informativa coerente

La struttura route già definita nel `03-sintesi.md` resta valida (17 → 8 route
pubbliche). Cambia il **framing** delle singole pagine:

| URL | Vecchio framing (Slow Compass) | Nuovo framing |
|-----|-------------------------------|---------------|
| `/` | "Magazine cover with manifesto" | "Indice della settimana: dove, quando, perché vale" |
| `/[zoneSlug]` | "Feature article on one market" | "Tutto su come vivere il mercato di X: orari, luoghi, banchi, come arrivare" |
| `/[zoneSlug]/banchi/[op]` | "Profilo operatore con voce firmata" | "La scheda di Mario: cosa vende, da quando, dove trovarlo questa settimana" |
| `/agenda` | "Province-wide editorial calendar" | "Calendario: cosa c'è oggi, domani, sabato. Filtrabile per zona/categoria/distanza" |
| `/aderisci` | "Manifesto + form" | "Cosa cambia per voi se entrate. Risposte a chi: 'ma a me cosa serve?'" |

Il documento di sintesi UX (`docs/rethink-ux/03-sintesi.md`) viene aggiornato
solo nella sezione **Brand System** e nei copy esempio. La struttura URL,
l'inventario componenti, e il piano di migrazione 5-fasi restano validi.

---

## Decisioni operative immediate

Quando questo brief viene approvato, eseguiamo subito:

1. **Hero homepage** rifatto con copy "Vicino. Ma da scoprire."
2. **Manifesto homepage** rifatto coi 3 punti sopra (ogni mercato è una
   mattina / le persone prima del prodotto / vicino non vuol dire ovvio).
3. **Meta title/description** aggiornati per riflettere il nuovo posizionamento.
4. **Pagina `/aderisci`** rivista nel framing (meno "magazine intro", più
   "ecco cosa cambia per voi").
5. **Componente `DaySeal`** creato e inserito sulle card zona della homepage.
6. **Audit corsivi**: rimuoviamo l'italic ornamentale da tutti gli `h1`/`h2`
   che non sono nomi propri o citazioni.

Tutto ciò che è già stato fatto (form adesione, privacy, cookie, analytics,
dashboard admin) resta. Cambia solo lo strato di brand/copy.
