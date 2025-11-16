export interface MarketEvent {
  id: string
  comune: string
  evento: string
  tipologia: string
  giorno?: string // es: "sabato", "domenica"
  dataInizio: string // "ricorrente" o "DD/MM"
  dataFine: string // "ricorrente" o "DD/MM"
  mese?: string // es: "giugno", "agosto"
  orario?: string
  luogo?: string
  organizzatore?: string
  settoriMerceologici?: string
  start?: Date // Data calcolata per FullCalendar
  end?: Date // Data calcolata per FullCalendar
  allDay?: boolean
}

export interface EventFilters {
  comune: string
  categoria: string
  tipo: string
}

