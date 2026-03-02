"use client"

import { useState, useEffect } from "react"
import { useCalculatorStore } from "@/store/use-calculator-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Package } from "lucide-react"
import Link from "next/link"

export default function InventoryPage() {
  const { inventory, updateInventory } = useCalculatorStore()
  const [localInventory, setLocalInventory] = useState(inventory)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
    setLocalInventory(inventory)
  }, [inventory])

  const handleSave = () => {
    updateInventory(localInventory)
    alert("Inventory saved successfully!")
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Package className="h-6 w-6 text-orange-600" />
              Inventory Management
            </h1>
            <p className="text-sm text-slate-500">Manage your current warehouse stock of foam sets.</p>
          </div>
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
          <Button onClick={handleSave} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Save Inventory
          </Button>
        </div>
      </div>
    </div>
  )
}
