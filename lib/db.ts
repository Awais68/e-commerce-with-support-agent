import "server-only"

import { Pool, type PoolClient } from "pg"
import type { CatalogProduct } from "./catalog"
import { skuForProduct } from "./ops"

export interface StockState {
  quantity: number
  inStock: boolean
}

export interface SyncResult {
  added: number
  updated: number
  total: number
  outOfStock: number
}

let pool: Pool | null = null
let schemaReady = false
let schemaPromise: Promise<boolean> | null = null

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

function getPool(): Pool | null {
  if (!isDbConfigured()) return null
  if (pool) return pool
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000,
  })
  pool.on("error", (err) => {
    console.error("SN DB pool error:", err)
  })
  return pool
}

const EMBED_DIMS = Number(process.env.EMBEDDING_DIMS) || 1536

const SCHEMA_SQL = (dims: number) => `
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS sn_products (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'local',
  source_id TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  hover_image TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  long_description TEXT NOT NULL DEFAULT '',
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  care JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  details JSONB NOT NULL DEFAULT '[]'::jsonb,
  made_in TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 0,
  in_stock BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS sn_products_source_idx
  ON sn_products (source, source_id)
  WHERE source_id <> '';

CREATE TABLE IF NOT EXISTS sn_product_chunks (
  id SERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES sn_products(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  chunk_text TEXT NOT NULL,
  embedding vector(${dims}),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, chunk_index)
);

CREATE TABLE IF NOT EXISTS sn_kb_chunks (
  id SERIAL PRIMARY KEY,
  entry_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  chunk_text TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(${dims}),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entry_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS sn_product_chunks_hnsw
  ON sn_product_chunks USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS sn_kb_chunks_hnsw
  ON sn_kb_chunks USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS sn_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sn_users ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT '';
ALTER TABLE sn_users ADD COLUMN IF NOT EXISTS avatar TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS sn_sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES sn_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sn_sessions_user_idx ON sn_sessions (user_id);

CREATE TABLE IF NOT EXISTS sn_addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES sn_users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  name TEXT NOT NULL DEFAULT '',
  street TEXT NOT NULL DEFAULT '',
  apartment TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  zip TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sn_addresses_user_idx ON sn_addresses (user_id);

CREATE TABLE IF NOT EXISTS sn_orders (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  user_id TEXT REFERENCES sn_users(id) ON DELETE SET NULL,
  email TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT '',
  provider_session_id TEXT NOT NULL DEFAULT '',
  provider_transaction_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  currency TEXT NOT NULL DEFAULT 'PKR',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sn_orders_user_idx ON sn_orders (user_id);
CREATE INDEX IF NOT EXISTS sn_orders_session_idx ON sn_orders (provider_session_id);
CREATE INDEX IF NOT EXISTS sn_orders_reference_idx ON sn_orders (reference);

ALTER TABLE sn_products ADD COLUMN IF NOT EXISTS sku TEXT NOT NULL DEFAULT '';
ALTER TABLE sn_products ADD COLUMN IF NOT EXISTS barcode TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS sn_couriers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT 'domestic',
  charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  eta_min INTEGER NOT NULL DEFAULT 1,
  eta_max INTEGER NOT NULL DEFAULT 3,
  tracking_url TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sn_shipments (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES sn_orders(id) ON DELETE CASCADE,
  order_ref TEXT NOT NULL,
  courier TEXT NOT NULL DEFAULT '',
  tracking_no TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  eta TEXT NOT NULL DEFAULT '',
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sn_shipments_order_ref_idx ON sn_shipments (order_ref);
CREATE INDEX IF NOT EXISTS sn_shipments_tracking_idx ON sn_shipments (tracking_no);

CREATE TABLE IF NOT EXISTS sn_stock_in (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES sn_products(id) ON DELETE SET NULL,
  supplier TEXT NOT NULL DEFAULT '',
  invoice_no TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  received_by TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS sn_stock_in_product_idx ON sn_stock_in (product_id);
CREATE INDEX IF NOT EXISTS sn_stock_in_received_idx ON sn_stock_in (received_at DESC);

CREATE TABLE IF NOT EXISTS sn_ops_chunks (
  id SERIAL PRIMARY KEY,
  kind TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  chunk_text TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(${dims}),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (kind, entry_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS sn_ops_chunks_hnsw
  ON sn_ops_chunks USING hnsw (embedding vector_cosine_ops);
`

