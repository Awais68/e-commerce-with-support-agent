import { NextRequest, NextResponse } from "next/server"
import { buildSupportResponse } from "@/lib/knowledge-base"
import { generateLLMResponse } from "@/lib/llm"
import { resolveOpsQuestion } from "@/lib/ops-rag"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = typeof body?.message === "string" ? body.message.trim() : ""

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const ops = await resolveOpsQuestion(message)
    if (ops.answer && ops.confidence === "high") {
      return NextResponse.json({
        reply: ops.answer,
        suggestions: suggestForIntent(ops.intent),
        engine: `ops:${ops.intent}`,
        timestamp: new Date().toISOString(),
      })
    }

    const llm = await generateLLMResponse(message, ops.context)
    if (llm) {
      return NextResponse.json({
        reply: llm.reply,
        suggestions: llm.suggestions,
        engine: ops.confidence === "high" ? "ops+llm" : "llm",
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

function suggestForIntent(intent: string): string[] {
  switch (intent) {
    case "order":
      return ["Where is my other order?", "Which couriers do you use?", "What are your delivery charges?"]
    case "stock-in":
      return ["What else is in stock?", "Tell me about a product", "Which couriers do you use?"]
    case "couriers":
      return ["Track an order", "What stock is available?", "What are your delivery charges?"]
    case "sku":
      return ["What stock is available?", "Tell me about a product"]
    default:
      return ["Where is my order?", "What stock is available?"]
  }
}