// Dizionario UI per le pagine fuori-home (zona, comune, tipici, footer, menu).
// Come home.ts: dizionario leggero, niente routing per lingua. I contenuti
// curati (story/descrizioni) sono in lib/markets/*.i18n.ts.
import type { Lang } from './home'

export interface UiDict {
  // navigazione / footer
  navMap: string
  navTipici: string
  navOperators: string
  navCalendar: string
  footerTagline: string
  footerNews: string
  footerEvents: string
  footerJoin: string
  footerCredits: string
  footerContacts: string
  // pagina zona
  zoneBack: string
  zoneComuni: string
  zoneComuniTitle: string
  comuniWord: string
  zoneLocalCalendar: string
  zoneMarketsTitle: string
  zoneFullCalendar: string
  zoneDays: string
  zoneMarketsCount: { one: string; many: string }
  zoneParkingNote: string
  featBanchi: string
  featCalendar: string
  featNews: string
  featWeather: string
  // pagina comune
  comuneLabel: string
  comuneChooseDay: string
  comuneRiviera: string
  comuneAround: string
  comuneAroundLead: string
  comuneNearby: string
  comuneVariableDates: string
  comuneNextDoor: string
  comuneBanchi: string
  comuneNoOperators: string
  comuneDirections: string
  // tipici
  tipiciEyebrow: string
  tipiciTitle: string
  tipiciLead: string
  tipiciCalendarTab: string
  tipiciListTab: string
  tipiciAllZones: string
  tipiciOnlySpecial: string
  tipiciEmptyCalendar: string
  tipiciEmptyList: string
  // varie
  weekdaysLong: string[]
  weekdaysShort: string[]
  monthsLong: string[]
}

