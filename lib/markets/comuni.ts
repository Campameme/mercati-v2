import { COMUNI_I18N } from './comuni.i18n'

// Descrizioni curate dei comuni del Ponente (Imperia + Savona): una-due frasi
// concrete sulle peculiarità di ogni paese, mostrate nella pagina comune.
// Stesso registro delle story di zona (lib/markets/zones): fatti, non slogan.
// Chiave = nome comune come appare in market_schedules.comune (lookup
// normalizzato in comuneDescription()).

export interface ComuneMeta {
  /** descrizione breve con le peculiarità del comune */
  descrizione: string
}

const COMUNI: Record<string, ComuneMeta> = {
  // ---- Provincia di Imperia ------------------------------------------------
  'Ventimiglia': {
    descrizione:
      'L’ultima città d’Italia, con la Ventimiglia alta medievale affacciata sul Roja e i giardini Hanbury a due passi. Il suo mercato del venerdì è da generazioni un rito transfrontaliero: si contratta in italiano e in francese.',
  },
  'Camporosso': {
    descrizione:
      'Alla foce del Nervia, tra spiaggia di ciottoli e serre di fiori: il borgo antico sta un chilometro nell’interno, il mercato vive tra piazza Garibaldi e il lungomare.',
  },
  'Vallecrosia': {
    descrizione:
      'Due anime: la città balneare sull’Aurelia e Vallecrosia Alta, il nucleo medievale tra gli orti. Qui c’è anche il curioso museo della canzone italiana, dentro un treno d’epoca.',
  },
  'Perinaldo': {
    descrizione:
      'Il borgo sul crinale dove nacque Gian Domenico Cassini, l’astronomo del Re Sole: l’osservatorio porta il suo nome e la vista corre dalle Alpi al mare. Patria del carciofo violetto.',
  },
  'Bordighera': {
    descrizione:
      'La città delle palme — dal 1586 fornisce i parmureli al Vaticano — che incantò Monet e la regina Margherita. Il mercato del giovedì si tiene sul Lungomare Argentina, la passeggiata a filo d’acqua.',
  },
  'Ospedaletti': {
    descrizione:
      'Nata attorno a un ospitale dei Cavalieri di Rodi, fu la prima cittadina italiana con un campo da tennis e un casinò. Oggi è una quinta di ville liberty e pista ciclabile sul vecchio tracciato ferroviario.',
  },
  'Sanremo': {
    descrizione:
      'La capitale della Riviera dei Fiori: il casinò, il Festival, la Milano-Sanremo — e la Pigna, il centro storico a spirale che sale sopra piazza Eroi Sanremesi, dove batte il mercato bisettimanale.',
  },
  'Taggia': {
    descrizione:
      'Patria dell’oliva taggiasca, con uno dei centri storici più lunghi della Liguria e il ponte medievale a quindici arcate sull’Argentina. Il convento di San Domenico custodisce cinque secoli di pittura ligure.',
  },
  'Riva Ligure': {
    descrizione:
      'Borgo marinaro compatto sull’Aurelia, un tempo scalo dei monaci di Villaregia: case colorate, spiaggia e la ciclabile del Parco Costiero che lo attraversa.',
  },
  'San Lorenzo al Mare': {
    descrizione:
      'Il paese più piccolo della costa imperiese, in due rioni ai lati del torrente: da qui parte la ciclovia sul mare e la strada per il golf di Castellaro.',
  },
  'Santo Stefano al Mare': {
    descrizione:
      'Tra la marina turistica degli Aregai e il nucleo antico raccolto attorno alla parrocchiale: un borgo di pescatori diventato porto della vela.',
  },
  'Cervo': {
    descrizione:
      'Il borgo dei corallini, sospeso sul mare: i pescatori di corallo finanziarono la chiesa barocca di San Giovanni Battista, e d’estate la piazza dei Corallini diventa palcoscenico di musica da camera.',
  },
  'Diano Marina': {
    descrizione:
      'La città degli aranci e delle spiagge di sabbia nel cuore del golfo: mercato bisettimanale tra corso Roma e via Genala, e d’estate i banchi serali sul porto.',
  },
  'San Bartolomeo al Mare': {
    descrizione:
      'Spiagge basse e famiglie in vacanza, il santuario della Rovere e la ciclabile del golfo: il lunedì il mercato apre la settimana dianese.',
  },
  'Pieve di Teco': {
    descrizione:
      'Fondata nel 1233 come borgo-mercato sulla Via del Sale: sotto i suoi portici medievali si commercia da ottocento anni. Capoluogo della Valle Arroscia, tra oliveti e il passo per il Piemonte.',
  },
  'Pontedassio': {
    descrizione:
      'Nella valle Impero, sulla strada dell’olio: qui la famiglia Agnesi aprì il primo museo degli spaghetti, e il venerdì la piazza si riempie di banchi.',
  },
  'Pornassio': {
    descrizione:
      'L’ultimo comune della Valle Arroscia prima del Piemonte, patria del vino Ormeasco: al Colle di Nava, tra i forti ottocenteschi, i campi di lavanda profumano l’estate e la domenica c’è mercato.',
  },
  'Imperia': {
    descrizione:
      'Due città cucite insieme nel 1923: Oneglia mercantile, con calata Cuneo e la tradizione dell’olio (qui è nata la Fratelli Carli), e Porto Maurizio arroccata sul Parasio sopra il porto. I mercati si alternano tra le due.',
  },

  // ---- Provincia di Savona -------------------------------------------------
  'Andora': {
    descrizione:
      'L’ultima spiaggia di ponente prima di capo Mele, con il porto turistico e, nell’interno, il castello dei Clavesana e il ponte medievale sul Merula. Il lunedì il mercato anima via Cavour.',
  },
  'Laigueglia': {
    descrizione:
      'Borgo marinaro tra i più belli d’Italia, un budello di carruggi dietro la spiaggia: fu villaggio di pescatori di corallo, oggi è la partenza della classicissima Milano-Sanremo dei dilettanti, la Laigueglia.',
  },
  'Alassio': {
    descrizione:
      'La Baia del Sole: quattro chilometri di sabbia fine, il Muretto con le firme dei famosi e il “budello” che corre parallelo al mare — la via del passeggio e, il sabato, del mercato.',
  },
  'Albenga': {
    descrizione:
      'La città delle cento torri, con il centro medievale meglio conservato della Liguria e il battistero paleocristiano. Attorno, la piana degli ortaggi: asparago violetto, carciofo, trombetta — che riempiono ogni giorno il mercato dei produttori.',
  },
  'Ceriale': {
    descrizione:
      'Spiagge larghe e il mercato del lunedì sul lungomare Diaz; alle spalle, la riserva naturale del Rio Torsero con i suoi fossili pliocenici.',
  },
  'Borghetto Santo Spirito': {
    descrizione:
      'Alle porte della Val Varatella, sotto il castello Borelli: mercato del martedì e banchi ortofrutticoli tutti i giorni, a due passi dalle spiagge.',
  },
  'Toirano': {
    descrizione:
      'Il borgo delle grotte: le sale di Bàsura e Santa Lucia conservano impronte dell’uomo preistorico accanto agli artigli dell’orso delle caverne. Il giovedì, mercato nella piazzetta di Agenore Fabbri.',
  },
  'Loano': {
    descrizione:
      'Cittadina doriana con il porto turistico più grande del ponente savonese e il monte Carmelo alle spalle: mercato del venerdì, agricoltori tutti i giorni in piazza San Francesco e, d’estate, il mercatino dei libri.',
  },
  'Pietra Ligure': {
    descrizione:
      'La città dei cantieri navali e di San Nicolò, con il centro storico che si apre sulla grande piazza della basilica: mercati del sabato, ortofrutta tre volte a settimana e l’antiquariato dell’ultima domenica del mese.',
  },
  'Borgio Verezzi': {
    descrizione:
      'Borgio sta sul mare, Verezzi è il balcone di pietra rosa in collina: quattro borgate saracene, un festival teatrale d’estate e le grotte di Valdemino. Mercato il martedì.',
  },
  'Finale Ligure': {
    descrizione:
      'Tre anime — Marina, Pia e Finalborgo, capitale del marchesato dei Del Carretto e oggi mecca dell’outdoor tra falesie e sentieri. Mercati in ogni rione, e l’antiquariato il primo weekend del mese tra le mura del Borgo.',
  },
  'Noli': {
    descrizione:
      'Per cinque secoli repubblica marinara indipendente, alleata di Genova: torri, carruggi e i pescatori che ancora tirano le reti a riva. Il giovedì mercato, e le domeniche del mese si alternano artigianato e antiquariato.',
  },
  'Spotorno': {
    descrizione:
      'Spiaggia lunga e sabbiosa davanti all’isola di Bergeggi: qui svernarono D.H. Lawrence e Camillo Sbarbaro. Mercato del martedì sull’Aurelia.',
  },
  'Savona': {
    descrizione:
      'Il capoluogo: la fortezza del Priamar, la torretta del Brandale sul porto e la cappella Sistina voluta da papa Sisto IV Della Rovere. Il lunedì le vie del centro diventano un mercato lungo un chilometro; il primo weekend del mese, l’antiquariato in via Paleocapa.',
  },
  'Vado Ligure': {
    descrizione:
      'Il porto operoso della rada savonese, con la villa Groppallo e le spiagge verso Bergeggi: mercato del mercoledì e, il secondo sabato, l’antiquariato tra piazza Cavour e via Gramsci.',
  },
  'Albissola Marina': {
    descrizione:
      'Capitale della ceramica insieme alla “sorella” Superiore: il lungomare degli Artisti è un mosaico a cielo aperto firmato dagli astrattisti del Novecento. Mercato il martedì e mercoledì, artigianato nel centro storico.',
  },
  'Albisola Superiore': {
    descrizione:
      'La patria storica della ceramica ligure — le fornaci lavorano dal Cinquecento — con la villa Gavotti e le spiagge di Albisola Capo. Mercato del mercoledì e collezionismo sulla passeggiata Montale.',
  },
  'Celle Ligure': {
    descrizione:
      'Borgo marinaro di case colorate strette tra la spiaggia e la collina, patria di papa Sisto IV: il venerdì il mercato attraversa il centro.',
  },
  'Varazze': {
    descrizione:
      'La porta di levante del Ponente: patria del beato Jacopo da Varagine, spiagge, cantieri storici e il lungomare Europa scavato nella falesia verso Cogoleto.',
  },
  // Val Bormida
  'Cairo Montenotte': {
    descrizione:
      'La capitale della Val Bormida, borgo murato dove Napoleone vinse la sua prima battaglia (1796): mercato del giovedì tra le piazze e, il secondo sabato, i Mercati della Terra con i produttori delle valli.',
  },
  'Carcare': {
    descrizione:
      'Cittadina di studi — il collegio calasanzio formò generazioni di liguri — al crocevia delle Bormide: mercato del mercoledì e produttori locali il primo sabato del mese.',
  },
  'Altare': {
    descrizione:
      'Il paese dei maestri vetrai: l’arte del vetro soffiato vive qui dal Medioevo, raccontata nel museo del vetro in villa Rosa, gioiello liberty. Mercato il venerdì.',
  },
  'Cengio': {
    descrizione:
      'Sul confine piemontese, lungo la Bormida di Millesimo: il martedì il mercato in piazza San Giuseppe serve anche le Langhe vicine.',
  },
  'Dego': {
    descrizione:
      'Tappa delle campagne napoleoniche sulla Bormida di Spigno: mercato del mercoledì e, da giugno a novembre, le sagre-mercato del primo sabato con i prodotti tipici delle valli.',
  },
  'Mallare': {
    descrizione:
      'Paese di boschi e ferriere nell’alta valle del Bormida di Mallare: il martedì i banchi arrivano in piazza Odorico del Carretto.',
  },
  'Millesimo': {
    descrizione:
      'Uno dei borghi più belli d’Italia, con il ponte-torre della Gaietta sul Bormida e la piazza porticata dei Del Carretto: mercato del sabato e, il primo del mese, artigianato e antiquariato. A settembre, la festa nazionale del tartufo.',
  },
  'Murialdo': {
    descrizione:
      'Borgate sparse tra i boschi di castagne della Val Bormida: il mercoledì il mercato fa tappa in borgata Piano.',
  },
  'Calizzano': {
    descrizione:
      'Ai piedi del colle del Melogno, tra faggete e funghi porcini — qui l’aria di mare incontra quella di Langa: mercato del martedì in piazza Vittorio Veneto.',
  },
  'Bardineto': {
    descrizione:
      'Altopiano a 700 metri tra i boschi, regno di porcini e castagne: il giovedì il mercato si sposta tra piazza e frazione a seconda della stagione.',
  },
  'Giusvalla': {
    descrizione:
      'Poche case tra i boschi al confine con il Piemonte, sulla strada dei calanchi: il sabato mattina i banchi davanti al municipio.',
  },
  // Beigua / entroterra di levante
  'Sassello': {
    descrizione:
      'Il paese degli amaretti morbidi, primo borgo d’Italia certificato Bandiera Arancione, alle pendici del Beigua: mercato del mercoledì e, le ultime domeniche del mese, i banchi in piazza San Rocco.',
  },
  'Urbe': {
    descrizione:
      'Cinque frazioni sparse nell’alta valle dell’Orba, dentro il parco del Beigua: aria fina, boschi e il mercato del giovedì che serve mezzo Appennino.',
  },
  'Pontinvrea': {
    descrizione:
      'Crocevia tra la costa e le valli piemontesi, terra di funghi e motocross: l’antiquariato arriva a Ferragosto, i mercatini di Natale al Giovo Ligure.',
  },
}

/** normalizza per lookup (accenti, spazi, maiuscole, "S." → "Santo") */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[̀-ͯ]/g, '')
    .replace(/\bs\.\s*/g, 'santo ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const BY_KEY: Record<string, { name: string; meta: ComuneMeta }> = Object.fromEntries(
  Object.entries(COMUNI).map(([name, meta]) => [normalize(name), { name, meta }]),
)

/**
 * Descrizione curata del comune nella lingua richiesta (match tollerante).
 * Le traduzioni FR/DE/EN vivono in comuni.i18n.ts; l'italiano è la sorgente
 * (e il ripiego se una traduzione manca).
 */
export function comuneDescription(comune: string, lang: 'it' | 'fr' | 'de' | 'en' = 'it'): string | null {
  const hit = BY_KEY[normalize(comune)]
  if (!hit) return null
  if (lang !== 'it') {
    const tr = COMUNI_I18N[hit.name]?.[lang]
    if (tr) return tr
  }
  return hit.meta.descrizione
}
