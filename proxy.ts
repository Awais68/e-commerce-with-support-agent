import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE = "sn_session"
const PUBLIC_PATHS = ["/account/login", "/account/register"]

function bufToB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ""
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function verifySignedToken(value: string): Promise<boolean> {
  const parts = value.split(".")
  if (parts.length !== 3) return false
  const [token, expStr, sig] = parts
  const secret = process.env.SESSION_SECRET || "sn-collections-dev-secret-change-me"

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const expectedBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(`${token}.${expStr}`))
  const expected = bufToB64url(expectedBuf)

  if (sig !== expected) return false
  const expiresAt = Number(expStr)
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (await verifySignedToken(request.cookies.get(SESSION_COOKIE)?.value ?? "")) {
      const url = request.nextUrl.clone()
      url.pathname = "/account/profile"
      url.search = ""
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (pathname.startsWith("/account")) {
    const cookie = request.cookies.get(SESSION_COOKIE)?.value
    if (!cookie || !(await verifySignedToken(cookie))) {
      const url = request.nextUrl.clone()
      url.pathname = "/account/login"
      url.search = ""
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*"],
}