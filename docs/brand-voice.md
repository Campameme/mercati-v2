# Mercati della Riviera di Ponente — Brand Voice

> Grafica e motion: [`brand-system.md`](./brand-system.md) · regole operative:
> [`../CLAUDE.md`](../CLAUDE.md). Aggiornato al **2026-07-06** — il brainstorming
> storico è stato rimosso: le decisioni superate vivono nella storia dei commit.

## Identità e perimetro
- Nome ufficiale **"Mercati della Riviera di Ponente"**; *"Riviera dei Fiori"*
  resta solo come descrittore geografico/heritage, mai come nome del progetto.
- Perimetro: **da Ventimiglia a Varazze** (province di Imperia e Savona, costa ed
  entroterra): 15 zone con `carattere` + `story` (`lib/markets/zones.ts`) e ~50
  comuni con descrizione curata (`lib/markets/comuni.ts`).
- Posizionamento: esperienza di **qualità e autoctona ad accesso aperto** — mai
  "élite", mai "banchi selezionati" (la selezione non esiste), mai "premium" o
  "esclusivo" nel copy visibile.

## Voce
- Prima persona plurale, concreta, ligure: si raccontano **giorni, piazze e gesti
  veri**. MAI slogan da agenzia (bandita *"gli ambulanti sono il prodotto"*), mai
  il brief come testo di pagina.
- Gli operatori sono **I Maestri del Banco**: si presentano per nome (col punto),
  con gli anni di mestiere e i fatti — non con gli aggettivi.
- Niente anglicismi. 4 lingue IT/FR/DE/EN; **il francese viene prima** nei
  contenuti di servizio pensati per i turisti (settimana, come arrivare).
- Target: 40–80 e turisti (soprattutto francesi da Nizza/Mentone, il venerdì di
  Ventimiglia è un'istituzione); i giovani si agganciano col **valore** (prezzi
  veri, stagionalità), non col tono giovanilistico.
- Date e ricorrenze sempre in **forma contratta** ("venerdì, sabato e domenica
  dal 24/7 al 30/8"), mai elenchi di date.
- Lessico sì: mare, mattina, banco, maestro, caruggio, fresco, autentico, di
  stagione, vicino a te. Vietato: motivi a foglia d'ulivo (basilico/pesto ok).

## Claim e heritage (verificati, citabili)
- Hero: **"I mercati che profumano di mare."** + sottotitolo con il perimetro
  Ventimiglia→Varazze.
- Dati veri da usare nei racconti (mai come elenco in hero): Sanremo **1882**
  primo mercato dei fiori · **Ventimiglia** tra i più grandi mercati all'aperto
  d'Italia, meta storica dei francesi · Bordighera palme al Vaticano dal **1586**
  · Pieve di Teco città mercatale (**1233**) · Albenga città delle cento torri ·
  Noli repubblica marinara · le Albisole capitali della ceramica · Liguria **1ª
  per Bandiere Blu 2026** · Savona provincia con più borghi d'Italia.

## Dove vivono i testi
- Home ×4 lingue: `lib/i18n/homeCopy.ts` · UI: `lib/i18n/ui.ts`
- Territorio: `lib/markets/zones.ts` / `comuni.ts` + `*.i18n.ts` (FR/DE/EN)
- Il kit social (guideline + template "Maestri del Banco") è **fuori repo**.
