#!/usr/bin/env node
/**
 * Applies pending SQL migrations from supabase/migrations/ against SUPABASE_DB_URL.
 * Tracks applied migrations in a _migrations table so each file runs at most once.
 * Then runs supabase/seed.sql (always, since it's idempotent).
 *
 * Required env: SUPABASE_DB_URL (Postgres connection string from Supabase dashboard).
 * Usage: npm run migrate   (or invoked automatically via npm run dev)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

// Load .env.local (Next.js convention)
dotenv.config({ path: path.join(projectRoot, '.env.local') })
dotenv.config({ path: path.join(projectRoot, '.env') })

const conn = process.env.SUPABASE_DB_URL
if (!conn) {
  console.error('\n[migrate] SUPABASE_DB_URL non impostata.')
  console.error('[migrate] Aggiungi in .env.local la Connection String del tuo progetto Supabase:')
  console.error('[migrate]   Supabase dashboard → Project Settings → Database → Connection string → URI')
  console.error('[migrate]   SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres\n')
  process.exit(1)
}

const migrationsDir = path.join(projectRoot, 'supabase', 'migrations')
const seedFile = path.join(projectRoot, 'supabase', 'seed.sql')

const client = new pg.Client({
  connectionString: conn,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  await client.connect()

  // Tracking table
  await client.query(`
    create table if not exists public._migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    );
  `)

  // Read all migration files sorted by name
  const files = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
    : []

  const { rows: applied } = await client.query('select name from public._migrations')
  const appliedSet = new Set(applied.map((r) => r.name))

  let appliedCount = 0
  for (const file of files) {
    if (appliedSet.has(file)) continue
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    process.stdout.write(`[migrate] Applying ${file}... `)
    try {
      await client.query('begin')
      await client.query(sql)
      await client.query('insert into public._migrations (name) values ($1) on conflict do nothing', [file])
      await client.query('commit')
      console.log('ok')
      appliedCount++
    } catch (err) {
      await client.query('rollback')
      console.log('FAILED')
      console.error(`[migrate] Errore in ${file}:`, err.message)
      throw err
    }
  }

  if (appliedCount === 0) {
    console.log('[migrate] Nessuna migrazione nuova.')
  } else {
    console.log(`[migrate] ${appliedCount} migrazion${appliedCount === 1 ? 'e' : 'i'} applicat${appliedCount === 1 ? 'a' : 'e'}.`)
  }

  // Seed (always — must be idempotent)
  if (fs.existsSync(seedFile)) {
    const sql = fs.readFileSync(seedFile, 'utf8')
    process.stdout.write('[migrate] Seeding... ')
    try {
      await client.query(sql)
      console.log('ok')
    } catch (err) {
      console.log('FAILED')
      console.error('[migrate] Errore in seed:', err.message)
      throw err
    }
  }

  await client.end()
}

main().catch((err) => {
  console.error('[migrate] Fallito:', err.message)
  process.exit(1)
})
