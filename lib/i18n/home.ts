// i18n leggero per la home mappa-centrica (chrome multilingua).
// Volutamente NON usiamo next-i18next/routing: per la v1 basta un dizionario
// client-side per le 4 lingue del pubblico (IT/FR/DE/EN). I contenuti dei
// banchi restano nella lingua del dato; qui traduciamo solo l'interfaccia.

export type Lang = 'it' | 'fr' | 'de' | 'en'

export const LANGS: Lang[] = ['it', 'fr', 'de', 'en']

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
}

export const HOME_I18N: Record<Lang, HomeDict> = {
  it: {
    tagline: 'prodotti autentici · cura · affidabilità',
    hint: 'Tocca un mercato sulla mappa',
    introTitle: 'I mercati della provincia di Imperia, su una mappa.',
    introText: 'Dove e quando si tengono, chi c’è al banco, dove parcheggiare. Scegli una zona o tocca un mercato.',
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
    searchPlaceholder: 'Cerca un luogo o un ambulante…',
    results: 'Risultati',
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
  },
  fr: {
    tagline: 'produits authentiques · soin · fiabilité',
    hint: 'Touchez un marché sur la carte',
    introTitle: 'Les marchés de la province d’Imperia, sur une carte.',
    introText: 'Où et quand, qui tient l’étal, où se garer. Choisissez une zone ou touchez un marché.',
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
    searchPlaceholder: 'Cherchez un lieu ou un marchand…',
    results: 'Résultats',
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
  },
  de: {
    tagline: 'echte Produkte · Sorgfalt · Verlässlichkeit',
    hint: 'Tippe auf einen Markt auf der Karte',
    introTitle: 'Die Märkte der Provinz Imperia, auf einer Karte.',
    introText: 'Wo und wann, wer am Stand steht, wo man parkt. Wähle eine Zone oder tippe auf einen Markt.',
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
    searchPlaceholder: 'Ort oder Händler suchen…',
    results: 'Ergebnisse',
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
  },
  en: {
    tagline: 'authentic produce · care · reliability',
    hint: 'Tap a market on the map',
    introTitle: 'The markets of the Imperia province, on a map.',
    introText: 'Where and when, who’s at the stall, where to park. Pick a zone or tap a market.',
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
    searchPlaceholder: 'Search a place or a vendor…',
    results: 'Results',
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
