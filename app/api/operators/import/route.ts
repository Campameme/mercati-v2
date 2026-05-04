import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { OPERATORS_SHEET_NAME, CATEGORIES } from '@/lib/excel/operators'

export const dynamic = 'force-dynamic'

interface RawRow {
  OperatorId?: string
  OperatorCode?: string
  Nome?: string
  Categoria?: string
  Descrizione?: string
  Email?: string
  Lingue?: string
  Pagamenti?: string
  MarketSlug?: string
  ScheduleId?: string
  Banco?: string | number
  Lat?: string | number
  Lng?: string | number
}

interface RowError {
  rowIndex: number
  message: string
  raw: RawRow
}

interface OperatorGroup {
  /** Chiave di raggruppamento: OperatorId | OperatorCode | "new:<nome>:<homeMarket>" */
  key: string
  operatorId: string | null
  operatorCode: string | null
  name: string
  category: string
  description: string
  email: string | null
  languages: string[]
  paymentMethods: string[]
  /** Mercato di "registrazione" (prima riga per quel codice) */
  homeMarketId: string | null
  homeMarketSlug: string
  presences: Array<{
    scheduleId: string
    scheduleMarketId: string
    lat: number | null
    lng: number | null
    stall: string | null
    rowIndex: number
  }>
}

