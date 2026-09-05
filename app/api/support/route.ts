import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { SupportApiError, assertWebformContract, isSupportConfigured, readTicketNumber, supportFetch } from "@/lib/support-api"
import { normalizeCategory, normalizePriority, ticketTrackingPath } from "@/lib/support-tickets"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Browser -> this route -> FastAPI POST /webhooks/webform.
 * The API key lives only on this side of the hop.
 */
export async function POST(request: NextRequest) {
  if (!isSupportConfigured()) {
    return NextResponse.json({ error: "Support desk is not configured." }, { status: 503 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const str = (value: unknown) => (typeof value === "string" ? value.trim() : "")

  // A logged-in session wins over whatever the form posted: identity resolution
  // on the agent side only works if the email is the one we actually know.
  const user = await getSessionUser()

  const name = str(body.name) || [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim()
  const email = user?.email ?? str(body.email).toLowerCase()
  const subject = str(body.subject) || "Website enquiry"
  const message = str(body.message)
  const category = normalizeCategory(body.category, subject)
  const priority = normalizePriority(body.priority)

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 })
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 })
  }
  if (message.length < 5) {
    return NextResponse.json({ error: "Please describe your enquiry in a little more detail." }, { status: 400 })
  }

  // snake_case throughout: these keys have to match the backend's Pydantic model
  // field-for-field. The shape is pinned in lib/support-webform-contract.json.
  const webformBody = {
    name,
    email,
    subject,
    category,
    priority,
    message,
    // Extra context. FastAPI models ignore unknown keys unless the model sets
    // extra="forbid", so these are safe to send even if the backend drops them.
    source: "website",
    customer_id: user?.id ?? null,
    order_reference: str(body.orderReference) || null,
  }
  if (process.env.NODE_ENV !== "production") assertWebformContract(webformBody)

  try {
    const payload = await supportFetch<Record<string, unknown>>("/webhooks/webform", {
      method: "POST",
      body: webformBody,
    })

    const ticketNumber = readTicketNumber(payload)
    if (!ticketNumber) {
      console.error("Support webform response had no ticket number:", payload)
      return NextResponse.json({ error: "Ticket was created but no ticket number was returned." }, { status: 502 })
    }

    return NextResponse.json(
      {
        ticketNumber,
        trackingPath: ticketTrackingPath(ticketNumber),
        status: typeof payload?.status === "string" ? payload.status : "open",
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof SupportApiError) {
      console.error("Support webform proxy failed:", error.status, error.message, error.detail)
      // 422 is the backend rejecting our field names/values. Passing it through
      // with FastAPI's own messages is what makes a contract drift diagnosable
      // instead of an opaque 502 — everything else stays a 502.
      if (error.status === 422) {
        return NextResponse.json(
          { error: `Support desk rejected the ticket: ${error.message}`, detail: error.detail },
          { status: 422 }
        )
      }
      const status = error.status === 504 || error.status === 503 ? error.status : 502
      return NextResponse.json({ error: error.message }, { status })
    }
    console.error("Support webform proxy failed:", error)
    return NextResponse.json({ error: "Could not reach the support desk." }, { status: 502 })
  }
}
