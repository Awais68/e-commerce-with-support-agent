import { NextRequest, NextResponse } from "next/server"
import { createSession, findUserByCredentials } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = String(body?.email || "").trim()
    const password = String(body?.password || "")

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
    }

    const user = await findUserByCredentials(email, password)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
    }

    await createSession(user.id)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Could not sign you in. Please try again." }, { status: 500 })
  }
}