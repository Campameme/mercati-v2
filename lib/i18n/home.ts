// i18n leggero per la home mappa-centrica (chrome multilingua).
// Volutamente NON usiamo next-i18next/routing: per la v1 basta un dizionario
// client-side per le 4 lingue del pubblico (IT/FR/DE/EN). I contenuti dei
// banchi restano nella lingua del dato; qui traduciamo solo l'interfaccia.

export type Lang = 'it' | 'fr' | 'de' | 'en'

export const LANGS: Lang[] = ['it', 'fr', 'de', 'en']

export interface StoryPillar {
  t: string
  d: string
}

export interface HomeDict {
  tagline: string
  hint: string
  introTitle: string
  introText: string
  zonesLabel: string
  allZones: string
  operatorsLink: string
  whatsapp: string
  filters: { all: string; today: string; open: string }
  nowLabel: string
  openSuffix: string
  noneOpen: string
  daysHours: string
  whatToFind: string
  operators: string
  parking: string
  searchPlaceholder: string
  results: string
  seeOnMap: string
  noResults: string
  list: string
  youAreHere: string
  locate: string
  details: string
  openUntil: string
  opensAt: string
  closedToday: string
  hoursUnknown: string
  directions: string
  noOperators: string
  parkingUnavailable: string
  noParking: string
  loading: string
  stall: string
  away: string
  crowd: Record<'empty' | 'low' | 'medium' | 'high' | 'full', string>
  // --- nuovi (filtri tipologia/zona, lista, ricerca, storia, zone) ---
  filterType: string
  filterZone: string
  allTypes: string
  sortLabel: string
  sortAZ: string
  sortNear: string
  listEmpty: string
  exploreCta: string
  whyShown: string
  fullCard: string
  freeParking: string
  paidParking: string
  story: { eyebrow: string; title: string; lead: string; pillars: StoryPillar[]; quote: string; quoteSource: string }
  zones: { eyebrow: string; title: string; lead: string; markets: string }
}

