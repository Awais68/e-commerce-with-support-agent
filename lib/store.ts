import "server-only"

import {
  getCatalog,
  getLocalCatalog,
  fetchExternalProducts,
  type CatalogProduct,
} from "./catalog"
import {
  isDbConfigured,
  ensureSchema,
  syncProducts,
  getDbProducts,
  type StockState,
  type SyncResult,
} from "./db"
import {
  isRagConfigured,
  indexKnowledgeBaseIfNeeded,
  indexProductsIfMissing,
  indexOpsIfMissing,
  resetAndReindex,
} from "./rag"

const UNITS_PER_SIZE = 5

export function computeStock(p: CatalogProduct): StockState {
  if (p.source !== "local") {
    if (p.price <= 0) return { quantity: 0, inStock: false }
    const hint = typeof p.stockHint === "number" ? p.stockHint : 0
    return hint > 0 ? { quantity: hint, inStock: true } : { quantity: 0, inStock: false }
  }

  if (p.price <= 0) return { quantity: 0, inStock: false }
  const availableSizes = (p.sizes || []).filter((s) => s.available)
  if (availableSizes.length === 0) return { quantity: 0, inStock: false }

  return { quantity: availableSizes.length * UNITS_PER_SIZE, inStock: true }
}

function withStock(p: CatalogProduct): CatalogProduct {
  const s = computeStock(p)
  return { ...p, quantity: s.quantity, inStock: s.inStock }
}

const CATALOG_TTL = 5 * 60 * 1000
let catalogCache: { products: CatalogProduct[]; at: number } | null = null

export async function getStoreCatalog(): Promise<CatalogProduct[]> {
  const now = Date.now()
  if (catalogCache && now - catalogCache.at < CATALOG_TTL) return catalogCache.products

  const local = getLocalCatalog().map(withStock)
  const external = await fetchExternalProducts()
  let merged = [...local, ...external].map(withStock)

  if (isDbConfigured()) {
    const dbProducts = await getDbProducts()
    const knownIds = new Set(merged.map((p) => p.id))
    const extra = dbProducts.filter((p) => !knownIds.has(p.id))
    if (extra.length > 0) merged = [...merged, ...extra.map(withStock)]
  }

  catalogCache = { products: merged, at: now }
  return merged
}

export async function getStoreCatalogByCategory(category: string): Promise<CatalogProduct[]> {
  // Filter the cached store catalog instead of refetching: this also keeps
  // DB-only products visible under their category.
  const catalog = await getStoreCatalog()
  if (!category || category === "All") return catalog
  return catalog.filter((p) => p.category === category)
}

export async function getStoreProductById(id: string): Promise<CatalogProduct | null> {
  const catalog = await getStoreCatalog()
  const product = catalog.find((p) => p.id === id)
  if (!product) return null
  return withStock(product)
}

export interface ForceSyncSummary {
  added: number
  updated: number
  total: number
  outOfStock: number
  externalFetched: number
  kbIndexed: number
  productsIndexed: number
  opsIndexed: number
  fallbackToDb: boolean
}

export async function forceSync(): Promise<ForceSyncSummary> {
  const local = getLocalCatalog()
  const external = await fetchExternalProducts(true)
  let all = [...local, ...external].map(withStock)

  let fallbackToDb = false
  if (isDbConfigured()) {
    const dbProducts = await getDbProducts()
    const knownIds = new Set(all.map((p) => p.id))
    const extra = dbProducts.filter((p) => !knownIds.has(p.id))
    if (extra.length > 0) {
      all = [...all, ...extra.map(withStock)]
      fallbackToDb = true
    }
  }

  let sync: SyncResult = { added: 0, updated: 0, total: all.length, outOfStock: 0 }
  let kbIndexed = 0
  let productsIndexed = 0
  let opsIndexed = 0

  if (isDbConfigured()) {
    await ensureSchema()
    sync = await syncProducts(all, computeStock)
    if (isRagConfigured()) {
      kbIndexed = (await indexKnowledgeBaseIfNeeded()) ? 1 : 0
      productsIndexed = await indexProductsIfMissing(all)
      opsIndexed = await indexOpsIfMissing()
    }
  }

  catalogCache = null

  return {
    added: sync.added,
    updated: sync.updated,
    total: sync.total,
    outOfStock: sync.outOfStock,
    externalFetched: external.length,
    kbIndexed,
    productsIndexed,
    opsIndexed,
    fallbackToDb,
  }
}

export async function reindexRag(): Promise<{ kb: number; products: number; ops: number }> {
  const all = await getCatalog()
  return resetAndReindex(all.map(withStock))
}