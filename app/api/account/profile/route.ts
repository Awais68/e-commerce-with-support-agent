import { NextRequest, NextResponse } from "next/server"
import { getSessionUser, hashPassword, verifyPassword } from "@/lib/auth"
import { dbQuery } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  return NextResponse.json({ user })
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const body = await request.json().catch(() => {})
  const firstName = String(body?.firstName ?? user.firstName).trim()
  const lastName = String(body?.lastName ?? user.lastName).trim()
  const phone = String(body?.phone ?? user.phone).trim()
  const email = String(body?.email ?? user.email).trim()
  const gender = String(body?.gender ?? user.gender).trim()
  const avatar = String(body?.avatar ?? user.avatar).trim()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }

  if (body?.newPassword) {
    const currentPassword = String(body?.currentPassword ?? "")
    if (!currentPassword) {
      return NextResponse.json({ error: "Enter your current password to change it." }, { status: 400 })
    }
    const pwRows = await dbQuery<{ password_hash: string }>(
      `SELECT password_hash FROM sn_users WHERE id = $1`,
      [user.id]
    )
    if (!pwRows || pwRows.length === 0 || !verifyPassword(currentPassword, pwRows[0].password_hash)) {
      return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 })
    }
    if (String(body.newPassword).length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 })
    }
    await dbQuery(`UPDATE sn_users SET password_hash = $1 WHERE id = $2`, [hashPassword(String(body.newPassword)), user.id])
  }

  const rows = await dbQuery(
    `UPDATE sn_users SET first_name = $1, last_name = $2, phone = $3, email = $4, gender = $5, avatar = $6, updated_at = now()
     WHERE id = $7 RETURNING id`,
    [firstName, lastName, phone, email.toLowerCase(), gender, avatar, user.id]
  )
  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "Could not update your profile." }, { status: 500 })
  }

  return NextResponse.json({
    user: { ...user, firstName, lastName, phone, email: email.toLowerCase(), gender, avatar },
  })
}

export async function DELETE() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  await dbQuery(`DELETE FROM sn_users WHERE id = $1`, [user.id])
  return NextResponse.json({ ok: true })
}