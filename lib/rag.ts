import "server-only"

import { dbQuery, ensureSchema, isDbConfigured } from "./db"
import { knowledgeBase } from "./knowledge-base"
import { couriers, shipments, stockIn, type Shipment } from "./ops"
import type { CatalogProduct } from "./catalog"

export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small"
export const EMBEDDING_DIMS = Number(process.env.EMBEDDING_DIMS) || 1536
export const EMBEDDING_URL = process.env.EMBEDDING_URL || "https://api.openai.com/v1/embeddings"

function embeddingApiKey(): string {
  return process.env.EMBEDDING_API_KEY || process.env.OPENAI_API_KEY || ""
}

export function isRagConfigured(): boolean {
  return Boolean(embeddingApiKey())
}

export async function getEmbedding(text: string): Promise<number[] | null> {
  const apiKey = embeddingApiKey()
  if (!apiKey) return null
  try {
    const res = await fetch(EMBEDDING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: text, dimensions: EMBEDDING_DIMS }),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) {
      console.error("[rag] embedding HTTP error:", res.status)
      return null
    }
    const data = await res.json()
    const emb = data?.data?.[0]?.embedding
    if (!Array.isArray(emb) || emb.length !== EMBEDDING_DIMS) return null
    return emb
  } catch (err) {
    console.error("[rag] embedding request failed:", err)
    return null
  }
}

export function chunkText(text: string, maxLen = 900): string[] {
  const clean = text.replace(/\s+/g, " ").trim()
  if (!clean) return []
  if (clean.length <= maxLen) return [clean]

  const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean]
  const chunks: string[] = []
  let current = ""

  for (const raw of sentences) {
    const piece = raw.trim()
    if (!piece) continue
    if ((current + " " + piece).length > maxLen) {
      if (current) chunks.push(current.trim())
      current = piece.length > maxLen ? piece.slice(0, maxLen) : piece
    } else {
      current = current ? `${current} ${piece}` : piece
    }
  }
  if (current) chunks.push(current.trim())
  return chunks
}

let kbIndexed = false

export async function indexKnowledgeBaseIfNeeded(): Promise<boolean> {
  if (!isRagConfigured() || !isDbConfigured() || kbIndexed) return kbIndexed
  await ensureSchema()

  const existing = await dbQuery<{ count: number }>("SELECT COUNT(*)::int AS count FROM sn_kb_chunks")
  if (existing && existing[0]?.count > 0) {
    kbIndexed = true
    return kbIndexed
  }

  for (const entry of knowledgeBase) {
    const text = `${entry.title}\n${entry.answer}\nKeywords: ${entry.keywords.join(", ")}`
    const chunks = chunkText(text)
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getEmbedding(chunks[i])
      if (!embedding) continue
      await dbQuery(
        `INSERT INTO sn_kb_chunks (entry_id, chunk_index, title, chunk_text, metadata, embedding)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6::vector)
         ON CONFLICT (entry_id, chunk_index) DO UPDATE SET
           chunk_text = EXCLUDED.chunk_text,
           title = EXCLUDED.title,
           metadata = EXCLUDED.metadata,
           embedding = EXCLUDED.embedding`,
        [entry.id, i, entry.title, chunks[i], JSON.stringify({ keywords: entry.keywords }), JSON.stringify(embedding)]
      )
    }
  }

  kbIndexed = true
  return kbIndexed
}

export function buildProductText(p: CatalogProduct): string {
  const sizes = p.sizes?.filter((s) => s.available).map((s) => s.size).join(", ")
  const colors = p.colors?.filter((c) => c.available).map((c) => c.name).join(", ")
  const inStock = p.inStock ?? true
  return [
    `Product: ${p.name}`,
    `Category: ${p.category}`,
    `Price: PKR ${p.price.toLocaleString()}`,
    `Description: ${p.longDescription || p.description}`,
    `Materials: ${(p.materials || []).join(", ")}`,
    `Available sizes: ${sizes || "N/A"}`,
    `Available colors: ${colors || "N/A"}`,
    `Made in: ${p.madeIn || "Imported"}`,
    `Stock: ${inStock ? "in stock" : "out of stock"}${typeof p.quantity === "number" ? ` (quantity ${p.quantity})` : ""}`,
  ].join("\n")
}

