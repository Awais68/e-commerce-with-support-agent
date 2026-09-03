import "server-only"

import { dbQuery, ensureSchema, isDbConfigured } from "./db"
import { couriers, shipments, stockIn, skuForProduct, type Shipment } from "./ops"
import { getLocalCatalog } from "./catalog"

export interface OpsResult {
  intent: string
  context: string
  answer?: string
  confidence: "high" | "medium" | "none"
}

const REF_RE = /\bSN-[A-Z0-9]{6,}\b/i
const TRACKING_RE = /\b(?:TCS|DHL|LP|FEDEX)[-\s]?[A-Z0-9-]{6,}\b/i

function formatMoney(n: number): string {
  return `PKR ${Math.round(n).toLocaleString()}`
}

function shipmentToText(s: Shipment): string {
  const last = s.timeline[s.timeline.length - 1]
  const events = s.timeline.map((e) => `- ${e.status} on ${e.at}${e.note ? ` (${e.note})` : ""}`).join("\n")
  return [
    `Order ${s.orderRef} — current status: ${s.status}${last && last.at ? ` (last update ${last.at})` : ""}`,
    `Courier: ${s.courier}`,
    `Tracking number: ${s.trackingNo}`,
    `Expected delivery: ${s.eta}`,
    `Timeline:\n${events}`,
  ].join("\n")
}

async function lookupOrderByReference(ref: string): Promise<string | null> {
  if (isDbConfigured()) {
    await ensureSchema()
    const order = await dbQuery<Record<string, unknown>>(
      `SELECT reference, status, provider, provider_transaction_id, total, currency, created_at, items
       FROM sn_orders WHERE reference = $1 LIMIT 1`,
      [ref]
    )
    const ship = await dbQuery<Record<string, unknown>>(
      `SELECT courier, tracking_no, status, eta, timeline FROM sn_shipments WHERE order_ref = $1 LIMIT 1`,
      [ref]
    )
    if (order && order[0]) {
      const o = order[0]
      let text = `Order ${o.reference} — status: ${o.status}.`
      if (o.created_at) text += `\nPlaced on ${o.created_at}`
      if (o.provider) text += `\nPayment provider: ${o.provider}${o.provider_transaction_id ? ` (txn ${o.provider_transaction_id})` : ""}`
      if (o.total) text += `\nTotal: ${o.currency ?? "PKR"} ${o.total}`
      if (ship && ship[0]) {
        const s = ship[0]
        text += `\nCourier: ${s.courier}, Tracking: ${s.tracking_no}, Status: ${s.status}, ETA: ${s.eta}`
        const timeline = Array.isArray(s.timeline) ? (s.timeline as { status: string; at?: string }[]) : []
        if (timeline.length > 0) {
          text += `\nTimeline:\n` + timeline.map((e) => `- ${e.status}${e.at ? ` on ${e.at}` : ""}`).join("\n")
        }
      }
      return text
    }
  }

  const local = shipments.find((s) => s.orderRef.toLowerCase() === ref.toLowerCase())
  return local ? shipmentToText(local) : null
}

async function lookupStockIn(query: string): Promise<string | null> {
  const tokens = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
  const matchName = (name: string) =>
    tokens.some((t) => name.toLowerCase().includes(t)) || name.toLowerCase().split(/\s+/).some((w) => tokens.includes(w))

  if (isDbConfigured()) {
    await ensureSchema()
    const rows = await dbQuery<Record<string, unknown>>(
      `SELECT s.id, p.name AS product_name, s.supplier, s.invoice_no, s.quantity, s.unit_cost,
              s.received_at, s.received_by, s.notes
       FROM sn_stock_in s LEFT JOIN sn_products p ON p.id = s.product_id
       ORDER BY s.received_at DESC LIMIT 20`
    )
    if (rows && rows.length > 0) {
      const filtered = tokens.length > 0 ? rows.filter((r) => matchName(String(r.product_name ?? ""))) : rows
      const list = filtered.length > 0 ? filtered : rows
      return list
        .map(
          (r) =>
            `${r.product_name} — ${r.quantity} units received on ${String(r.received_at).slice(0, 10)} from ${r.supplier} (invoice ${r.invoice_no}), unit cost ${formatMoney(Number(r.unit_cost))}, received by ${r.received_by}`
        )
        .join("\n")
    }
  }

  const records = stockIn
    .map((r) => {
      const p = getLocalCatalog().find((x) => x.id === r.productId)
      return { ...r, productName: p?.name ?? r.productId }
    })
    .sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1))

  const filtered = tokens.length > 0 ? records.filter((r) => matchName(r.productName)) : records
  const list = filtered.length > 0 ? filtered : records
  return list
    .map(
      (r) =>
        `${r.productName} — ${r.quantity} units received on ${r.receivedAt} from ${r.supplier} (invoice ${r.invoiceNo}), unit cost ${formatMoney(r.unitCost)}, received by ${r.receivedBy}${r.notes ? ` — ${r.notes}` : ""}`
    )
    .join("\n")
}

function couriersText(): string {
  return couriers
    .map(
      (c) =>
        `${c.name} (${c.service}) — charge ${formatMoney(c.charge)}, delivery ${c.etaMin}–${c.etaMax} business days`
    )
    .join("\n")
}

function skuText(query: string): string | null {
  const local = getLocalCatalog()
  const tokens = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
  const product = local.find((p) => {
    const name = p.name.toLowerCase()
    return tokens.some((t) => name.includes(t) || name.split(/\s+/).includes(t))
  })
  if (!product) return null
  const sku = skuForProduct(product.id)
  if (!sku) return null
  return `${product.name}\nSKU: ${sku.sku}\nBarcode: ${sku.barcode}\nPrice: ${formatMoney(product.price)}`
}

export async function resolveOpsQuestion(query: string): Promise<OpsResult> {
  const q = query.trim()
  const lower = q.toLowerCase()

  const refMatch = q.match(REF_RE)
  const trackingMatch = q.match(TRACKING_RE)

  const wantsOrder = /\b(order|delivery|tracking|track|shipment|dispatched|arriv|status of|where is|confirm)/i.test(lower)
  const wantsCouriers = /\b(courier|dispatch service|delivery charge|shipping charge|postage|charges|delivery partner)\b/i.test(lower)
  const wantsSku = /\b(sku|barcode|code|scan)\b/i.test(lower)

  const stockInIntent =
    /\b(recent stock|new stock|stock arrived|stock aya|arrivals?|arrived today|received from|purchase|supplier|invoice|inventory arrived|latest stock)\b/i.test(lower)

  if (refMatch || trackingMatch) {
    const key = refMatch ? refMatch[0] : trackingMatch![0]
    const res = await lookupOrderByReference(key)
    if (res) return { intent: "order", context: res, answer: res, confidence: "high" }
  }

  if (stockInIntent) {
    const res = await lookupStockIn(q)
    if (res) {
      return {
        intent: "stock-in",
        context: res,
        answer: `Recent stock arrivals:\n${res}`,
        confidence: "high",
      }
    }
  }

  if (wantsCouriers) {
    return {
      intent: "couriers",
      context: couriersText(),
      answer: `Here are our dispatch services and charges:\n${couriersText()}`,
      confidence: "high",
    }
  }

  if (wantsSku) {
    const res = skuText(q)
    if (res) return { intent: "sku", context: res, answer: res, confidence: "high" }
  }

  if (wantsOrder) {
    const res = await lookupOrderByReference(q)
    if (res) return { intent: "order", context: res, answer: res, confidence: "medium" }
  }

  return { intent: "none", context: "", confidence: "none" }
}