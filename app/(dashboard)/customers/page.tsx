"use client"

import { useState } from "react"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Users, Plus, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CustomersPage() {
  const { customers, addCustomer, loading } = useSupabaseData()
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  const handleSave = async () => {
    if (!name) return alert("Name is required")
    setSaving(true)
    await addCustomer({ name, phone, address })
    setSaving(false)
    setIsAdding(false)
    setName("")
    setPhone("")
    setAddress("")
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-orange-600" />
              Customers
            </h1>
            <p className="text-sm text-slate-500">Manage your customer database.</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Button>
        </div>

        {isAdding && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {saving ? "Saving..." : "Save Customer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.length === 0 && !isAdding && (
            <p className="text-slate-500 col-span-full text-center py-8">No customers found. Add one to get started.</p>
          )}
          {customers.map((customer) => (
            <Link key={customer.id} href={`/customers/${customer.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-slate-200 hover:border-orange-300">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-slate-900">{customer.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{customer.phone}</p>
                  <p className="text-sm text-slate-500">{customer.address}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
