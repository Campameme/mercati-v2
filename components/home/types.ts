// Tipi condivisi tra la home server (app/page.tsx) e i componenti client
// dell'esperienza mappa-centrica.

export interface MarketSession {
  scheduleId: string
  giorno: string | null
  orario: string | null
  luogo: string | null
  /** Settori merceologici: "cosa trovi" (es. "Alimentare · Produttori agricoli"). */
  settori: string | null
}

export interface MarketPin {
  /** chiave stabile: `${marketSlug}:${comuneSlug}` */
  id: string
  marketId: string
  marketSlug: string
  marketName: string
  /** giorni di mercato della zona (0=domenica … 6=sabato) */
  marketDays: number[]
  comune: string
  comuneSlug: string
  luogo: string | null
  lat: number
  lng: number
  /** tutte le sessioni di questo mercato in questo comune (giorni diversi) */
  sessions: MarketSession[]
}
