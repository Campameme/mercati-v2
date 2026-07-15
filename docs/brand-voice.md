# I Mercati della Riviera dei Fiori — Brand Voice

> Grafica e motion: [`brand-system.md`](./brand-system.md) · regole operative:
> [`../CLAUDE.md`](../CLAUDE.md). Aggiornato al **2026-07-12** (svolta "Nodo ×
> Mezzogiorno": il brainstorming precedente vive nella storia dei commit).

## Identità e perimetro
- Nome **"I Mercati della Riviera dei Fiori"** ("Mercati della Riviera di
  Ponente" = naming precedente, in dismissione; "Riviera dei Fiori" torna a
  essere il cuore del nome, non solo descrittore).
- Perimetro: **provincia di Imperia, da Ventimiglia a Diano/Cervo** — 8 zone
  (`lib/markets/zones.ts`, IMPERIA_ZONE_SLUGS). Le zone di Savona sono state
  rimosse del tutto, dati e codice (migrazione 0024_remove_savona).
- Posizionamento: il mercato come **esperienza** — perché venirci (o tornarci),
  raccontato con storytelling, mai in modo funzionale. Valori: qualità vera,
  **sostenibilità, seconda mano, vicinanza al territorio**; per tutti — clienti
  abituali, turisti, ragazzi. Mai "élite/premium/selezionato": la **rete dei
  banchi** è un gruppo che si sceglie, parallela al mercato standard senza
  disprezzarlo ("non è un abbonamento: è un gruppo che si sceglie").

## Voce
- Prima persona plurale, concreta, ligure: **giorni, piazze e gesti veri**. MAI
  slogan da agenzia, mai il brief come testo di pagina.
- Gli operatori sono **i banchi di fiducia della rete**: si presentano col nome
  del banco ("Il banco di Antonio."), il mestiere, e parlano in **prima
  persona** («Nella mia famiglia sono la quinta generazione di bagnatori di
  stoccafisso.») — hashtag **#DietroIlBanco**. ("I Maestri del Banco" = naming
  precedente.)
- I tre requisiti della rete, sempre con queste parole: **banco pulito e
  curato · prodotti di qualità · serietà con colleghi e clienti**.
- Niente anglicismi. 4 lingue IT/FR/DE/EN (`lib/i18n/*`); il francese prima nei
  contenuti di servizio per i turisti (il venerdì di Ventimiglia è
  un'istituzione per chi scende dalla Costa Azzurra).
- Date e ricorrenze sempre in **forma contratta**, mai elenchi di date.
- Lessico sì: banco, fiducia, rete, mestiere, di stagione, seconda mano,
  vicino, mattina, piazza. Vietato: foglia d'ulivo come motivo (il basilico e
  il pesto come prodotti sono ok).

## Claim e heritage (verificati, citabili)
- Hero (mockup): **"Il tuo banco di fiducia, da Ventimiglia a Diano."** ·
  claim storico ancora valido come alternativa: "I mercati che profumano di
  mare." (scelta finale legata alle proposte above-the-fold).
- Dati veri da usare nei racconti (mai in elenco nell'hero): Sanremo **1882**
  primo mercato dei fiori d'Italia · **Ventimiglia** il venerdì, tra i più
  grandi mercati all'aperto d'Italia · Bordighera palme al Vaticano dal
  **1586** · Pieve di Teco città mercatale (**1233**) · il golfo Dianese coi
  mercati quasi ogni giorno.

## Dove vivono i testi
- Home ×4 lingue: `lib/i18n/homeCopy.ts` · UI: `lib/i18n/ui.ts`
- Territorio: `lib/markets/zones.ts` / `comuni.ts` + `*.i18n.ts` (FR/DE/EN)
- Il kit social (guideline + template #DietroIlBanco) è **fuori repo**.