function toStr(v: unknown): string {
  if (v == null) return ''
  return String(v).trim()
}
function toNumOrNull(v: unknown): number | null {
  if (v === '' || v == null) return null
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
function splitList(v: unknown): string[] {
  const s = toStr(v)
  if (!s) return []
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}

export async function POST(request: NextRequest) {
  const authClient = createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { data: profile } = await authClient.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const isSuper = profile?.role === 'super_admin'
  const { data: adminOf } = await authClient.from('market_admins').select('market_id').eq('user_id', user.id)
  const adminMarkets = new Set((adminOf ?? []).map((r: any) => r.market_id))

  if (!isSuper && adminMarkets.size === 0) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  }

  const url = new URL(request.url)
  const dryRun = url.searchParams.get('dryRun') === '1'

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'File mancante' }, { status: 400 })
  const arrayBuffer = await file.arrayBuffer()

  let wb: XLSX.WorkBook
  try {
    wb = XLSX.read(arrayBuffer, { type: 'array' })
  } catch {
    return NextResponse.json({ error: 'File .xlsx non valido' }, { status: 400 })
  }
  const sheet = wb.Sheets[OPERATORS_SHEET_NAME] ?? wb.Sheets[wb.SheetNames[0]]
  if (!sheet) return NextResponse.json({ error: `Foglio "${OPERATORS_SHEET_NAME}" non trovato` }, { status: 400 })

  const rawRows: RawRow[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  // Lookup mappings
  const service = createServiceClient()
  const { data: allMarkets } = await service.from('markets').select('id, slug')
  const marketBySlug = new Map<string, string>()
  for (const m of allMarkets ?? []) marketBySlug.set((m as any).slug.toLowerCase(), (m as any).id)

  const { data: allSchedules } = await service.from('market_schedules').select('id, market_id')
  const scheduleToMarket = new Map<string, string>()
  for (const s of allSchedules ?? []) scheduleToMarket.set((s as any).id, (s as any).market_id)

  // Cerca operatori esistenti per code (case-insensitive)
  const incomingCodes = Array.from(
    new Set(rawRows.map((r) => toStr(r.OperatorCode).toLowerCase()).filter(Boolean)),
  )
  const codeToOperatorId = new Map<string, { id: string; market_id: string }>()
  if (incomingCodes.length > 0) {
    const { data: existing } = await service
      .from('operators')
      .select('id, code, market_id')
      .in('code', incomingCodes)
    // case-insensitive: ricerca anche con lower(code) se necessario
    for (const r of existing ?? []) {
      if ((r as any).code) codeToOperatorId.set(((r as any).code as string).toLowerCase(), { id: (r as any).id, market_id: (r as any).market_id })
    }
    // fallback ilike per codici case diversi
    if (codeToOperatorId.size < incomingCodes.length) {
      for (const c of incomingCodes) {
        if (codeToOperatorId.has(c)) continue
        const { data: e } = await service
          .from('operators')
          .select('id, code, market_id')
          .ilike('code', c)
          .maybeSingle()
        if (e && (e as any).code) codeToOperatorId.set(c, { id: (e as any).id, market_id: (e as any).market_id })
      }
    }
  }

  // Group per operator
  const groups = new Map<string, OperatorGroup>()
  const errors: RowError[] = []

  rawRows.forEach((r, idx) => {
    const rowIndex = idx + 2

    const name = toStr(r.Nome)
    if (!name) {
      if (Object.values(r).every((v) => toStr(v) === '')) return
      errors.push({ rowIndex, message: 'Nome mancante', raw: r })
      return
    }

    const category = toStr(r.Categoria).toLowerCase()
    if (!CATEGORIES.includes(category as any)) {
      errors.push({ rowIndex, message: `Categoria "${category}" non valida. Accettate: ${CATEGORIES.join(', ')}`, raw: r })
      return
    }

    const marketSlug = toStr(r.MarketSlug).toLowerCase()
    const marketId = marketSlug ? marketBySlug.get(marketSlug) ?? null : null
    if (marketSlug && !marketId) {
      errors.push({ rowIndex, message: `MarketSlug "${marketSlug}" non trovato`, raw: r })
      return
    }
    if (!marketId) {
      errors.push({ rowIndex, message: 'MarketSlug obbligatorio', raw: r })
      return
    }
    if (!isSuper && !adminMarkets.has(marketId)) {
      errors.push({ rowIndex, message: `Non sei admin del mercato "${marketSlug}"`, raw: r })
      return
    }

    const operatorId = toStr(r.OperatorId) || null
    const operatorCode = toStr(r.OperatorCode) || null
    const codeKey = operatorCode ? operatorCode.toLowerCase() : null

    // Determina la chiave di raggruppamento
    // Priorità: OperatorId > OperatorCode > nome+market
    let key: string
    let resolvedId: string | null = operatorId
    if (operatorId) {
      key = `id:${operatorId}`
    } else if (codeKey) {
      const existing = codeToOperatorId.get(codeKey)
      if (existing) resolvedId = existing.id
      key = `code:${codeKey}`
    } else {
      key = `new:${name}:${marketId}`
    }

    let group = groups.get(key)
    if (!group) {
      group = {
        key,
        operatorId: resolvedId,
        operatorCode,
        name,
        category,
        description: toStr(r.Descrizione),
        email: toStr(r.Email) || null,
        languages: splitList(r.Lingue),
        paymentMethods: splitList(r.Pagamenti),
        homeMarketId: marketId,
        homeMarketSlug: marketSlug,
        presences: [],
      }
      groups.set(key, group)
    }

    const scheduleId = toStr(r.ScheduleId)
    if (scheduleId) {
      const schedMarket = scheduleToMarket.get(scheduleId)
      if (!schedMarket) {
        errors.push({ rowIndex, message: `ScheduleId "${scheduleId}" non trovato`, raw: r })
        return
      }
      // Cross-market: la sessione può essere in un mercato diverso da quello di home,
      // ma l'utente deve essere admin di QUEL mercato (o super)
      if (!isSuper && !adminMarkets.has(schedMarket)) {
        errors.push({ rowIndex, message: `Non sei admin del mercato della sessione (ScheduleId ${scheduleId})`, raw: r })
        return
      }
      group.presences.push({
        scheduleId,
        scheduleMarketId: schedMarket,
        lat: toNumOrNull(r.Lat),
        lng: toNumOrNull(r.Lng),
        stall: toStr(r.Banco) || null,
        rowIndex,
      })
    }
  })

  const preview = {
    willCreate: 0,
    willUpdate: 0,
    totalPresences: 0,
    errors,
    groups: Array.from(groups.values()).map((g) => ({
      operatorId: g.operatorId,
      operatorCode: g.operatorCode,
      name: g.name,
      marketSlug: g.homeMarketSlug,
      action: g.operatorId ? ('update' as const) : ('create' as const),
      presencesCount: g.presences.length,
    })),
  }
  for (const g of groups.values()) {
    if (g.operatorId) preview.willUpdate += 1
    else preview.willCreate += 1
    preview.totalPresences += g.presences.length
  }

  if (dryRun) {
    return NextResponse.json({ dryRun: true, preview })
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Correggi gli errori prima di importare', preview }, { status: 400 })
  }

  let created = 0
  let updated = 0
  let presencesSaved = 0

  for (const g of groups.values()) {
    let opId = g.operatorId
    const opPayload: Record<string, unknown> = {
      market_id: g.homeMarketId!,
      name: g.name,
      category: g.category,
      description: g.description || null,
      languages: g.languages,
      payment_methods: g.paymentMethods,
    }
    if (g.operatorCode) opPayload.code = g.operatorCode
    if (opId) {
      const { error } = await service.from('operators').update(opPayload).eq('id', opId)
      if (error) {
        errors.push({ rowIndex: 0, message: `Errore update ${g.name}: ${error.message}`, raw: {} })
        continue
      }
      updated += 1
    } else {
      const { data, error } = await service.from('operators').insert(opPayload).select('id').single()
      if (error || !data) {
        errors.push({ rowIndex: 0, message: `Errore create ${g.name}: ${error?.message ?? 'unknown'}`, raw: {} })
        continue
      }
      opId = data.id
      created += 1
    }
    if (!opId) continue

    for (const p of g.presences) {
      const { error } = await service.from('operator_schedules').upsert({
        operator_id: opId,
        schedule_id: p.scheduleId,
        location_lat: p.lat,
        location_lng: p.lng,
        stall_number: p.stall,
      })
      if (error) {
        errors.push({ rowIndex: p.rowIndex, message: `Errore presenza: ${error.message}`, raw: {} })
      } else {
        presencesSaved += 1
      }
    }
  }

  return NextResponse.json({
    ok: true,
    created,
    updated,
    presencesSaved,
    errors,
  })
}