export const HOME_I18N: Record<Lang, HomeDict> = {
  it: {
    tagline: 'prodotti autentici · cura · affidabilità',
    hint: 'Tocca un mercato sulla mappa',
    introTitle: 'Tutti i mercati della Riviera dei Fiori, su una mappa.',
    introText: 'Da Ventimiglia a Diano: dove e quando si tengono, chi c’è al banco, dove parcheggiare. Tocca un mercato per aprirlo.',
    zonesLabel: 'Cerca per zona',
    allZones: 'Tutta la provincia',
    operatorsLink: 'Gli ambulanti',
    whatsapp: 'WhatsApp',
    filters: { all: 'Tutti', today: 'Oggi', open: 'Aperti ora' },
    nowLabel: 'Sono le',
    openSuffix: 'aperti adesso',
    noneOpen: 'nessuno aperto ora',
    daysHours: 'Giorni e orari',
    whatToFind: 'Cosa trovi',
    operators: 'Banchi e operatori',
    parking: 'Parcheggi vicini',
    searchPlaceholder: 'Cerca: mercato, artigianato, una zona, un ambulante…',
    results: 'Risultati',
    seeOnMap: 'Vedi su mappa',
    noResults: 'Nessun risultato',
    list: 'Mercati',
    youAreHere: 'Sei qui',
    locate: 'La mia posizione',
    details: 'Dettagli',
    openUntil: 'Aperto fino alle',
    opensAt: 'Apre alle',
    closedToday: 'Oggi chiuso',
    hoursUnknown: 'Orari da verificare',
    directions: 'Portami qui',
    noOperators: 'Operatori in aggiornamento',
    parkingUnavailable: 'Parcheggi non disponibili al momento',
    noParking: 'Nessun parcheggio nelle vicinanze',
    loading: 'Carico…',
    stall: 'Banco',
    away: 'di distanza',
    crowd: { empty: 'libero', low: 'poco pieno', medium: 'medio', high: 'pieno', full: 'pienissimo' },
    filterType: 'Tipologia',
    filterZone: 'Zona',
    allTypes: 'Tutte le tipologie',
    sortLabel: 'Ordina',
    sortAZ: 'A → Z',
    sortNear: 'Più vicini',
    listEmpty: 'Nessun mercato con questi filtri',
    exploreCta: 'Esplora la mappa',
    whyShown: 'Perché compare',
    fullCard: 'Scheda completa',
    freeParking: 'gratuito',
    paidParking: 'a pagamento',
    story: {
      eyebrow: 'La storia, quella vera',
      title: 'Una corda tesa tra il mare e i monti',
      lead: 'Prima di essere “Riviera dei Fiori”, questa costa era una rete di mulattiere lungo cui il sale del mare risaliva verso il Piemonte e ne tornava carico di grano e formaggi. Ogni mercato di queste valli è un nodo di quella corda antica.',
      pillars: [
        { t: 'La Via del Sale', d: 'Dai porti del Ponente al Colle di Nava: per secoli muli carichi di sale, olio e pesce hanno legato il mare all’entroterra. I mercati nascono lì, dove la valle scendeva e la costa saliva.' },
        { t: 'Il venerdì di Ventimiglia', d: 'Il mercato all’aperto più grande della Liguria, da sempre transfrontaliero: i francesi della Costa Azzurra scendono a fare la spesa e ai banchi si risponde in francese perfetto.' },
        { t: 'Le città mercatali', d: 'Pieve di Teco non è un borgo con un mercato: è un mercato diventato borgo. Sotto i portici cinquecenteschi, l’ultima domenica del mese, l’antiquariato continua un gesto vecchio di ottocento anni.' },
      ],
      quote: '«Aiga ae corde!» — il grido in dialetto che dal 1586 porta in Vaticano le palme bianche di Bordighera.',
      quoteSource: 'Tradizione del Ponente ligure',
    },
    zones: { eyebrow: 'Le zone', title: 'Otto zone, una Riviera sola', lead: 'Dalla frontiera francese alle valli dell’entroterra: scegli una zona per vedere i suoi borghi e i suoi mercati.', markets: 'mercati' },
  },
  fr: {
    tagline: 'produits authentiques · soin · fiabilité',
    hint: 'Touchez un marché sur la carte',
    introTitle: 'Tous les marchés du Ponant, sur une carte.',
    introText: 'De Vintimille à Diano : où et quand, qui tient l’étal, où se garer. Touchez un marché pour l’ouvrir.',
    zonesLabel: 'Rechercher par zone',
    allZones: 'Toute la province',
    operatorsLink: 'Les marchands',
    whatsapp: 'WhatsApp',
    filters: { all: 'Tous', today: 'Aujourd’hui', open: 'Ouverts' },
    nowLabel: 'Il est',
    openSuffix: 'ouverts maintenant',
    noneOpen: 'aucun ouvert maintenant',
    daysHours: 'Jours et horaires',
    whatToFind: 'Ce qu’on y trouve',
    operators: 'Étals et marchands',
    parking: 'Parkings proches',
    searchPlaceholder: 'Cherchez : marché, artisanat, une zone, un marchand…',
    results: 'Résultats',
    seeOnMap: 'Voir sur la carte',
    noResults: 'Aucun résultat',
    list: 'Marchés',
    youAreHere: 'Vous êtes ici',
    locate: 'Ma position',
    details: 'Détails',
    openUntil: 'Ouvert jusqu’à',
    opensAt: 'Ouvre à',
    closedToday: 'Fermé aujourd’hui',
    hoursUnknown: 'Horaires à vérifier',
    directions: 'M’y emmener',
    noOperators: 'Marchands en cours de mise à jour',
    parkingUnavailable: 'Parkings indisponibles pour le moment',
    noParking: 'Aucun parking à proximité',
    loading: 'Chargement…',
    stall: 'Étal',
    away: 'de distance',
    crowd: { empty: 'libre', low: 'peu rempli', medium: 'moyen', high: 'rempli', full: 'complet' },
    filterType: 'Type',
    filterZone: 'Zone',
    allTypes: 'Tous les types',
    sortLabel: 'Trier',
    sortAZ: 'A → Z',
    sortNear: 'Les plus proches',
    listEmpty: 'Aucun marché avec ces filtres',
    exploreCta: 'Explorer la carte',
    whyShown: 'Pourquoi ce résultat',
    fullCard: 'Fiche complète',
    freeParking: 'gratuit',
    paidParking: 'payant',
    story: {
      eyebrow: 'L’histoire, la vraie',
      title: 'Une corde tendue entre la mer et les monts',
      lead: 'Avant d’être la « Riviera des Fleurs », cette côte était un réseau de chemins muletiers : le sel de la mer remontait vers le Piémont et redescendait chargé de blé et de fromages. Chaque marché de ces vallées est un nœud de cette corde ancienne.',
      pillars: [
        { t: 'La Route du Sel', d: 'Des ports du Ponant au Col de Nava : pendant des siècles, des mulets chargés de sel, d’huile et de poisson ont relié la mer à l’arrière-pays. Les marchés sont nés là.' },
        { t: 'Le vendredi de Vintimille', d: 'Le plus grand marché en plein air de Ligurie, transfrontalier depuis toujours : les Français de la Côte d’Azur viennent y faire leurs courses, et l’on répond en français parfait.' },
        { t: 'Les villes-marchés', d: 'Pieve di Teco n’est pas un bourg avec un marché : c’est un marché devenu bourg. Sous les arcades du XVIᵉ, le dernier dimanche du mois, l’antiquité perpétue un geste vieux de huit siècles.' },
      ],
      quote: '« Aiga ae corde ! » — le cri en dialecte qui, depuis 1586, porte au Vatican les palmes blanches de Bordighera.',
      quoteSource: 'Tradition du Ponant ligure',
    },
    zones: { eyebrow: 'Les zones', title: 'Huit zones, un seul Ponant', lead: 'De la frontière française aux vallées de l’arrière-pays : choisissez une zone pour voir ses bourgs et ses marchés.', markets: 'marchés' },
  },
  de: {
    tagline: 'echte Produkte · Sorgfalt · Verlässlichkeit',
    hint: 'Tippe auf einen Markt auf der Karte',
    introTitle: 'Alle Märkte der Riviera dei Fiori, auf einer Karte.',
    introText: 'Von Ventimiglia bis Diano: wo und wann, wer am Stand steht, wo man parkt. Tippe auf einen Markt, um ihn zu öffnen.',
    zonesLabel: 'Nach Zone suchen',
    allZones: 'Ganze Provinz',
    operatorsLink: 'Die Händler',
    whatsapp: 'WhatsApp',
    filters: { all: 'Alle', today: 'Heute', open: 'Jetzt offen' },
    nowLabel: 'Es ist',
    openSuffix: 'jetzt offen',
    noneOpen: 'keiner jetzt offen',
    daysHours: 'Tage und Zeiten',
    whatToFind: 'Was du findest',
    operators: 'Stände und Händler',
    parking: 'Parkplätze in der Nähe',
    searchPlaceholder: 'Suche: Markt, Handwerk, eine Zone, einen Händler…',
    results: 'Ergebnisse',
    seeOnMap: 'Auf der Karte',
    noResults: 'Keine Ergebnisse',
    list: 'Märkte',
    youAreHere: 'Du bist hier',
    locate: 'Mein Standort',
    details: 'Details',
    openUntil: 'Offen bis',
    opensAt: 'Öffnet um',
    closedToday: 'Heute geschlossen',
    hoursUnknown: 'Zeiten zu prüfen',
    directions: 'Hinbringen',
    noOperators: 'Händler werden aktualisiert',
    parkingUnavailable: 'Parkplätze momentan nicht verfügbar',
    noParking: 'Kein Parkplatz in der Nähe',
    loading: 'Lädt…',
    stall: 'Stand',
    away: 'entfernt',
    crowd: { empty: 'frei', low: 'wenig voll', medium: 'mittel', high: 'voll', full: 'sehr voll' },
    filterType: 'Art',
    filterZone: 'Zone',
    allTypes: 'Alle Arten',
    sortLabel: 'Sortieren',
    sortAZ: 'A → Z',
    sortNear: 'Am nächsten',
    listEmpty: 'Kein Markt mit diesen Filtern',
    exploreCta: 'Karte erkunden',
    whyShown: 'Warum angezeigt',
    fullCard: 'Vollständige Karte',
    freeParking: 'kostenlos',
    paidParking: 'kostenpflichtig',
    story: {
      eyebrow: 'Die wahre Geschichte',
      title: 'Ein Seil zwischen Meer und Bergen',
      lead: 'Bevor sie „Blumenriviera“ war, war diese Küste ein Netz aus Saumpfaden: Das Salz des Meeres stieg ins Piemont hinauf und kehrte beladen mit Getreide und Käse zurück. Jeder Markt dieser Täler ist ein Knoten in diesem alten Seil.',
      pillars: [
        { t: 'Die Salzstraße', d: 'Von den Häfen des Ponente zum Colle di Nava: Jahrhundertelang verbanden mit Salz, Öl und Fisch beladene Maultiere das Meer mit dem Hinterland. Dort entstanden die Märkte.' },
        { t: 'Der Freitag von Ventimiglia', d: 'Der größte Freiluftmarkt Liguriens, seit jeher grenzüberschreitend: Die Franzosen der Côte d’Azur kommen zum Einkaufen, und an den Ständen antwortet man perfekt auf Französisch.' },
        { t: 'Die Marktstädte', d: 'Pieve di Teco ist kein Dorf mit Markt: Es ist ein Markt, der zum Dorf wurde. Unter den Arkaden aus dem 16. Jh. führt am letzten Sonntag des Monats der Antiquitätenhandel eine 800 Jahre alte Geste fort.' },
      ],
      quote: '„Aiga ae corde!“ — der Ruf im Dialekt, der seit 1586 die weißen Palmen von Bordighera in den Vatikan bringt.',
      quoteSource: 'Tradition des ligurischen Ponente',
    },
    zones: { eyebrow: 'Die Zonen', title: 'Acht Zonen, eine Riviera', lead: 'Von der französischen Grenze bis zu den Tälern des Hinterlandes: Wähle eine Zone, um ihre Dörfer und Märkte zu sehen.', markets: 'Märkte' },
  },
  en: {
    tagline: 'authentic produce · care · reliability',
    hint: 'Tap a market on the map',
    introTitle: 'All the Riviera dei Fiori markets, on one map.',
    introText: 'From Ventimiglia to Diano: where and when, who’s at the stall, where to park. Tap a market to open it.',
    zonesLabel: 'Search by zone',
    allZones: 'Whole province',
    operatorsLink: 'The vendors',
    whatsapp: 'WhatsApp',
    filters: { all: 'All', today: 'Today', open: 'Open now' },
    nowLabel: 'It’s',
    openSuffix: 'open now',
    noneOpen: 'none open now',
    daysHours: 'Days & hours',
    whatToFind: 'What you find',
    operators: 'Stalls and vendors',
    parking: 'Parking nearby',
    searchPlaceholder: 'Search: market, crafts, a zone, a vendor…',
    results: 'Results',
    seeOnMap: 'See on map',
    noResults: 'No results',
    list: 'Markets',
    youAreHere: 'You are here',
    locate: 'My location',
    details: 'Details',
    openUntil: 'Open until',
    opensAt: 'Opens at',
    closedToday: 'Closed today',
    hoursUnknown: 'Hours to confirm',
    directions: 'Take me there',
    noOperators: 'Vendors being updated',
    parkingUnavailable: 'Parking unavailable right now',
    noParking: 'No parking nearby',
    loading: 'Loading…',
    stall: 'Stall',
    away: 'away',
    crowd: { empty: 'empty', low: 'quiet', medium: 'medium', high: 'busy', full: 'full' },
    filterType: 'Type',
    filterZone: 'Zone',
    allTypes: 'All types',
    sortLabel: 'Sort',
    sortAZ: 'A → Z',
    sortNear: 'Nearest',
    listEmpty: 'No market with these filters',
    exploreCta: 'Explore the map',
    whyShown: 'Why it shows',
    fullCard: 'Full page',
    freeParking: 'free',
    paidParking: 'paid',
    story: {
      eyebrow: 'The real story',
      title: 'A rope strung between the sea and the mountains',
      lead: 'Before it was the “Riviera of Flowers”, this coast was a web of mule tracks: sea salt climbed toward Piedmont and came back laden with grain and cheese. Every market in these valleys is a knot in that ancient rope.',
      pillars: [
        { t: 'The Salt Road', d: 'From the Ponente harbours to the Colle di Nava: for centuries mules loaded with salt, oil and fish tied the sea to the hinterland. The markets were born there.' },
        { t: 'Ventimiglia’s Friday', d: 'Liguria’s largest open-air market, cross-border since forever: the French from the Côte d’Azur come to shop, and the stalls answer in perfect French.' },
        { t: 'The market towns', d: 'Pieve di Teco isn’t a town with a market: it’s a market that became a town. Under 16th-century arcades, on the last Sunday of the month, the antiques trade continues a gesture eight centuries old.' },
      ],
      quote: '“Aiga ae corde!” — the dialect cry that since 1586 carries Bordighera’s white palms to the Vatican.',
      quoteSource: 'Western Liguria tradition',
    },
    zones: { eyebrow: 'The areas', title: 'Eight zones, one Riviera', lead: 'From the French border to the inland valleys: pick a zone to see its villages and its markets.', markets: 'markets' },
  },
}