const ALIGN_EMBEDDING_SQL = (dims: number) => `
DO $sn$
BEGIN
  BEGIN
    ALTER TABLE sn_kb_chunks ALTER COLUMN embedding TYPE vector(${dims});
  EXCEPTION WHEN OTHERS THEN
    DROP TABLE sn_kb_chunks CASCADE;
  END;
  BEGIN
    ALTER TABLE sn_product_chunks ALTER COLUMN embedding TYPE vector(${dims});
  EXCEPTION WHEN OTHERS THEN
    DROP TABLE sn_product_chunks CASCADE;
  END;
  BEGIN
    ALTER TABLE sn_ops_chunks ALTER COLUMN embedding TYPE vector(${dims});
  EXCEPTION WHEN OTHERS THEN
    DROP TABLE sn_ops_chunks CASCADE;
  END;
END $sn$;`

/**
 * Cheap probe that avoids the multi-round-trip DDL when the schema is already
 * in place. `atttypmod` on a pgvector column carries the declared dimension, so
 * a single query tells us whether the tables exist AND match EMBED_DIMS.
 */
async function schemaAlreadyMatches(db: Pool, dims: number): Promise<boolean> {
  try {
    const res = await db.query<{ ready: boolean }>(
      `SELECT bool_and(a.atttypmod = $1) AS ready
       FROM pg_attribute a
       WHERE a.attrelid IN (
               to_regclass('sn_product_chunks'),
               to_regclass('sn_kb_chunks'),
               to_regclass('sn_ops_chunks')
             )
         AND a.attname = 'embedding'
         AND NOT a.attisdropped
       HAVING count(*) = 3`,
      [dims]
    )
    return res.rows[0]?.ready === true
  } catch {
    return false
  }
}

async function initSchema(db: Pool): Promise<boolean> {
  if (await schemaAlreadyMatches(db, EMBED_DIMS)) {
    schemaReady = true
    return true
  }
  try {
    await db.query(SCHEMA_SQL(EMBED_DIMS))
    await db.query(ALIGN_EMBEDDING_SQL(EMBED_DIMS))
    await db.query(SCHEMA_SQL(EMBED_DIMS))
    schemaReady = true
    console.log(`[sn-db] schema ready (pgvector enabled, embedding dims ${EMBED_DIMS})`)
  } catch (err) {
    console.error("[sn-db] schema init failed:", err)
  }
  return schemaReady
}

export async function ensureSchema(): Promise<boolean> {
  const db = getPool()
  if (!db || schemaReady) return schemaReady
  // Share one init across concurrent requests instead of running the DDL per call.
  if (!schemaPromise) {
    schemaPromise = initSchema(db).finally(() => {
      if (!schemaReady) schemaPromise = null
    })
  }
  return schemaPromise
}

async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T | null> {
  const db = getPool()
  if (!db) return null
  let client: PoolClient | null = null
  try {
    client = await db.connect()
  } catch (err) {
    console.error("[sn-db] connect failed:", err)
    return null
  }
  try {
    return await fn(client)
  } catch (err) {
    console.error("[sn-db] query error:", err)
    return null
  } finally {
    client.release()
  }
}

export async function dbQuery<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[] | null> {
  const db = getPool()
  if (!db) return null
  try {
    const res = await db.query(text, params)
    return res.rows as T[]
  } catch (err) {
    console.error("[sn-db] dbQuery error:", err)
    return null
  }
}

function productToRow(p: CatalogProduct, stock: StockState) {
  const sku = skuForProduct(p.id)
  return {
    id: p.id,
    source: p.source,
    sourceId: p.sourceId ?? p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    image: p.image ?? "",
    hoverImage: p.hoverImage ?? p.image ?? "",
    description: p.description ?? "",
    longDescription: p.longDescription ?? "",
    materials: JSON.stringify(p.materials ?? []),
    care: JSON.stringify(p.care ?? []),
    sizes: JSON.stringify(p.sizes ?? []),
    colors: JSON.stringify(p.colors ?? []),
    details: JSON.stringify(p.details ?? []),
    madeIn: p.madeIn ?? "",
    quantity: stock.quantity,
    inStock: stock.inStock,
    sku: sku?.sku ?? "",
    barcode: sku?.barcode ?? "",
  }
}

