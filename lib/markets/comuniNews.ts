// I siti ufficiali dei comuni della provincia di Imperia con mercato: è lì
// (sezione novità/avvisi, spesso "mercato cittadino") che escono le notizie
// sui mercati. Domini VERIFICATI a mano il 2026-07-17 (root sempre valida —
// i percorsi interni delle news cambiano troppo spesso per essere cablati).
// Vallecrosia e Pornassio: sito non raggiungibile alla verifica, esclusi.

export interface ComuneNewsSource {
  comune: string
  url: string
}

export const COMUNI_NEWS: ComuneNewsSource[] = [
  { comune: 'Ventimiglia', url: 'https://comune.ventimiglia.im.it' },
  { comune: 'Camporosso', url: 'https://comune.camporosso.im.it' },
  { comune: 'Perinaldo', url: 'https://comune.perinaldo.im.it' },
  { comune: 'Bordighera', url: 'https://comune.bordighera.im.it' },
  { comune: 'Ospedaletti', url: 'https://comune.ospedaletti.im.it' },
  { comune: 'Sanremo', url: 'https://comune.sanremo.im.it' },
  { comune: 'Taggia', url: 'https://comune.taggia.im.it' },
  { comune: 'Riva Ligure', url: 'https://comune.rivaligure.im.it' },
  { comune: 'Santo Stefano al Mare', url: 'https://comune.santostefanoalmare.im.it' },
  { comune: 'San Lorenzo al Mare', url: 'https://comune.sanlorenzoalmare.im.it' },
  { comune: 'Imperia', url: 'https://comune.imperia.it' },
  { comune: 'Diano Marina', url: 'https://comune.dianomarina.im.it' },
  { comune: 'San Bartolomeo al Mare', url: 'https://comune.sanbartolomeoalmare.im.it' },
  { comune: 'Cervo', url: 'https://comune.cervo.im.it' },
  { comune: 'Pieve di Teco', url: 'https://comune.pievediteco.im.it' },
  { comune: 'Pontedassio', url: 'https://comune.pontedassio.im.it' },
]