export async function indexProductsIfMissing(products: CatalogProduct[]): Promise<number> {
  if (!isRagConfigured() || !isDbConfigured()) return 0
  await ensureSchema()

  const existing = await dbQuery<{ product_id: string }>(
    "SELECT DISTINCT product_id FROM sn_product_chunks WHERE product_id = ANY($1::text[])",
    [products.map((p) => p.id)]
  )
  const existingIds = new Set((existing || []).map((r) => r.product_id))
  const missing = products.filter((p) => !existingIds.has(p.id))
  if (missing.length === 0) return 0

  let indexed = 0
  for (const p of missing) {
    const chunks = chunkText(buildProductText(p))
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getEmbedding(chunks[i])
      if (!embedding) continue
      await dbQuery(
        `INSERT INTO sn_product_chunks (product_id, chunk_index, chunk_text, embedding)
         VALUES ($1, $2, $3, $4::vector)
         ON CONFLICT (product_id, chunk_index) DO NOTHING`,
        [p.id, i, chunks[i], JSON.stringify(embedding)]
      )
      indexed += 1
    }
  }
  return indexed
}

export interface OpsRecord {
  kind: "courier" | "shipment" | "stock-in"
  entryId: string
  title: string
  text: string
}

function shipmentText(s: Shipment): string {
  const events = s.timeline.map((e) => `- ${e.status} on ${e.at}${e.note ? ` (${e.note})` : ""}`).join("\n")
  return [
    `Order ${s.orderRef}`,
    `Status: ${s.status}`,
    `Courier: ${s.courier}`,
    `Tracking: ${s.trackingNo}`,
    `ETA: ${s.eta}`,
    events,
  ].join("\n")
}

export async function getOpsRecords(): Promise<OpsRecord[]> {
  const records: OpsRecord[] = []

  if (isDbConfigured()) {
    await ensureSchema()
    const courierRows = await dbQuery<{ id: string; name: string; service: string; charge: string; eta_min: number; eta_max: number }>(
      "SELECT id, name, service, charge, eta_min, eta_max FROM sn_couriers"
    )
    for (const c of courierRows || []) {
      records.push({
        kind: "courier",
        entryId: `courier-${c.id}`,
        title: `Courier: ${c.name}`,
        text: `Courier: ${c.name} (${c.service}), delivery charge PKR ${Math.round(Number(c.charge)).toLocaleString()}, ETA ${c.eta_min}-${c.eta_max} business days`,
      })
    }

    const shipRows = await dbQuery<{ id: string; order_ref: string; courier: string; tracking_no: string; status: string; eta: string; timeline: unknown }>(
      "SELECT id, order_ref, courier, tracking_no, status, eta, timeline FROM sn_shipments"
    )
    for (const s of shipRows || []) {
      const timeline = Array.isArray(s.timeline)
        ? (s.timeline as { status: string; at?: string; note?: string }[]).map((e) => `- ${e.status} on ${e.at ?? ""}${e.note ? ` (${e.note})` : ""}`).join("\n")
        : ""
      records.push({
        kind: "shipment",
        entryId: `ship-${s.id}`,
        title: `Order ${s.order_ref} shipment`,
        text: `Order ${s.order_ref} — status ${s.status}, courier ${s.courier}, tracking ${s.tracking_no}, ETA ${s.eta}\n${timeline}`,
      })
    }

    const stockRows = await dbQuery<{ id: string; product_id: string; supplier: string; invoice_no: string; quantity: number; unit_cost: string; received_at: string; received_by: string; notes: string }>(
      `SELECT s.id, s.product_id, s.supplier, s.invoice_no, s.quantity, s.unit_cost,
              s.received_at, s.received_by, s.notes
       FROM sn_stock_in s ORDER BY s.received_at DESC`
    )
    for (const r of stockRows || []) {
      records.push({
        kind: "stock-in",
        entryId: `stock-${r.id}`,
        title: `Stock arrival: ${r.supplier}`,
        text: `Stock received: ${r.quantity} units for product ${r.product_id} on ${String(r.received_at).slice(0, 10)}, from ${r.supplier} (invoice ${r.invoice_no}), unit cost PKR ${Number(r.unit_cost).toLocaleString()}, received by ${r.received_by}${r.notes ? `. ${r.notes}` : ""}`,
      })
    }
  }

  if (records.length === 0) {
    for (const c of couriers) {
      records.push({
        kind: "courier",
        entryId: `courier-${c.id}`,
        title: `Courier: ${c.name}`,
        text: `Courier: ${c.name} (${c.service}), delivery charge PKR ${c.charge.toLocaleString()}, ETA ${c.etaMin}-${c.etaMax} business days`,
      })
    }
    for (const s of shipments) {
      records.push({ kind: "shipment", entryId: `ship-${s.orderRef}`, title: `Order ${s.orderRef} shipment`, text: shipmentText(s) })
    }
    for (const r of stockIn) {
      records.push({
        kind: "stock-in",
        entryId: `stock-${r.id}`,
        title: `Stock arrival: ${r.supplier}`,
        text: `Stock received: ${r.quantity} units for product ${r.productId} on ${r.receivedAt}, from ${r.supplier} (invoice ${r.invoiceNo}), unit cost PKR ${r.unitCost.toLocaleString()}, received by ${r.receivedBy}${r.notes ? `. ${r.notes}` : ""}`,
      })
    }
  }

  return records
}

