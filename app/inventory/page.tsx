"use client"

import { useState, useEffect } from "react"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Package, Loader2 } from "lucide-react"
import { AppLayout } from "@/components/AppLayout"

export default function InventoryPage() {
  const { inventory, updateInventory, loading } = useSupabaseData()
  const [localInventory, setLocalInventory] = useState(inventory)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLocalInventory(inventory)
  }, [inventory])

  const handleSave = async () => {
    setSaving(true)
    await updateInventory(localInventory)
    setSaving(false)
    alert("Inventory saved successfully!")
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>

  return (
    <AppLayout>
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-orange-600" />
            Inventory Management
          </h1>
          <p className="text-sm text-slate-500">Manage your current warehouse stock of foam sets.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Stock</CardTitle>
            <CardDescription>
              Enter the number of sets currently available in your warehouse.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openCellSets">Open Cell (Sets)</Label>
              <Input
                id="openCellSets"
                type="number"
                step="0.01"
                value={localInventory.openCellSets}
                onChange={(e) => setLocalInventory({ ...localInventory, openCellSets: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closedCellSets">Closed Cell (Sets)</Label>
              <Input
                id="closedCellSets"
                type="number"
                step="0.01"
                value={localInventory.closedCellSets}
                onChange={(e) => setLocalInventory({ ...localInventory, closedCellSets: Number(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="w-full sm:w-auto" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Saving..." : "Save Inventory"}
          </Button>
        </div>
      </div>
    </div>
    </AppLayout>
  )
}
