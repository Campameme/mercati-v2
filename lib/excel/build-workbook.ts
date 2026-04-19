// Build dell'xlsx con data validations (dropdown) e formule di auto-popolamento
// per le colonne derivate (Comune, Giorno, Luogo). Usa exceljs perché la libreria
// xlsx (SheetJS) community non scrive data validations.

import ExcelJS from 'exceljs'
import { OPERATORS_COLUMNS, OPERATORS_SHEET_NAME, SESSIONS_SHEET_NAME, INSTRUCTIONS_SHEET_NAME, INSTRUCTIONS_ROWS, CATEGORIES } from './operators'

export interface SessionRow {
  ScheduleId: string
  MarketSlug: string
  Zona: string
  Comune: string
  Giorno: string
  Orario: string
  Luogo: string
  Lat: number | string
  Lng: number | string
}

export interface OperatorRow {
  OperatorId: string
  Nome: string
  Categoria: string
  Descrizione: string
  Email: string
  Lingue: string
  Pagamenti: string
  MarketSlug: string
  ScheduleId: string
  Comune?: string
  Giorno?: string
  Luogo?: string
  Banco: string | number
  Lat: number | string
  Lng: number | string
}

const LANGUAGE_VALUES = ['it', 'en', 'fr', 'de', 'es']
const PAYMENT_VALUES = ['cash', 'card', 'digital']

const DATA_ROWS = 1000 // numero righe con validation pre-applicate

