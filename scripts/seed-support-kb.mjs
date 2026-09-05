#!/usr/bin/env node
/**
 * Seeds the FastAPI support backend's knowledge base with SN Collections
 * policies, so the agent answers from our real content instead of guessing.
 *
 * An empty KB is the single biggest cause of generic agent replies — run this
 * once after the backend is up, and again whenever a policy page changes.
 *
 * Usage:
 *   node scripts/seed-support-kb.mjs            # ingest everything
 *   node scripts/seed-support-kb.mjs --dry-run  # print the payload only
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const dir = resolve(fileURLToPath(import.meta.url), "..", "..")

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(resolve(dir, file), "utf8")
      for (const line of raw.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
      }
    } catch {
      // file missing — fall through to the next one / process env
    }
  }
}

loadEnv()

const BASE = (process.env.SUPPORT_API_URL || "").replace(/\/+$/, "")
const KEY = process.env.SUPPORT_API_KEY || ""
const DRY_RUN = process.argv.includes("--dry-run")

/** @type {{ title: string, category: string, tags: string[], content: string }[]} */
const documents = [
  {
    title: "Returns & Exchanges Policy",
    category: "returns",
    tags: ["return", "refund", "exchange", "30 days", "return label"],
    content: `SN Collections offers complimentary returns and exchanges within 30 days of delivery.

Condition: items must be unworn, unwashed, and returned in their original packaging with all tags attached. Try items on over clean clothing, as is standard for luxury goods.

How to start a return: contact the concierge through the contact form, WhatsApp, or email with your order number. We issue a prepaid return label and a unique returns reference, usually within a few hours.

Refunds: once the return reaches our atelier and passes inspection, the refund is processed within 5-7 business days to the original payment method. It typically appears on the customer's statement 3-5 business days after processing.

Exchanges: tell us the size or colour you want when you start the return and we hold the replacement while the original travels back.

Non-returnable: sealed personal accessories (earrings, fragrance, intimates) may only be returned unopened. Custom and made-to-order pieces are final sale unless faulty.

Damaged or incorrect items: notify the concierge within 48 hours of delivery with photographs. We arrange a replacement or refund at no cost to the customer.

Outside the 30-day window: exceptional cases are reviewed individually — escalate to a human concierge rather than refusing outright.`,
  },
  {
    title: "Shipping & Delivery",
    category: "shipping",
    tags: ["shipping", "delivery", "dispatch", "courier", "express", "duties"],
    content: `Orders are dispatched from our Florence atelier within 24-48 hours.

Standard delivery: 3-5 business days, fully tracked. Complimentary on all orders over Rs. 150.
Express delivery: 1-2 business days. Orders placed before 12pm CET are prioritised for same-day dispatch.
International: we deliver worldwide including Pakistan, the USA, the UK, Europe and the Gulf, via insured express courier with full tracking. International transit is usually 5-10 business days.
Import duties and taxes are calculated and shown at checkout for most destinations, so there is nothing to pay on arrival.
Signature: orders over Rs. 200 require a signature on delivery. Customers can request a safe-place drop or reschedule through the courier's tracking page once the order ships.

Tracking: order references look like SN-XXXXXXX and are on the confirmation email and the checkout success page. Live status, courier, tracking number and ETA are available at /track and through the AI concierge.`,
  },
  {
    title: "Sizing & Fit Guide",
    category: "product",
    tags: ["size", "sizing", "fit", "measurements", "size guide", "shoes"],
    content: `SN Collections pieces are cut true to size in European sizing.

Garments: compare chest, waist and hip measurements against the size chart on each product page. Customers between sizes should size up for a relaxed fit, or stay with the smaller size for a tailored line.
Shoes: available in EU sizing 36-44. Half sizes are not offered — size up if between.
Every product page carries its own available sizes and stock state; the AI concierge can read live availability per size.
Unsure customers should be offered an exchange reminder: exchanges are complimentary within 30 days, so ordering the closer size is low risk.`,
  },
  {
    title: "Payments — Stripe, NayaPay & Cash on Delivery",
    category: "payment",
    tags: ["payment", "stripe", "nayapay", "cod", "cash on delivery", "card", "refund"],
    content: `Three payment methods are offered at checkout:

1. Card via Stripe — Visa, Mastercard and American Express. The customer is redirected to Stripe's hosted checkout; SN Collections never sees or stores card details. Payment is captured immediately and the order moves to "paid".

2. NayaPay — pay from a NayaPay wallet or a linked card. The customer completes the transaction on NayaPay's hosted page and returns to the order confirmation. Verification is automatic; if a transaction shows as pending for more than 15 minutes, escalate to a human concierge with the order reference.

3. Cash on Delivery (COD) — available across Pakistan on orders up to Rs. 200,000. Select COD at checkout with a working phone number. The courier calls before delivery and the customer pays the exact order total in cash at the door. The order reference appears immediately for tracking.

Security: all online transactions are encrypted and processed on the provider's hosted page.
Refunds always return to the original payment method. COD orders are refunded by bank transfer once the returned item passes inspection — the concierge collects the account details.
Failed or double charges: ask for the order reference and the last four digits of the card, then escalate. Never ask a customer for a full card number, CVV, or wallet PIN.`,
  },
  {
    title: "Order Tracking & Status",
    category: "order",
    tags: ["track", "tracking", "where is my order", "status", "delayed", "eta"],
    content: `Order references have the form SN-XXXXXXX and appear on the confirmation email and the checkout success page.

Customers can track at /track, or ask the AI concierge, which reads the live order record: status, payment method, amount due (for COD), courier, tracking number, ETA and full dispatch timeline.

Status meanings:
- Awaiting payment: the order exists but payment has not completed.
- Confirmed / Paid: payment settled, awaiting dispatch.
- Dispatched: handed to the courier with a tracking number.
- Out for delivery: with the rider today.
- Delivered: signed for or handed over.
- Cancelled / Refunded: closed.

Typical timings: dispatch within 24-48 hours, domestic delivery 3-5 business days, international 5-10 business days. If a parcel has not moved for more than 3 business days past its ETA, open a courier trace and tell the customer we are chasing it — do not simply repeat the ETA.`,
  },
  {
    title: "Order Changes & Cancellations",
    category: "order",
    tags: ["cancel", "change address", "amend order", "cancellation"],
    content: `Before dispatch: address changes, size swaps and cancellations are free. Ask for the order reference and the change required, then action it — orders that are still "pending" or "confirmed" have not left the atelier.

After dispatch: the order cannot be recalled. Offer the 30-day complimentary return instead, or ask the customer to refuse delivery for COD orders.

Cancellation refunds follow the normal refund route: original payment method, 5-7 business days after the request is processed.`,
  },
  {
    title: "Product Care",
    category: "product",
    tags: ["care", "wash", "dry clean", "cashmere", "leather", "silk"],
    content: `Care guidance also appears on every product page.

Silk and wool garments: dry clean only.
Cashmere and merino: hand wash cold, do not wring, dry flat away from direct heat. Store folded, never on a hanger.
Leather: condition with a neutral balm every few months, keep away from direct sunlight and radiators, and store in the supplied dust bag.
Metal hardware: wipe with a dry soft cloth; avoid perfume and hairspray contact.

Damage caused by incorrect care is not covered by the returns policy, but faulty craftsmanship is — if a customer reports a seam, zip or fastening failure, treat it as a fault and escalate for replacement.`,
  },
  {
    title: "Contact, Hours & Escalation",
    category: "general",
    tags: ["contact", "concierge", "whatsapp", "hours", "escalate", "ticket"],
    content: `Concierge hours: Monday to Saturday 9:00-20:00 CET, Sunday 11:00-18:00 CET.
Email: concierge@sncollections.com. Press: press@sncollections.com.
WhatsApp: the fastest channel, answered within minutes during hours.
Boutique: Via della Condotta 12, 50122 Florence, Italy. Private atelier consultations are available by request.

Tickets opened through the website get a ticket number immediately and can be followed at /support/<ticket-number>. Standard response time is one business day; urgent order issues are picked up the same day.

Escalate to a human when: a payment is disputed or double-charged, a parcel is lost or damaged, a return falls outside the 30-day window, a customer asks for a goodwill gesture, or the customer explicitly asks for a person.`,
  },
]

async function main() {
  if (DRY_RUN) {
    console.log(JSON.stringify({ documents }, null, 2))
    console.log(`\n${documents.length} documents ready (dry run — nothing sent).`)
    return
  }

  if (!BASE) {
    console.error("SUPPORT_API_URL is not set. Add it to .env.local or pass it inline.")
    process.exit(1)
  }

  let ok = 0
  for (const doc of documents) {
    const res = await fetch(`${BASE}/knowledge-base/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(KEY ? { "X-API-Key": KEY, Authorization: `Bearer ${KEY}` } : {}),
      },
      body: JSON.stringify({
        title: doc.title,
        content: doc.content,
        category: doc.category,
        tags: doc.tags,
        source: "website",
        source_url: `https://sncollections.com/${doc.category}`,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`✗ ${doc.title} — ${res.status} ${body.slice(0, 300)}`)
      continue
    }
    ok += 1
    console.log(`✓ ${doc.title}`)
  }

  console.log(`\nIngested ${ok}/${documents.length} documents into ${BASE}/knowledge-base/ingest`)
  if (ok < documents.length) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
