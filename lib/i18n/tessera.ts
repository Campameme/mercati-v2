// Testi della tessera punti e dell'accesso con codice email (OTP), ×4 lingue.
// Come gli altri dizionari: leggeri, senza routing per lingua.
import type { Lang } from './home'

export interface LoginDict {
  title: string
  lead: string
  emailLabel: string
  sendCode: string
  codeSent: string
  codeLabel: string
  verify: string
  resend: string
  changeEmail: string
  welcomeNote: string
  staffLink: string
  backCitizen: string
  genericError: string
}

export const LOGIN_I18N: Record<Lang, LoginDict> = {
  it: {
    title: 'Entra al mercato',
    lead: 'Scrivi la tua email: ti mandiamo un codice a 6 cifre, niente password da ricordare.',
    emailLabel: 'La tua email',
    sendCode: 'Mandami il codice',
    codeSent: 'Codice inviato: controlla la posta (anche lo spam). Vale pochi minuti.',
    codeLabel: 'Codice a 6 cifre',
    verify: 'Entra',
    resend: 'Mandamelo di nuovo',
    changeEmail: 'Cambia email',
    welcomeNote: 'Alla prima iscrizione la tessera parte con 100 punti di benvenuto.',
    staffLink: 'Sei un operatore o un admin? Accedi con la password',
    backCitizen: '← Torna all’accesso con codice email',
    genericError: 'Qualcosa è andato storto. Riprova tra un momento.',
  },
  fr: {
    title: 'Entrez au marché',
    lead: 'Écrivez votre email : nous vous envoyons un code à 6 chiffres, aucun mot de passe à retenir.',
    emailLabel: 'Votre email',
    sendCode: 'Envoyez-moi le code',
    codeSent: 'Code envoyé : vérifiez votre boîte mail (et les spams). Il expire dans quelques minutes.',
    codeLabel: 'Code à 6 chiffres',
    verify: 'Entrer',
    resend: 'Renvoyer le code',
    changeEmail: 'Changer d’email',
    welcomeNote: 'À la première inscription, la carte démarre avec 100 points de bienvenue.',
    staffLink: 'Marchand ou admin ? Connexion avec mot de passe',
    backCitizen: '← Retour à l’accès par code email',
    genericError: 'Un problème est survenu. Réessayez dans un instant.',
  },
  de: {
    title: 'Rein in den Markt',
    lead: 'E-Mail eingeben: wir schicken einen 6-stelligen Code — kein Passwort nötig.',
    emailLabel: 'Deine E-Mail',
    sendCode: 'Code schicken',
    codeSent: 'Code verschickt: bitte Posteingang (und Spam) prüfen. Er gilt nur wenige Minuten.',
    codeLabel: '6-stelliger Code',
    verify: 'Anmelden',
    resend: 'Code erneut schicken',
    changeEmail: 'E-Mail ändern',
    welcomeNote: 'Bei der ersten Anmeldung startet die Karte mit 100 Willkommenspunkten.',
    staffLink: 'Händler oder Admin? Anmeldung mit Passwort',
    backCitizen: '← Zurück zum Code-Login',
    genericError: 'Etwas ist schiefgelaufen. Bitte gleich noch einmal versuchen.',
  },
  en: {
    title: 'Come on in',
    lead: 'Type your email: we’ll send a 6-digit code — no password to remember.',
    emailLabel: 'Your email',
    sendCode: 'Send me the code',
    codeSent: 'Code sent: check your inbox (and spam). It expires in a few minutes.',
    codeLabel: '6-digit code',
    verify: 'Sign in',
    resend: 'Send it again',
    changeEmail: 'Change email',
    welcomeNote: 'On your first sign-up the card starts with 100 welcome points.',
    staffLink: 'Vendor or admin? Sign in with password',
    backCitizen: '← Back to email-code sign in',
    genericError: 'Something went wrong. Please try again in a moment.',
  },
}

export interface TesseraDict {
  eyebrow: string
  title: string
  pointsLabel: string
  historyTitle: string
  historyEmpty: string
  couponsTitle: string
  couponsEmpty: string
  couponActive: string
  couponUsed: string
  couponVoid: string
  logout: string
  qrTitle: string
  qrHint: string
  joinTitle: string
  joinLead: string
  joinConsent: string
  joinCta: string
  shopTitle: string
  shopLead: string
  shopCta: string
  gdprTitle: string
  gdprExport: string
  gdprDelete: string
  gdprDeleteConfirm: string
}