let opsIndexed = false

export async function indexOpsIfMissing(): Promise<number> {
  if (!isRagConfigured() || !isDbConfigured()) return 0
  await ensureSchema()

  const records = await getOpsRecords()
  if (opsIndexed && records.length === 0) return 0

  const existing = await dbQuery<{ entry_id: string }>(
    "SELECT DISTINCT entry_id FROM sn_ops_chunks WHERE entry_id = ANY($1::text[])",
    [records.map((r) => r.entryId)]
  )
  const existingIds = new Set((existing || []).map((r) => r.entry_id))
  const missing = records.filter((r) => !existingIds.has(r.entryId))
  if (missing.length === 0) {
    opsIndexed = true
    return 0
  }

  let indexed = 0
  for (const r of missing) {
    const chunks = chunkText(r.text)
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getEmbedding(chunks[i])
      if (!embedding) continue
      await dbQuery(
        `INSERT INTO sn_ops_chunks (kind, entry_id, chunk_index, title, chunk_text, metadata, embedding)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6::vector)
         ON CONFLICT (kind, entry_id, chunk_index) DO NOTHING`,
        [r.kind, r.entryId, i, r.title, chunks[i], JSON.stringify({}), JSON.stringify(embedding)]
      )
      indexed += 1
    }
  }

  opsIndexed = true
  return indexed
}

export async function resetAndReindex(products: CatalogProduct[]): Promise<{ kb: number; products: number; ops: number }> {
  if (!isDbConfigured()) return { kb: 0, products: 0, ops: 0 }
  await ensureSchema()
  await dbQuery("DELETE FROM sn_kb_chunks")
  await dbQuery("DELETE FROM sn_product_chunks")
  await dbQuery("DELETE FROM sn_ops_chunks")
  kbIndexed = false
  opsIndexed = false
  const kb = (await indexKnowledgeBaseIfNeeded()) ? 1 : 0
  const p = await indexProductsIfMissing(products)
  const ops = await indexOpsIfMissing()
  return { kb, products: p, ops }
}

export interface RagHit {
  title: string
  text: string
  productId?: string
}

export interface RagResult {
  kb: RagHit[]
  products: RagHit[]
  ops: RagHit[]
}

export async function ragSearch(query: string, limit = 5): Promise<RagResult | null> {
  if (!isRagConfigured() || !isDbConfigured()) return null
  await ensureSchema()

  const embedding = await getEmbedding(query)
  if (!embedding) return null
  const vec = JSON.stringify(embedding)

  const kbRes = await dbQuery<{ title: string; chunk_text: string }>(
    `SELECT title, chunk_text FROM sn_kb_chunks
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [vec, limit]
  )

  const prodRes = await dbQuery<{ product_id: string; name: string; chunk_text: string }>(
    `SELECT c.product_id, p.name, c.chunk_text
     FROM sn_product_chunks c
     JOIN sn_products p ON p.id = c.product_id
     WHERE c.embedding IS NOT NULL
     ORDER BY c.embedding <=> $1::vector
     LIMIT $2`,
    [vec, limit]
  )

  const opsRes = await dbQuery<{ title: string; chunk_text: string; metadata: unknown }>(
    `SELECT title, chunk_text, metadata FROM sn_ops_chunks
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [vec, limit]
  )

  return {
    kb: (kbRes || []).map((r) => ({ title: r.title, text: r.chunk_text })),
    products: (prodRes || []).map((r) => ({ title: r.name, text: r.chunk_text, productId: r.product_id })),
    ops: (opsRes || []).map((r) => ({ title: r.title, text: r.chunk_text })),
  }
}

export function ragContextToString(rag: RagResult): string {
  const parts: string[] = []
  for (const hit of rag.kb) parts.push(`## ${hit.title}\n${hit.text}`)
  for (const hit of rag.products) parts.push(`## ${hit.title}\n${hit.text}`)
  for (const hit of rag.ops) parts.push(`## ${hit.title}\n${hit.text}`)
  return parts.join("\n\n")
}