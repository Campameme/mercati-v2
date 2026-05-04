// Definizioni condivise per export/template/import Excel operatori.
// Una riga = una presenza di operatore su una sessione.
// Se l'operatore ha N sessioni → N righe nell'export.
// In import le righe con lo stesso OperatorId vengono raggruppate.

export const OPERATORS_SHEET_NAME = 'Operatori'
export const INSTRUCTIONS_SHEET_NAME = 'Istruzioni'
export const SESSIONS_SHEET_NAME = 'Sessioni'

export const OPERATORS_COLUMNS = [
  'OperatorId',
  'OperatorCode',
  'Nome',
  'Categoria',
  'Descrizione',
  'Email',
  'Lingue',
  'Pagamenti',
  'MarketSlug',
  'ScheduleId',
  'Comune',
  'Giorno',
  'Luogo',
  'Banco',
  'Lat',
  'Lng',
] as const

export const CATEGORIES = [
  'food',
  'clothing',
  'accessories',
  'electronics',
  'home',
  'books',
  'flowers',
  'other',
] as const

export const INSTRUCTIONS_ROWS: string[][] = [
  ['IMercati — Import/Export Operatori'],
  [''],
  ['Ogni riga rappresenta UNA presenza di un operatore su UNA sessione di mercato.'],
  ["Se lo stesso operatore frequenta più mercati, inserisci una riga per ciascuno."],
  [''],
  ['Colonne:'],
  ['OperatorId', "UUID dell'operatore (autogenerato). Lascia vuoto per crearne uno nuovo."],
  ['OperatorCode', "Codice mnemonico univoco (es. \"MARIO_FRUTTA\"). Permette di importare presenze su più mercati per lo stesso operatore: usa lo stesso codice in tutte le righe del medesimo operatore. Se OperatorId è vuoto ma OperatorCode esiste già, l'operatore esistente viene aggiornato."],
  ['Nome', 'Obbligatorio. Stesso valore in tutte le righe dello stesso operatore.'],
  ['Categoria', `Una tra: ${CATEGORIES.join(', ')}`],
  ['Descrizione', 'Testo libero.'],
  ['Email', 'Email per collegare un account (opzionale).'],
  ['Lingue', 'Lista separata da virgola (es. "it, en, fr").'],
  ['Pagamenti', 'Lista separata da virgola (es. "cash, card").'],
  ['MarketSlug', 'Slug della zona (es. "imperia"). Obbligatorio sulla prima riga dell\'operatore.'],
  ['ScheduleId', 'UUID della sessione. Vedi foglio "Sessioni" per l\'elenco.'],
  ['Comune', '(solo lettura, per riferimento)'],
  ['Giorno', '(solo lettura, per riferimento)'],
  ['Luogo', '(solo lettura, per riferimento)'],
  ['Banco', 'Numero o codice banco su questa sessione (opzionale).'],
  ['Lat', 'Latitudine della posizione del banco (es. 43.7903). Vuoto = usa coord sessione.'],
  ['Lng', 'Longitudine (es. 7.6084).'],
  [''],
  ['Suggerimenti:'],
  ['- Esporta prima il file per vedere i dati attuali.'],
  ['- Mantieni OperatorId per aggiornamenti; cancellalo per creare un nuovo operatore.'],
  ['- Per rimuovere una presenza esistente, cancella la riga e ri-importa.'],
]
