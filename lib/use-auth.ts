"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export interface ClientUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  gender: string
  avatar: string
  createdAt: string
}

type AuthState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: ClientUser }
  | { status: "unauthenticated"; user: null }

export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null })
  const router = useRouter()

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" })
      const data = await res.json()
      if (data?.user) {
        setState({ status: "authenticated", user: data.user })
      } else {
        setState({ status: "unauthenticated", user: null })
      }
    } catch {
      setState({ status: "unauthenticated", user: null })
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data?.user) {
          setState({ status: "authenticated", user: data.user })
        } else {
          setState({ status: "unauthenticated", user: null })
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "unauthenticated", user: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setState({ status: "unauthenticated", user: null })
    router.push("/account/login")
    router.refresh()
  }, [router])

  return {
    status: state.status,
    user: state.user,
    refresh,
    logout,
  }
}