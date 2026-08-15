import { NextRequest, NextResponse } from "next/server"
import { buildSupportResponse } from "@/lib/knowledge-base"
import { generateLLMResponse } from "@/lib/llm"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = typeof body?.message === "string" ? body.message.trim() : ""

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const llm = await generateLLMResponse(message)
    if (llm) {
      return NextResponse.json({
        reply: llm.reply,
        suggestions: llm.suggestions,
        engine: "llm",
        timestamp: new Date().toISOString(),
      })
    }

    const { reply, suggestions } = buildSupportResponse(message)
    return NextResponse.json({
      reply,
      suggestions: suggestions.slice(0, 3),
      engine: "knowledge-base",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Support agent error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}