"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, AlertCircle, ContactRound, UserRound, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { AccountSidebar } from "@/components/account-sidebar"
import { useAuth } from "@/lib/use-auth"
import type { ClientUser } from "@/lib/use-auth"

interface ProfileForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string
  avatar: string
}

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

export default function ProfilePage() {
  const router = useRouter()
  const { status } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "male",
    avatar: "",
  })

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.replace("/account/login")
      return
    }
    fetch("/api/account/profile", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          const u = data.user as ClientUser
          setForm({
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            phone: u.phone,
            gender: u.gender || "male",
            avatar: u.avatar || "",
          })
        }
      })
      .finally(() => setLoading(false))
  }, [status, router])

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      return
    }
    const raw = await fileToDataUrl(file)
    const avatar = await resizeImage(raw)
    setForm((prev) => ({ ...prev, avatar }))
    e.target.value = ""
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Could not save your profile.")
        return
      }
      toast.success("Profile updated")
    } catch {
      setError("Could not save your profile.")
    } finally {
      setSaving(false)
    }
  }

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [pwSaving, setPwSaving] = useState(false)

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    setPwSaving(true)
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error || "Could not update your password.")
        return
      }
      toast.success("Password updated")
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch {
      toast.error("Could not update your password.")
    } finally {
      setPwSaving(false)
    }
  }

  if (loading || status === "loading") {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-24 lg:pt-32 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  const setField = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="font-serif text-3xl lg:text-4xl mb-2">My Account</h1>
            <p className="text-muted-foreground">Manage your profile and preferences</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12">
            <AccountSidebar />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1"
            >
              <div className="max-w-2xl">
                <h2 className="font-serif text-2xl mb-8">Personal Information</h2>

                {error && (
                  <div className="mb-6 flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <Label className="text-xs tracking-wide uppercase text-muted-foreground">Profile Photo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <Avatar className="h-20 w-20 border border-border">
                        {form.avatar ? (
                          <AvatarImage src={form.avatar} alt="Profile photo" />
                        ) : (
                          <AvatarFallback className="text-muted-foreground">
                            {form.gender === "female" ? <ContactRound className="h-6 w-6" /> : <UserRound className="h-6 w-6" />}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex cursor-pointer items-center gap-2 border border-border/50 px-4 py-2 text-xs tracking-wide uppercase text-muted-foreground hover:border-foreground/50 transition-colors">
                          <Upload className="h-4 w-4" />
                          Upload Photo
                          <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatar}
                          />
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
                    <Label className="text-xs tracking-wide uppercase text-muted-foreground">Gender</Label>
                    <div className="mt-2 grid grid-cols-2 gap-4 max-w-xs">
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

                  <div className="grid sm:grid-cols-2 gap-6">
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
                      value={form.email}
                      onChange={setField("email")}
                      className="mt-2 border-border/50 focus:border-foreground"
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
                    />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" disabled={saving} className="px-8 py-6 text-sm tracking-[0.15em] uppercase">
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>

                <div className="mt-16 pt-16 border-t border-border">
                  <h2 className="font-serif text-2xl mb-8">Change Password</h2>

                  <form onSubmit={handlePassword} className="space-y-6">
                    <div>
                      <Label
                        htmlFor="currentPassword"
                        className="text-xs tracking-wide uppercase text-muted-foreground"
                      >
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={pwForm.currentPassword}
                        onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                        className="mt-2 border-border/50 focus:border-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPassword" className="text-xs tracking-wide uppercase text-muted-foreground">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={pwForm.newPassword}
                        onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                        className="mt-2 border-border/50 focus:border-foreground"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="confirmPassword"
                        className="text-xs tracking-wide uppercase text-muted-foreground"
                      >
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={pwForm.confirmPassword}
                        onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                        className="mt-2 border-border/50 focus:border-foreground"
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        variant="outline"
                        disabled={pwSaving}
                        className="px-8 py-6 text-sm tracking-[0.15em] uppercase bg-transparent"
                      >
                        {pwSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Update Password
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <PremiumFooter />
    </>
  )
}