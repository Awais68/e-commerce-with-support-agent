import "server-only"

import { Pool, type PoolClient } from "pg"
import type { CatalogProduct } from "./catalog"

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

const SCHEMA_SQL = `
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
  embedding vector(1536),
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
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entry_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS sn_product_chunks_hnsw
  ON sn_product_chunks USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS sn_kb_chunks_hnsw
  ON sn_kb_chunks USING hnsw (embedding vector_cosine_ops);
`

export async function ensureSchema(): Promise<boolean> {
  const db = getPool()
  if (!db || schemaReady) return schemaReady
  try {
    await db.query(SCHEMA_SQL)
    schemaReady = true
    console.log("[sn-db] schema ready (pgvector enabled)")
  } catch (err) {
    console.error("[sn-db] schema init failed:", err)
  }
  return schemaReady
}

async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T | null> {
  const db = getPool()
  if (!db) return null
  const client = await db.connect()
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
            made_in, quantity, in_stock
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13::jsonb,$14::jsonb,$15::jsonb,$16,$17,$18
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
            updated_at = now()
          RETURNING (xmax = 0) AS inserted`,
          [
            row.id, row.source, row.sourceId, row.name, row.price, row.category,
            row.image, row.hoverImage, row.description, row.longDescription,
            row.materials, row.care, row.sizes, row.colors, row.details,
            row.madeIn, row.quantity, row.inStock,
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