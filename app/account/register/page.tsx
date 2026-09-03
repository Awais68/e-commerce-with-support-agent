"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, AlertCircle, UserPlus, ContactRound, UserRound, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const GENDERS = [
  { value: "male", label: "Male", icon: UserRound },
  { value: "female", label: "Female", icon: ContactRound },
]

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function resizeImage(dataUrl: string, maxSize = 256): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext("2d")
      if (!ctx) return resolve(dataUrl)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/jpeg", 0.8))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    gender: "male",
    avatar: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.")
      return
    }
    const raw = await fileToDataUrl(file)
    const avatar = await resizeImage(raw)
    setForm((prev) => ({ ...prev, avatar }))
    e.target.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Could not create your account.")
        return
      }
      router.push("/account/profile")
      router.refresh()
    } catch {
      setError("Could not create your account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
          <Link href="/" className="font-serif text-xl lg:text-2xl tracking-[0.3em] uppercase">
            SN Collections
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-border">
              <UserPlus className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-3xl mb-2">Create Account</h1>
            <p className="text-sm text-muted-foreground">
              Join SN Collections for faster checkout and order tracking.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-xs tracking-wide uppercase text-muted-foreground">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={setField("firstName")}
                  className="mt-2 border-border/50 focus:border-foreground"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-xs tracking-wide uppercase text-muted-foreground">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={setField("lastName")}
                  className="mt-2 border-border/50 focus:border-foreground"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-xs tracking-wide uppercase text-muted-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={setField("email")}
                className="mt-2 border-border/50 focus:border-foreground"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs tracking-wide uppercase text-muted-foreground">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={setField("phone")}
                className="mt-2 border-border/50 focus:border-foreground"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <Label className="text-xs tracking-wide uppercase text-muted-foreground">Gender</Label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {GENDERS.map((g) => {
                  const active = form.gender === g.value
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, gender: g.value }))}
                      className={`flex items-center justify-center gap-2 border px-4 py-3 text-sm tracking-wide transition-colors ${
                        active
                          ? "border-foreground text-foreground"
                          : "border-border/50 text-muted-foreground hover:border-foreground/50"
                      }`}
                    >
                      <g.icon className="h-4 w-4" />
                      {g.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <Label htmlFor="avatar" className="text-xs tracking-wide uppercase text-muted-foreground">
                Profile Photo <span className="normal-case text-muted-foreground/70">(optional)</span>
              </Label>
              <div className="mt-2 flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-border">
                  {form.avatar ? (
                    <AvatarImage src={form.avatar} alt="Profile preview" />
                  ) : (
                    <AvatarFallback className="text-muted-foreground">
                      {form.gender === "female" ? <ContactRound className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-1 items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 border border-border/50 px-4 py-2 text-xs tracking-wide uppercase text-muted-foreground hover:border-foreground/50 transition-colors">
                    <Upload className="h-4 w-4" />
                    Upload
                    <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                  </label>
                  {form.avatar && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, avatar: "" }))}
                      className="flex items-center gap-1 text-xs tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-xs tracking-wide uppercase text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={setField("password")}
                className="mt-2 border-border/50 focus:border-foreground"
                placeholder="At least 8 characters"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full py-6 text-sm tracking-[0.2em] uppercase">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/account/login" className="underline underline-offset-4 hover:no-underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  )
}