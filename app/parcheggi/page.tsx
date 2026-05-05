import { redirect } from 'next/navigation'

// /parcheggi → /  (la mappa con parcheggi è ora integrata in ogni pagina mercato)
export default function ParcheggiRedirect() {
  redirect('/')
}
