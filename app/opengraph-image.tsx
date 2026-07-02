import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/site'

// Immagine OG di default (1200×630): fondo notte, sole e onde come
// nell'emblema del brand. Runtime EDGE obbligatorio: la variante node di
// @vercel/og si rompe se il percorso del progetto contiene spazi (Windows).
export const runtime = 'edge'
export const alt = `${SITE_NAME} — il mercato che profuma di mare`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0E3040',
          padding: '72px 84px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              color: '#F7EFDD',
              opacity: 0.85,
              fontSize: 28,
              letterSpacing: 6,
              textTransform: 'uppercase',
            }}
          >
            Riviera dei Fiori · Provincia di Imperia
          </div>
          <div
            style={{
              display: 'flex',
              width: 72,
              height: 72,
              borderRadius: 9999,
              backgroundColor: '#F4B62C',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* corpo ridotto: il nome lungo va su due righe dentro i 1032px utili */}
          <div style={{ display: 'flex', color: '#F7EFDD', fontSize: 88, lineHeight: 1.05, maxWidth: 1032 }}>
            {SITE_NAME}
          </div>
          <div style={{ display: 'flex', color: '#DCEBEC', fontSize: 38, marginTop: 18 }}>
            Il mercato che profuma di mare.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <svg width="1032" height="60" viewBox="0 0 1032 60" fill="none">
            <path
              d="M0 20 C 60 0, 120 40, 180 20 S 300 0, 360 20 S 480 40, 540 20 S 660 0, 720 20 S 840 40, 900 20 S 1000 5, 1032 18"
              stroke="#F4B62C"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M0 48 C 60 28, 120 68, 180 48 S 300 28, 360 48 S 480 68, 540 48 S 660 28, 720 48 S 840 68, 900 48 S 1000 33, 1032 46"
              stroke="#DCEBEC"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        </div>
      </div>
    ),
    { ...size },
  )
}
