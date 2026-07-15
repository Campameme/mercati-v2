import { redirect } from 'next/navigation'

// I mercati tipici (antiquariato, produttori, artigianato) ora vivono sulla
// mappa unica insieme ai mercati principali: /tipici confluisce in /mappa,
// dove il filtro "Tipologie" li isola. Vecchi link e SEO reindirizzati qui.
export default function TipiciPage() {
  redirect('/mappa')
}
