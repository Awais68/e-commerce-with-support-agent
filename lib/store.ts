import "server-only"

import {
  getCatalog,
  getCatalogByCategory,
  getCatalogProductById,
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

async function syncCatalog(products: CatalogProduct[]): Promise<void> {
  if (!isDbConfigured()) return
  await ensureSchema()
  await syncProducts(products, computeStock)
  await indexKnowledgeBaseIfNeeded()
  await indexProductsIfMissing(products)
}

export async function getStoreCatalog(): Promise<CatalogProduct[]> {
  const local = getLocalCatalog().map(withStock)
  const external = await fetchExternalProducts()
  let merged = [...local, ...external].map(withStock)

  if (external.length === 0 && isDbConfigured()) {
    const dbProducts = await getDbProducts()
    const localIds = new Set(local.map((p) => p.id))
    const extra = dbProducts.filter((p) => !localIds.has(p.id))
    if (extra.length > 0) merged = [...local, ...extra.map(withStock)]
  }

  await syncCatalog(merged)
  return merged
}

export async function getStoreCatalogByCategory(category: string): Promise<CatalogProduct[]> {
  const catalog = await getCatalogByCategory(category)
  const stocked = catalog.map(withStock)
  await syncCatalog(catalog)
  return stocked
}

export async function getStoreProductById(id: string): Promise<CatalogProduct | null> {
  const product = await getCatalogProductById(id)
  if (!product) return null
  const stocked = withStock(product)
  await syncCatalog([stocked])
  return stocked
}

export interface ForceSyncSummary {
  added: number
  updated: number
  total: number
  outOfStock: number
  externalFetched: number
  kbIndexed: number
  productsIndexed: number
  fallbackToDb: boolean
}

export async function forceSync(): Promise<ForceSyncSummary> {
  const local = getLocalCatalog()
  const external = await fetchExternalProducts(true)
  let all = [...local, ...external].map(withStock)

  let fallbackToDb = false
  if (external.length === 0 && isDbConfigured()) {
    const dbProducts = await getDbProducts()
    const localIds = new Set(local.map((p) => p.id))
    const extra = dbProducts.filter((p) => !localIds.has(p.id))
    if (extra.length > 0) {
      all = [...local, ...extra.map(withStock)]
      fallbackToDb = true
    }
  }

  let sync: SyncResult = { added: 0, updated: 0, total: all.length, outOfStock: 0 }
  let kbIndexed = 0
  let productsIndexed = 0

  if (isDbConfigured()) {
    await ensureSchema()
    sync = await syncProducts(all, computeStock)
    if (isRagConfigured()) {
      kbIndexed = (await indexKnowledgeBaseIfNeeded()) ? 1 : 0
      productsIndexed = await indexProductsIfMissing(all)
    }
  }

  return {
    added: sync.added,
    updated: sync.updated,
    total: sync.total,
    outOfStock: sync.outOfStock,
    externalFetched: external.length,
    kbIndexed,
    productsIndexed,
    fallbackToDb,
  }
}

export async function reindexRag(): Promise<{ kb: number; products: number }> {
  const all = await getCatalog()
  return resetAndReindex(all.map(withStock))
}