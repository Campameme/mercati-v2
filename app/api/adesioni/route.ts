import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import crypto from 'node:crypto'

export const dynamic = 'force-dynamic'

// Destinatario delle richieste: configurabile via env (ADESIONI_TO) per non
// legare il codice a una casella personale.
const DESTINATARIO = process.env.ADESIONI_TO ?? 'emanueleecampanini@gmail.com'

// Rate limit semplicissimo in-memory: max 3 invii nello stesso minuto dallo stesso ip.
// In produzione su Netlify funziona per istanza, non perfetto ma scoraggia spam basic.
const RECENT = new Map<string, number[]>()
function ratelimit(ip: string): boolean {
  const now = Date.now()
  const arr = (RECENT.get(ip) ?? []).filter((t) => now - t < 60_000)
  if (arr.length >= 3) return false
  arr.push(now)
  RECENT.set(ip, arr)
  return true
}

function hashIp(ip: string): string {
  const salt = process.env.IP_SALT
  if (!salt && process.env.NODE_ENV === 'production') {
    // Col salt di default gli hash IP sono prevedibili: impostare IP_SALT nel deploy.
    console.error('[adesioni] IP_SALT mancante in produzione: impostala nelle env del deploy')
  }
  return crypto.createHash('sha256').update(ip + (salt ?? 'imercati-default-salt')).digest('hex').slice(0, 32)
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  )
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!ratelimit(ip)) {
    return NextResponse.json(
      { error: 'Troppe richieste, riprova tra qualche minuto.' },
      { status: 429 },
    )
  }

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Body non valido' }, { status: 400 })
  }

  const nome = (body.nome ?? '').toString().trim()
  const email = (body.email ?? '').toString().trim().toLowerCase()
  const telefono = (body.telefono ?? '').toString().trim() || null
  const attivita = (body.attivita ?? '').toString().trim()
  const mercatiFrequentati = (body.mercatiFrequentati ?? '').toString().trim() || null
  const messaggio = (body.messaggio ?? '').toString().trim() || null
  // Honeypot: campo nascosto "website". I bot lo riempiono, gli umani no.
  const honeypot = (body.website ?? '').toString()

  if (honeypot) {
    // Finta success per non rivelare il trick
    return NextResponse.json({ ok: true })
  }

  if (!nome || nome.length < 2 || nome.length > 100) {
    return NextResponse.json({ error: 'Nome obbligatorio (2-100 caratteri)' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'Email non valida' }, { status: 400 })
  }
  if (!attivita || attivita.length < 2 || attivita.length > 200) {
    return NextResponse.json({ error: 'Descrizione attivita obbligatoria' }, { status: 400 })
  }
  if (messaggio && messaggio.length > 2000) {
    return NextResponse.json({ error: 'Messaggio troppo lungo (max 2000 caratteri)' }, { status: 400 })
  }

  // 1) Salva su DB (durevole anche se email fallisce)
  const supabase = createClient()
  const { data: row, error: insErr } = await supabase
    .from('adesioni_operatori')
    .insert({
      nome, email, telefono, attivita,
      mercati_frequentati: mercatiFrequentati,
      messaggio,
      user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
      ip_hash: hashIp(ip),
    })
    .select('id')
    .single()

  if (insErr) {
    console.error('[adesioni] insert error', insErr)
    return NextResponse.json({ error: 'Errore salvataggio. Riprova o scrivi direttamente a ' + DESTINATARIO }, { status: 500 })
  }

  // 2) Email (best-effort)
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; color: #2a2620;">
      <h2 style="font-family: Georgia, serif; color: #5d6e3b;">Nuova richiesta di adesione</h2>
      <p style="color: #7a6f60;">Ricevuta su ${SITE_NAME} il ${new Date().toLocaleString('it-IT')}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px 0; color: #7a6f60; vertical-align: top; width: 140px;">Nome</td><td style="padding: 8px 0;">${escapeHtml(nome)}</td></tr>
        <tr><td style="padding: 8px 0; color: #7a6f60; vertical-align: top;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        ${telefono ? `<tr><td style="padding: 8px 0; color: #7a6f60; vertical-align: top;">Telefono</td><td style="padding: 8px 0;">${escapeHtml(telefono)}</td></tr>` : ''}
        <tr><td style="padding: 8px 0; color: #7a6f60; vertical-align: top;">Attivita</td><td style="padding: 8px 0;">${escapeHtml(attivita)}</td></tr>
        ${mercatiFrequentati ? `<tr><td style="padding: 8px 0; color: #7a6f60; vertical-align: top;">Mercati</td><td style="padding: 8px 0;">${escapeHtml(mercatiFrequentati)}</td></tr>` : ''}
        ${messaggio ? `<tr><td style="padding: 8px 0; color: #7a6f60; vertical-align: top;">Messaggio</td><td style="padding: 8px 0; white-space: pre-wrap;">${escapeHtml(messaggio)}</td></tr>` : ''}
      </table>
      <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #ddcdb0; color: #7a6f60; font-size: 12px;">
        ID richiesta: ${row.id}<br>
        Gestisci le richieste in <a href="${SITE_URL}/admin/adesioni">Admin → Adesioni</a>
      </p>
    </div>
  `

  const result = await sendEmail({
    to: DESTINATARIO,
    subject: `Adesione ${SITE_NAME} — ${nome}`,
    html,
    replyTo: email,
  })

  // Aggiorna stato email
  await supabase
    .from('adesioni_operatori')
    .update({
      email_sent: result.ok,
      email_error: result.ok ? null : (result.reason === 'no_key' ? 'no_resend_key' : result.detail ?? 'unknown'),
    })
    .eq('id', row.id)

  return NextResponse.json({ ok: true, id: row.id })
}