// ---------------------------------------------------------------------------
// Etichette della pagina /mappa in variante "colonna filtri + risultati"
// (stile portale di prenotazione): la mappa si apre solo su richiesta.
// Concetto di copy: i settimanali = l'esperienza autentica della Riviera;
// antiquariato/artigianato = i "mercati d'autore" (il pezzo unico, la nicchia).
// ---------------------------------------------------------------------------

export interface MappaDict {
  /** titolo della colonna filtri */
  refine: string
  /** etichetta del selettore giorno */
  dayLabel: string
  /** opzione "tutti i giorni" del selettore */
  allDays: string
  /** titolo del gruppo tipologie */
  typesTitle: string
  /** gruppo: mercati di ogni settimana (generale + alimentare) */
  weeklyGroup: string
  weeklyHint: string
  /** gruppo: mercati d'autore (antiquariato + artigianato) */
  autoreGroup: string
  autoreHint: string
  /** accesso al calendario dalla colonna filtri */
  openCalendar: string
  /** chiusura del pannello mappa a tutta altezza */
  backToList: string
  /** CTA delle card risultato */
  discover: string
  /** bottone che apre/chiude i filtri secondari su mobile */
  filtersBtn: string
  /** contatore risultati ("12 mercati trovati") */
  found: (n: number) => string
}

