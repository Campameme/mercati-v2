/**
 * Wrapper email per Mercati di Ponente. Usa Resend se RESEND_API_KEY e settata,
 * altrimenti logga warning e ritorna { ok: false, reason: 'no_key' }.
 * Cosi in dev/staging il form continua a funzionare (salvando su DB)
 * senza richiedere setup esterno.
 */
import { Resend } from 'resend'

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'no_key' | 'error'; detail?: string }

export interface SendArgs {
  to: string
  subject: string
  html: string
  replyTo?: string
}

let cachedClient: Resend | null = null
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!cachedClient) cachedClient = new Resend(key)
  return cachedClient
}

export async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<SendResult> {
  const r = client()
  if (!r) {
    console.warn('[email] RESEND_API_KEY non impostata, email non inviata')
    return { ok: false, reason: 'no_key' }
  }
  const from = process.env.RESEND_FROM ?? 'Mercati di Ponente <no-reply@imercati.it>'
  try {
    const res = await r.emails.send({ from, to, subject, html, replyTo })
    if (res.error) {
      console.error('[email] Resend error:', res.error)
      return { ok: false, reason: 'error', detail: String(res.error) }
    }
    return { ok: true, id: res.data?.id ?? '' }
  } catch (e: any) {
    console.error('[email] send exception:', e)
    return { ok: false, reason: 'error', detail: e?.message ?? 'unknown' }
  }
}