function colLetter(index1based: number): string {
  // 1 → A, 27 → AA
  let s = ''
  let n = index1based
  while (n > 0) {
    const rem = (n - 1) % 26
    s = String.fromCharCode(65 + rem) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

export async function buildOperatorsWorkbook(opts: {
  operators: OperatorRow[] // può essere [] per template
  sessions: SessionRow[]
  marketSlugs: string[]
  label: string
}): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'IMercati'
  wb.created = new Date()

  // Ordine creazione: Operatori (primo, tab attivo) | Sessioni | Liste (nascosto) | Istruzioni
  // Creo Operatori come stub adesso e popolo dopo, per avere l'ordine giusto senza hack.
  const ws = wb.addWorksheet(OPERATORS_SHEET_NAME)

  // ── Foglio Sessioni (riferimento + sorgente per dropdown ScheduleId) ──
  const wsSes = wb.addWorksheet(SESSIONS_SHEET_NAME, { state: 'visible' })
  wsSes.columns = [
    { header: 'ScheduleId', key: 'ScheduleId', width: 40 },
    { header: 'MarketSlug', key: 'MarketSlug', width: 18 },
    { header: 'Zona', key: 'Zona', width: 20 },
    { header: 'Comune', key: 'Comune', width: 20 },
    { header: 'Giorno', key: 'Giorno', width: 16 },
    { header: 'Orario', key: 'Orario', width: 14 },
    { header: 'Luogo', key: 'Luogo', width: 30 },
    { header: 'Lat', key: 'Lat', width: 12 },
    { header: 'Lng', key: 'Lng', width: 12 },
  ]
  for (const s of opts.sessions) wsSes.addRow(s)
  wsSes.getRow(1).font = { bold: true }

  // ── Foglio Liste (valori per dropdown) ──
  const wsLists = wb.addWorksheet('Liste', { state: 'veryHidden' })
  wsLists.getCell('A1').value = 'Categorie'
  wsLists.getCell('B1').value = 'Lingue'
  wsLists.getCell('C1').value = 'Pagamenti'
  wsLists.getCell('D1').value = 'MarketSlug'
  CATEGORIES.forEach((c, i) => { wsLists.getCell(`A${i + 2}`).value = c })
  LANGUAGE_VALUES.forEach((c, i) => { wsLists.getCell(`B${i + 2}`).value = c })
  PAYMENT_VALUES.forEach((c, i) => { wsLists.getCell(`C${i + 2}`).value = c })
  opts.marketSlugs.forEach((c, i) => { wsLists.getCell(`D${i + 2}`).value = c })

  // Named ranges per data validation (più pulite di formule inline)
  wb.definedNames.add(`Liste!$A$2:$A$${1 + CATEGORIES.length}`, 'Cats')
  wb.definedNames.add(`Liste!$B$2:$B$${1 + LANGUAGE_VALUES.length}`, 'Langs')
  wb.definedNames.add(`Liste!$C$2:$C$${1 + PAYMENT_VALUES.length}`, 'Pays')
  if (opts.marketSlugs.length > 0) {
    wb.definedNames.add(`Liste!$D$2:$D$${1 + opts.marketSlugs.length}`, 'Markets')
  }
  if (opts.sessions.length > 0) {
    wb.definedNames.add(`${SESSIONS_SHEET_NAME}!$A$2:$A$${1 + opts.sessions.length}`, 'Schedules')
  }

  // ── Foglio Operatori (popolamento) ──
  ws.columns = OPERATORS_COLUMNS.map((c) => ({
    header: c,
    key: c,
    width: c === 'OperatorId' || c === 'ScheduleId' ? 38
         : c === 'Nome' || c === 'Descrizione' || c === 'Luogo' ? 28
         : c === 'Email' || c === 'Lingue' || c === 'Pagamenti' ? 18
         : c === 'Comune' ? 20
         : 14,
  }))
  ws.getRow(1).font = { bold: true }
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E9D2' } }
  ws.views = [{ state: 'frozen', ySplit: 1 }]

  // Pre-popola i dati esistenti, lasciando Comune/Giorno/Luogo come formule
  const colIdx = Object.fromEntries(OPERATORS_COLUMNS.map((c, i) => [c, i + 1])) as Record<string, number>

  // Aggiungi righe reali
  opts.operators.forEach((op, i) => {
    const rowNum = i + 2
    const row = ws.getRow(rowNum)
    row.getCell(colIdx.OperatorId).value = op.OperatorId || ''
    row.getCell(colIdx.Nome).value = op.Nome
    row.getCell(colIdx.Categoria).value = op.Categoria
    row.getCell(colIdx.Descrizione).value = op.Descrizione
    row.getCell(colIdx.Email).value = op.Email
    row.getCell(colIdx.Lingue).value = op.Lingue
    row.getCell(colIdx.Pagamenti).value = op.Pagamenti
    row.getCell(colIdx.MarketSlug).value = op.MarketSlug
    row.getCell(colIdx.ScheduleId).value = op.ScheduleId || ''
    row.getCell(colIdx.Banco).value = op.Banco ?? ''
    row.getCell(colIdx.Lat).value = op.Lat === '' ? null : op.Lat
    row.getCell(colIdx.Lng).value = op.Lng === '' ? null : op.Lng
  })

  // Applica VALIDATION + FORMULE su tutte le righe dati (anche future) fino a DATA_ROWS
  const lastRow = 1 + DATA_ROWS
  const catCol = colLetter(colIdx.Categoria)
  const langCol = colLetter(colIdx.Lingue)
  const payCol = colLetter(colIdx.Pagamenti)
  const marketCol = colLetter(colIdx.MarketSlug)
  const schedCol = colLetter(colIdx.ScheduleId)
  const comuneCol = colLetter(colIdx.Comune)
  const giornoCol = colLetter(colIdx.Giorno)
  const luogoCol = colLetter(colIdx.Luogo)
  const latCol = colLetter(colIdx.Lat)
  const lngCol = colLetter(colIdx.Lng)

  for (let r = 2; r <= lastRow; r++) {
    const rowN = r

    // Categoria (dropdown rigido)
    ws.getCell(`${catCol}${rowN}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['Cats'],
      showErrorMessage: true,
      errorTitle: 'Categoria non valida',
      error: `Usa una tra: ${CATEGORIES.join(', ')}`,
    }

    // Lingue (dropdown suggerito — ma non forza; permette anche stringa libera "it, en")
    ws.getCell(`${langCol}${rowN}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['Langs'],
      showErrorMessage: false, // non blocca: l'utente può scrivere "it, en, fr"
      prompt: 'Suggeriti: it, en, fr, de, es. Separa con virgola per più lingue.',
      showInputMessage: true,
    }

    // Pagamenti
    ws.getCell(`${payCol}${rowN}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['Pays'],
      showErrorMessage: false,
      prompt: 'Suggeriti: cash, card, digital. Separa con virgola.',
      showInputMessage: true,
    }

    // MarketSlug (dropdown rigido)
    if (opts.marketSlugs.length > 0) {
      ws.getCell(`${marketCol}${rowN}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['Markets'],
        showErrorMessage: true,
        errorTitle: 'Zona non valida',
        error: 'Seleziona una delle zone dell\'elenco.',
      }
    }

    // ScheduleId (dropdown rigido, da foglio Sessioni)
    if (opts.sessions.length > 0) {
      ws.getCell(`${schedCol}${rowN}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['Schedules'],
        showErrorMessage: true,
        errorTitle: 'ScheduleId non valido',
        error: 'Seleziona dall\'elenco del foglio Sessioni.',
      }
    }

    // Comune/Giorno/Luogo: formule IFERROR + VLOOKUP su Sessioni
    if (opts.sessions.length > 0) {
      const lastSesRow = 1 + opts.sessions.length
      const sesRange = `${SESSIONS_SHEET_NAME}!$A$2:$I$${lastSesRow}`
      // Sessioni layout: A ScheduleId | B MarketSlug | C Zona | D Comune (4) | E Giorno (5) | F Orario | G Luogo (7) | H Lat | I Lng
      ws.getCell(`${comuneCol}${rowN}`).value = {
        formula: `IFERROR(VLOOKUP(${schedCol}${rowN},${sesRange},4,FALSE),"")`,
      }
      ws.getCell(`${giornoCol}${rowN}`).value = {
        formula: `IFERROR(VLOOKUP(${schedCol}${rowN},${sesRange},5,FALSE),"")`,
      }
      ws.getCell(`${luogoCol}${rowN}`).value = {
        formula: `IFERROR(VLOOKUP(${schedCol}${rowN},${sesRange},7,FALSE),"")`,
      }
    }

    // Lat/Lng: validation decimale (range bounding box Liguria-ovest ampio)
    ws.getCell(`${latCol}${rowN}`).dataValidation = {
      type: 'decimal',
      operator: 'between',
      allowBlank: true,
      formulae: [43, 45],
      showErrorMessage: true,
      errorTitle: 'Latitudine fuori range',
      error: 'Attesa latitudine tra 43 e 45 (Liguria).',
    }
    ws.getCell(`${lngCol}${rowN}`).dataValidation = {
      type: 'decimal',
      operator: 'between',
      allowBlank: true,
      formulae: [7, 9],
      showErrorMessage: true,
      errorTitle: 'Longitudine fuori range',
      error: 'Attesa longitudine tra 7 e 9 (Liguria).',
    }
  }

  // Colonne derivate in grigio + locked (visivo, non blocca perché il foglio non è protetto)
  for (const col of [comuneCol, giornoCol, luogoCol]) {
    ws.getColumn(col).font = { color: { argb: 'FF888888' }, italic: true }
  }

  // ── Foglio Istruzioni (ultimo) ──
  const wsInstr = wb.addWorksheet(INSTRUCTIONS_SHEET_NAME)
  wsInstr.columns = [{ width: 22 }, { width: 80 }]
  INSTRUCTIONS_ROWS.forEach((r) => wsInstr.addRow(r))
  wsInstr.getRow(1).font = { bold: true, size: 14 }
  wsInstr.getColumn(1).font = { bold: true }
  wsInstr.getColumn(2).alignment = { wrapText: true, vertical: 'top' }

  const buffer = await wb.xlsx.writeBuffer()
  return buffer as ArrayBuffer
}
