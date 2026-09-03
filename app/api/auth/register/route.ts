import { NextRequest, NextResponse } from "next/server"
import { createSession, createUser } from "@/lib/auth"
import { dbQuery, ensureSchema } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = String(body?.email || "").trim()
    const password = String(body?.password || "")
    const firstName = String(body?.firstName || "").trim()
    const lastName = String(body?.lastName || "").trim()
    const phone = String(body?.phone || "").trim()
    const gender = String(body?.gender || "").trim()
    const avatar = String(body?.avatar || "").trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
    }

    await ensureSchema()
    const existing = await dbQuery(`SELECT id FROM sn_users WHERE email = $1`, [email.toLowerCase()])
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }

    const user = await createUser({ email, password, firstName, lastName, phone, gender, avatar })
    if (!user) {
      return NextResponse.json({ error: "Could not create your account. Please try again." }, { status: 500 })
    }

    await createSession(user.id)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Could not create your account. Please try again." }, { status: 500 })
  }
}