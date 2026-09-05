import "server-only"

import { randomUUID } from "crypto"
import { dbQuery, ensureSchema } from "./db"
import { generateOrderReference } from "./payments"

export interface OrderItemInput {
  id: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image?: string
}

export interface ShippingInput {
  email: string
  firstName: string
  lastName: string
  phone: string
  street: string
  apartment?: string
  city: string
  state: string
  zip: string
  country?: string
}

export interface OrderTotals {
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export interface Order {
  id: string
  reference: string
  userId: string | null
  email: string
  provider: string
  providerSessionId: string
  providerTransactionId: string
  status: string
  currency: string
  subtotal: number
  shipping: number
  tax: number
  total: number
  items: OrderItemInput[]
  shippingAddress: Record<string, unknown>
  createdAt: string
}

interface OrderRow {
  id: string
  reference: string
  user_id: string | null
  email: string
  provider: string
  provider_session_id: string
  provider_transaction_id: string
  status: string
  currency: string
  subtotal: string
  shipping: string
  tax: string
  total: string
  items: OrderItemInput[]
  shipping_address: Record<string, unknown>
  created_at: string
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    reference: row.reference,
    userId: row.user_id,
    email: row.email,
    provider: row.provider,
    providerSessionId: row.provider_session_id,
    providerTransactionId: row.provider_transaction_id,
    status: row.status,
    currency: row.currency,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    tax: Number(row.tax),
    total: Number(row.total),
    items: row.items ?? [],
    shippingAddress: row.shipping_address ?? {},
    createdAt: row.created_at,
  }
}

export function computeTotals(items: OrderItemInput[]): OrderTotals {
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
  const shipping = 0
  const tax = Math.round(subtotal * 0.08)
  return { subtotal, shipping, tax, total: subtotal + shipping + tax }
}

export async function createOrder(input: {
  items: OrderItemInput[]
  shipping?: ShippingInput
  userId?: string | null
  provider: string
  providerSessionId?: string
  providerTransactionId?: string
  reference?: string
  currency?: string
  status?: string
}): Promise<Order | null> {
  await ensureSchema()
  const totals = computeTotals(input.items)
  const reference = input.reference || generateOrderReference()
  const id = randomUUID()
  const email = input.shipping?.email ?? ""
  const address = input.shipping
    ? {
        firstName: input.shipping.firstName,
        lastName: input.shipping.lastName,
        phone: input.shipping.phone,
        street: input.shipping.street,
        apartment: input.shipping.apartment ?? "",
        city: input.shipping.city,
        state: input.shipping.state,
        zip: input.shipping.zip,
        country: input.shipping.country ?? "",
      }
    : {}

  const rows = await dbQuery<OrderRow>(
    `INSERT INTO sn_orders (
      id, reference, user_id, email, provider, provider_session_id,
      provider_transaction_id, status, currency, subtotal, shipping, tax, total,
      items, shipping_address
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15::jsonb)
    RETURNING *`,
    [
      id,
      reference,
      input.userId ?? null,
      email,
      input.provider,
      input.providerSessionId ?? "",
      input.providerTransactionId ?? "",
      input.status ?? "pending",
      input.currency ?? "PKR",
      totals.subtotal,
      totals.shipping,
      totals.tax,
      totals.total,
      JSON.stringify(input.items),
      JSON.stringify(address),
    ]
  )
  if (!rows || rows.length === 0) return null
  return mapOrder(rows[0])
}

export async function getOrderByReference(reference: string): Promise<Order | null> {
  const rows = await dbQuery<OrderRow>(`SELECT * FROM sn_orders WHERE reference = $1`, [reference])
  if (!rows || rows.length === 0) return null
  return mapOrder(rows[0])
}

export async function getOrderByProviderSession(sessionId: string): Promise<Order | null> {
  const rows = await dbQuery<OrderRow>(`SELECT * FROM sn_orders WHERE provider_session_id = $1`, [sessionId])
  if (!rows || rows.length === 0) return null
  return mapOrder(rows[0])
}

