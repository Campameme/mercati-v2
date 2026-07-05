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
  'andora': {
    src: '/zone/andora.jpg',
    alt: 'La baia di Andora verso Capo Mele',
    file: 'Andora-panorama (2).JPG',
    artist: 'Riky_Volpe',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:Andora-panorama_(2).JPG',
  },
  'laigueglia': {
    src: '/zone/laigueglia.jpg',
    alt: 'La baia di Laigueglia con le case colorate sul mare',
    file: 'Laigueglia view.jpg',
    artist: 'Amstead23',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Laigueglia_view.jpg',
  },
  'alassio': {
    src: '/zone/alassio.jpg',
    alt: 'La spiaggia di Alassio con l’isola Gallinara sullo sfondo',
    file: 'Alassio spiaggia 2013.jpg',
    artist: 'Incola',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Alassio_spiaggia_2013.jpg',
  },
  'albenga': {
    src: '/zone/albenga.jpg',
    alt: 'La cattedrale di San Michele e le torri medievali di Albenga',
    file: 'Albenga - Kathedrale San Michele Arcangelo - Domplatz 1, August 2019.jpg',
    artist: 'Mediatus',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Albenga_-_Kathedrale_San_Michele_Arcangelo_-_Domplatz_1,_August_2019.jpg',
  },
  'loano': {
    src: '/zone/loano.jpg',
    alt: 'La passeggiata a mare di Loano',
    file: 'Loano verso Pietra Ligure.jpg',
    artist: 'Al*from*Lig',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Loano_verso_Pietra_Ligure.jpg',
  },
  'pietra-ligure': {
    src: '/zone/pietra-ligure.jpg',
    alt: 'Pietra Ligure e il promontorio della Caprazoppa',
    file: 'Pietra Ligure SV (panorama) - panoramio.jpg',
    artist: 'Stefano Mazzone',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Pietra_Ligure_SV_(panorama)_-_panoramio.jpg',
  },
  'finale-ligure': {
    src: '/zone/finale-ligure.jpg',
    alt: 'Finalborgo visto dal castello, con il mare in fondo alla valle',
    file: 'Finalborgo dal castello.jpg',
    artist: 'Davide Mauro',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Finalborgo_dal_castello.jpg',
  },
  'noli': {
    src: '/zone/noli.jpg',
    alt: 'La baia di Noli con il castello di Monte Ursino',
    file: 'Panorama di Noli.JPG',
    artist: 'Giorgiosantin',
    license: 'Public domain',
    url: 'https://commons.wikimedia.org/wiki/File:Panorama_di_Noli.JPG',
  },
  'savona': {
    src: '/zone/savona.jpg',
    alt: 'La torre Leon Pancaldo sulla vecchia darsena di Savona',
    file: 'Savona - Torre Leon Pancaldo (1).jpg',
    artist: 'raffaele sergi',
    license: 'CC BY 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:Savona_-_Torre_Leon_Pancaldo_(1).jpg',
  },
  'albissola-marina': {
    src: '/zone/albissola-marina.jpg',
    alt: 'Il mosaico del Lungomare degli Artisti ad Albissola Marina',
    file: 'Albissola Marina-IMG 1507.JPG',
    artist: 'Davide Papalini',
    license: 'CC BY-SA 2.5',
    url: 'https://commons.wikimedia.org/wiki/File:Albissola_Marina-IMG_1507.JPG',
  },
  'celle-ligure': {
    src: '/zone/celle-ligure.jpg',
    alt: 'Le facciate colorate sulla passeggiata di Celle Ligure',
    file: 'Celle Ligure-IMG 1449.JPG',
    artist: 'Davide Papalini',
    license: 'CC BY-SA 2.5',
    url: 'https://commons.wikimedia.org/wiki/File:Celle_Ligure-IMG_1449.JPG',
  },
  'varazze': {
    src: '/zone/varazze.jpg',
    alt: 'Il porto turistico di Varazze',
    file: 'Varazze vista con porto.jpg',
    artist: 'Al*from*Lig',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Varazze_vista_con_porto.jpg',
  },
  'cairo-montenotte': {
    src: '/zone/cairo-montenotte.jpg',
    alt: 'Cairo Montenotte lungo la Bormida',
    file: 'Cairo montenotte bormida di spigno.jpg',
    artist: 'F Ceragioli',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Cairo_montenotte_bormida_di_spigno.jpg',
  },
  'millesimo': {
    src: '/zone/millesimo.jpg',
    alt: 'Il ponte-torre della Gaietta a Millesimo',
    file: 'Millesimo-IMG 0905.JPG',
    artist: 'Davide Papalini',
    license: 'CC BY 2.5',
    url: 'https://commons.wikimedia.org/wiki/File:Millesimo-IMG_0905.JPG',
  },
  'sassello': {
    src: '/zone/sassello.jpg',
    alt: 'Sassello tra i prati e i boschi del Beigua',
    file: 'Sassello 1273.jpg',
    artist: 'Phyrexian',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Sassello_1273.jpg',
  },
}

// Alias: nomi alternativi con cui i luoghi arrivano dalle query (comuni dal
// DB, frazioni, diciture estese). Normalizzati come le chiavi.
const ALIASES: Record<string, string> = {
  'pornassio': 'colle-di-nava',
  'colle-di-nava-pornassio': 'colle-di-nava',
  'sanremo-centro': 'sanremo',
  'finalborgo': 'finale-ligure',
  'albisola-superiore': 'albissola-marina',
}

/** Foto-hero di ogni zona (slug zona → chiave foto). */
const ZONE_HERO: Record<string, string> = {
  'sanremo': 'sanremo',
  'imperia': 'imperia',
  'ventimiglia': 'ventimiglia',
  'bordighera-ospedaletti': 'bordighera',
  'taggia-e-costa': 'arma-di-taggia',
  'golfo-dianese': 'cervo',
  'val-nervia': 'perinaldo',
  'entroterra': 'pieve-di-teco',
  'baia-del-sole': 'alassio',
  'albenganese': 'albenga',
  'loano-pietra': 'pietra-ligure',
  'finalese': 'finale-ligure',
  'savonese': 'savona',
  'val-bormida': 'millesimo',
  'beigua': 'sassello',
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

/** Chiave foto-hero della zona (per le card zona della home). */
export function zoneHeroKey(zoneSlug: string): string {
  return ZONE_HERO[zoneSlug] ?? zoneSlug
}

/** Elenco crediti (deduplicato per file) per la pagina /crediti. */
export const PHOTO_CREDITS: CuratedPhoto[] = Object.values(
  Object.fromEntries(Object.values(PHOTOS).map((p) => [p.file, p])),
)
