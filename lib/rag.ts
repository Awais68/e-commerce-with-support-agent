import "server-only"

import { dbQuery, ensureSchema, isDbConfigured } from "./db"
import { knowledgeBase } from "./knowledge-base"
import type { CatalogProduct } from "./catalog"

export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small"
export const EMBEDDING_DIMS = 1536
export const EMBEDDING_URL = process.env.EMBEDDING_URL || "https://api.openai.com/v1/embeddings"

export function isRagConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY)
}

export async function getEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch(EMBEDDING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
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
    `Price: $${p.price.toLocaleString()}`,
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

  let indexed = 0
  for (const p of products) {
    const existing = await dbQuery<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM sn_product_chunks WHERE product_id = $1",
      [p.id]
    )
    if (existing && existing[0]?.count > 0) continue

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

export async function resetAndReindex(products: CatalogProduct[]): Promise<{ kb: number; products: number }> {
  if (!isDbConfigured()) return { kb: 0, products: 0 }
  await ensureSchema()
  await dbQuery("DELETE FROM sn_kb_chunks")
  await dbQuery("DELETE FROM sn_product_chunks")
  kbIndexed = false
  const kb = (await indexKnowledgeBaseIfNeeded()) ? 1 : 0
  const p = await indexProductsIfMissing(products)
  return { kb, products: p }
}

export interface RagHit {
  title: string
  text: string
  productId?: string
}

export interface RagResult {
  kb: RagHit[]
  products: RagHit[]
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

  return {
    kb: (kbRes || []).map((r) => ({ title: r.title, text: r.chunk_text })),
    products: (prodRes || []).map((r) => ({ title: r.name, text: r.chunk_text, productId: r.product_id })),
  }
}

export function ragContextToString(rag: RagResult): string {
  const parts: string[] = []
  for (const hit of rag.kb) parts.push(`## ${hit.title}\n${hit.text}`)
  for (const hit of rag.products) parts.push(`## ${hit.title}\n${hit.text}`)
  return parts.join("\n\n")
}