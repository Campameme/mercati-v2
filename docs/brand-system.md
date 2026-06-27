# Mercati di Ponente — Brand & Motion System

> Documento **canonico** di brand + motion. Sostituisce il vecchio framing
> "IMercati / Slow Compass / cream-olive". Da qui in poi ogni decisione di
> grafica, copy e **animazione** si misura contro questo file.
> Quando sviluppo il sito, questo è il contratto: produco animazioni GSAP
> **firmate**, non inventate ogni volta.

---

## 1. Posizionamento

**Mercati di Ponente** è la mappa viva dei mercati della **provincia di Imperia**
(Riviera di Ponente): dove e quando si tengono, chi c'è al banco, cosa trovi,
dove parcheggiare. Concept guida: **"Riviera di mattina"** — il mercato come
rituale del mattino fatto di luce, mare, fiori e persone vere.

Serve **due pubblici insieme**, e il brand deve convincerli entrambi:
1. **Chi compra** — cittadini di prossimità + turisti (IT, FR dalla Costa Azzurra,
   DE in cerca di autenticità, EN in barca). Vogliono: cosa c'è **oggi**, vicino,
   a che ora, dove parcheggiare.
2. **Chi vende** — gli **ambulanti**. Il brand li mette al centro ("le persone del
   mercato") e li fa sentire rappresentati con dignità, non come "categorie".

### Nome & USP
- **Nome:** Mercati di Ponente. (Mai più "iMercati".)
- **USP primaria:** *La mattina, vicino a te.*
- **Alternative:** *Vicino, ma da scoprire.* · *I mercati della provincia di Imperia, su una mappa.*

---

## 2. Voce

Calda, da **insider**, diretta. Parla a chi compra **e** a chi vende. Multilingua
IT · FR · DE · EN (il chrome è tradotto; i contenuti restano nella lingua del dato).

**Pilastri**
1. **Sapere insider, non claim astratti.** "Autentico" non si scrive, si dimostra:
   *"Anselmo taglia il pesce dalle 7. Alle 11 ha già finito."*
2. **Direttezza.** Frasi compiute: *"Sabato a Sanremo, 8–12. Piazza Eroi."*
3. **Prossimità come fatto:** dove, quando, a che ora, dove parcheggiare.
4. **Doppio pubblico esplicito:** "Per chi compra" / "Per chi vende".

**Mai:** `premium`, `esclusivo`, buzzword digitali, corsivi ornamentali, hero
magniloquenti senza una risposta utile subito sotto.

---

## 3. Logo

Logotipo = **wordmark + simbolo** "sole che sorge sul mare" (Riviera di Ponente =
ovest, dove il sole cala sul mare). Componente unico: `components/Logo.tsx`.
- `<Logo inline />` → mark + nome su una riga (nav, footer, header pagine).
- `<Logo />` → mark sopra il nome impilato (hero, splash).
- `<LogoMonogram />` → icona app/favicon/social (mark su `bg-notte`).
- Il sole è sempre **Sole** (`#F4B62C`); onda e testo ereditano `currentColor`
  (ink su chiaro, carta su scuro). **Niente "iMercati" da nessuna parte.**

---

## 4. Palette (coerente, 5 + neutri)

| Token | HEX | Uso |
|-------|-----|-----|
| `mare` (600/700) | `#15607C` (`#114F66`/`#0E3F52`) | **Primario**: azioni, CTA, link, pin mercato |
| `sole` (600) | `#F4B62C` (`#D69A12`) | **Oggi / aperto / luce**, accenti, pin selezionato |
| `fiore` (600) | `#EC6A5E` (`#D24B3F`) | Accento caldo, "per chi vende", momenti-fiore |
| `carta` | `#F7EFDD` | Sfondo pagina (caldo, anti bianco-clinico) |
| `notte` | `#0E3040` | Sezioni scure (hero, footer scuri) |
| `ink` / `ink-soft` / `ink-muted` | `#1A1714` / `#4A4438` / `#8A8275` | Tipografia |
| `marel` | `#DCEBEC` | Mare chiaro per sfondi tenui |

**Semantica fissa:** Mare = azione · Sole = tempo/luce (oggi, aperto ora) ·
Fiore = accento. Niente verde generico.

> Nota tecnica: in `tailwind.config.js` gli **alias legacy** (`pesto`, `riviera`,
> `mimosa`, `coral`, `paper`, `night`, `cream`, `olive`, `sea`, `terra`,
> `primary`) sono rimappati alla nuova palette per retro-compatibilità. **Nel
> codice nuovo usa solo** `mare/sole/fiore/carta/notte/ink/marel`.

---

## 5. Tipografia (poster grotesque)

| Uso | Font (token) |
|-----|--------------|
| Display / titoli | **Archivo Black** (`font-display`), UPPERCASE per gli H grandi |
| UI / label / eyebrow | **Bricolage Grotesque** (`font-alt`), uppercase tracking |
| Testo lungo | **Inter** (`font-sans`) |
| Accento manoscritto | **Caveat** (`font-accent`), con parsimonia |

Niente Fraunces/serif editoriale. Niente corsivi ornamentali.

---

## 6. Iconografia & motivi (NO ulivo)

- **Icone:** semplici, a **una linea** (lucide-react), tratto coerente.
- **Motivi liguri ammessi:** sole, onde/mare, fiore, limone, archi/facciate dei
  caruggi. In `components/decorations.tsx` (`WaveTaglia`, `SunRay`, `Lemon`,
  `Arco`, `WaveDivider`). **`OliveSprig` è deprecato e non si usa.**
- **Le persone — "carta del banco":** ogni venditore è una figurina
  (`components/BancoAvatar.tsx`: `BancoAvatar` per le liste, `BancoPlaceholder`
  per le testate). Foto vera oppure placeholder **duotone Mare→Sole** con
  iniziale; nome `font-display`, specialità, badge **Verificato** (`bg-sole`) e
  **WhatsApp** (`#25D366`, `wa.me`) quando i dati ci sono.

---

## 7. MOTION SYSTEM (GSAP) — il cuore "solo nostro"

Obiettivo: livello **awwwards**, **bold immersivo**, ma con **mappa e ricerca
sempre calme e usabili** (pubblico 55+). Il movimento è *enfasi*, mai ostacolo.

### 7.1 Regole d'oro (NON negoziabili)
1. **Mai svelare contenuto critico** (titoli, testo, card) partendo da
   `opacity:0` o **fuori schermo** con `gsap.from`: se il tween non completa
   (rAF rallentato, tab in background, HMR) resta invisibile. → usa **offset
   piccoli** + `clearProps:'transform'`, oppure `gsap.fromTo` con stato finale
   garantito on-screen. *(Lezione vissuta: hero invisibile + card mappa fuori
   schermo.)*
2. **Anima solo `transform` e `opacity`** (GPU). Mai `width/top/left` in loop.
3. **`prefers-reduced-motion` sempre**: niente animazioni non essenziali; gli
   stati finali restano leggibili; WebGL → frame statico.
4. **Cleanup obbligatorio**: `gsap.context()` per scope + `ctx.revert()` su
   unmount; `ScrollTrigger.kill()` dove serve; `tween.kill()` nei `useEffect`.
5. **Mappa & ricerca = zona calma**: nessun set-piece sopra la mappa; solo micro
   feedback (pin "Approdo", card "Vela"). La leggibilità batte il wow.
6. **Mobile**: riduci ampiezza/DPR; disattiva parallax pesante e WebGL ad alta
   risoluzione.

### 7.2 Setup tecnico
- **Plugin GSAP:** core + `ScrollTrigger` (reveal/parallax/scrub) + `Flip`
  (rimescolamento liste/ricerca) + `SplitText` (type cinetica, ora free) +
  `Observer` (gesture/cursore).
- **Smooth scroll:** **Lenis ovunque**, sincronizzato con ScrollTrigger.
  Disattivato sotto `prefers-reduced-motion`.
- **Struttura file:**
  ```
  lib/motion/
    gsap.ts        // registerPlugin + gsapWithCSP; init Lenis + sync ticker
    tokens.ts      // DUR, EASE (vedi 7.3)
    signatures.ts  // funzioni firmate riusabili (alba, onda, sbocciare, vela…)
  components/motion/
    SmoothScroll.tsx   // provider Lenis (client, in layout)
    SeaCanvas.tsx      // hero WebGL "Mare liquido"
    KineticText.tsx    // titolo cinetico (split + mask reveal)
    MagneticButton.tsx // "Calamita"
    Reveal.tsx         // wrapper scroll-reveal (Onda/Sbocciare)
  ```
- **Sync Lenis↔GSAP (riferimento):**
  ```ts
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  // reduced-motion → non istanziare Lenis
  ```

### 7.3 Token di motion (nomi nostri)
```ts
export const DUR  = { fast: .25, base: .5, slow: .8, scena: 1.1 }
export const EASE = {
  onda:     'power3.out',        // reveal/ingressi
  molla:    'back.out(1.6)',     // "Sbocciare" (overshoot morbido)
  approdo:  'elastic.out(1,0.5)',// pin che atterrano
  luce:     'power2.inOut',      // transizioni/luce
  vela:     'power4.out',        // pannelli che scivolano
}
```

### 7.4 Vocabolario di animazioni **firmate**
Set chiuso. Ogni animazione ha un nome; si richiama sempre uguale.

| Nome | Cosa fa | Dove | Note tecniche |
|------|---------|------|---------------|
| **Mare liquido** | Superficie marina WebGL (shader noise domain-warp, palette notte→mare→sole) **reattiva al cursore** dietro l'hero | Hero home (set-piece d'apertura) | shader frammento; uniform `u_mouse` crea increspatura; sole + titolo sopra in `mix-blend`. Reduced-motion → 1 frame statico; mobile → DPR ridotto |
| **Alba** | All'ingresso: luce calda che entra + sole che sorge | sopra "Mare liquido" nell'hero | timeline `luce`; transform/opacity di un overlay-luce + del sole |
| **Cinetica** | Titoli display: split per righe, **mask reveal** dal basso; numeri che salgono | hero, intestazioni grandi, "N aperti adesso" | `SplitText` + `yPercent` con parent `overflow-hidden`; count-up con `snap` |
| **Onda** | Reveal a cascata diagonale di liste/griglie | card ambulanti, eventi, sessioni | `ScrollTrigger` + `stagger:{each, from:'start'}` ease `onda` |
| **Sbocciare** | Ingresso con micro-overshoot (fiore che si apre) | card, badge, pin | `scale .92→1` + opacity, ease `molla` |
| **Risacca** | Onde/divisori che respirano in loop + deriva orizzontale del mare | divisori di sezione | CSS keyframe (`.imk-wave-divider`) o GSAP `repeat:-1 yoyo` |
| **Marea** | Parallax allo scroll: sole/mare/elementi a profondità diverse | hero, sezioni editoriali (eventi, progetto) | `ScrollTrigger scrub` + `y`/`yPercent` per layer |
| **Vela** | Pannelli/card che scivolano dentro **in sicurezza** | card mercato (`MarketPanel`), drawer | `gsap.from {x:60}` desktop / `{y:60}` mobile + `clearProps` (mai 110%) |
| **Approdo** | Pin mappa che "atterrano" elastici; "aperto ora" pulsa come un faro | mappa | `from {y:-46, opacity:0}` ease `approdo`, stagger; pulse = ring CSS |
| **Calamita** | CTA e logo seguono dolcemente il cursore | CTA primarie, logo hero | `MagneticButton`; spostamento max ~10–14px; off su touch |
| **Dissolvenza di luce** | Transizione tra pagine: luce calda che spazza | route transitions | overlay `notte/sole`, `luce`; rispetta reduced-motion |

