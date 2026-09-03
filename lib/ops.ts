export interface Courier {
  id: string
  name: string
  service: "domestic" | "international"
  charge: number
  etaMin: number
  etaMax: number
  trackingUrl?: string
}

export interface ShipmentEvent {
  status: string
  at: string
  note?: string
}

export interface Shipment {
  orderRef: string
  courier: string
  trackingNo: string
  status: string
  eta: string
  timeline: ShipmentEvent[]
}

export interface StockInRecord {
  id: string
  productId: string
  supplier: string
  invoiceNo: string
  quantity: number
  unitCost: number
  receivedAt: string
  receivedBy: string
  notes?: string
}

export interface ProductSku {
  productId: string
  sku: string
  barcode: string
}

export const couriers: Courier[] = [
  { id: "tcs", name: "TCS Express", service: "domestic", charge: 250, etaMin: 1, etaMax: 3, trackingUrl: "https://www.tcs.com.pk/tracking" },
  { id: "leopard", name: "Leopard Courier", service: "domestic", charge: 220, etaMin: 1, etaMax: 3 },
  { id: "callcourier", name: "Call Courier", service: "domestic", charge: 200, etaMin: 2, etaMax: 4 },
  { id: "trax", name: "Trax", service: "domestic", charge: 190, etaMin: 1, etaMax: 2 },
  { id: "dhl", name: "DHL Express", service: "international", charge: 3500, etaMin: 2, etaMax: 4, trackingUrl: "https://www.dhl.com/tracking" },
  { id: "fedex", name: "FedEx International", service: "international", charge: 3200, etaMin: 2, etaMax: 5, trackingUrl: "https://www.fedex.com/tracking" },
]

export const shipments: Shipment[] = [
  {
    orderRef: "SN-K3X9Q2",
    courier: "TCS Express",
    trackingNo: "TCS-PK-88122034",
    status: "Dispatched",
    eta: "2026-08-21",
    timeline: [
      { status: "Order confirmed", at: "2026-08-16 14:20", note: "Payment verified via NayaPay" },
      { status: "Packed", at: "2026-08-16 18:05", note: "QC passed, boxed with gift wrap" },
      { status: "Dispatched", at: "2026-08-17 09:30", note: "Handed to TCS Express, Lahore hub" },
    ],
  },
  {
    orderRef: "SN-M7W4R8",
    courier: "DHL Express",
    trackingNo: "DHL-4472-9911-0",
    status: "In transit",
    eta: "2026-08-20",
    timeline: [
      { status: "Order confirmed", at: "2026-08-15 11:02", note: "Payment verified via Stripe" },
      { status: "Dispatched", at: "2026-08-16 10:00", note: "Departed Florence, Italy" },
      { status: "In transit", at: "2026-08-18 07:45", note: "Arrived DHL Dubai gateway, cleared customs" },
    ],
  },
  {
    orderRef: "SN-P2T6E1",
    courier: "Leopard Courier",
    trackingNo: "LP-66-2281-9",
    status: "Delivered",
    eta: "Delivered 2026-08-17",
    timeline: [
      { status: "Order confirmed", at: "2026-08-14 16:40", note: "Cash on delivery" },
      { status: "Dispatched", at: "2026-08-15 09:15", note: "Leopard Courier, Karachi" },
      { status: "Out for delivery", at: "2026-08-17 11:30", note: "Courier: Imran (0333-2211884)" },
      { status: "Delivered", at: "2026-08-17 16:05", note: "Received by customer, COD collected PKR 6,950" },
    ],
  },
]

export const stockIn: StockInRecord[] = [
  { id: "sin-001", productId: "silk-evening-coat", supplier: "Florentine Silk House", invoiceNo: "FSH-2026-044", quantity: 24, unitCost: 42000, receivedAt: "2026-08-18", receivedBy: "Ali Raza", notes: "Noir & Ivory, sizes XS–XL" },
  { id: "sin-002", productId: "cashmere-wrap-dress", supplier: "Mongolian Cashmere Co.", invoiceNo: "MCC-2026-118", quantity: 30, unitCost: 35000, receivedAt: "2026-08-16", receivedBy: "Sana Tariq" },
  { id: "sin-003", productId: "mens-leather-oxfords", supplier: "Vinci Leatherworks", invoiceNo: "VL-2026-031", quantity: 40, unitCost: 24000, receivedAt: "2026-08-14", receivedBy: "Ali Raza" },
  { id: "sin-004", productId: "structured-handbag", supplier: "Como Atelier", invoiceNo: "CA-2026-077", quantity: 18, unitCost: 55000, receivedAt: "2026-08-12", receivedBy: "Sana Tariq" },
]

export const productSkus: ProductSku[] = [
  { productId: "silk-evening-coat", sku: "SN-OTW-001", barcode: "8901201000012" },
  { productId: "cashmere-wrap-dress", sku: "SN-DRS-002", barcode: "8901201000029" },
  { productId: "tailored-wool-blazer", sku: "SN-OTW-003", barcode: "8901201000036" },
  { productId: "merino-turtleneck", sku: "SN-KNT-004", barcode: "8901201000043" },
  { productId: "leather-belt", sku: "SN-ACC-005", barcode: "8901201000050" },
  { productId: "silk-scarf", sku: "SN-ACC-006", barcode: "8901201000067" },
  { productId: "linen-trousers", sku: "SN-TRS-007", barcode: "8901201000074" },
  { productId: "structured-handbag", sku: "SN-ACC-008", barcode: "8901201000081" },
  { productId: "baby-cotton-onesie", sku: "SN-BBY-009", barcode: "8901201000098" },
  { productId: "baby-knit-romper", sku: "SN-BBY-010", barcode: "8901201000104" },
  { productId: "girls-floral-dress", sku: "SN-GRL-011", barcode: "8901201000111" },
  { productId: "girls-knit-cardigan", sku: "SN-GRL-012", barcode: "8901201000128" },
  { productId: "mens-wool-overcoat", sku: "SN-MWT-013", barcode: "8901201000135" },
  { productId: "mens-cashmere-sweater", sku: "SN-MWT-014", barcode: "8901201000142" },
  { productId: "mens-linen-shirt", sku: "SN-MST-015", barcode: "8901201000159" },
  { productId: "womens-satin-heels", sku: "SN-SHO-016", barcode: "8901201000166" },
  { productId: "mens-leather-oxfords", sku: "SN-SHO-017", barcode: "8901201000173" },
  { productId: "baby-leather-booties", sku: "SN-BBY-018", barcode: "8901201000180" },
]

export function skuForProduct(productId: string): ProductSku | undefined {
  return productSkus.find((s) => s.productId === productId)
}

export function barcodeForProduct(productId: string): string {
  return skuForProduct(productId)?.barcode ?? ""
}