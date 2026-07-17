import 'server-only'
import QRCode from 'qrcode'

// SVG del QR (nessuna immagine remota, nessun canvas): si può inlineare nella
// pagina. Il payload è il token opaco della carta — mai l'id utente.
export async function qrSvg(payload: string): Promise<string> {
  return QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    color: { dark: '#26241E', light: '#0000' }, // ink su trasparente
  })
}
