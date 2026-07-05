import type { Lang } from './home'

// Copy della home editoriale. Tenuto separato da HomeDict. Voce: prima persona
// plurale, concreta, ligure; niente slogan da agenzia — si raccontano giorni,
// piazze e gesti veri. Le "qualities" vengono dai colloqui veri con gli
// ambulanti (docs/operatori_schede_PED): il banco che cambia ogni settimana,
// cinque generazioni di baccalà, la sveglia alle 4, il pensierino nel
// sacchetto — raccontati senza nomi. Vedi docs/brand-voice.md.

export interface HomeQuality {
  t: string
  d: string
}

export interface HomeValueHead {
  k: string
  title: string
  lead: string
}

export interface HomeCopy {
  heroHeadline: string
  heroSubtitle: string
  heroScrollCue: string
  heroChips: { today: string; near: string; saturday: string }
  searchExamples: string[]
  exploreMapCta: string
  valueProject: HomeValueHead
  searchValueEyebrow: string
  searchValueTitle: string
  searchValueLead: string
  searchCta: string
  valueMarket: HomeValueHead
  qualities: HomeQuality[]
  qualitiesNote: string
  operatorsEyebrow: string
  operatorsTitle: string
  operatorsLead: string
  operatorsCta: string
  weekEyebrow: string
  weekTitle: string
  weekLead: string
  newsColTitle: string
  newsEmpty: string
  newsEmptyLead: string
  newsAllCta: string
  eventsColTitle: string
  eventsEmpty: string
  eventsEmptyLead: string
  eventsAllCta: string
}