export const MAPPA_I18N: Record<Lang, MappaDict> = {
  it: {
    refine: 'Affina la ricerca',
    dayLabel: 'Il giorno',
    allDays: 'Tutti i giorni',
    typesTitle: 'Che mercato cerchi?',
    weeklyGroup: 'Ogni settimana',
    weeklyHint: 'L’esperienza vera della Riviera: la spesa, i banchi, le piazze.',
    autoreGroup: 'Mercati d’autore',
    autoreHint: 'Antiquariato e artigianato: il pezzo unico, non la spesa.',
    openCalendar: 'Vedi il calendario',
    backToList: 'Torna alla lista',
    discover: 'Scopri',
    filtersBtn: 'Filtri',
    found: (n) => `${n} mercat${n === 1 ? 'o' : 'i'} trovat${n === 1 ? 'o' : 'i'}`,
  },
  fr: {
    refine: 'Affinez la recherche',
    dayLabel: 'Le jour',
    allDays: 'Tous les jours',
    typesTitle: 'Quel marché cherchez-vous ?',
    weeklyGroup: 'Chaque semaine',
    weeklyHint: 'L’expérience vraie de la Riviera : les courses, les étals, les places.',
    autoreGroup: 'Marchés d’auteur',
    autoreHint: 'Antiquités et artisanat : la pièce unique, pas les courses.',
    openCalendar: 'Voir le calendrier',
    backToList: 'Retour à la liste',
    discover: 'Découvrir',
    filtersBtn: 'Filtres',
    found: (n) => `${n} marché${n === 1 ? '' : 's'} trouvé${n === 1 ? '' : 's'}`,
  },
  de: {
    refine: 'Suche verfeinern',
    dayLabel: 'Der Tag',
    allDays: 'Alle Tage',
    typesTitle: 'Welchen Markt suchst du?',
    weeklyGroup: 'Jede Woche',
    weeklyHint: 'Das echte Riviera-Erlebnis: Einkauf, Stände, Plätze.',
    autoreGroup: 'Besondere Märkte',
    autoreHint: 'Antiquitäten und Handwerk: das einzelne Stück, nicht der Einkauf.',
    openCalendar: 'Kalender ansehen',
    backToList: 'Zurück zur Liste',
    discover: 'Entdecken',
    filtersBtn: 'Filter',
    found: (n) => `${n} ${n === 1 ? 'Markt' : 'Märkte'} gefunden`,
  },
  en: {
    refine: 'Refine your search',
    dayLabel: 'The day',
    allDays: 'Any day',
    typesTitle: 'What market are you after?',
    weeklyGroup: 'Every week',
    weeklyHint: 'The real Riviera experience: the shopping, the stalls, the squares.',
    autoreGroup: 'Curated markets',
    autoreHint: 'Antiques and crafts: the one-off find, not the groceries.',
    openCalendar: 'See the calendar',
    backToList: 'Back to the list',
    discover: 'Discover',
    filtersBtn: 'Filters',
    found: (n) => `${n} market${n === 1 ? '' : 's'} found`,
  },
}

