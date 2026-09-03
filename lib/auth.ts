import "server-only"

import { cookies } from "next/headers"
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto"
import { dbQuery, ensureSchema } from "./db"

const SESSION_COOKIE = "sn_session"
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 }

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  gender: string
  avatar: string
  createdAt: string
}

export function getSessionSecret(): string {
  return process.env.SESSION_SECRET || "sn-collections-dev-secret-change-me"
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64, SCRYPT_OPTS).toString("hex")
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$")
  if (parts.length !== 3 || parts[0] !== "scrypt") return false
  const [, salt, expectedHex] = parts
  const actual = scryptSync(password, salt, 64, SCRYPT_OPTS)
  const expected = Buffer.from(expectedHex, "hex")
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}

export function signToken(token: string, expiresAt: number): string {
  const sig = createHmac("sha256", getSessionSecret())
    .update(`${token}.${expiresAt}`)
    .digest("base64url")
  return `${token}.${expiresAt}.${sig}`
}

export function verifySignedToken(value: string): string | null {
  const parts = value.split(".")
  if (parts.length !== 3) return null
  const [token, expStr, sig] = parts
  const expected = createHmac("sha256", getSessionSecret())
    .update(`${token}.${expStr}`)
    .digest("base64url")
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  const expiresAt = Number(expStr)
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null
  return token
}

export async function createSession(userId: string): Promise<string> {
  await ensureSchema()
  const token = randomBytes(32).toString("hex")
  const expiresAt = Date.now() + SESSION_TTL_MS
  const expiresIso = new Date(expiresAt).toISOString()
  await dbQuery(`INSERT INTO sn_sessions (token, user_id, expires_at) VALUES ($1, $2, $3)`, [
    token,
    userId,
    expiresIso,
  ])
  const signed = signToken(token, expiresAt)
  const store = await cookies()
  store.set(SESSION_COOKIE, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  })
  return signed
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  const value = store.get(SESSION_COOKIE)?.value
  if (value) {
    const token = verifySignedToken(value)
    if (token) {
      await dbQuery(`DELETE FROM sn_sessions WHERE token = $1`, [token])
    }
    store.delete(SESSION_COOKIE)
  }
}

interface UserRow {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  gender: string
  avatar: string
  created_at: string
}

function mapUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    gender: row.gender,
    avatar: row.avatar,
    createdAt: row.created_at,
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const store = await cookies()
  const value = store.get(SESSION_COOKIE)?.value
  if (!value) return null
  const token = verifySignedToken(value)
  if (!token) return null
  const rows = await dbQuery<UserRow>(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.gender, u.avatar, u.created_at
     FROM sn_sessions s
     JOIN sn_users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > now()`,
    [token]
  )
  if (!rows || rows.length === 0) return null
  return mapUser(rows[0])
}

export async function createUser(input: {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  gender?: string
  avatar?: string
}): Promise<AuthUser | null> {
  await ensureSchema()
  const id = randomUUID()
  const passwordHash = hashPassword(input.password)
  const rows = await dbQuery<UserRow>(
    `INSERT INTO sn_users (id, email, password_hash, first_name, last_name, phone, gender, avatar)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, email, first_name, last_name, phone, gender, avatar, created_at`,
    [
      id,
      input.email.toLowerCase().trim(),
      passwordHash,
      input.firstName ?? "",
      input.lastName ?? "",
      input.phone ?? "",
      input.gender ?? "",
      input.avatar ?? "",
    ]
  )
  if (!rows || rows.length === 0) return null
  return mapUser(rows[0])
}

export async function findUserByCredentials(email: string, password: string): Promise<AuthUser | null> {
  const rows = await dbQuery<UserRow & { password_hash: string }>(
    `SELECT id, email, password_hash, first_name, last_name, phone, gender, avatar, created_at
     FROM sn_users WHERE email = $1`,
    [email.toLowerCase().trim()]
  )
  if (!rows || rows.length === 0) return null
  const row = rows[0]
  if (!verifyPassword(password, row.password_hash)) return null
  return mapUser(row)
}