export const HOME_COPY: Record<Lang, HomeCopy> = {
  it: {
    heroHeadline: 'I mercati che profumano di mare.',
    heroSubtitle: 'I mercati della Riviera di Ponente: banchi, piazze e voci da Ventimiglia a Varazze, dal mare alla Via del Sale.',
    heroScrollCue: 'Le zone',
    heroChips: { today: 'Oggi al mercato', near: 'Vicino a me', saturday: 'Sabato' },
    searchExamples: ['Cerca un prodotto…', 'Cerca un ambulante…', 'Cerca una zona…', 'Cerca un mercato di oggi…', 'Cerca l’artigianato…'],
    exploreMapCta: 'Apri la mappa',
    valueProject: {
      k: 'Il progetto',
      title: 'Da Ventimiglia a Varazze, un solo Ponente.',
      lead: 'Quindici zone tra mare e entroterra, ognuna con i suoi giorni, le sue piazze e il suo racconto: qui trovi dove sono i mercati, quando aprono e cosa aspettarti.',
    },
    searchValueEyebrow: 'L’accesso ai mercati',
    searchValueTitle: 'Cerca un prodotto, un banco, un paese',
    searchValueLead: 'Scrivi cosa ti serve — o semplicemente “oggi” — e la mappa ti mostra i mercati giusti: giorni, orari e come arrivarci.',
    searchCta: 'Cerca sulla mappa',
    valueMarket: {
      k: 'I valori del mercato',
      title: 'Il mestiere del banco',
      lead: 'Qualità vera, cortesia, mestiere tramandato. Li abbiamo raccolti parlando con chi il banco lo monta all’alba, ogni settimana.',
    },
    qualities: [
      { t: 'Qualità che si tocca', d: 'Il tessuto va sentito tra le dita, la frutta guardata da vicino. Al banco si prova prima di comprare.' },
      { t: 'Il consiglio onesto', d: 'C’è chi ti dice anche quando non comprare: il consiglio giusto vale più della vendita.' },
      { t: 'Mestiere di generazioni', d: 'Su certi banchi si lavora allo stesso modo da cinque generazioni. Un sapere che nessun supermercato può copiare.' },
      { t: 'Fresco di stamattina', d: 'Sveglia alle 4 per scegliere la cassetta migliore: il locale di stagione arriva sul banco lo stesso giorno.' },
      { t: 'La cura del banco', d: 'C’è chi non espone mai due volte lo stesso banco e chi ha studiato da vetrinista: l’ordine è un biglietto da visita.' },
      { t: 'Accoglienza, in ogni lingua', d: 'Un pensierino nel sacchetto, due parole in francese per chi arriva da oltre confine: qui sei un nome, non uno scontrino.' },
    ],
    qualitiesNote: 'Raccolti parlando con gli ambulanti del Ponente, banco per banco.',
    operatorsEyebrow: 'Le persone del mercato',
    operatorsTitle: 'Chi c’è dietro i banchi',
    operatorsLead: 'Chi coltiva, chi sceglie all’alba, chi ti conosce per nome: qui trovi le persone dei mercati, banco per banco, e cosa portano.',
    operatorsCta: 'Conosci gli ambulanti',
    weekEyebrow: 'La settimana',
    weekTitle: 'Notizie ed eventi dalla Riviera',
    weekLead: 'Gli avvisi dei comuni e gli appuntamenti da segnare, uno accanto all’altro.',
    newsColTitle: 'Dai comuni',
    newsEmpty: 'Presto nuove notizie',
    newsEmptyLead: 'Gli avvisi dei comuni e dei mercati compariranno qui.',
    newsAllCta: 'Tutte le notizie',
    eventsColTitle: 'Sulla Riviera',
    eventsEmpty: 'Presto nuovi appuntamenti',
    eventsEmptyLead: 'Fiere, sagre e mercati straordinari, in arrivo.',
    eventsAllCta: 'Tutti gli eventi',
  },
  fr: {
    heroHeadline: 'Les marchés qui sentent la mer.',
    heroSubtitle: 'Les marchés de la Riviera di Ponente : étals, places et voix de Vintimille à Varazze, de la mer à la Route du Sel.',
    heroScrollCue: 'Les zones',
    heroChips: { today: 'Aujourd’hui au marché', near: 'Près de moi', saturday: 'Samedi' },
    searchExamples: ['Cherche un produit…', 'Cherche un marchand…', 'Cherche une zone…', 'Cherche un marché d’aujourd’hui…', 'Cherche l’artisanat…'],
    exploreMapCta: 'Ouvrir la carte',
    valueProject: {
      k: 'Le projet',
      title: 'De Vintimille à Varazze, un seul Ponant.',
      lead: 'Quinze zones entre mer et arrière-pays, chacune avec ses jours, ses places et son histoire : ici tu trouves où sont les marchés, quand ils ouvrent et à quoi t’attendre.',
    },
    searchValueEyebrow: 'L’accès aux marchés',
    searchValueTitle: 'Cherche un produit, un étal, un village',
    searchValueLead: 'Écris ce qu’il te faut — ou simplement « aujourd’hui » — et la carte te montre les bons marchés : jours, horaires et comment y arriver.',
    searchCta: 'Chercher sur la carte',
    valueMarket: {
      k: 'Les valeurs du marché',
      title: 'Le métier de l’étal',
      lead: 'Qualité vraie, courtoisie, métier transmis. Recueillis en parlant avec ceux qui montent l’étal à l’aube, chaque semaine.',
    },
    qualities: [
      { t: 'La qualité qui se touche', d: 'Le tissu se sent entre les doigts, les fruits se regardent de près. À l’étal, on essaie avant d’acheter.' },
      { t: 'Le conseil honnête', d: 'Certains te disent aussi quand ne pas acheter : le bon conseil vaut plus que la vente.' },
      { t: 'Un métier de générations', d: 'Sur certains étals on travaille ainsi depuis cinq générations. Un savoir qu’aucun supermarché ne peut copier.' },
      { t: 'Frais de ce matin', d: 'Debout à 4 heures pour choisir la meilleure cagette : le local de saison arrive à l’étal le jour même.' },
      { t: 'Le soin de l’étal', d: 'Certains n’exposent jamais deux fois le même étal, d’autres ont appris l’art de la vitrine : l’ordre est une carte de visite.' },
      { t: 'Un accueil, dans ta langue', d: 'Un petit cadeau dans le sachet, deux mots en français pour qui vient d’au-delà de la frontière : ici tu es un nom, pas un ticket.' },
    ],
    qualitiesNote: 'Recueillis auprès des marchands du Ponant, étal par étal.',
    operatorsEyebrow: 'Les gens du marché',
    operatorsTitle: 'Qui est derrière les étals',
    operatorsLead: 'Qui cultive, qui choisit à l’aube, qui te connaît par ton nom : ici tu trouves les gens des marchés, étal par étal, et ce qu’ils apportent.',
    operatorsCta: 'Rencontrer les marchands',
    weekEyebrow: 'La semaine',
    weekTitle: 'Nouvelles et événements de la Riviera',
    weekLead: 'Les avis des communes et les rendez-vous à noter, côte à côte.',
    newsColTitle: 'Des communes',
    newsEmpty: 'Bientôt de nouvelles infos',
    newsEmptyLead: 'Les avis des communes et des marchés apparaîtront ici.',
    newsAllCta: 'Toutes les nouvelles',
    eventsColTitle: 'Sur la Riviera',
    eventsEmpty: 'Bientôt de nouveaux rendez-vous',
    eventsEmptyLead: 'Foires, fêtes et marchés extraordinaires, à venir.',
    eventsAllCta: 'Tous les événements',
  },
  de: {
    heroHeadline: 'Die Märkte, die nach Meer duften.',
    heroSubtitle: 'Die Märkte der Riviera di Ponente: Stände, Plätze und Stimmen von Ventimiglia bis Varazze, vom Meer bis zur Salzstraße.',
    heroScrollCue: 'Die Zonen',
    heroChips: { today: 'Heute am Markt', near: 'In meiner Nähe', saturday: 'Samstag' },
    searchExamples: ['Suche ein Produkt…', 'Suche einen Händler…', 'Suche eine Zone…', 'Suche einen Markt heute…', 'Suche Handwerk…'],
    exploreMapCta: 'Karte öffnen',
    valueProject: {
      k: 'Das Projekt',
      title: 'Von Ventimiglia bis Varazze: ein Ponente.',
      lead: 'Fünfzehn Zonen zwischen Meer und Hinterland, jede mit ihren Tagen, Plätzen und Geschichten. Hier findest du, wo die Märkte sind, wann sie öffnen und was dich erwartet.',
    },
    searchValueEyebrow: 'Der Zugang zu den Märkten',
    searchValueTitle: 'Such ein Produkt, einen Stand, ein Dorf',
    searchValueLead: 'Schreib, was du brauchst — oder einfach „heute“ — und die Karte zeigt dir die richtigen Märkte: Tage, Zeiten und den Weg dorthin.',
    searchCta: 'Auf der Karte suchen',
    valueMarket: {
      k: 'Die Werte des Marktes',
      title: 'Das Handwerk am Stand',
      lead: 'Echte Qualität, Freundlichkeit, überliefertes Handwerk. Gesammelt im Gespräch mit denen, die den Stand jede Woche im Morgengrauen aufbauen.',
    },
    qualities: [
      { t: 'Qualität zum Anfassen', d: 'Der Stoff will gefühlt, das Obst aus der Nähe betrachtet werden. Am Stand probierst du, bevor du kaufst.' },
      { t: 'Der ehrliche Rat', d: 'Manche sagen dir auch, wann du nicht kaufen sollst: der richtige Rat zählt mehr als der Verkauf.' },
      { t: 'Handwerk über Generationen', d: 'An manchen Ständen arbeitet man so seit fünf Generationen. Ein Wissen, das kein Supermarkt kopieren kann.' },
      { t: 'Frisch von heute Morgen', d: 'Um 4 Uhr auf, um die beste Kiste auszusuchen: das Saisonale aus der Region liegt noch am selben Tag am Stand.' },
      { t: 'Die Pflege des Standes', d: 'Manche zeigen nie zweimal denselben Stand, andere haben Schaufenster gelernt: Ordnung ist eine Visitenkarte.' },
      { t: 'Willkommen, in deiner Sprache', d: 'Eine kleine Aufmerksamkeit im Beutel, ein paar Worte Französisch für Gäste von jenseits der Grenze: hier bist du ein Name, kein Kassenbon.' },
    ],
    qualitiesNote: 'Gesammelt im Gespräch mit den Händlern des Ponente, Stand für Stand.',
    operatorsEyebrow: 'Die Menschen des Marktes',
    operatorsTitle: 'Wer hinter den Ständen steht',
    operatorsLead: 'Wer anbaut, wer im Morgengrauen auswählt, wer dich beim Namen kennt: hier findest du die Menschen der Märkte, Stand für Stand, und was sie mitbringen.',
    operatorsCta: 'Die Händler kennenlernen',
    weekEyebrow: 'Die Woche',
    weekTitle: 'Nachrichten & Termine von der Riviera',
    weekLead: 'Die Hinweise der Gemeinden und die Termine zum Vormerken, nebeneinander.',
    newsColTitle: 'Aus den Gemeinden',
    newsEmpty: 'Bald neue Nachrichten',
    newsEmptyLead: 'Die Hinweise der Gemeinden und Märkte erscheinen hier.',
    newsAllCta: 'Alle Nachrichten',
    eventsColTitle: 'An der Riviera',
    eventsEmpty: 'Bald neue Termine',
    eventsEmptyLead: 'Messen, Feste und Sondermärkte — demnächst.',
    eventsAllCta: 'Alle Termine',
  },
  en: {
    heroHeadline: 'The markets with the scent of the sea.',
    heroSubtitle: 'The markets of the Riviera di Ponente: stalls, squares and voices from Ventimiglia to Varazze, from the sea to the old Salt Road.',
    heroScrollCue: 'The areas',
    heroChips: { today: 'Today at the market', near: 'Near me', saturday: 'Saturday' },
    searchExamples: ['Search a product…', 'Search a vendor…', 'Search an area…', 'Search a market today…', 'Search the crafts…'],
    exploreMapCta: 'Open the map',
    valueProject: {
      k: 'The project',
      title: 'From Ventimiglia to Varazze, one Ponente.',
      lead: 'Fifteen areas between sea and hinterland, each with its days, its squares and its story: here you’ll find where the markets are, when they open and what to expect.',
    },
    searchValueEyebrow: 'Getting to the markets',
    searchValueTitle: 'Search a product, a stall, a village',
    searchValueLead: 'Type what you need — or simply “today” — and the map shows you the right markets: days, hours and how to get there.',
    searchCta: 'Search on the map',
    valueMarket: {
      k: 'The market’s values',
      title: 'The craft of the stall',
      lead: 'Real quality, courtesy, a craft passed down. Collected by talking with the people who set up their stalls at dawn, every week.',
    },
    qualities: [
      { t: 'Quality you can touch', d: 'Fabric is felt between your fingers, fruit looked at up close. At the stall you try before you buy.' },
      { t: 'Honest advice', d: 'Some will even tell you when not to buy: the right advice is worth more than the sale.' },
      { t: 'A craft of generations', d: 'Some stalls have worked the same way for five generations. A knowledge no supermarket can copy.' },
      { t: 'Fresh from this morning', d: 'Up at 4 a.m. to pick the best crate: local seasonal produce reaches the stall the same day.' },
      { t: 'The care of the stall', d: 'Some never lay out the same stall twice; others trained in window dressing: order is a calling card.' },
      { t: 'A welcome, in your language', d: 'A little extra in the bag, a few words of French for those from across the border: here you’re a name, not a receipt.' },
    ],
    qualitiesNote: 'Collected by talking with the vendors of the Ponente, stall by stall.',
    operatorsEyebrow: 'The people of the market',
    operatorsTitle: 'Who’s behind the stalls',
    operatorsLead: 'Who grows, who picks at dawn, who knows you by name: here you’ll find the people of the markets, stall by stall, and what they bring.',
    operatorsCta: 'Meet the vendors',
    weekEyebrow: 'The week',
    weekTitle: 'News & events from the Riviera',
    weekLead: 'Town notices and dates to save, side by side.',
    newsColTitle: 'From the towns',
    newsEmpty: 'New notices soon',
    newsEmptyLead: 'Notices from towns and markets will appear here.',
    newsAllCta: 'All the news',
    eventsColTitle: 'On the Riviera',
    eventsEmpty: 'New dates soon',
    eventsEmptyLead: 'Fairs, festivals and special markets, coming up.',
    eventsAllCta: 'All events',
  },
}
