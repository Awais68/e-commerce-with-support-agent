import { NextRequest, NextResponse } from "next/server"
import { forceSync, reindexRag } from "@/lib/store"
import { isDbConfigured } from "@/lib/db"
import { isRagConfigured } from "@/lib/rag"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const reindex = body?.reindex === true

    const summary = await forceSync()
    const rag = reindex ? await reindexRag() : null

    return NextResponse.json({
      ok: true,
      db: isDbConfigured() ? "connected" : "not-configured",
      rag: isRagConfigured() ? "configured" : "not-configured",
      sync: summary,
      ...(rag ? { reindexed: rag } : {}),
    })
  } catch (error) {
    console.error("Sync API error:", error)
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 })
  }
}