export const TESSERA_I18N: Record<Lang, TesseraDict> = {
  it: {
    eyebrow: 'La tessera del mercato',
    title: 'I tuoi punti',
    pointsLabel: 'punti',
    historyTitle: 'I movimenti',
    historyEmpty: 'Ancora nessun movimento: si comincia con la spesa di sabato.',
    couponsTitle: 'I tuoi coupon',
    couponsEmpty: 'Nessun coupon per ora: arrivano con le offerte dei banchi di fiducia.',
    couponActive: 'attivo',
    couponUsed: 'usato',
    couponVoid: 'annullato',
    logout: 'Esci',
    qrTitle: 'Il tuo QR',
    qrHint: 'Mostralo al banco per ricevere o usare i punti.',
    joinTitle: 'Attiva la tessera',
    joinLead: 'Un QR personale per accumulare punti al mercato e usarli quando vuoi.',
    joinConsent: 'Attivandola acconsenti al trattamento dei tuoi dati per la tessera punti (vedi Privacy).',
    joinCta: 'Attiva ora',
    shopTitle: 'Lo shop dei punti',
    shopLead: 'Trasforma i tuoi punti in buoni regalo.',
    shopCta: 'Vai allo shop',
    gdprTitle: 'I tuoi dati',
    gdprExport: 'Scarica i miei dati',
    gdprDelete: 'Cancella la tessera',
    gdprDeleteConfirm: 'Cancellare tutta la tessera (punti e coupon)? L’azione è definitiva.',
  },
  fr: {
    eyebrow: 'La carte du marché',
    title: 'Vos points',
    pointsLabel: 'points',
    historyTitle: 'Les mouvements',
    historyEmpty: 'Aucun mouvement pour l’instant : tout commence samedi au marché.',
    couponsTitle: 'Vos coupons',
    couponsEmpty: 'Pas de coupon pour le moment : ils arrivent avec les initiatives des étals de confiance.',
    couponActive: 'actif',
    couponUsed: 'utilisé',
    couponVoid: 'annulé',
    logout: 'Se déconnecter',
    qrTitle: 'Votre QR',
    qrHint: 'Montrez-le à l’étal pour recevoir ou utiliser les points.',
    joinTitle: 'Activez la carte',
    joinLead: 'Un QR personnel pour cumuler des points au marché et les utiliser quand vous voulez.',
    joinConsent: 'En l’activant, vous consentez au traitement de vos données pour la carte de points (voir Confidentialité).',
    joinCta: 'Activer',
    shopTitle: 'La boutique des points',
    shopLead: 'Transformez vos points en bons cadeaux.',
    shopCta: 'Voir la boutique',
    gdprTitle: 'Vos données',
    gdprExport: 'Télécharger mes données',
    gdprDelete: 'Supprimer la carte',
    gdprDeleteConfirm: 'Supprimer toute la carte (points et coupons) ? L’action est définitive.',
  },
  de: {
    eyebrow: 'Die Marktkarte',
    title: 'Deine Punkte',
    pointsLabel: 'Punkte',
    historyTitle: 'Die Bewegungen',
    historyEmpty: 'Noch keine Bewegungen: es beginnt mit dem Einkauf am Samstag.',
    couponsTitle: 'Deine Coupons',
    couponsEmpty: 'Noch keine Coupons: sie kommen mit den Aktionen der Stände des Vertrauens.',
    couponActive: 'aktiv',
    couponUsed: 'eingelöst',
    couponVoid: 'storniert',
    logout: 'Abmelden',
    qrTitle: 'Dein QR',
    qrHint: 'Zeig ihn am Stand, um Punkte zu erhalten oder einzulösen.',
    joinTitle: 'Karte aktivieren',
    joinLead: 'Ein persönlicher QR, um auf dem Markt Punkte zu sammeln und jederzeit zu nutzen.',
    joinConsent: 'Mit der Aktivierung stimmst du der Verarbeitung deiner Daten für die Punktekarte zu (siehe Datenschutz).',
    joinCta: 'Aktivieren',
    shopTitle: 'Der Punkte-Shop',
    shopLead: 'Verwandle deine Punkte in Gutscheine.',
    shopCta: 'Zum Shop',
    gdprTitle: 'Deine Daten',
    gdprExport: 'Meine Daten laden',
    gdprDelete: 'Karte löschen',
    gdprDeleteConfirm: 'Die ganze Karte (Punkte und Coupons) löschen? Die Aktion ist endgültig.',
  },
  en: {
    eyebrow: 'The market card',
    title: 'Your points',
    pointsLabel: 'points',
    historyTitle: 'Activity',
    historyEmpty: 'No activity yet: it all starts with Saturday’s shopping.',
    couponsTitle: 'Your coupons',
    couponsEmpty: 'No coupons yet: they come with the Masters’ initiatives.',
    couponActive: 'active',
    couponUsed: 'used',
    couponVoid: 'voided',
    logout: 'Sign out',
    qrTitle: 'Your QR',
    qrHint: 'Show it at the stall to get or spend points.',
    joinTitle: 'Activate the card',
    joinLead: 'A personal QR to collect points at the market and use them whenever you like.',
    joinConsent: 'By activating it you consent to the processing of your data for the points card (see Privacy).',
    joinCta: 'Activate',
    shopTitle: 'The points shop',
    shopLead: 'Turn your points into gift vouchers.',
    shopCta: 'Go to shop',
    gdprTitle: 'Your data',
    gdprExport: 'Download my data',
    gdprDelete: 'Delete card',
    gdprDeleteConfirm: 'Delete the whole card (points and coupons)? This cannot be undone.',
  },
}

/** Etichette leggibili per le causali note del ledger. */
export const REASON_I18N: Record<string, Record<Lang, string>> = {
  welcome: {
    it: 'Benvenuto al mercato',
    fr: 'Bienvenue au marché',
    de: 'Willkommen auf dem Markt',
    en: 'Welcome to the market',
  },
}

export function reasonLabel(reason: string, lang: Lang): string {
  return REASON_I18N[reason]?.[lang] ?? reason
}
