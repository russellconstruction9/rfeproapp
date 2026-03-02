"use client"

import { useState, useEffect } from "react"
import { useCalculatorStore } from "@/store/use-calculator-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { settings, updateSettings } = useCalculatorStore()
  const [localSettings, setLocalSettings] = useState(settings)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
    setLocalSettings(settings)
  }, [settings])

  const handleSave = () => {
    updateSettings(localSettings)
    alert("Settings saved successfully!")
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500">Manage your chemical yields and pricing.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chemical Yields</CardTitle>
            <CardDescription>
              Enter the board feet yield per set for your chemicals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openCellYield">Open Cell Yield (Board Feet)</Label>
              <Input
                id="openCellYield"
                type="number"
                value={localSettings.openCellYield}
                onChange={(e) => setLocalSettings({ ...localSettings, openCellYield: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closedCellYield">Closed Cell Yield (Board Feet)</Label>
              <Input
                id="closedCellYield"
                type="number"
                value={localSettings.closedCellYield}
                onChange={(e) => setLocalSettings({ ...localSettings, closedCellYield: Number(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing (Optional)</CardTitle>
            <CardDescription>
              Enter the price per set to estimate material costs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openCellPrice">Open Cell Price per Set ($)</Label>
              <Input
                id="openCellPrice"
                type="number"
                value={localSettings.openCellPrice}
                onChange={(e) => setLocalSettings({ ...localSettings, openCellPrice: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closedCellPrice">Closed Cell Price per Set ($)</Label>
              <Input
                id="closedCellPrice"
                type="number"
                value={localSettings.closedCellPrice}
                onChange={(e) => setLocalSettings({ ...localSettings, closedCellPrice: Number(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
