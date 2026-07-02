// Le 8 "zone" della provincia di Imperia coincidono con i mercati aggregati.
// Ogni zona raccoglie i suoi comuni/borghi. Qui i metadati curati (carattere,
// borghi, colore) usati da: sezione Zone & Borghi, filtro zona, evidenziazione
// sulla mappa. I contenuti pescano dalla storia reale del Ponente ligure
// (Via del Sale, mercato transfrontaliero, città mercatali, due porti).

export interface ZoneMeta {
  /** = market slug */
  slug: string
  name: string
  /** comuni/borghi della zona (ordine curato) */
  borghi: string[]
  /** una frase di carattere, autentica */
  carattere: string
  /** accento colore della zona (distinto, armonico col brand) */
  accent: string
}

export const ZONES: ZoneMeta[] = [
  {
    slug: 'ventimiglia',
    name: 'Ventimiglia',
    borghi: ['Ventimiglia'],
    carattere:
      'Il venerdì il mercato più grande della Liguria si snoda lungo il Roia: un labirinto di banchi dove da sempre si contratta in due lingue, italiano e francese.',
    accent: '#15607C',
  },
  {
    slug: 'val-nervia',
    name: 'Val Nervia',
    borghi: ['Camporosso', 'Vallecrosia', 'Perinaldo'],
    carattere:
      'Dalla foce del Nervia ai borghi affacciati sulle colline: mercati di paese tra mare e entroterra, dove Perinaldo guarda ancora le stelle di Cassini.',
    accent: '#4C8B3F',
  },
  {
    slug: 'bordighera-ospedaletti',
    name: 'Bordighera e Ospedaletti',
    borghi: ['Bordighera', 'Ospedaletti'],
    carattere:
      'Lungomari, palme e brocante: da Bordighera, che dal 1586 manda al Vaticano le sue palme bianche, alle passeggiate di Ospedaletti.',
    accent: '#C2502E',
  },
  {
    slug: 'sanremo',
    name: 'Sanremo',
    borghi: ['Sanremo centro', 'Coldirodi', 'Poggio', 'Bussana', 'Foce'],
    carattere:
      'La città dei fiori cambia mercato ogni giorno: dal bisettimanale al piccolo antiquariato di San Siro, tra il centro e le frazioni in collina.',
    accent: '#8E5BB5',
  },
  {
    slug: 'taggia-e-costa',
    name: 'Taggia e Costa',
    borghi: ['Taggia', 'Arma di Taggia', 'Santo Stefano al Mare', 'Riva Ligure', 'San Lorenzo al Mare'],
    carattere:
      'La costa dei piccoli porti e il centro storico di Taggia, con il mercatino dell’antiquariato che ogni terza domenica scende lungo l’Argentina.',
    accent: '#15607C',
  },
  {
    slug: 'imperia',
    name: 'Imperia',
    borghi: ['Oneglia', 'Porto Maurizio'],
    carattere:
      'Due porti che furono di due Stati, cuciti in una sola città dall’olio e dal pesce: Oneglia mercantile e Porto Maurizio arroccato sul Parasio.',
    accent: '#4C8B3F',
  },
  {
    slug: 'golfo-dianese',
    name: 'Golfo Dianese',
    borghi: ['Diano Marina', 'San Bartolomeo al Mare', 'Cervo'],
    carattere:
      'Il golfo dei mercati serali d’estate, dal solettone del porto di Diano fino al borgo di Cervo sospeso sul mare.',
    accent: '#C2502E',
  },
  {
    slug: 'entroterra',
    name: 'Entroterra',
    borghi: ['Pieve di Teco', 'Pontedassio', 'Colle di Nava (Pornassio)'],
    carattere:
      'La Via del Sale e le città mercatali: a Pieve di Teco, borgo nato come mercato, gli ambulanti dell’antiquariato continuano sotto i portici un gesto vecchio di ottocento anni.',
    accent: '#8E5BB5',
  },
]

export const ZONE_BY_SLUG: Record<string, ZoneMeta> = Object.fromEntries(ZONES.map((z) => [z.slug, z]))
