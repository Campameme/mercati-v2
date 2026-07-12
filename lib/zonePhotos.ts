// Selezione fotografica curata delle zone e dei borghi del Ponente
// (province di Imperia e Savona). Ogni foto è stata scelta e verificata
// una per una perché rappresenti DAVVERO quel borgo o quel tratto di
// costa — niente immagini a caso da API. File locali in public/zone/,
// provenienza Wikimedia Commons con licenze libere: i crediti completi
// sono in PHOTO_CREDITS (pagina /crediti).

export interface CuratedPhoto {
  /** percorso locale (public/) */
  src: string
  alt: string
  /** nome file su Wikimedia Commons */
  file: string
  artist: string
  license: string
  /** pagina della foto su Commons */
  url: string
}

const PHOTOS: Record<string, CuratedPhoto> = {
  'sanremo': {
    src: '/zone/sanremo.jpg',
    alt: 'Sanremo dalla Madonna della Costa: i tetti, il porto e il mare',
    file: 'Sanremmu-Panuràmma daa Madònna da Còsta 01.jpg',
    artist: 'Arbenganese',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Sanremmu-Panur%C3%A0mma_daa_Mad%C3%B2nna_da_C%C3%B2sta_01.jpg',
  },
  'imperia': {
    src: '/zone/imperia.jpg',
    alt: 'Calata Cuneo, il porto di Oneglia a Imperia',
    file: 'Calata Cuneo, porto di Oneglia, Imperia.jpg',
    artist: 'Tony Frisina at Italian Wikipedia',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:Calata_Cuneo,_porto_di_Oneglia,_Imperia.jpg',
  },
  'porto-maurizio': {
    src: '/zone/porto-maurizio.jpg',
    alt: 'Il Borgo Marina di Porto Maurizio, Imperia',
    file: 'Imperia Porto Maurizio-Borgo Marina-IMG 2565.JPG',
    artist: 'Twice25 &amp; Rinina25',
    license: 'CC BY 2.5',
    url: 'https://commons.wikimedia.org/wiki/File:Imperia_Porto_Maurizio-Borgo_Marina-IMG_2565.JPG',
  },
  'oneglia': {
    src: '/zone/oneglia.jpg',
    alt: 'Calata Cuneo, il porto di Oneglia a Imperia',
    file: 'Calata Cuneo, porto di Oneglia, Imperia.jpg',
    artist: 'Tony Frisina at Italian Wikipedia',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:Calata_Cuneo,_porto_di_Oneglia,_Imperia.jpg',
  },
  'ventimiglia': {
    src: '/zone/ventimiglia.jpg',
    alt: 'Un carruggio di Ventimiglia Alta',
    file: '2024-09-22 Ventimiglia Alta 04.jpg',
    artist: 'Alexkom000',
    license: 'CC BY 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:2024-09-22_Ventimiglia_Alta_04.jpg',
  },
  'bordighera': {
    src: '/zone/bordighera.jpg',
    alt: 'Il chiosco della musica sul lungomare di Bordighera',
    file: 'Bordighera Chiosco musica.jpg',
    artist: 'Al*from*Lig',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Bordighera_Chiosco_musica.jpg',
  },
  'ospedaletti': {
    src: '/zone/ospedaletti.jpg',
    alt: 'Ospedaletti vista dal mare',
    file: 'Ospedaletti-panorama.jpg',
    artist: 'Davide Papalini',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Ospedaletti-panorama.jpg',
  },
  'taggia': {
    src: '/zone/taggia.jpg',
    alt: 'Il ponte antico di Taggia sul torrente Argentina',
    file: 'Taggia Ponte Romano 01.JPG',
    artist: 'Laurom',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Taggia_Ponte_Romano_01.JPG',
  },
  'arma-di-taggia': {
    src: '/zone/arma-di-taggia.jpg',
    alt: 'La passeggiata a mare di Arma di Taggia',
    file: 'Arma di taggia IMG 8397a.jpg',
    artist: 'Evelyscher',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Arma_di_taggia_IMG_8397a.jpg',
  },
  'riva-ligure': {
    src: '/zone/riva-ligure.jpg',
    alt: 'La costa di Riva Ligure',
    file: 'Riva Ligure-panorama.jpg',
    artist: 'Davide Papalini',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Riva_Ligure-panorama.jpg',
  },
  'san-lorenzo-al-mare': {
    src: '/zone/san-lorenzo-al-mare.jpg',
    alt: 'San Lorenzo al Mare visto dal mare',
    file: 'Vista di San Lorenzo al mare - panoramio.jpg',
    artist: 'Agenzia Tecnocasa St…',
    license: 'CC BY 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Vista_di_San_Lorenzo_al_mare_-_panoramio.jpg',
  },
  'santo-stefano-al-mare': {
    src: '/zone/santo-stefano-al-mare.jpg',
    alt: 'La chiesa parrocchiale di Santo Stefano al Mare',
    file: 'Santo Stefano al Mare-chiesa santo stefano.jpg',
    artist: 'Davide Papalini',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Santo_Stefano_al_Mare-chiesa_santo_stefano.jpg',
  },
  'cervo': {
    src: '/zone/cervo.jpg',
    alt: 'Il borgo di Cervo illuminato la sera, sul mare',
    file: 'Cervo - Comune di Cervo - il borgo.jpg',
    artist: 'Twentydays',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Cervo_-_Comune_di_Cervo_-_il_borgo.jpg',
  },
  'diano-marina': {
    src: '/zone/diano-marina.jpg',
    alt: 'La spiaggia di Diano Marina',
    file: 'Diano-marina-italy.jpg',
    artist: 'User Wx8',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:Diano-marina-italy.jpg',
  },
  'san-bartolomeo-al-mare': {
    src: '/zone/san-bartolomeo-al-mare.jpg',
    alt: 'La spiaggia di San Bartolomeo al Mare',
    file: 'San Bartolomeo Al Mare.jpg',
    artist: 'Stijnsation',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:San_Bartolomeo_Al_Mare.jpg',
  },
  'camporosso': {
    src: '/zone/camporosso.jpg',
    alt: 'La spiaggia di Camporosso Mare, alla foce del Nervia',
    file: 'E5955-Camporosso-Vallecrosia.jpg',
    artist: 'User:Vmenkov',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:E5955-Camporosso-Vallecrosia.jpg',
  },
  'vallecrosia': {
    src: '/zone/vallecrosia.jpg',
    alt: 'Vallecrosia Alta tra gli orti della Val Nervia',
    file: 'Vallecrosia Alta 2016 abc3.jpg',
    artist: 'Patafisik',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Vallecrosia_Alta_2016_abc3.jpg',
  },
  'perinaldo': {
    src: '/zone/perinaldo.jpg',
    alt: 'Perinaldo, il borgo di Cassini, sul crinale',
    file: 'Perinaldo-panorama.JPG',
    artist: 'Davide Papalini',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Perinaldo-panorama.JPG',
  },
  'pieve-di-teco': {
    src: '/zone/pieve-di-teco.jpg',
    alt: 'I portici medievali di Pieve di Teco',
    file: 'Pieve di Teco-IMG 0812.JPG',
    artist: 'Davide Papalini',
    license: 'CC BY 2.5',
    url: 'https://commons.wikimedia.org/wiki/File:Pieve_di_Teco-IMG_0812.JPG',
  },
  'pontedassio': {
    src: '/zone/pontedassio.jpg',
    alt: 'Pontedassio, nella valle Impero',
    file: 'Pontedassio-IMG 0772.JPG',
    artist: 'Davide Papalini',
    license: 'CC BY 2.5',
    url: 'https://commons.wikimedia.org/wiki/File:Pontedassio-IMG_0772.JPG',
  },
  'colle-di-nava': {
    src: '/zone/colle-di-nava.jpg',
    alt: 'Il Forte Centrale al Colle di Nava',
    file: 'Pornassio - Forte Centrale.jpeg',
    artist: 'Doppiavu2v',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Pornassio_-_Forte_Centrale.jpeg',
  },
  'vita-mercato-ventimiglia': {
    src: '/zone/vita-mercato-ventimiglia.jpg',
    alt: 'Il mercato del venerdì a Ventimiglia, con la città alta alle spalle',
    file: 'Market of Vintimiglia.jpg',
    artist: 'Tangopaso',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:Market_of_Vintimiglia.jpg',
  },
  'vita-banco-verdure': {
    src: '/zone/vita-banco-verdure.jpg',
    alt: 'Un banco di verdure al mercato, tra venditore e clienti',
    file: '--quanti skei?-- (41167411811).jpg',
    artist: 'istolethetv',
    license: 'CC BY 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:--quanti_skei%3F--_(41167411811).jpg',
  },
  'vita-fiori-sanremo-1962': {
    src: '/zone/vita-fiori-sanremo-1962.jpg',
    alt: 'Il mercato dei fiori di Sanremo nel 1962',
    file: 'Photo Flower market in Sanremo 1962 - Touring Club Italiano 1.3390.jpg',
    artist: 'Autore sconosciuto (Touring Club Italiano)',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Photo_Flower_market_in_Sanremo_1962_-_Touring_Club_Italiano_1.3390.jpg',
  },
  'vita-sapori': {
    src: '/zone/vita-sapori.jpg',
    alt: 'Cestini di sapori su un banco di mercato',
    file: 'Fruit at Mercato Centrale.jpg',
    artist: 'Brian & Jaclyn Drum',
    license: 'CC BY 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:Fruit_at_Mercato_Centrale.jpg',
  },
  'vita-piazza-mercato-sanremo-1880': {
    src: '/zone/vita-piazza-mercato-sanremo-1880.jpg',
    alt: 'Sanremo, la piazza del mercato a fine Ottocento',
    file: 'Brogi, Carlo (1850-1925) - n. 8735 - Sanremo - Piazza del Mercato.png',
    artist: 'Carlo Brogi (Edizioni Brogi)',
    license: 'Pubblico dominio',
    url: 'https://commons.wikimedia.org/wiki/File:Brogi,_Carlo_(1850-1925)_-_n._8735_-_Sanremo_-_Piazza_del_Mercato.png',
  },
  'vita-mercato-coperto-ventimiglia': {
    src: '/zone/vita-mercato-coperto-ventimiglia.jpg',
    alt: 'L’interno del mercato coperto di Ventimiglia',
    file: 'Interno del mercato di XXmiglia.jpg',
    artist: 'Flickr (via Wikimedia Commons)',
    license: 'CC BY-SA 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:Interno_del_mercato_di_XXmiglia.jpg',
  },
}

// Alias: nomi alternativi con cui i luoghi arrivano dalle query (comuni dal
// DB, frazioni, diciture estese). Normalizzati come le chiavi.
const ALIASES: Record<string, string> = {
  'pornassio': 'colle-di-nava',
  'colle-di-nava-pornassio': 'colle-di-nava',
  'sanremo-centro': 'sanremo',
}

function normalize(q: string): string {
  return q
    .toLowerCase()
    .normalize('NFD')
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Foto curata per un luogo (nome comune/borgo o chiave), se esiste. */
export function curatedPhoto(query: string): CuratedPhoto | null {
  const k = normalize(query)
  return PHOTOS[ALIASES[k] ?? k] ?? null
}

/** Elenco crediti (deduplicato per file) per la pagina /crediti. */
export const PHOTO_CREDITS: CuratedPhoto[] = Object.values(
  Object.fromEntries(Object.values(PHOTOS).map((p) => [p.file, p])),
)
