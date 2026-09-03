#!/usr/bin/env node
/**
 * One-time DB setup for SN Collections.
 * 1. Tests the connection using DATABASE_URL
 * 2. Enables the pgvector extension (built-in on Neon)
 * 3. Prints status
 *
 * Usage:
 *   DATABASE_URL="postgres://..." node scripts/init-db.mjs
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"

const dir = resolve(fileURLToPath(import.meta.url), "..", "..")

function loadEnv() {
  try {
    const raw = readFileSync(resolve(dir, ".env.local"), "utf8")
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
      }
    }
  } catch {
    // no .env.local — rely on process env
  }
}

loadEnv()

const url = process.env.DATABASE_URL
if (!url) {
  console.error("✗ DATABASE_URL not set.")
  console.error("  Add it to .env.local, then run this script again.")
  process.exit(1)
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  console.log("✓ Connected to Postgres")

  await client.query('CREATE EXTENSION IF NOT EXISTS vector')
  console.log("✓ pgvector extension enabled")

  const { rows } = await client.query(
    "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'"
  )
  console.log(`  extname=${rows[0]?.extname} version=${rows[0]?.extversion}`)

  await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto")
  console.log("✓ pgcrypto available")

  const hasTable = await client.query(
    "SELECT to_regclass('public.sn_products') AS t"
  )
  if (hasTable.rows[0]?.t) {
    console.log("ℹ sn_products table already exists — tables are created automatically by the app on first sync.")
  } else {
    console.log("ℹ Tables will be created automatically by the app on first POST /api/sync")
  }

  await client.end()
  console.log("✓ All good. Now run: curl -X POST http://localhost:3000/api/sync -H 'Content-Type: application/json' -d '{\"reindex\":true}'")
} catch (err) {
  console.error("✗ Failed:", err.message)
  process.exit(1)
}
