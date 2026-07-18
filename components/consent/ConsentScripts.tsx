'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

// Gating degli script di terze parti secondo il consenso dell'utente e il
// Google Consent Mode v2. Finché l'utente non acconsente, i tag restano in
// modalità "denied" e GTM/Meta non vengono nemmeno caricati.
//
// Fase attuale: se le env non sono impostate, il componente non carica nulla e
// non rompe. GTM orchestra GA4/Ads/Pixel lato Tag Manager: qui non inseriamo
// GA né Pixel separati, salvo il Pixel opzionale via NEXT_PUBLIC_META_PIXEL_ID.

const STORAGE_KEY = 'imercati:consent:v2'
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

type Consent = { analytics: boolean; marketing: boolean }

function readConsent(): Consent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { analytics: false, marketing: false }
    const p = JSON.parse(raw) as { analytics?: unknown; marketing?: unknown }
    return { analytics: !!p.analytics, marketing: !!p.marketing }
  } catch {
    return { analytics: false, marketing: false }
  }
}

// Riflette il consenso corrente ai tag Google già in pagina (Consent Mode v2).
// window.gtag è definito dallo script inline `beforeInteractive` qui sotto.
function pushGoogleConsent(c: Consent) {
  if (!GTM_ID || typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag
  if (typeof gtag !== 'function') return
  gtag('consent', 'update', {
    analytics_storage: c.analytics ? 'granted' : 'denied',
    ad_storage: c.marketing ? 'granted' : 'denied',
    ad_user_data: c.marketing ? 'granted' : 'denied',
    ad_personalization: c.marketing ? 'granted' : 'denied',
  })
}

// Consenso lato Meta Pixel (se presente e già inizializzato).
function pushMetaConsent(c: Consent) {
  if (!PIXEL_ID || typeof window === 'undefined') return
  const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq
  if (typeof fbq !== 'function') return
  fbq('consent', c.marketing ? 'grant' : 'revoke')
}

export default function ConsentScripts() {
  const [consent, setConsent] = useState<Consent>({ analytics: false, marketing: false })

  useEffect(() => {
    // Allinea allo stato salvato (es. utente di ritorno che aveva già scelto).
    const initial = readConsent()
    setConsent(initial)
    pushGoogleConsent(initial)
    pushMetaConsent(initial)

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ analytics?: boolean; marketing?: boolean }>).detail
      const next: Consent = {
        analytics: !!detail?.analytics,
        marketing: !!detail?.marketing,
      }
      setConsent(next)
      pushGoogleConsent(next)
      pushMetaConsent(next)
    }
    window.addEventListener('imk:consent-changed', onChange)
    return () => window.removeEventListener('imk:consent-changed', onChange)
  }, [])

  // Niente ID configurati: non caricare nulla.
  if (!GTM_ID && !PIXEL_ID) return null

  const anyGoogle = consent.analytics || consent.marketing

  return (
    <>
      {/* Consent Mode v2: default DENIED impostato PRIMA di GTM. Definisce anche
          window.gtag così gli update runtime possono riusarlo. Nessuna risorsa
          esterna: sicuro anche senza consenso. */}
      {GTM_ID && (
        <Script id="google-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(){ dataLayer.push(arguments); };
            gtag('consent', 'default', {
              ad_storage: 'denied',
              analytics_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              wait_for_update: 500
            });
            gtag('set', 'ads_data_redaction', true);
          `}
        </Script>
      )}

      {/* GTM: caricato SOLO con consenso ad almeno una categoria non necessaria. */}
      {GTM_ID && anyGoogle && (
        <Script id="gtm-loader" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
      )}

      {/* Meta Pixel opzionale: caricato SOLO con consenso marketing. */}
      {PIXEL_ID && consent.marketing && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('consent', 'grant');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  )
}