export const UI_I18N: Record<Lang, UiDict> = {
  it: {
    navMap: 'Mappa dei mercati',
    navTipici: 'Mercati tipici',
    navOperators: 'I banchi di fiducia',
    navCalendar: 'Calendario eventi',
    footerTagline: 'Guida ai mercati della Riviera dei Fiori.',
    footerNews: 'Notizie',
    footerEvents: 'Eventi',
    footerJoin: 'Aderisci',
    footerCredits: 'Crediti foto',
    footerContacts: 'Contatti',
    zoneBack: 'La Riviera',
    zoneComuni: 'I borghi',
    zoneComuniTitle: 'I comuni della zona',
    comuniWord: 'comuni',
    zoneLocalCalendar: 'Il calendario locale',
    zoneMarketsTitle: 'Mercati di questa zona',
    zoneFullCalendar: 'Calendario completo →',
    zoneDays: 'Giorni',
    zoneMarketsCount: { one: 'mercato', many: 'mercati' },
    zoneParkingNote: 'parcheggi entro 2 km',
    featBanchi: 'Banchi',
    featCalendar: 'Calendario',
    featNews: 'Notizie',
    featWeather: 'Meteo',
    comuneLabel: 'Comune',
    comuneChooseDay: 'Scegli un giorno',
    comuneRiviera: 'Sulla Riviera',
    comuneAround: 'Attorno a',
    comuneAroundLead: 'I mercati dei paesi vicini, a pochi minuti di strada.',
    comuneNearby: 'km',
    comuneVariableDates: 'date variabili',
    comuneNextDoor: 'accanto',
    comuneBanchi: 'Banchi',
    comuneNoOperators: 'Nessun operatore ancora registrato per questo mercato.',
    comuneDirections: 'Indicazioni',
    tipiciEyebrow: 'Oltre le merci varie',
    tipiciTitle: 'Mercati tipici',
    tipiciLead:
      'Antiquariato e collezionismo, produttori e sapori, artigianato: i mercati speciali della Riviera dei Fiori, con le loro ricorrenze — la prima domenica, il terzo sabato, le sere d’estate. Da Ventimiglia a Diano.',
    tipiciCalendarTab: 'Calendario',
    tipiciListTab: 'Tutti i mercati',
    tipiciAllZones: 'Tutte le zone',
    tipiciOnlySpecial: 'Solo ricorrenze speciali (mensili e stagionali)',
    tipiciEmptyCalendar: 'Nessuna ricorrenza speciale nei prossimi 60 giorni con questi filtri.',
    tipiciEmptyList: 'Nessun mercato con questi filtri.',
    weekdaysLong: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
    weekdaysShort: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
    monthsLong: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  },
  fr: {
    navMap: 'Carte des marchés',
    navTipici: 'Marchés typiques',
    navOperators: 'Les étals de confiance',
    navCalendar: 'Calendrier des événements',
    footerTagline: 'Guide des marchés de la Riviera dei Fiori.',
    footerNews: 'Actualités',
    footerEvents: 'Événements',
    footerJoin: 'Adhérer',
    footerCredits: 'Crédits photo',
    footerContacts: 'Contacts',
    zoneBack: 'La Riviera',
    zoneComuni: 'Les bourgs',
    zoneComuniTitle: 'Les communes de la zone',
    comuniWord: 'communes',
    zoneLocalCalendar: 'Le calendrier local',
    zoneMarketsTitle: 'Marchés de cette zone',
    zoneFullCalendar: 'Calendrier complet →',
    zoneDays: 'Jours',
    zoneMarketsCount: { one: 'marché', many: 'marchés' },
    zoneParkingNote: 'parkings à moins de 2 km',
    featBanchi: 'Étals',
    featCalendar: 'Calendrier',
    featNews: 'Actualités',
    featWeather: 'Météo',
    comuneLabel: 'Commune',
    comuneChooseDay: 'Choisis un jour',
    comuneRiviera: 'Sur la Riviera',
    comuneAround: 'Autour de',
    comuneAroundLead: 'Les marchés des villages voisins, à quelques minutes de route.',
    comuneNearby: 'km',
    comuneVariableDates: 'dates variables',
    comuneNextDoor: 'à côté',
    comuneBanchi: 'Étals',
    comuneNoOperators: 'Aucun marchand enregistré pour ce marché pour l’instant.',
    comuneDirections: 'Itinéraire',
    tipiciEyebrow: 'Au-delà du tout-venant',
    tipiciTitle: 'Marchés typiques',
    tipiciLead:
      'Antiquités et collection, producteurs et saveurs, artisanat : les marchés spéciaux de la Riviera dei Fiori, avec leurs récurrences — le premier dimanche, le troisième samedi, les soirs d’été. De Vintimille à Diano.',
    tipiciCalendarTab: 'Calendrier',
    tipiciListTab: 'Tous les marchés',
    tipiciAllZones: 'Toutes les zones',
    tipiciOnlySpecial: 'Seulement les récurrences spéciales (mensuelles et saisonnières)',
    tipiciEmptyCalendar: 'Aucune récurrence spéciale dans les 60 prochains jours avec ces filtres.',
    tipiciEmptyList: 'Aucun marché avec ces filtres.',
    weekdaysLong: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    weekdaysShort: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'],
    monthsLong: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  },
  de: {
    navMap: 'Karte der Märkte',
    navTipici: 'Typische Märkte',
    navOperators: 'Die Stände des Vertrauens',
    navCalendar: 'Veranstaltungskalender',
    footerTagline: 'Führer zu den Märkten der Riviera dei Fiori.',
    footerNews: 'Nachrichten',
    footerEvents: 'Termine',
    footerJoin: 'Mitmachen',
    footerCredits: 'Fotonachweise',
    footerContacts: 'Kontakt',
    zoneBack: 'Die Riviera',
    zoneComuni: 'Die Dörfer',
    zoneComuniTitle: 'Die Gemeinden der Zone',
    comuniWord: 'Gemeinden',
    zoneLocalCalendar: 'Der lokale Kalender',
    zoneMarketsTitle: 'Märkte dieser Zone',
    zoneFullCalendar: 'Vollständiger Kalender →',
    zoneDays: 'Tage',
    zoneMarketsCount: { one: 'Markt', many: 'Märkte' },
    zoneParkingNote: 'Parkplätze innerhalb von 2 km',
    featBanchi: 'Stände',
    featCalendar: 'Kalender',
    featNews: 'Nachrichten',
    featWeather: 'Wetter',
    comuneLabel: 'Gemeinde',
    comuneChooseDay: 'Wähle einen Tag',
    comuneRiviera: 'An der Riviera',
    comuneAround: 'Rund um',
    comuneAroundLead: 'Die Märkte der Nachbarorte, wenige Minuten entfernt.',
    comuneNearby: 'km',
    comuneVariableDates: 'wechselnde Termine',
    comuneNextDoor: 'nebenan',
    comuneBanchi: 'Stände',
    comuneNoOperators: 'Für diesen Markt sind noch keine Händler registriert.',
    comuneDirections: 'Route',
    tipiciEyebrow: 'Mehr als Allerlei',
    tipiciTitle: 'Typische Märkte',
    tipiciLead:
      'Antiquitäten und Sammlerstücke, Erzeuger und Spezialitäten, Handwerk: die besonderen Märkte der Riviera dei Fiori mit ihren Terminen — erster Sonntag, dritter Samstag, Sommerabende. Von Ventimiglia bis Diano.',
    tipiciCalendarTab: 'Kalender',
    tipiciListTab: 'Alle Märkte',
    tipiciAllZones: 'Alle Zonen',
    tipiciOnlySpecial: 'Nur besondere Termine (monatlich und saisonal)',
    tipiciEmptyCalendar: 'Keine besonderen Termine in den nächsten 60 Tagen mit diesen Filtern.',
    tipiciEmptyList: 'Kein Markt mit diesen Filtern.',
    weekdaysLong: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    monthsLong: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  },
  en: {
    navMap: 'Market map',
    navTipici: 'Typical markets',
    navOperators: 'The trusted stalls',
    navCalendar: 'Events calendar',
    footerTagline: 'Guide to the markets of the Riviera dei Fiori.',
    footerNews: 'News',
    footerEvents: 'Events',
    footerJoin: 'Join us',
    footerCredits: 'Photo credits',
    footerContacts: 'Contacts',
    zoneBack: 'The Riviera',
    zoneComuni: 'The villages',
    zoneComuniTitle: 'The towns of this area',
    comuniWord: 'towns',
    zoneLocalCalendar: 'The local calendar',
    zoneMarketsTitle: 'Markets in this area',
    zoneFullCalendar: 'Full calendar →',
    zoneDays: 'Days',
    zoneMarketsCount: { one: 'market', many: 'markets' },
    zoneParkingNote: 'parking within 2 km',
    featBanchi: 'Stalls',
    featCalendar: 'Calendar',
    featNews: 'News',
    featWeather: 'Weather',
    comuneLabel: 'Town',
    comuneChooseDay: 'Pick a day',
    comuneRiviera: 'On the Riviera',
    comuneAround: 'Around',
    comuneAroundLead: 'The markets of the neighbouring villages, a few minutes away.',
    comuneNearby: 'km',
    comuneVariableDates: 'variable dates',
    comuneNextDoor: 'next door',
    comuneBanchi: 'Stalls',
    comuneNoOperators: 'No vendors registered for this market yet.',
    comuneDirections: 'Directions',
    tipiciEyebrow: 'Beyond the everyday market',
    tipiciTitle: 'Typical markets',
    tipiciLead:
      'Antiques and collectables, growers and flavours, crafts: the special markets of the Riviera dei Fiori with their recurrences — first Sunday, third Saturday, summer evenings. From Ventimiglia to Diano.',
    tipiciCalendarTab: 'Calendar',
    tipiciListTab: 'All markets',
    tipiciAllZones: 'All areas',
    tipiciOnlySpecial: 'Only special recurrences (monthly and seasonal)',
    tipiciEmptyCalendar: 'No special dates in the next 60 days with these filters.',
    tipiciEmptyList: 'No market with these filters.',
    weekdaysLong: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
}
