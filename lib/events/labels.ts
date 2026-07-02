// Etichette e colori delle CATEGORIE EVENTO — unica fonte di verità per
// /calendar, /[marketSlug]/calendar, EventCard e la bacheca /eventi.
// I colori riprendono la palette brand e le tinte-tipologia dei mercati
// (vedi lib/schedules/classify): mare = mercato · terracotta = fiera ·
// verde orto = gastronomia · viola = musica · fiore = arte · notte = sport.
export const EVT_LABEL: Record<string, string> = {
  market: 'Mercato',
  fair: 'Fiera',
  food: 'Gastronomia',
  music: 'Musica',
  art: 'Arte',
  sport: 'Sport',
  other: 'Altro',
}

export const EVT_COLOR: Record<string, string> = {
  market: '#15607C',
  fair: '#C2502E',
  food: '#4C8B3F',
  music: '#8E5BB5',
  art: '#EC6A5E',
  sport: '#0E3040',
  other: '#4A4438',
}

export const ALL_EVT_CATS = Object.keys(EVT_LABEL)
