import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { getSessionUser } from "@/lib/auth"
import { dbQuery, ensureSchema } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export interface Address {
  id: string
  label: string
  name: string
  street: string
  apartment: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  isDefault: boolean
}

interface AddressRow {
  id: string
  label: string
  name: string
  street: string
  apartment: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  is_default: boolean
}

function mapAddress(row: AddressRow): Address {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    street: row.street,
    apartment: row.apartment,
    city: row.city,
    state: row.state,
    zip: row.zip,
    country: row.country,
    phone: row.phone,
    isDefault: row.is_default,
  }
}

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const rows = await dbQuery<AddressRow>(
    `SELECT id, label, name, street, apartment, city, state, zip, country, phone, is_default
     FROM sn_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC`,
    [user.id]
  )
  return NextResponse.json({ addresses: rows ? rows.map(mapAddress) : [] })
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  await ensureSchema()
  const body = await request.json().catch(() => ({}))
  const address: Address = {
    id: randomUUID(),
    label: String(body?.label || "Home").trim(),
    name: String(body?.name || "").trim(),
    street: String(body?.street || "").trim(),
    apartment: String(body?.apartment || "").trim(),
    city: String(body?.city || "").trim(),
    state: String(body?.state || "").trim(),
    zip: String(body?.zip || "").trim(),
    country: String(body?.country || "").trim(),
    phone: String(body?.phone || "").trim(),
    isDefault: Boolean(body?.isDefault),
  }

  if (!address.name || !address.street || !address.city || !address.zip) {
    return NextResponse.json({ error: "Please fill in the required address fields." }, { status: 400 })
  }

  const countRows = await dbQuery<{ count: string }>(`SELECT count(*)::text AS count FROM sn_addresses WHERE user_id = $1`, [
    user.id,
  ])
  const existingCount = Number(countRows?.[0]?.count || 0)
  if (existingCount === 0) address.isDefault = true

  if (address.isDefault) {
    await dbQuery(`UPDATE sn_addresses SET is_default = false WHERE user_id = $1`, [user.id])
  }

  const rows = await dbQuery<AddressRow>(
    `INSERT INTO sn_addresses (
      id, user_id, label, name, street, apartment, city, state, zip, country, phone, is_default
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING id, label, name, street, apartment, city, state, zip, country, phone, is_default`,
    [
      address.id,
      user.id,
      address.label,
      address.name,
      address.street,
      address.apartment,
      address.city,
      address.state,
      address.zip,
      address.country,
      address.phone,
      address.isDefault,
    ]
  )
  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "Could not save the address." }, { status: 500 })
  }
  return NextResponse.json({ address: mapAddress(rows[0]) }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Address id is required." }, { status: 400 })

  const body = await request.json().catch(() => ({}))
  const fields = {
    label: String(body?.label ?? "").trim(),
    name: String(body?.name ?? "").trim(),
    street: String(body?.street ?? "").trim(),
    apartment: String(body?.apartment ?? "").trim(),
    city: String(body?.city ?? "").trim(),
    state: String(body?.state ?? "").trim(),
    zip: String(body?.zip ?? "").trim(),
    country: String(body?.country ?? "").trim(),
    phone: String(body?.phone ?? "").trim(),
  }

  if (body?.isDefault === true) {
    await dbQuery(`UPDATE sn_addresses SET is_default = false WHERE user_id = $1`, [user.id])
  }

  const rows = await dbQuery<AddressRow>(
    `UPDATE sn_addresses
     SET label = $1, name = $2, street = $3, apartment = $4, city = $5, state = $6,
         zip = $7, country = $8, phone = $9, is_default = COALESCE($10, is_default)
     WHERE id = $11 AND user_id = $12
     RETURNING id, label, name, street, apartment, city, state, zip, country, phone, is_default`,
    [
      fields.label,
      fields.name,
      fields.street,
      fields.apartment,
      fields.city,
      fields.state,
      fields.zip,
      fields.country,
      fields.phone,
      body?.isDefault === undefined ? null : Boolean(body?.isDefault),
      id,
      user.id,
    ]
  )
  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 })
  }
  return NextResponse.json({ address: mapAddress(rows[0]) })
}

export async function DELETE(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Address id is required." }, { status: 400 })

  await dbQuery(`DELETE FROM sn_addresses WHERE id = $1 AND user_id = $2`, [id, user.id])
  return NextResponse.json({ ok: true })
}