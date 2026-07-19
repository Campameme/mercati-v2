import WaveDivider from './WaveDivider'

/**
 * Riquadro del video hero con bordi FLUIDI: dentro il riquadro (overflow
 * hidden), sopra e sotto, due onde piene color crema — il fondo pagina — che
 * si deformano piano come i divisori di sezione (morph, non scorrimento).
 * L'onda in alto è capovolta (scaleY(-1) via CSS .imk-vframe-wave.top):
 * effetto "il video galleggia nella crema con bordi liquidi".
 * Onde decorative (aria-hidden e pointer-events none in WaveDivider/CSS);
 * reduced-motion: i profili restano fermi sulla forma d'appoggio.
 */
export default function VideoWaveFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#e0d7c1] shadow-xl aspect-[4/5]">
      {children}
      {/* bordo alto: la crema scende nel video con creste capovolte */}
      <WaveDivider fill className="imk-vframe-wave top text-crema" />
      {/* bordo basso: la crema risale nel video */}
      <WaveDivider fill className="imk-vframe-wave bottom text-crema" />
    </div>
  )
}
