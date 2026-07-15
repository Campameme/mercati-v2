import { COMUNI_I18N } from './comuni.i18n'

// Descrizioni curate dei comuni della provincia di Imperia: una-due frasi
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