const CATEGORY_I18N: Record<string, Record<Lang, string>> = {
  food: { it: 'Alimentari', fr: 'Alimentation', de: 'Lebensmittel', en: 'Food' },
  fruit_vegetables: { it: 'Frutta e verdura', fr: 'Fruits et légumes', de: 'Obst & Gemüse', en: 'Fruit & veg' },
  bakery: { it: 'Panetteria', fr: 'Boulangerie', de: 'Bäckerei', en: 'Bakery' },
  meat_fish: { it: 'Carne e pesce', fr: 'Viande et poisson', de: 'Fleisch & Fisch', en: 'Meat & fish' },
  dairy: { it: 'Latticini', fr: 'Produits laitiers', de: 'Milchprodukte', en: 'Dairy' },
  clothing: { it: 'Abbigliamento', fr: 'Vêtements', de: 'Kleidung', en: 'Clothing' },
  accessories: { it: 'Accessori', fr: 'Accessoires', de: 'Accessoires', en: 'Accessories' },
  electronics: { it: 'Elettronica', fr: 'Électronique', de: 'Elektronik', en: 'Electronics' },
  home: { it: 'Casa', fr: 'Maison', de: 'Haushalt', en: 'Home' },
  books: { it: 'Libri', fr: 'Livres', de: 'Bücher', en: 'Books' },
  flowers: { it: 'Fiori', fr: 'Fleurs', de: 'Blumen', en: 'Flowers' },
  other: { it: 'Varie', fr: 'Autres', de: 'Sonstiges', en: 'Other' },
}

/** Etichetta categoria localizzata; fallback alla stringa grezza se sconosciuta. */
export function categoryLabel(category: string | null | undefined, lang: Lang): string {
  if (!category) return ''
  const entry = CATEGORY_I18N[category.toLowerCase()]
  return entry ? entry[lang] : category
}
