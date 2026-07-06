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
    heroSubtitle: 'I mercati della Riviera di Ponente: banchi, piazze e voci da Ventimiglia a Varazze, dal mare alla Via del Sale.',
    heroScrollCue: 'Le zone',
    heroChips: { today: 'Oggi al mercato', near: 'Vicino a me', saturday: 'Sabato' },
    searchExamples: ['Cerca un prodotto…', 'Cerca un ambulante…', 'Cerca una zona…', 'Cerca un mercato di oggi…', 'Cerca l’artigianato…'],
    exploreMapCta: 'Apri la mappa',
    liguria: {
      eyebrow: 'La Liguria vera',
      title: 'Qui l’autentico è quotidiano.',
      beats: [
        { stat: '1ª', statLabel: 'regione d’Italia per Bandiere Blu 2026', t: 'Il mare più premiato d’Italia', d: 'Il mare che profuma i banchi è lo stesso che colleziona primati: nel 2026 la Liguria è ancora prima per Bandiere Blu. Chi viene per la spiaggia trova il mercato a due passi dall’ombrellone.' },
        { stat: 'SV', statLabel: 'la provincia con più borghi', t: 'La terra dei borghi', d: 'Savona è la provincia italiana con più borghi: Finalborgo dentro le mura, Noli che fu repubblica, Millesimo col suo ponte-torre. E in ogni borgo, da secoli, il giorno di mercato è il giorno in cui la piazza si accende.' },
        { stat: '7/7', statLabel: 'giorni: c’è sempre un mercato aperto', t: 'Un mercato, ogni giorno', d: 'Sette giorni su sette c’è un banco montato da qualche parte tra Ventimiglia e Varazze. Non eventi: la spesa vera di tutti i giorni, il consiglio, il mestiere tramandato.' },
      ],
    },
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
    operatorsTitle: 'Ti aspettano al banco.',
    operatorsLead: 'La sveglia alle quattro per scegliere la cassetta migliore. Cinque generazioni dietro lo stesso baccalà. Il pensierino nel sacchetto e due parole in francese per chi scende dal confine. I mercati del Ponente sono le loro persone: questo posto serve a fartele incontrare.',
    operatorsCta: 'Conosci i Maestri del Banco',
    operatorsJoinCta: 'Hai un banco? Unisciti',
    weekEyebrow: 'La settimana',
    weekTitle: 'La settimana della Riviera',
    weekLead: 'Gli avvisi dei comuni e i prossimi mercati tipici, uno accanto all’altro.',
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
    liguria: {
      eyebrow: 'La vraie Ligurie',
      title: 'Ici, l’authentique est quotidien.',
      beats: [
        { stat: '1ère', statLabel: 'région d’Italie pour les Pavillons Bleus 2026', t: 'La mer la plus primée d’Italie', d: 'La mer qui parfume les étals est la même qui collectionne les records : en 2026, la Ligurie est encore première pour les Pavillons Bleus. Qui vient pour la plage trouve le marché à deux pas du parasol.' },
        { stat: 'SV', statLabel: 'la province aux plus nombreux bourgs', t: 'La terre des bourgs', d: 'Savone est la province italienne qui compte le plus de bourgs : Finalborgo dans ses murailles, Noli l’ancienne république, Millesimo et son pont-tour. Et dans chaque bourg, depuis des siècles, le jour de marché est celui où la place s’anime.' },
        { stat: '7/7', statLabel: 'jours : il y a toujours un marché ouvert', t: 'Un marché, chaque jour', d: 'Sept jours sur sept, un étal est monté quelque part entre Vintimille et Varazze. Pas des événements : les courses vraies de tous les jours, le conseil, le métier transmis.' },
      ],
    },
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
    operatorsTitle: 'Ils t’attendent à l’étal.',
    operatorsLead: 'Debout à quatre heures pour choisir la meilleure cagette. Cinq générations derrière la même morue. Le petit cadeau dans le sachet et deux mots de français pour qui descend de la frontière. Les marchés du Ponant, ce sont leurs gens : ce site sert à te les faire rencontrer.',
    operatorsCta: 'Rencontrer les Maîtres de l’étal',
    operatorsJoinCta: 'Tu as un étal ? Rejoins-nous',
    weekEyebrow: 'La semaine',
    weekTitle: 'La semaine de la Riviera',
    weekLead: 'Les avis des communes et les prochains marchés typiques, côte à côte.',
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
    liguria: {
      eyebrow: 'Das echte Ligurien',
      title: 'Hier ist das Echte Alltag.',
      beats: [
        { stat: '1.', statLabel: 'Region Italiens bei den Blauen Flaggen 2026', t: 'Das meistausgezeichnete Meer Italiens', d: 'Das Meer, das die Stände duften lässt, sammelt auch Rekorde: 2026 ist Ligurien wieder die Nummer eins bei den Blauen Flaggen. Wer für den Strand kommt, findet den Markt zwei Schritte vom Sonnenschirm.' },
        { stat: 'SV', statLabel: 'die Provinz mit den meisten Borghi', t: 'Das Land der Borghi', d: 'Savona ist die italienische Provinz mit den meisten Borghi: Finalborgo hinter Mauern, Noli, die Republik war, Millesimo mit seiner Brückenturm. Und in jedem Borgo ist der Markttag seit Jahrhunderten der Tag, an dem der Platz lebendig wird.' },
        { stat: '7/7', statLabel: 'Tage: irgendwo ist immer Markt', t: 'Ein Markt, jeden Tag', d: 'Sieben Tage die Woche steht irgendwo zwischen Ventimiglia und Varazze ein Stand. Keine Events: der echte Alltagseinkauf, der Rat, das überlieferte Handwerk.' },
      ],
    },
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
    operatorsTitle: 'Sie warten am Stand auf dich.',
    operatorsLead: 'Um vier Uhr auf, um die beste Kiste auszusuchen. Fünf Generationen hinter demselben Stockfisch. Die kleine Aufmerksamkeit im Beutel und ein paar Worte Französisch für Gäste von der Grenze. Die Märkte des Ponente sind ihre Menschen: diese Seite bringt euch zusammen.',
    operatorsCta: 'Die Meister des Standes kennenlernen',
    operatorsJoinCta: 'Hast du einen Stand? Mach mit',
    weekEyebrow: 'Die Woche',
    weekTitle: 'Die Woche der Riviera',
    weekLead: 'Die Hinweise der Gemeinden und die nächsten typischen Märkte, nebeneinander.',
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
    liguria: {
      eyebrow: 'The real Liguria',
      title: 'Here, authentic is everyday.',
      beats: [
        { stat: '1st', statLabel: 'region in Italy for Blue Flags 2026', t: 'Italy’s most awarded sea', d: 'The sea that scents the stalls is the same one that collects records: in 2026 Liguria is once again first for Blue Flag beaches. Come for the beach — the market is two steps from your umbrella.' },
        { stat: 'SV', statLabel: 'the province with the most villages', t: 'The land of borghi', d: 'Savona is the Italian province with the most historic villages: walled Finalborgo, Noli the former republic, Millesimo with its bridge-tower. And in every village, for centuries, market day is the day the square comes alive.' },
        { stat: '7/7', statLabel: 'days: somewhere a market is always on', t: 'A market, every day', d: 'Seven days a week there’s a stall set up somewhere between Ventimiglia and Varazze. Not events: real everyday shopping, honest advice, a craft handed down.' },
      ],
    },
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
    operatorsTitle: 'They’re waiting at the stall.',
    operatorsLead: 'Up at four to pick the best crate. Five generations behind the same salt cod. A little extra in the bag and a few words of French for those coming down from the border. The Ponente markets are their people: this place exists to introduce you.',
    operatorsCta: 'Meet the Stall Masters',
    operatorsJoinCta: 'Got a stall? Join us',
    weekEyebrow: 'The week',
    weekTitle: 'The Riviera’s week',
    weekLead: 'Town notices and the next typical markets, side by side.',
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