export async function markOrderPaid(
  reference: string,
  update: { provider?: string; providerSessionId?: string; providerTransactionId?: string } = {}
): Promise<Order | null> {
  const rows = await dbQuery<OrderRow>(
    `UPDATE sn_orders
     SET status = 'paid',
         provider = COALESCE($2, provider),
         provider_session_id = COALESCE($3, provider_session_id),
         provider_transaction_id = COALESCE($4, provider_transaction_id),
         updated_at = now()
     WHERE reference = $1
     RETURNING *`,
    [reference, update.provider ?? null, update.providerSessionId ?? null, update.providerTransactionId ?? null]
  )
  if (!rows || rows.length === 0) return null
  return mapOrder(rows[0])
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const rows = await dbQuery<OrderRow>(
    `SELECT * FROM sn_orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  )
  if (!rows) return []
  return rows.map(mapOrder)
}

export async function getOrdersByEmail(email: string, limit = 5): Promise<Order[]> {
  const rows = await dbQuery<OrderRow>(
    `SELECT * FROM sn_orders WHERE lower(email) = lower($1) ORDER BY created_at DESC LIMIT $2`,
    [email.trim(), limit]
  )
  if (!rows) return []
  return rows.map(mapOrder)
}

export async function setOrderUserId(reference: string, userId: string): Promise<void> {
  await dbQuery(`UPDATE sn_orders SET user_id = $2 WHERE reference = $1`, [reference, userId])
}

export async function markOrderCancelled(reference: string): Promise<void> {
  await dbQuery(
    `UPDATE sn_orders SET status = 'cancelled', updated_at = now() WHERE reference = $1 AND status = 'pending'`,
    [reference]
  )
}

export async function setOrderProviderTransaction(reference: string, providerTransactionId: string): Promise<void> {
  await dbQuery(
    `UPDATE sn_orders SET provider_transaction_id = $2, updated_at = now() WHERE reference = $1`,
    [reference, providerTransactionId]
  )
}
/* ------------------------------------------------------------------ *
 * Cash on Delivery + shipment tracking
 * ------------------------------------------------------------------ */

export interface ShipmentEventRecord {
  status: string
  at: string
  note?: string
}

export interface ShipmentRecord {
  orderRef: string
  courier: string
  trackingNo: string
  status: string
  eta: string
  timeline: ShipmentEventRecord[]
}

interface ShipmentRow {
  order_ref: string
  courier: string
  tracking_no: string
  status: string
  eta: string
  timeline: ShipmentEventRecord[]
}

function mapShipment(row: ShipmentRow): ShipmentRecord {
  return {
    orderRef: row.order_ref,
    courier: row.courier,
    trackingNo: row.tracking_no,
    status: row.status,
    eta: row.eta,
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
  }
}

export function nowStamp(): string {
  return new Date().toISOString().slice(0, 16).replace("T", " ")
}

export function etaFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export async function createShipment(input: {
  orderId?: string | null
  orderRef: string
  courier: string
  trackingNo?: string
  status?: string
  eta?: string
  timeline?: ShipmentEventRecord[]
}): Promise<ShipmentRecord | null> {
  await ensureSchema()
  const rows = await dbQuery<ShipmentRow>(
    `INSERT INTO sn_shipments (id, order_id, order_ref, courier, tracking_no, status, eta, timeline)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
     RETURNING *`,
    [
      randomUUID(),
      input.orderId ?? null,
      input.orderRef,
      input.courier,
      input.trackingNo ?? "",
      input.status ?? "Order confirmed",
      input.eta ?? "",
      JSON.stringify(input.timeline ?? []),
    ]
  )
  if (!rows || rows.length === 0) return null
  return mapShipment(rows[0])
}

export async function getShipmentByOrderRef(reference: string): Promise<ShipmentRecord | null> {
  const rows = await dbQuery<ShipmentRow>(
    `SELECT * FROM sn_shipments WHERE order_ref = $1 ORDER BY created_at DESC LIMIT 1`,
    [reference]
  )
  if (!rows || rows.length === 0) return null
  return mapShipment(rows[0])
}

/**
 * Pushes one event onto the shipment timeline and promotes it to the current
 * status. Done in SQL so two concurrent updates cannot clobber each other's
 * events the way a read-modify-write in JS would.
 */
export async function addShipmentEvent(
  reference: string,
  event: ShipmentEventRecord,
  update: { courier?: string; trackingNo?: string; eta?: string } = {}
): Promise<ShipmentRecord | null> {
  const rows = await dbQuery<ShipmentRow>(
    `UPDATE sn_shipments
     SET status = $2,
         courier = COALESCE(NULLIF($3, ''), courier),
         tracking_no = COALESCE(NULLIF($4, ''), tracking_no),
         eta = COALESCE(NULLIF($5, ''), eta),
         timeline = timeline || $6::jsonb,
         updated_at = now()
     WHERE order_ref = $1
     RETURNING *`,
    [
      reference,
      event.status,
      update.courier ?? "",
      update.trackingNo ?? "",
      update.eta ?? "",
      JSON.stringify([{ ...event, at: event.at || nowStamp() }]),
    ]
  )
  if (!rows || rows.length === 0) return null
  return mapShipment(rows[0])
}

export async function setOrderStatus(reference: string, status: string): Promise<Order | null> {
  const rows = await dbQuery<OrderRow>(
    `UPDATE sn_orders SET status = $2, updated_at = now() WHERE reference = $1 RETURNING *`,
    [reference, status]
  )
  if (!rows || rows.length === 0) return null
  return mapOrder(rows[0])
}
