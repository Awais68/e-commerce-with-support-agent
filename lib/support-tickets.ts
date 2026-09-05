/**
 * Shared ticket vocabulary — imported by both client forms and route handlers,
 * so this file must stay free of server-only imports.
 */

export const TICKET_CATEGORIES = [
  { value: "order", label: "Order Support" },
  { value: "shipping", label: "Shipping & Delivery" },
  { value: "returns", label: "Returns & Exchanges" },
  { value: "payment", label: "Payments & Billing" },
  { value: "product", label: "Product & Sizing" },
  { value: "general", label: "General Enquiry" },
] as const

export const TICKET_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const

export type TicketCategory = (typeof TICKET_CATEGORIES)[number]["value"]
export type TicketPriority = (typeof TICKET_PRIORITIES)[number]["value"]

const CATEGORY_VALUES = TICKET_CATEGORIES.map((c) => c.value) as readonly string[]
const PRIORITY_VALUES = TICKET_PRIORITIES.map((p) => p.value) as readonly string[]

/** Free-text subjects (the old contact-form options) mapped onto a category. */
const SUBJECT_CATEGORY_HINTS: [RegExp, TicketCategory][] = [
  [/order|track|delivery status|cancel/i, "order"],
  [/ship|deliver|courier|dispatch/i, "shipping"],
  [/return|exchange|refund/i, "returns"],
  [/pay|card|stripe|nayapay|cod|billing|invoice/i, "payment"],
  [/product|size|sizing|fit|care|material/i, "product"],
]

export function normalizeCategory(input: unknown, subject?: string): TicketCategory {
  if (typeof input === "string") {
    const value = input.trim().toLowerCase()
    if (CATEGORY_VALUES.includes(value)) return value as TicketCategory
  }
  if (subject) {
    for (const [pattern, category] of SUBJECT_CATEGORY_HINTS) {
      if (pattern.test(subject)) return category
    }
  }
  return "general"
}

export function normalizePriority(input: unknown): TicketPriority {
  if (typeof input === "string") {
    const value = input.trim().toLowerCase()
    if (PRIORITY_VALUES.includes(value)) return value as TicketPriority
  }
  return "normal"
}

export function categoryLabel(value: string): string {
  return TICKET_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

export function ticketTrackingPath(ticketNumber: string): string {
  return `/support/${encodeURIComponent(ticketNumber)}`
}
