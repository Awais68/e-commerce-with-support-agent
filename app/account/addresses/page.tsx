"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MapPin, Edit2, Trash2, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { AccountSidebar } from "@/components/account-sidebar"
import { useAuth } from "@/lib/use-auth"

interface Address {
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

const emptyForm = {
  label: "Home",
  name: "",
  street: "",
  apartment: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  phone: "",
}

export default function AddressesPage() {
  const router = useRouter()
  const { status: authStatus } = useAuth()
  const [loading, setLoading] = useState(true)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authStatus === "loading") return
    if (authStatus === "unauthenticated") {
      router.replace("/account/login")
      return
    }
    fetch("/api/account/addresses", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data?.addresses ?? [])
        const def = data?.addresses?.find((a: Address) => a.isDefault)
        if (def) setSelectedAddress(def.id)
      })
      .finally(() => setLoading(false))
  }, [authStatus, router])

  const setField = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const startCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  const startEdit = (address: Address) => {
    setForm({
      label: address.label,
      name: address.name,
      street: address.street,
      apartment: address.apartment,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      phone: address.phone,
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const res = await fetch(`/api/account/addresses?id=${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data?.error || "Could not update the address.")
          return
        }
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingId ? { ...a, ...form, id: editingId } : a))
        )
        toast.success("Address updated")
      } else {
        const res = await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data?.error || "Could not save the address.")
          return
        }
        setAddresses((prev) => [...prev, data.address])
        if (data.address.isDefault) setSelectedAddress(data.address.id)
        toast.success("Address added")
      }
      setShowForm(false)
    } catch {
      toast.error("Could not save the address.")
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id: string) => {
    await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" })
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    toast.success("Address removed")
  }

  const handleSetDefault = async (address: Address) => {
    const res = await fetch(`/api/account/addresses?id=${address.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    })
    const data = await res.json()
    if (res.ok && data?.address) {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === address.id })))
      setSelectedAddress(address.id)
    }
  }

  if (loading || authStatus === "loading") {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-24 lg:pt-32 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

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
            <p className="text-muted-foreground">Manage your shipping addresses</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12">
            <AccountSidebar />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl">Saved Addresses</h2>
                <Button
                  variant="outline"
                  onClick={startCreate}
                  className="gap-2 text-sm tracking-[0.1em] uppercase bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </Button>
              </div>

              {addresses.length === 0 && !showForm && (
                <div className="text-center py-16 border border-border">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-6">No saved addresses yet.</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                {addresses.map((address, index) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`relative border p-6 transition-colors cursor-pointer ${
                      selectedAddress === address.id || address.isDefault
                        ? "border-foreground"
                        : "border-border hover:border-foreground/50"
                    }`}
                    onClick={() => {
                      setSelectedAddress(address.id)
                      if (!address.isDefault) handleSetDefault(address)
                    }}
                  >
                    {address.isDefault && (
                      <span className="absolute top-4 right-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                        Default
                      </span>
                    )}

                    <div className="flex items-start gap-3 mb-4">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{address.label}</span>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1 ml-7">
                      <p>{address.name}</p>
                      <p>{address.street}</p>
                      {address.apartment && <p>{address.apartment}</p>}
                      <p>
                        {address.city}
                        {address.state && `, ${address.state}`} {address.zip}
                      </p>
                      {address.country && <p>{address.country}</p>}
                      {address.phone && <p className="pt-2">{address.phone}</p>}
                    </div>

                    <div className="flex gap-4 mt-6 ml-7">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          startEdit(address)
                        }}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      {!address.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemove(address.id)
                          }}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-10 border border-border p-6 lg:p-8"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-serif text-xl">{editingId ? "Edit Address" : "Add New Address"}</h3>
                      <button onClick={() => setShowForm(false)} aria-label="Close">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <Label htmlFor="label" className="text-xs tracking-wide uppercase text-muted-foreground">
                            Label
                          </Label>
                          <Input id="label" value={form.label} onChange={setField("label")} className="mt-2" />
                        </div>
                        <div>
                          <Label htmlFor="name" className="text-xs tracking-wide uppercase text-muted-foreground">
                            Full Name
                          </Label>
                          <Input id="name" required value={form.name} onChange={setField("name")} className="mt-2" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="street" className="text-xs tracking-wide uppercase text-muted-foreground">
                          Street Address
                        </Label>
                        <Input id="street" required value={form.street} onChange={setField("street")} className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="apartment" className="text-xs tracking-wide uppercase text-muted-foreground">
                          Apartment, suite, etc. (optional)
                        </Label>
                        <Input id="apartment" value={form.apartment} onChange={setField("apartment")} className="mt-2" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                        <div>
                          <Label htmlFor="city" className="text-xs tracking-wide uppercase text-muted-foreground">
                            City
                          </Label>
                          <Input id="city" required value={form.city} onChange={setField("city")} className="mt-2" />
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-xs tracking-wide uppercase text-muted-foreground">
                            State
                          </Label>
                          <Input id="state" value={form.state} onChange={setField("state")} className="mt-2" />
                        </div>
                        <div>
                          <Label htmlFor="zip" className="text-xs tracking-wide uppercase text-muted-foreground">
                            ZIP
                          </Label>
                          <Input id="zip" required value={form.zip} onChange={setField("zip")} className="mt-2" />
                        </div>
                        <div>
                          <Label htmlFor="country" className="text-xs tracking-wide uppercase text-muted-foreground">
                            Country
                          </Label>
                          <Input id="country" value={form.country} onChange={setField("country")} className="mt-2" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-xs tracking-wide uppercase text-muted-foreground">
                          Phone
                        </Label>
                        <Input id="phone" value={form.phone} onChange={setField("phone")} className="mt-2" />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={saving} className="px-8 py-5 text-sm tracking-[0.15em] uppercase">
                          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {editingId ? "Update Address" : "Save Address"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowForm(false)}
                          className="px-8 py-5 text-sm tracking-[0.15em] uppercase bg-transparent"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>
      <PremiumFooter />
    </>
  )
}