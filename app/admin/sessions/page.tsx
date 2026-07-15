import { redirect } from 'next/navigation'

// La sezione "Accendi / Spegni" ora è incorporata nel pannello /admin
// (componente MarketToggles). Questa pagina resta come reindirizzamento
// per i vecchi link/segnalibri.
export default function AdminSessionsRedirect() {
  redirect('/admin#accendi-spegni')
}
