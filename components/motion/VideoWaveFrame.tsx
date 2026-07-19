import WaveDivider from './WaveDivider'

/**
 * Il video hero SENZA box: niente bordo, niente angoli, niente ombra.
 * Riempie il contenitore (che in home è una fascia assoluta appoggiata al
 * margine DESTRO della pagina, da cui "esce") e la crema — il fondo pagina —
 * lo lambisce con onde fluide su tre lati: sopra (capovolta), sotto e sul
 * fianco sinistro (onda verticale). Il quarto lato è il bordo della pagina.
 * Onde decorative (aria-hidden, pointer-events none); reduced-motion: i
 * profili restano fermi sulla forma d'appoggio.
 */
export default function VideoWaveFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {children}
      {/* bordo alto: la crema scende nel video con creste capovolte */}
      <WaveDivider fill className="imk-vframe-wave top text-crema" />
      {/* bordo basso: la crema risale nel video */}
      <WaveDivider fill className="imk-vframe-wave bottom text-crema" />
      {/* fianco sinistro: la crema entra di lato (onda verticale) */}
      <WaveDivider fill vertical className="imk-vframe-wave-left text-crema" />
    </div>
  )
}
