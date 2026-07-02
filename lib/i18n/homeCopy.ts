import type { Lang } from './home'

// Copy della home editoriale. Tenuto separato da HomeDict. Voce: prima persona
// plurale, calda, ligure-pop, sensoriale; gli ambulanti = il prodotto.
// Le "qualities" vengono dai colloqui veri con gli ambulanti (docs/operatori_schede_PED):
// gesti reali — il banco che cambia ogni settimana, cinque generazioni di baccalà,
// la sveglia alle 4, il pensierino nel sacchetto — raccontati senza nomi.
// Vedi docs/brand-voice.md.

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
    heroHeadline: 'Il mercato che profuma di mare.',
    heroSubtitle: 'Da oltre 100 anni, la Liguria al mercato. I mercati della Riviera di Ponente.',
    heroScrollCue: 'Scopri',
    heroChips: { today: 'Oggi al mercato', near: 'Vicino a me', saturday: 'Sabato' },
    searchExamples: ['Cerca un prodotto…', 'Cerca un ambulante…', 'Cerca una zona…', 'Cerca un mercato di oggi…', 'Cerca l’artigianato…'],
    exploreMapCta: 'Apri la mappa',
    valueProject: {
      k: 'Il progetto',
      title: 'Tutta la Riviera, in un posto solo.',
      lead: 'I mercati settimanali del Ponente — dalla costa ai borghi dell’entroterra — raccolti in un’unica mappa: dove sono, quando aprono, cosa ci trovi.',
    },
    searchValueEyebrow: 'L’accesso ai mercati',
    searchValueTitle: 'Dimmi cosa cerchi, ti porto al banco giusto',
    searchValueLead: 'Un prodotto, un ambulante, una zona o semplicemente “oggi”: scrivi e ti apriamo la mappa con i mercati che fanno per te — giorni, orari, cosa trovi e come arrivarci.',
    searchCta: 'Cerca sulla mappa',
    valueMarket: {
      k: 'I valori del mercato',
      title: 'Il meglio del Ponente non è la merce: è come te la danno.',
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
    operatorsTitle: 'Gli ambulanti sono il prodotto',
    operatorsLead: 'Dietro ogni banco c’è una storia: chi coltiva, chi sceglie, chi ti conosce per nome. Scopri chi c’è e cosa porta.',
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
    heroHeadline: 'Le marché qui sent la mer.',
    heroSubtitle: 'Depuis plus de 100 ans, la Ligurie au marché. Les marchés de la Riviera di Ponente.',
    heroScrollCue: 'Découvre',
    heroChips: { today: 'Aujourd’hui au marché', near: 'Près de moi', saturday: 'Samedi' },
    searchExamples: ['Cherche un produit…', 'Cherche un marchand…', 'Cherche une zone…', 'Cherche un marché d’aujourd’hui…', 'Cherche l’artisanat…'],
    exploreMapCta: 'Ouvrir la carte',
    valueProject: {
      k: 'Le projet',
      title: 'Toute la Riviera, au même endroit.',
      lead: 'Les marchés hebdomadaires du Ponant — de la côte aux villages de l’arrière-pays — réunis sur une seule carte : où ils sont, quand ils ouvrent, ce qu’on y trouve.',
    },
    searchValueEyebrow: 'L’accès aux marchés',
    searchValueTitle: 'Dis-moi ce que tu cherches, je t’amène au bon étal',
    searchValueLead: 'Un produit, un marchand, une zone ou simplement « aujourd’hui » : écris et on t’ouvre la carte avec les marchés qu’il te faut — jours, horaires, ce qu’on y trouve et comment y arriver.',
    searchCta: 'Chercher sur la carte',
    valueMarket: {
      k: 'Les valeurs du marché',
      title: 'Le meilleur du Ponant, ce n’est pas la marchandise : c’est la façon de la donner.',
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
    operatorsTitle: 'Les marchands sont le produit',
    operatorsLead: 'Derrière chaque étal, une histoire : qui cultive, qui choisit, qui te connaît par ton nom. Découvre qui est là et ce qu’il apporte.',
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
    heroHeadline: 'Der Markt, der nach Meer duftet.',
    heroSubtitle: 'Seit über 100 Jahren: Ligurien auf dem Markt. Die Märkte der Riviera di Ponente.',
    heroScrollCue: 'Entdecke',
    heroChips: { today: 'Heute am Markt', near: 'In meiner Nähe', saturday: 'Samstag' },
    searchExamples: ['Suche ein Produkt…', 'Suche einen Händler…', 'Suche eine Zone…', 'Suche einen Markt heute…', 'Suche Handwerk…'],
    exploreMapCta: 'Karte öffnen',
    valueProject: {
      k: 'Das Projekt',
      title: 'Die ganze Riviera, an einem Ort.',
      lead: 'Die Wochenmärkte des Ponente — von der Küste bis zu den Dörfern des Hinterlands — auf einer einzigen Karte: wo sie sind, wann sie öffnen, was es gibt.',
    },
    searchValueEyebrow: 'Der Zugang zu den Märkten',
    searchValueTitle: 'Sag, was du suchst — ich bring dich zum richtigen Stand',
    searchValueLead: 'Ein Produkt, ein Händler, eine Zone oder einfach „heute“: schreib es, und wir öffnen die Karte mit den passenden Märkten — Tage, Zeiten, was es gibt und wie man hinkommt.',
    searchCta: 'Auf der Karte suchen',
    valueMarket: {
      k: 'Die Werte des Marktes',
      title: 'Das Beste des Ponente ist nicht die Ware: es ist, wie man sie dir gibt.',
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
    operatorsTitle: 'Die Händler sind das Produkt',
    operatorsLead: 'Hinter jedem Stand eine Geschichte: wer anbaut, wer auswählt, wer dich beim Namen kennt. Entdecke, wer da ist und was er mitbringt.',
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
    heroHeadline: 'The market with the scent of the sea.',
    heroSubtitle: 'For over 100 years, Liguria at the market. The markets of the Riviera di Ponente.',
    heroScrollCue: 'Discover',
    heroChips: { today: 'Today at the market', near: 'Near me', saturday: 'Saturday' },
    searchExamples: ['Search a product…', 'Search a vendor…', 'Search an area…', 'Search a market today…', 'Search the crafts…'],
    exploreMapCta: 'Open the map',
    valueProject: {
      k: 'The project',
      title: 'The whole Riviera, in one place.',
      lead: 'The weekly markets of the Ponente — from the coast to the inland villages — gathered on a single map: where they are, when they open, what you’ll find.',
    },
    searchValueEyebrow: 'Getting to the markets',
    searchValueTitle: 'Tell me what you want, I’ll take you to the right stall',
    searchValueLead: 'A product, a vendor, an area or just “today”: type it and we open the map with the markets for you — days, hours, what you’ll find and how to get there.',
    searchCta: 'Search on the map',
    valueMarket: {
      k: 'The market’s values',
      title: 'The best of the Ponente isn’t the goods: it’s how they hand them to you.',
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
    operatorsTitle: 'The vendors are the product',
    operatorsLead: 'Behind every stall a story: who grows, who picks, who knows you by name. Discover who’s there and what they bring.',
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
