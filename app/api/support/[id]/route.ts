import { NextRequest, NextResponse } from "next/server"
import { SupportApiError, isSupportConfigured, supportFetch } from "@/lib/support-api"

export const runtime = "nodejs"
// A ticket's status changes the moment an agent replies. Anything cached here
// serves a stale page to a customer who just refreshed for an update.
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

interface TicketPayload {
  ticket_number?: string
  ticketNumber?: string
  status?: string
  priority?: string
  category?: string
  subject?: string
  created_at?: string
  updated_at?: string
  messages?: unknown[]
  [key: string]: unknown
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const ticketId = decodeURIComponent(id ?? "").trim()

  if (!ticketId) {
    return NextResponse.json({ error: "Ticket id is required." }, { status: 400 })
  }
  if (!isSupportConfigured()) {
    return NextResponse.json({ error: "Support desk is not configured." }, { status: 503 })
  }

  const noStore = { "Cache-Control": "no-store, max-age=0, must-revalidate" }

  try {
    const ticket = await supportFetch<TicketPayload>(`/tickets/${encodeURIComponent(ticketId)}`)
    return NextResponse.json(
      {
        ticket: {
          ...ticket,
          ticketNumber: ticket.ticket_number ?? ticket.ticketNumber ?? ticketId,
          createdAt: ticket.created_at ?? null,
          updatedAt: ticket.updated_at ?? null,
        },
      },
      { headers: noStore }
    )
  } catch (error) {
    if (error instanceof SupportApiError) {
      if (error.status === 404) {
        return NextResponse.json({ ticket: null, error: "Ticket not found." }, { status: 404, headers: noStore })
      }
      console.error("Ticket lookup failed:", error.status, error.message)
      const status = error.status === 504 || error.status === 503 ? error.status : 502
      return NextResponse.json({ error: error.message }, { status, headers: noStore })
    }
    console.error("Ticket lookup failed:", error)
    return NextResponse.json({ error: "Could not reach the support desk." }, { status: 502, headers: noStore })
  }
}
