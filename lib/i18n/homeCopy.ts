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
    searchExamples: ['Cerca un prodotto…', 'Cerca un ambulante…', 'Cerca una zona…', 'Cerca un mercato di oggi…', 'Cerca l’artigianato…'],
    exploreMapCta: 'Apri la mappa',
    liguria: {
      eyebrow: 'Il progetto',
      title: 'Riportare la gente al mercato.',
      beats: [
        { stat: '', statLabel: '', t: 'Un’eredità', d: 'Il venerdì di Ventimiglia, i fiori di Sanremo, i portici di Pieve di Teco: qui il mercato non è un’abitudine, è un’eredità che passa di mano ogni settimana, da secoli. Eppure ogni anno qualche banco non riapre, e la piazza fa un po’ più di eco.' },
        { stat: '', statLabel: '', t: 'Una promessa', d: 'Noi non ci stiamo. Abbiamo messo tutta la Riviera dei Fiori in un posto solo — i giorni, le piazze, le persone — perché tornare al mercato sia semplice come chiedersi: dov’è il banco, oggi? Il più vicino te lo dice la mappa.' },
        { stat: '', statLabel: '', t: 'Una stretta di mano', d: 'E per chi il banco lo monta all’alba c’è una porta aperta: la tua storia raccontata a chi arriva apposta per te, e una rete che dà valore a chi lavora bene.' },
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
    searchExamples: ['Cherche un produit…', 'Cherche un marchand…', 'Cherche une zone…', 'Cherche un marché d’aujourd’hui…', 'Cherche l’artisanat…'],
    exploreMapCta: 'Ouvrir la carte',
    liguria: {
      eyebrow: 'Le projet',
      title: 'Ramener les gens au marché.',
      beats: [
        { stat: '', statLabel: '', t: 'Un héritage', d: 'Le vendredi de Vintimille, les fleurs de Sanremo, les arcades de Pieve di Teco : ici le marché n’est pas une habitude, c’est un héritage qui passe de main en main chaque semaine, depuis des siècles. Pourtant, chaque année, un étal ne rouvre pas, et la place résonne un peu plus.' },
        { stat: '', statLabel: '', t: 'Une promesse', d: 'Nous ne nous y résignons pas. Nous avons réuni toute la Riviera dei Fiori en un seul endroit — les jours, les places, les gens — pour que revenir au marché soit aussi simple que se demander : où est l’étal, aujourd’hui ? Le plus proche, la carte te le dit.' },
        { stat: '', statLabel: '', t: 'Une poignée de main', d: 'Et pour qui monte l’étal à l’aube, une porte est ouverte : ton histoire racontée à qui vient exprès pour toi, et un réseau qui donne de la valeur à qui travaille bien.' },
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
    searchExamples: ['Suche ein Produkt…', 'Suche einen Händler…', 'Suche eine Zone…', 'Suche einen Markt heute…', 'Suche Handwerk…'],
    exploreMapCta: 'Karte öffnen',
    liguria: {
      eyebrow: 'Das Projekt',
      title: 'Die Leute zurück auf den Markt bringen.',
      beats: [
        { stat: '', statLabel: '', t: 'Ein Erbe', d: 'Der Freitag von Ventimiglia, die Blumen von Sanremo, die Arkaden von Pieve di Teco: Hier ist der Markt keine Gewohnheit, sondern ein Erbe, das seit Jahrhunderten jede Woche weitergegeben wird. Und doch öffnet jedes Jahr ein Stand nicht mehr, und der Platz hallt ein wenig mehr.' },
        { stat: '', statLabel: '', t: 'Ein Versprechen', d: 'Wir finden uns damit nicht ab. Wir haben die ganze Riviera dei Fiori an einen Ort gebracht — die Tage, die Plätze, die Menschen — damit der Weg zurück zum Markt so einfach ist wie die Frage: Wo ist heute der Stand? Den nächsten zeigt dir die Karte.' },
        { stat: '', statLabel: '', t: 'Ein Handschlag', d: 'Und für alle, die den Stand im Morgengrauen aufbauen, steht eine Tür offen: deine Geschichte, erzählt denen, die eigens für dich kommen, und ein Netz, das gute Arbeit belohnt.' },
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
    searchExamples: ['Search a product…', 'Search a vendor…', 'Search an area…', 'Search a market today…', 'Search the crafts…'],
    exploreMapCta: 'Open the map',
    liguria: {
      eyebrow: 'The project',
      title: 'Bringing people back to the market.',
      beats: [
        { stat: '', statLabel: '', t: 'An inheritance', d: 'Ventimiglia’s Friday, Sanremo’s flowers, the arcades of Pieve di Teco: here the market isn’t a habit, it’s an inheritance handed down every week, for centuries. And yet every year a stall doesn’t reopen, and the square echoes a little more.' },
        { stat: '', statLabel: '', t: 'A promise', d: 'We won’t accept that. We’ve gathered the whole Riviera dei Fiori in one place — the days, the squares, the people — so that coming back to the market is as simple as asking: where’s the stall today? The map tells you the nearest one.' },
        { stat: '', statLabel: '', t: 'A handshake', d: 'And for those who set up at dawn, there’s an open door: your story told to people who come on purpose for you, and a network that rewards those who work well.' },
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
