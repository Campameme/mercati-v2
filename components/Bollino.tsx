// Bollino "RETE DEI BANCHI" — la targa dei banchi aderenti (sistema Nodo ×
// Mezzogiorno): cerchio alga, testo ad anello che ruota piano (mz-ring-spin,
// reduced-motion safe), nodo al centro col capo limone. Vive su /aderisci,
// nella sezione rete della home e sui materiali dei banchi.

export default function Bollino({ className = '', spin = true }: { className?: string; spin?: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="I Mercati della Riviera dei Fiori — Rete dei banchi">
      <circle cx="100" cy="100" r="96" fill="#46683B" />
      <circle cx="100" cy="100" r="69" fill="none" stroke="#FBF6EC" strokeWidth="2" />
      <defs>
        <path id="bollino-ring" d="M100,100 m -82,0 a 82,82 0 1,1 164,0 a 82,82 0 1,1 -164,0" />
      </defs>
      <g className={spin ? 'mz-ring-spin' : undefined} style={{ transformOrigin: '100px 100px' }}>
        <text fontFamily="var(--font-alt), sans-serif" fontSize="13.2" fontWeight="600" letterSpacing="3" fill="#FBF6EC">
          <textPath href="#bollino-ring" startOffset="2%">I MERCATI DELLA RIVIERA DEI FIORI · RETE DEI BANCHI ·</textPath>
        </text>
      </g>
      <g transform="translate(43,58) scale(0.95)">
        <path
          d="M14 68 C 2 52, 12 26, 36 26 C 62 26, 60 62, 40 62 C 24 62, 26 38, 48 33 C 74 27, 96 40, 100 66"
          fill="none" stroke="#FBF6EC" strokeWidth="8" strokeLinecap="round"
        />
        <path d="M36 26 C 62 26, 60 62, 40 62" fill="none" stroke="#EAC54F" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  )
}