export async function syncProducts(products: CatalogProduct[], stock: (p: CatalogProduct) => StockState): Promise<SyncResult> {
  const db = getPool()
  if (!db || products.length === 0) {
    return { added: 0, updated: 0, total: products.length, outOfStock: 0 }
  }

  const result = await withClient(async (client) => {
    try {
      await client.query("BEGIN")
      let added = 0
      let updated = 0
      let outOfStock = 0

      for (const p of products) {
        const s = stock(p)
        if (s.quantity <= 0) outOfStock += 1
        const row = productToRow(p, s)
        const res = await client.query(
          `INSERT INTO sn_products (
            id, source, source_id, name, price, category, image, hover_image,
            description, long_description, materials, care, sizes, colors, details,
            made_in, quantity, in_stock, sku, barcode
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13::jsonb,$14::jsonb,$15::jsonb,$16,$17,$18,$19,$20
          )
          ON CONFLICT (id) DO UPDATE SET
            source = EXCLUDED.source,
            source_id = EXCLUDED.source_id,
            name = EXCLUDED.name,
            price = EXCLUDED.price,
            category = EXCLUDED.category,
            image = EXCLUDED.image,
            hover_image = EXCLUDED.hover_image,
            description = EXCLUDED.description,
            long_description = EXCLUDED.long_description,
            materials = EXCLUDED.materials,
            care = EXCLUDED.care,
            sizes = EXCLUDED.sizes,
            colors = EXCLUDED.colors,
            details = EXCLUDED.details,
            made_in = EXCLUDED.made_in,
            quantity = EXCLUDED.quantity,
            in_stock = EXCLUDED.in_stock,
            sku = EXCLUDED.sku,
            barcode = EXCLUDED.barcode,
            updated_at = now()
          RETURNING (xmax = 0) AS inserted`,
          [
            row.id, row.source, row.sourceId, row.name, row.price, row.category,
            row.image, row.hoverImage, row.description, row.longDescription,
            row.materials, row.care, row.sizes, row.colors, row.details,
            row.madeIn, row.quantity, row.inStock, row.sku, row.barcode,
          ]
        )
        if (res.rows[0]?.inserted) added += 1
        else updated += 1
      }

      await client.query("COMMIT")
      return { added, updated, total: products.length, outOfStock }
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    }
  })

  if (!result) {
    return { added: 0, updated: 0, total: products.length, outOfStock: 0 }
  }
  return result
}

export interface DbProduct {
  id: string
  source: string
  source_id: string
  name: string
  price: string
  category: string
  image: string
  hover_image: string
  description: string
  long_description: string
  materials: string[]
  care: string[]
  sizes: { size: string; available: boolean }[]
  colors: { name: string; hex: string; available: boolean }[]
  details: string[]
  made_in: string
  quantity: number
  in_stock: boolean
}

function toCatalogProduct(row: DbProduct): CatalogProduct {
  return {
    id: row.id,
    source: (row.source as CatalogProduct["source"]) || "local",
    sourceId: row.source_id,
    name: row.name,
    price: Number(row.price),
    category: row.category,
    image: row.image,
    hoverImage: row.hover_image,
    description: row.description,
    longDescription: row.long_description,
    materials: row.materials ?? [],
    care: row.care ?? [],
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    details: row.details ?? [],
    madeIn: row.made_in,
    quantity: row.quantity,
    inStock: row.in_stock,
  }
}

export async function getDbProducts(): Promise<CatalogProduct[]> {
  const result = await withClient((client) =>
    client.query<DbProduct>(
      `SELECT id, source, source_id, name, price, category, image, hover_image,
              description, long_description, materials, care, sizes, colors, details,
              made_in, quantity, in_stock
       FROM sn_products
       ORDER BY created_at DESC`
    )
  )
  if (!result) return []
  return result.rows.map(toCatalogProduct)
}

export async function getDbProductById(id: string): Promise<CatalogProduct | null> {
  const result = await withClient((client) =>
    client.query<DbProduct>(
      `SELECT id, source, source_id, name, price, category, image, hover_image,
              description, long_description, materials, care, sizes, colors, details,
              made_in, quantity, in_stock
       FROM sn_products WHERE id = $1`,
      [id]
    )
  )
  if (!result || result.rows.length === 0) return null
  return toCatalogProduct(result.rows[0])
}