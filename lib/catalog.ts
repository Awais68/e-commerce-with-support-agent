import { products as localProducts, type Product } from "./products"

export type CatalogSource = "local" | "fakestore" | "kolz"

export interface CatalogProduct extends Product {
  source: CatalogSource
  sourceId: string
}

export const catalogCategories = [
  "All",
  "Men",
  "Women",
  "Outerwear",
  "Dresses",
  "Knitwear",
  "Trousers",
  "Accessories",
  "Baby",
  "Girls",
  "Men Winter",
  "Men Summer",
  "Shoes",
  "Electronics",
  "Jewelry",
  "Beauty & Personal Care",
  "Home & Kitchen",
  "Health & Fitness",
  "Fashion & Apparel",
  "Miscellaneous",
]

const DEFAULT_SIZE = "One Size"
const DEFAULT_COLORS: Product["colors"] = []

interface RawFakeStore {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating?: { rate: number; count: number }
}

interface RawKolz {
  id: string | number
  image: string
  name: string
  rating?: { stars: number; count: number }
  priceCents?: number
  category: string
  subCategory?: string
  description: string
}

function toDetails(description: string): string[] {
  const clean = description?.trim().replace(/\s+/g, " ").slice(0, 160)
  return [
    clean || "Premium quality product sourced for the SN Collections catalogue",
    "SN Collections authenticated",
    "Complimentary shipping on all orders",
  ]
}

function baseExternal(input: {
  id: string
  name: string
  price: number
  category: string
  image: string
  hoverImage: string
  description: string
  longDescription: string
  source: CatalogSource
  sourceId: string
}): CatalogProduct {
  return {
    id: input.id,
    name: input.name,
    price: input.price,
    category: input.category,
    image: input.image,
    hoverImage: input.hoverImage,
    description: input.description.slice(0, 90) + (input.description.length > 90 ? "…" : ""),
    longDescription:
      input.longDescription ||
      `${input.name}. ${input.description}. Crafted to meet the exacting standards of SN Collections.`,
    materials: ["Imported premium materials", "Authentic sourcing"],
    care: ["Follow the care instructions provided with the product", "Store appropriately to preserve quality"],
    sizes: [{ size: DEFAULT_SIZE, available: true }],
    colors: DEFAULT_COLORS,
    details: toDetails(input.description),
    madeIn: "Imported",
    source: input.source,
    sourceId: input.sourceId,
  }
}

function mapFakeStoreCategory(category: string): string {
  switch (category) {
    case "men's clothing":
      return "Men"
    case "women's clothing":
      return "Women"
    case "electronics":
      return "Electronics"
    case "jewelery":
    case "jewelry":
      return "Jewelry"
    default:
      return "Miscellaneous"
  }
}

function normalizeFakeStore(items: RawFakeStore[]): CatalogProduct[] {
  return items.map((item) =>
    baseExternal({
      id: `fs-${item.id}`,
      name: item.title,
      price: item.price,
      category: mapFakeStoreCategory(item.category),
      image: item.image,
      hoverImage: item.image,
      description: item.description,
      longDescription: item.description,
      source: "fakestore",
      sourceId: String(item.id),
    })
  )
}

function mapKolzCategory(category: string, subCategory: string): string {
  const top = category?.toLowerCase() || ""
  const sub = subCategory?.toLowerCase() || ""
  if (top.includes("beauty")) return "Beauty & Personal Care"
  if (top.includes("electronics")) return "Electronics"
  if (top.includes("home")) return "Home & Kitchen"
  if (top.includes("health")) return "Health & Fitness"
  if (top.includes("fashion")) {
    if (sub.includes("men")) return "Men"
    if (sub.includes("women")) return "Women"
    if (sub.includes("footwear")) return "Shoes"
    if (sub.includes("accessories")) return "Accessories"
    return "Fashion & Apparel"
  }
  return "Miscellaneous"
}

function normalizeKolz(items: RawKolz[]): CatalogProduct[] {
  return items.map((item) => {
    const name = item.name || "SN Collections Product"
    const price = item.priceCents != null ? item.priceCents / 100 : 0
    const category = mapKolzCategory(item.category || "", item.subCategory || "")
    return baseExternal({
      id: `kolz-${item.id}`,
      name,
      price,
      category,
      image: item.image || "/placeholder.svg",
      hoverImage: item.image || "/placeholder.svg",
      description: item.description || `${name} — curated for the SN Collections catalogue.`,
      longDescription: item.description || `${name} — curated for the SN Collections catalogue.`,
      source: "kolz",
      sourceId: String(item.id),
    })
  })
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(12000),
  })
  if (!res.ok) throw new Error(`Request failed for ${url}: ${res.status}`)
  return res.json()
}

export async function fetchExternalProducts(): Promise<CatalogProduct[]> {
  const [fake, kolz] = await Promise.allSettled([
    fetchJson<RawFakeStore[]>("https://fakestoreapi.com/products").then(normalizeFakeStore),
    fetchJson<RawKolz[]>(
      "https://kolzsticks.github.io/Free-Ecommerce-Products-Api/main/products.json"
    ).then(normalizeKolz),
  ])

  return [
    ...(fake.status === "fulfilled" ? fake.value : []),
    ...(kolz.status === "fulfilled" ? kolz.value : []),
  ]
}

const EXTERNAL_TTL = 60 * 60 * 1000
let externalCache: { products: CatalogProduct[]; fetchedAt: number } | null = null

async function getExternalCached(): Promise<CatalogProduct[]> {
  const now = Date.now()
  if (externalCache && now - externalCache.fetchedAt < EXTERNAL_TTL) {
    return externalCache.products
  }
  const products = await fetchExternalProducts()
  externalCache = { products, fetchedAt: now }
  return products
}

export function getLocalCatalog(): CatalogProduct[] {
  return localProducts.map((p) => ({ ...p, source: "local", sourceId: p.id }))
}

export async function getCatalog(): Promise<CatalogProduct[]> {
  const [local, external] = await Promise.all([Promise.resolve(getLocalCatalog()), getExternalCached()])
  return [...local, ...external]
}

export async function getCatalogByCategory(category: string): Promise<CatalogProduct[]> {
  const catalog = await getCatalog()
  if (!category || category === "All") return catalog
  return catalog.filter((p) => p.category === category)
}

export async function getCatalogProductById(id: string): Promise<CatalogProduct | undefined> {
  const catalog = await getCatalog()
  return catalog.find((p) => p.id === id)
}

export function getRelatedCatalogProducts(
  catalog: CatalogProduct[],
  currentId: string,
  limit = 4
): CatalogProduct[] {
  const current = catalog.find((p) => p.id === currentId)
  if (!current) return catalog.slice(0, limit)
  const sameCategory = catalog.filter((p) => p.id !== currentId && p.category === current.category)
  const others = catalog.filter((p) => p.id !== currentId && p.category !== current.category)
  return [...sameCategory, ...others].slice(0, limit)
}