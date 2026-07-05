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

  // ---- Provincia di Savona (da Andora a Varazze) ---------------------------
  {
    slug: 'baia-del-sole',
    name: 'Baia del Sole',
    borghi: ['Andora', 'Laigueglia', 'Alassio'],
    carattere:
      'Il sabato i banchi arrivano a due passi dal “budello” di Alassio, la via del passeggio dietro la spiaggia; a Laigueglia si vendeva il corallo, oggi il venerdì si fa il mercato.',
    story:
      'La baia della sabbia fine ha i suoi riti: il sabato il mercato di Alassio accanto al budello e al Muretto delle firme, il venerdì i banchi nel centro storico di Laigueglia, il lunedì Andora lungo via Cavour. E il primo sabato del mese, sotto i portici di piazza Santa Maria ad Andora, tornano antiquari e artigiani.',
    accent: '#C2502E',
  },
  {
    slug: 'albenganese',
    name: 'Piana di Albenga',
    borghi: ['Albenga', 'Ceriale', 'Borghetto Santo Spirito', 'Toirano'],
    carattere:
      'La città delle cento torri e la piana degli ortaggi: asparago violetto, carciofo e trombette riempiono ogni mattina i banchi dei produttori in piazza del Popolo.',
    story:
      'Qui il mercato nasce nei campi: la piana di Albenga coltiva gli ortaggi di mezza Liguria, e i produttori vendono ogni mattina in piazza del Popolo, sotto le torri medievali. Il mercoledì il grande mercato ingauno, il lunedì i banchi sul lungomare di Ceriale, il martedì Borghetto, il giovedì Toirano, il paese delle grotte preistoriche.',
    accent: '#4C8B3F',
  },
  {
    slug: 'loano-pietra',
    name: 'Loano e Pietra',
    borghi: ['Loano', 'Pietra Ligure', 'Borgio Verezzi'],
    carattere:
      'Mercati quasi ogni giorno tra il porto doriano di Loano e la piazza della basilica di Pietra; l’ultima domenica del mese, l’antiquariato invade il centro storico pietrese.',
    story:
      'Tra il porto turistico di Loano e la grande piazza di San Nicolò a Pietra Ligure c’è un mercato quasi ogni giorno: il venerdì a Loano, il sabato a Pietra, il martedì a Borgio Verezzi sotto le borgate saracene di pietra rosa. L’ultima domenica del mese l’antiquariato riempie piazze e carruggi di Pietra; d’estate, a Loano, spunta perfino il mercatino dei libri.',
    accent: '#15607C',
  },
  {
    slug: 'finalese',
    name: 'Finalese',
    borghi: ['Finale Ligure', 'Noli', 'Spotorno'],
    carattere:
      'Il lunedì il mercato entra tra le mura di Finalborgo, capitale dei Del Carretto; a Noli, repubblica marinara per cinque secoli, le domeniche si alternano artigiani e antiquari.',
    story:
      'Ogni rione ha il suo giorno: il lunedì il mercato tra le mura quattrocentesche di Finalborgo, il giovedì alla Marina e a Noli — che fu repubblica marinara indipendente per cinque secoli — il martedì a Spotorno davanti all’isola di Bergeggi. Il primo weekend del mese Finalborgo si riempie di antiquariato; a Noli le domeniche si dividono tra artigiani e antiquari.',
    accent: '#8E5BB5',
  },
  {
    slug: 'savonese',
    name: 'Savona e le Albisole',
    borghi: ['Savona', 'Vado Ligure', 'Albissola Marina', 'Albisola Superiore', 'Celle Ligure', 'Varazze'],
    carattere:
      'Il lunedì le vie del centro di Savona diventano un mercato lungo un chilometro, all’ombra del Priamar; nelle Albisole, patria della ceramica, i banchi stanno accanto alle fornaci.',
    story:
      'Il lunedì Savona chiude le vie del centro e le consegna ai banchi, dal Priamar alla torretta del Brandale: è il mercato più lungo del Ponente. Nelle Albisole — dove la ceramica si cuoce dal Cinquecento e il lungomare è un mosaico d’artista — si va il martedì e il mercoledì, il venerdì a Celle Ligure. Il primo weekend del mese, l’antiquariato in via Paleocapa, sotto i portici.',
    accent: '#15607C',
  },
  {
    slug: 'val-bormida',
    name: 'Val Bormida',
    borghi: ['Cairo Montenotte', 'Millesimo', 'Carcare', 'Altare', 'Cengio', 'Dego', 'Mallare', 'Murialdo', 'Calizzano', 'Bardineto', 'Giusvalla'],
    carattere:
      'Oltre il colle del Melogno l’aria sa di Langa: mercati di valle a Cairo e Millesimo, il paese del ponte-torre della Gaietta e del tartufo.',
    story:
      'Qui la Liguria guarda al Piemonte: boschi di castagne, porcini e tartufi, e mercati che servono le valli. Il giovedì a Cairo Montenotte, il borgo murato della prima vittoria di Napoleone; il sabato a Millesimo, sotto il ponte-torre della Gaietta; il mercoledì a Carcare. Il secondo sabato del mese, a Cairo, i Mercati della Terra dei produttori di valle; ad Altare, il paese dei vetrai, si va il venerdì.',
    accent: '#C2502E',
  },
  {
    slug: 'beigua',
    name: 'Beigua e valle Orba',
    borghi: ['Sassello', 'Urbe', 'Pontinvrea'],
    carattere:
      'Il paese degli amaretti e le frazioni del parco del Beigua: mercati d’altura tra faggete e aria fina.',
    story:
      'Dentro il parco del Beigua i mercati sono un presidio di montagna: il mercoledì a Sassello — il borgo degli amaretti morbidi, prima Bandiera Arancione d’Italia — il giovedì tra le frazioni di Urbe, nell’alta valle dell’Orba. Le ultime domeniche del mese i banchi tornano in piazza San Rocco, e a Ferragosto l’antiquariato sale a Pontinvrea.',
    accent: '#4C8B3F',
  },
]

export const ZONE_BY_SLUG: Record<string, ZoneMeta> = Object.fromEntries(ZONES.map((z) => [z.slug, z]))
