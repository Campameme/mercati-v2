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

export interface LiguriaBeat {
  /** parola/numero grande (es. '1ª', 'SV', '7/7') */
  stat: string
  statLabel: string
  t: string
  d: string
}

export interface HomeCopy {
  heroHeadline: string
  heroSubtitle: string
  heroScrollCue: string
  heroChips: { today: string; near: string; saturday: string }
  searchExamples: string[]
  exploreMapCta: string
  valueProject: HomeValueHead
  liguria: { eyebrow: string; title: string; beats: LiguriaBeat[] }
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
  operatorsJoinCta: string
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
    heroSubtitle: 'Da Ventimiglia a Diano c’è un mercato quasi ogni giorno. Cose buone di stagione, gente che conosci per nome, la spesa che torna a essere un piacere: la Riviera dei Fiori, banco per banco.',
    heroScrollCue: 'Il progetto',
    heroChips: { today: 'Oggi al mercato', near: 'Vicino a me', saturday: 'Sabato' },
    searchExamples: ['le zucchine più buone', 'tendaggi per la casa di qualità', 'pantaloni da lavoro', 'mercati vicino Bordighera', 'mercati tipici', 'Claudia, abbigliamento'],
    exploreMapCta: 'Apri la mappa',
    liguria: {
      eyebrow: 'Il progetto',
      title: 'Ogni settimana, vicino a casa.',
      beats: [
        { stat: '', statLabel: '', t: '', d: 'Il mercato torna in piazza in ogni comune, nel suo giorno di sempre: la spesa di stagione a due passi da casa, dal banco di chi la porta. Il più vicino te lo dice la mappa.' },
      ],
    },
    valueProject: {
      k: 'Le zone',
      title: 'Otto zone, da Ventimiglia a Diano.',
      lead: 'La Riviera dei Fiori tra mare ed entroterra: ogni zona ha i suoi giorni, le sue piazze e il suo racconto. Qui trovi dove sono i mercati, quando aprono e cosa aspettarti.',
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
    qualitiesNote: 'Raccolti parlando con gli ambulanti della Riviera dei Fiori, banco per banco.',
    operatorsEyebrow: 'Le persone del mercato',
    operatorsTitle: 'Ti aspettano al banco.',
    operatorsLead: 'La sveglia alle quattro per scegliere la cassetta migliore. Cinque generazioni dietro lo stesso baccalà. Il pensierino nel sacchetto e due parole in francese per chi scende dal confine. I mercati della Riviera dei Fiori sono le loro persone: questo posto serve a fartele incontrare.',
    operatorsCta: 'Conosci i banchi di fiducia',
    operatorsJoinCta: 'Hai un banco? Unisciti',
    weekEyebrow: 'La settimana',
    weekTitle: 'La settimana della Riviera',
    weekLead: 'Gli avvisi dei comuni e dei mercati, sempre aggiornati.',
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
    heroSubtitle: 'De Vintimille à Diano, il y a un marché presque chaque jour. De bonnes choses de saison, des gens qu’on connaît par leur nom, des courses qui redeviennent un plaisir : la Riviera dei Fiori, étal par étal.',
    heroScrollCue: 'Le projet',
    heroChips: { today: 'Aujourd’hui au marché', near: 'Près de moi', saturday: 'Samedi' },
    searchExamples: ['les meilleures courgettes', 'des rideaux pour la maison', 'pantalons de travail', 'marchés près de Bordighera', 'marchés typiques', 'Claudia, vêtements'],
    exploreMapCta: 'Ouvrir la carte',
    liguria: {
      eyebrow: 'Le projet',
      title: 'Chaque semaine, près de chez soi.',
      beats: [
        { stat: '', statLabel: '', t: '', d: 'Le marché revient sur la place dans chaque commune, à son jour de toujours : les courses de saison à deux pas de chez soi, à l’étal de qui les apporte. Le plus proche, la carte te le dit.' },
      ],
    },
    valueProject: {
      k: 'Les zones',
      title: 'Huit zones, de Vintimille à Diano.',
      lead: 'La Riviera dei Fiori entre mer et arrière-pays : chaque zone a ses jours, ses places et son histoire. Ici tu trouves où sont les marchés, quand ils ouvrent et à quoi t’attendre.',
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
    qualitiesNote: 'Recueillis auprès des marchands de la Riviera dei Fiori, étal par étal.',
    operatorsEyebrow: 'Les gens du marché',
    operatorsTitle: 'Ils t’attendent à l’étal.',
    operatorsLead: 'Debout à quatre heures pour choisir la meilleure cagette. Cinq générations derrière la même morue. Le petit cadeau dans le sachet et deux mots de français pour qui descend de la frontière. Les marchés de la Riviera dei Fiori, ce sont leurs gens : ce site sert à te les faire rencontrer.',
    operatorsCta: 'Rencontrer les étals de confiance',
    operatorsJoinCta: 'Tu as un étal ? Rejoins-nous',
    weekEyebrow: 'La semaine',
    weekTitle: 'La semaine de la Riviera',
    weekLead: 'Les avis des communes et des marchés, toujours à jour.',
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
    heroSubtitle: 'Von Ventimiglia bis Diano ist fast jeden Tag irgendwo Markt. Gutes der Saison, Menschen, die man beim Namen kennt, Einkaufen, das wieder Freude macht: die Riviera dei Fiori, Stand für Stand.',
    heroScrollCue: 'Das Projekt',
    heroChips: { today: 'Heute am Markt', near: 'In meiner Nähe', saturday: 'Samstag' },
    searchExamples: ['die besten Zucchini', 'Vorhänge für zu Hause', 'Arbeitshosen', 'Märkte bei Bordighera', 'typische Märkte', 'Claudia, Kleidung'],
    exploreMapCta: 'Karte öffnen',
    liguria: {
      eyebrow: 'Das Projekt',
      title: 'Jede Woche, gleich um die Ecke.',
      beats: [
        { stat: '', statLabel: '', t: '', d: 'Der Markt kehrt in jeder Gemeinde auf den Platz zurück, an seinem gewohnten Tag: der saisonale Einkauf gleich um die Ecke, am Stand derer, die ihn bringen. Den nächsten zeigt dir die Karte.' },
      ],
    },
    valueProject: {
      k: 'Die Zonen',
      title: 'Acht Zonen, von Ventimiglia bis Diano.',
      lead: 'Die Riviera dei Fiori zwischen Meer und Hinterland: jede Zone hat ihre Tage, Plätze und Geschichten. Hier findest du, wo die Märkte sind, wann sie öffnen und was dich erwartet.',
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
    qualitiesNote: 'Gesammelt im Gespräch mit den Händlern der Riviera dei Fiori, Stand für Stand.',
    operatorsEyebrow: 'Die Menschen des Marktes',
    operatorsTitle: 'Sie warten am Stand auf dich.',
    operatorsLead: 'Um vier Uhr auf, um die beste Kiste auszusuchen. Fünf Generationen hinter demselben Stockfisch. Die kleine Aufmerksamkeit im Beutel und ein paar Worte Französisch für Gäste von der Grenze. Die Märkte der Riviera dei Fiori sind ihre Menschen: diese Seite bringt euch zusammen.',
    operatorsCta: 'Die Stände des Vertrauens kennenlernen',
    operatorsJoinCta: 'Hast du einen Stand? Mach mit',
    weekEyebrow: 'Die Woche',
    weekTitle: 'Die Woche der Riviera',
    weekLead: 'Die Hinweise der Gemeinden und Märkte, immer aktuell.',
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
    heroSubtitle: 'From Ventimiglia to Diano there’s a market almost every day. Good things in season, people you know by name, shopping that becomes a pleasure again: the Riviera dei Fiori, stall by stall.',
    heroScrollCue: 'The project',
    heroChips: { today: 'Today at the market', near: 'Near me', saturday: 'Saturday' },
    searchExamples: ['the best courgettes', 'curtains for the home', 'work trousers', 'markets near Bordighera', 'typical markets', 'Claudia, clothing'],
    exploreMapCta: 'Open the map',
    liguria: {
      eyebrow: 'The project',
      title: 'Every week, close to home.',
      beats: [
        { stat: '', statLabel: '', t: '', d: 'The market returns to the square in every town, on its usual day: seasonal shopping a stone’s throw from home, at the stall of the people who bring it. The map tells you the nearest one.' },
      ],
    },
    valueProject: {
      k: 'The areas',
      title: 'Eight areas, from Ventimiglia to Diano.',
      lead: 'The Riviera dei Fiori between sea and hinterland: each area has its days, its squares and its story. Here you’ll find where the markets are, when they open and what to expect.',
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
    qualitiesNote: 'Collected by talking with the vendors of the Riviera dei Fiori, stall by stall.',
    operatorsEyebrow: 'The people of the market',
    operatorsTitle: 'They’re waiting at the stall.',
    operatorsLead: 'Up at four to pick the best crate. Five generations behind the same salt cod. A little extra in the bag and a few words of French for those coming down from the border. The Riviera dei Fiori markets are their people: this place exists to introduce you.',
    operatorsCta: 'Meet the trusted stalls',
    operatorsJoinCta: 'Got a stall? Join us',
    weekEyebrow: 'The week',
    weekTitle: 'The Riviera’s week',
    weekLead: 'Notices from towns and markets, always up to date.',
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
