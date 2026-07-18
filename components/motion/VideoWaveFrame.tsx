import WaveDivider from './WaveDivider'

/**
 * Riquadro del video hero con due nastri d'onda che scorrono lungo il bordo
 * superiore (alga) e inferiore (terracotta): "contorni a onda che si muovono".
 * Il video sta sopra; le onde sono decorative (pointer-events none, aria-hidden).
 * Reduced-motion: lo scorrimento si ferma, l'onda resta come cornice.
 */
export default function VideoWaveFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="imk-videoframe">
      <WaveDivider className="imk-vwave -top-3 text-alga/70" />
      <div className="relative overflow-hidden rounded-2xl border border-[#e0d7c1] shadow-xl aspect-[4/5]">
        {children}
      </div>
      <WaveDivider className="imk-vwave bottom -bottom-3 text-terracotta/70" />
    </div>
  )
}
