// Dati e silhouette dei borghi costieri — condivisi tra l'intro (skyline) e
// la Costa (tessere cliccabili). I "giorni" sono indicativi nel prototipo;
// i link puntano alla ricerca mappa (robusta agli slug).

export interface Borgo {
  n: string
  g: string
  nota: string
  /** titolo per /api/comune-image (Wikipedia), se diverso dal nome mostrato */
  wiki?: string
}

export const BORGHI: Borgo[] = [
  { n: 'Ventimiglia', g: 'venerdì', nota: 'Il venerdì transfrontaliero, il più grande della Liguria.' },
  { n: 'Bordighera', g: 'giovedì', nota: 'Palme, lungomare e la luce dei pittori.' },
  { n: 'Ospedaletti', g: '3° sabato', nota: 'Un balcone sul mare, raccolto e gentile.' },
  { n: 'Sanremo', g: 'sabato', nota: 'La città dei fiori, tra la Pigna e il Corso.' },
  { n: 'Arma di Taggia', g: 'mercoledì', nota: "L'olio e le valli che scendono al mare.", wiki: 'Taggia' },
  { n: 'Imperia', g: 'merc · sab', nota: 'Oneglia e Porto Maurizio: due anime, un mercato.' },
  { n: 'Diano Marina', g: 'martedì', nota: 'La baia del sole, distesa e larga.' },
  { n: 'Cervo', g: "sere d'estate", nota: "Il borgo che canta d'estate, a picco sul blu.", wiki: 'Cervo (Italia)' },
]

export function BorgoMark({ i, className = 'w-14 md:w-24 h-auto' }: { i: number; className?: string }) {
  const fill = ['#0E3F52', '#114F66', '#15607C'][i % 3]
  return (
    <svg viewBox="0 0 90 60" className={className} aria-hidden="true">
      <path d="M0 60 Q22 34 45 40 Q70 46 90 60 Z" fill={fill} />
      <g fill="#F7EFDD" opacity="0.92">
        <rect x="30" y="30" width="9" height="14" />
        <rect x="42" y="26" width="10" height="18" />
        <rect x="55" y="33" width="8" height="11" />
      </g>
      <g fill={fill}>
        <path d="M29 30 l4.5 -5 l4.5 5 Z" />
        <path d="M41 26 l6 -6 l6 6 Z" />
        <path d="M54 33 l4 -4 l4 4 Z" />
      </g>
    </svg>
  )
}