### 7.5 Ricette per componente
- **Hero home:** `Mare liquido` (WebGL) + `Alba` + `Cinetica` sul titolo +
  `Calamita` sulla CTA. Barra ricerca/filtri **calma** (entrata `Onda` leggera).
- **Mappa:** zona calma. Pin = `Approdo`; "aperto ora" pulsa; card = `Vela`.
  Niente parallax/scrub sopra la mappa.
- **Ricerca:** dropdown con `Sbocciare` veloce; reshuffle risultati con **Flip**.
- **Ambulanti (carte del banco):** griglia `Onda` + hover `Calamita`/`.imk-lift`;
  ingresso card `Sbocciare`.
- **Eventi / Progetto:** `Marea` (parallax) + `Risacca` sui divisori + `Cinetica`
  sui titoli di sezione.
- **Transizioni di pagina:** `Dissolvenza di luce`.

### 7.6 Performance & accessibilità
- Budget: 60fps; niente jank allo scroll (Lenis + ScrollTrigger, no layout
  thrash). WebGL: 1 canvas, pausa quando fuori viewport, DPR ≤ 1.5.
- Tutto degrada con grazia: senza JS il contenuto è completo; con reduced-motion
  è statico ma bello. Test obbligatorio: tab in background / rAF throttling.

---

## 8. Stato & prossimi passi

**Fatto:** rebrand "Mercati di Ponente" su tutto il sito (palette, logo, type,
"carta del banco"); home mappa-centrica con ricerca/filtri sopra la mappa;
animazioni base GSAP (sole `.imk-sun`, onde `.imk-wave-divider`, titolo cinetico,
`Vela`/`Approdo`, hover `.imk-lift`); time-awareness con ricorrenze mensili.

**Da fare (motion):**
1. `lib/motion/` (gsap.ts + tokens + signatures) e `components/motion/*`.
2. **Lenis** in layout (provider + sync), con guardia reduced-motion.
3. **`SeaCanvas`** — hero WebGL "Mare liquido" reattivo al cursore (+ `Alba`).
4. `KineticText` (`SplitText`) e `MagneticButton` riusabili.
5. **Flip** sul reshuffle ricerca; `Marea` su eventi/progetto; `Dissolvenza di
   luce` sulle transizioni.
6. Refactor delle animazioni attuali per usare i **token** e le **firme** sopra.

> Sezioni da rifinire insieme: intensità esatta di `Marea`/scroll, se introdurre
> capitoli scroll-jacked nelle pagine editoriali, e i parametri dello shader
> "Mare liquido" (colori/contrasto).
