// Le 8 "zone" della provincia di Imperia coincidono con i mercati aggregati.
// Ogni zona raccoglie i suoi comuni/borghi. Qui i metadati curati (carattere,
// racconto, borghi, colore) usati da: sezione Zone della home, filtro zona,
// hero delle pagine zona. I contenuti pescano dalla storia reale del Ponente
// ligure (Via del Sale, mercato transfrontaliero, città mercatali, due porti)
// e dai giorni/piazze effettivi dei mercati in archivio.

export interface ZoneMeta {
  /** = market slug */
  slug: string
  name: string
  /** comuni/borghi della zona (ordine curato) */
  borghi: string[]
  /** una frase di carattere, autentica (card in home) */
  carattere: string
  /**
   * Racconto breve e specifico della zona (hero della pagina zona):
   * 2–3 frasi concrete — giorni veri, piazze vere, niente slogan.
   */
  story: string
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
    story:
      'Il venerdì è il giorno che tutti conoscono: il mercato più grande della Liguria si distende lungo il fiume Roia e nel centro città, e da sempre ci si arriva anche dalla Costa Azzurra, contrattando in italiano e in francese. Un sabato al mese, in centro, tornano invece i banchi dell’antiquariato e del collezionismo.',
    accent: '#15607C',
  },
  {
    slug: 'val-nervia',
    name: 'Val Nervia',
    borghi: ['Camporosso', 'Vallecrosia', 'Perinaldo'],
    carattere:
      'Dalla foce del Nervia ai borghi affacciati sulle colline: mercati di paese tra mare e entroterra, dove Perinaldo guarda ancora le stelle di Cassini.',
    story:
      'Mercati di paese, in una valle che sale dal mare alle colline: il mercoledì i banchi sono in piazza Garibaldi a Camporosso, nel fine settimana si scende lungo il Nervia, a Vallecrosia il lunedì. E in cima alla valle c’è Perinaldo, il borgo dell’astronomo Cassini, che guarda insieme le stelle e la costa.',
    accent: '#4C8B3F',
  },
  {
    slug: 'bordighera-ospedaletti',
    name: 'Bordighera e Ospedaletti',
    borghi: ['Bordighera', 'Ospedaletti'],
    carattere:
      'Lungomari, palme e brocante: da Bordighera, che dal 1586 manda al Vaticano le sue palme bianche, alle passeggiate di Ospedaletti.',
    story:
      'Il giovedì i banchi si allineano sul Lungomare Argentina, la passeggiata che incantò Monet: è il mercato con la vista più bella del Ponente, nella città che dal 1586 manda le sue palme al Vaticano. A Ospedaletti si va il mercoledì; la prima domenica del mese tocca al piccolo antiquariato.',
    accent: '#C2502E',
  },
  {
    slug: 'sanremo',
    name: 'Sanremo',
    borghi: ['Sanremo centro', 'Coldirodi', 'Poggio', 'Bussana', 'Foce'],
    carattere:
      'La città dei fiori cambia mercato ogni giorno: dal bisettimanale al piccolo antiquariato di San Siro, tra il centro e le frazioni in collina.',
    story:
      'Il martedì e il sabato piazza Eroi Sanremesi si riempie di banchi ai piedi della Pigna, il centro storico che sale a spirale. Il mercato annonario, coperto, lavora invece tutti i giorni; il mercoledì e il venerdì tocca al quartiere della Foce, e a rotazione il mercato arriva anche nelle frazioni in collina.',
    accent: '#8E5BB5',
  },
  {
    slug: 'taggia-e-costa',
    name: 'Taggia e Costa',
    borghi: ['Taggia', 'Arma di Taggia', 'Santo Stefano al Mare', 'Riva Ligure', 'San Lorenzo al Mare'],
    carattere:
      'La costa dei piccoli porti e il centro storico di Taggia, con il mercatino dell’antiquariato che ogni terza domenica scende lungo l’Argentina.',
    story:
      'Qui il mercato corre lungo la costa, sempre a due passi dalla ciclabile del Parco Costiero: il lunedì a Riva Ligure, il martedì a San Lorenzo al Mare, il venerdì sul lungomare di Santo Stefano. E a Taggia, patria dell’oliva taggiasca, la terza domenica del mese (da aprile a ottobre) i banchi dell’antiquariato salgono verso il ponte antico.',
    accent: '#15607C',
  },
  {
    slug: 'imperia',
    name: 'Imperia',
    borghi: ['Oneglia', 'Porto Maurizio'],
    carattere:
      'Due porti che furono di due Stati, cuciti in una sola città dall’olio e dal pesce: Oneglia mercantile e Porto Maurizio arroccato sul Parasio.',
    story:
      'Due città in una, e al mercato si sente ancora: Porto Maurizio ha i suoi banchi il martedì e il giovedì sotto il colle del Parasio, Oneglia il mercoledì e il sabato tra le piazze e calata Cuneo, dove l’aria sa ancora di frantoio e di porto. Erano due Stati diversi: li ha cuciti insieme il commercio.',
    accent: '#4C8B3F',
  },
  {
    slug: 'golfo-dianese',
    name: 'Golfo Dianese',
    borghi: ['Diano Marina', 'San Bartolomeo al Mare', 'Cervo'],
    carattere:
      'Il golfo dei mercati serali d’estate, dal solettone del porto di Diano fino al borgo di Cervo sospeso sul mare.',
    story:
      'Nel golfo c’è un mercato quasi ogni giorno: il lunedì a San Bartolomeo al Mare, il martedì e il venerdì a Diano Marina tra corso Roma e via Genala, il giovedì su a Cervo — il borgo dei pescatori di corallo sospeso sul mare, che d’estate diventa un palcoscenico di musica da camera.',
    accent: '#C2502E',
  },
  {
    slug: 'entroterra',
    name: 'Valle Arroscia',
    borghi: ['Pieve di Teco', 'Pontedassio', 'Colle di Nava (Pornassio)'],
    carattere:
      'La Via del Sale e le città mercatali: a Pieve di Teco, borgo nato come mercato, gli ambulanti dell’antiquariato continuano sotto i portici un gesto vecchio di ottocento anni.',
    story:
      'Da qui saliva la Via del Sale, e i mercati restano il cuore dei paesi della Valle Arroscia: il martedì a Pieve di Teco — borgo fondato nel 1233 proprio per il commercio — i banchi stanno sotto i portici medievali; il venerdì tocca a Pontedassio, la domenica si sale al Colle di Nava, tra i campi di lavanda.',
    accent: '#8E5BB5',
  },
]

export const ZONE_BY_SLUG: Record<string, ZoneMeta> = Object.fromEntries(ZONES.map((z) => [z.slug, z]))

// Le 8 zone della provincia di IMPERIA (seed 0007): sono le uniche esistenti.
// Le zone della provincia di Savona (ex seed 0019) sono state rimosse del tutto,
// sia dai dati sia dal codice (migrazione 0024_remove_savona).
export const IMPERIA_ZONE_SLUGS = [
  'ventimiglia', 'val-nervia', 'bordighera-ospedaletti', 'sanremo',
  'taggia-e-costa', 'imperia', 'golfo-dianese', 'entroterra',
] as const
