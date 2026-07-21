// Fonti macchina-leggibili (RSS) delle notizie ufficiali dei comuni della
// provincia di Imperia con mercato. Ogni URL è stato verificato con una fetch
// reale il 2026-07-21 (risposta 200 + item presenti, certificato TLS valido).
//
// Piattaforme incontrate:
// - Siscom (ASP.NET): endpoint /RSSNews (Taggia, Riva Ligure, Santo Stefano,
//   San Lorenzo, Perinaldo).
// - Municipium / Design Comuni "/it": endpoint /it/news/feed, espone solo le
//   ultime 5 news (Sanremo, Imperia, Pontedassio).
// - WordPress "Design Comuni" PNRR: feed del post type `notizia`
//   (Camporosso, San Bartolomeo) o feed classico /feed/ (Pieve di Teco).
// - ComWeb ePublic: /it-it/feed-rss/avvisi-novita (Ventimiglia).
// - OpenCity/OpenPA (eZ): /rss/feed/news (Bordighera).
// - Drupal: /rss.xml (Diano Marina) · statico: /home/novita.rss (Cervo).
//
// Ospedaletti: il sito è un WordPress PNRR appena installato, senza notizie né
// feed funzionante → feedUrl null, resta solo il link statico alla bacheca.
//
// NB: i domini "storici" perinaldo.it, rivaligure.it e cervo.it NON sono i siti
// istituzionali (portali terzi o parking): qui usiamo i domini ufficiali
// comune.<nome>.im.it.

export interface ComuneFeed {
  /** Nome del comune come mostrato nelle card */
  comune: string
  /** URL del feed verificato; null = nessuna fonte macchina-leggibile */
  feedUrl: string | null
  /** Formato della fonte (solo rss al momento; atom previsto dal parser) */
  tipo: 'rss' | 'atom' | null
  /** Homepage istituzionale (per attribuzione/fallback) */
  homepage: string
  /** Annotazioni utili alla manutenzione */
  nota?: string
}

export const COMUNI_FEEDS: ComuneFeed[] = [
  {
    comune: 'Ventimiglia',
    feedUrl: 'https://www.comune.ventimiglia.im.it/it-it/feed-rss/avvisi-novita',
    tipo: 'rss',
    homepage: 'https://www.comune.ventimiglia.im.it',
    nota: 'ComWeb ePublic; esiste anche /it-it/feed-rss/ordinanze',
  },
  {
    comune: 'Camporosso',
    feedUrl: 'https://comune.camporosso.im.it/?post_type=notizia&feed=rss2',
    tipo: 'rss',
    homepage: 'https://comune.camporosso.im.it',
    nota: 'WordPress Design Comuni: il feed classico /feed/ è vuoto, le news sono nel post type `notizia`',
  },
  {
    comune: 'Perinaldo',
    feedUrl: 'https://comune.perinaldo.im.it/RSSNews',
    tipo: 'rss',
    homepage: 'https://comune.perinaldo.im.it',
    nota: 'Siscom; perinaldo.it NON è il sito istituzionale',
  },
  {
    comune: 'Bordighera',
    feedUrl: 'https://www.comune.bordighera.im.it/rss/feed/news',
    tipo: 'rss',
    homepage: 'https://www.comune.bordighera.im.it',
    nota: 'OpenCity/OpenPA (eZ); il feed unisce notizie, avvisi e comunicati',
  },
  {
    comune: 'Ospedaletti',
    feedUrl: null,
    tipo: null,
    homepage: 'https://www.comune.ospedaletti.im.it',
    nota: 'WordPress PNRR appena installato: nessuna notizia pubblicata, feed che rimanda alla homepage',
  },
  {
    comune: 'Sanremo',
    feedUrl: 'https://www.comune.sanremo.im.it/it/news/feed',
    tipo: 'rss',
    homepage: 'https://www.comune.sanremo.im.it',
    nota: 'Municipium: il feed espone solo le ultime 5 news',
  },
  {
    comune: 'Taggia',
    feedUrl: 'https://www.comune.taggia.im.it/RSSNews',
    tipo: 'rss',
    homepage: 'https://www.comune.taggia.im.it',
    nota: 'Siscom',
  },
  {
    comune: 'Riva Ligure',
    feedUrl: 'https://comune.rivaligure.im.it/RSSNews',
    tipo: 'rss',
    homepage: 'https://comune.rivaligure.im.it',
    nota: 'Siscom; rivaligure.it NON è il sito istituzionale',
  },
  {
    comune: 'Santo Stefano al Mare',
    feedUrl: 'https://comune.santostefanoalmare.im.it/RSSNews',
    tipo: 'rss',
    homepage: 'https://comune.santostefanoalmare.im.it',
    nota: 'Siscom',
  },
  {
    comune: 'San Lorenzo al Mare',
    feedUrl: 'https://comune.sanlorenzoalmare.im.it/RSSNews',
    tipo: 'rss',
    homepage: 'https://comune.sanlorenzoalmare.im.it',
    nota: 'Siscom',
  },
  {
    comune: 'Imperia',
    feedUrl: 'https://comune.imperia.it/it/news/feed',
    tipo: 'rss',
    homepage: 'https://comune.imperia.it',
    nota: 'Municipium: il feed espone solo le ultime 5 news',
  },
  {
    comune: 'Diano Marina',
    feedUrl: 'https://www.comune.dianomarina.im.it/rss.xml',
    tipo: 'rss',
    homepage: 'https://www.comune.dianomarina.im.it',
    nota: 'Drupal',
  },
  {
    comune: 'San Bartolomeo al Mare',
    feedUrl: 'https://www.comune.sanbartolomeoalmare.im.it/?post_type=notizia&feed=rss2',
    tipo: 'rss',
    homepage: 'https://www.comune.sanbartolomeoalmare.im.it',
    nota: 'WordPress Design Comuni: le news sono nel post type `notizia`',
  },
  {
    comune: 'Cervo',
    feedUrl: 'https://www.comune.cervo.im.it/home/novita.rss',
    tipo: 'rss',
    homepage: 'https://www.comune.cervo.im.it',
    nota: 'Feed della pagina novità; cervo.it è un dominio parking, NON il comune',
  },
  {
    comune: 'Pieve di Teco',
    feedUrl: 'https://www.comune.pievediteco.im.it/wp/feed/',
    tipo: 'rss',
    homepage: 'https://www.comune.pievediteco.im.it/wp/',
    nota: 'WordPress classico, articoli = notizie',
  },
  {
    comune: 'Pontedassio',
    feedUrl: 'https://comune.pontedassio.im.it/it/news/feed',
    tipo: 'rss',
    homepage: 'https://comune.pontedassio.im.it',
    nota: 'Municipium: il feed espone solo le ultime 5 news',
  },
]
