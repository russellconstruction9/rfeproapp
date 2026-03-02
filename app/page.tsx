"use client"

import { useState, useEffect, Suspense } from "react"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Droplets, Ruler, DollarSign, Package, CheckCircle2, Users, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"

function HomeContent() {
  const { settings, inventory, customers, addEstimate, loading } = useSupabaseData()
  const [jobSaved, setJobSaved] = useState(false)
  const [savingJob, setSavingJob] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const searchParams = useSearchParams()

  // Inputs
  const [length, setLength] = useState<number>(40)
  const [width, setWidth] = useState<number>(30)
  const [wallHeight, setWallHeight] = useState<number>(10)
  const [roofPitch, setRoofPitch] = useState<number>(4) // 4/12 pitch
  
  // Toggles & Material per section
  const [includeWalls, setIncludeWalls] = useState<boolean>(true)
  const [wallFoamType, setWallFoamType] = useState<"open" | "closed">("closed")
  const [wallThickness, setWallThickness] = useState<number>(2)

  const [includeRoof, setIncludeRoof] = useState<boolean>(true)
  const [roofFoamType, setRoofFoamType] = useState<"open" | "closed">("open")
  const [roofThickness, setRoofThickness] = useState<number>(5.5)

  const [includeGables, setIncludeGables] = useState<boolean>(true)
  const [gableFoamType, setGableFoamType] = useState<"open" | "closed">("closed")
  const [gableThickness, setGableThickness] = useState<number>(2)

  useEffect(() => {
    const customerId = searchParams.get('customerId')
    if (customerId) {
      setSelectedCustomerId(customerId)
    }
  }, [searchParams])

  // Calculations
  const wallArea = includeWalls ? (2 * length * wallHeight) + (2 * width * wallHeight) : 0
  const gableArea = includeGables ? width * (width / 2) * (roofPitch / 12) : 0
  const roofArea = includeRoof ? length * width * Math.sqrt(1 + Math.pow(roofPitch / 12, 2)) : 0
  
  const totalArea = Math.round(wallArea + gableArea + roofArea)

  const wallBdFt = Math.round(wallArea * wallThickness)
  const gableBdFt = Math.round(gableArea * gableThickness)
  const roofBdFt = Math.round(roofArea * roofThickness)

  const totalBoardFeet = wallBdFt + gableBdFt + roofBdFt

  let openCellBdFt = 0
  let closedCellBdFt = 0

  if (includeWalls) {
    if (wallFoamType === "open") openCellBdFt += wallBdFt; else closedCellBdFt += wallBdFt;
  }
  if (includeRoof) {
    if (roofFoamType === "open") openCellBdFt += roofBdFt; else closedCellBdFt += roofBdFt;
  }
  if (includeGables) {
    if (gableFoamType === "open") openCellBdFt += gableBdFt; else closedCellBdFt += gableBdFt;
  }

  const openSets = settings.openCellYield > 0 ? openCellBdFt / settings.openCellYield : 0
  const closedSets = settings.closedCellYield > 0 ? closedCellBdFt / settings.closedCellYield : 0
  const totalSets = openSets + closedSets

  const estimatedCost = (openSets * settings.openCellPrice) + (closedSets * settings.closedCellPrice)

  const handleSaveJob = async () => {
    if (!selectedCustomerId) {
      alert("Please select a customer first.")
      return
    }
    
    setSavingJob(true)
    const now = new Date()
    await addEstimate({
      customerId: selectedCustomerId,
      date: now.toISOString(),
      status: 'draft',
      openSets,
      closedSets,
      estimatedCost,
      totalArea,
      totalBoardFeet
    })
    setSavingJob(false)
    
    setJobSaved(true)
    setTimeout(() => setJobSaved(false), 3000)
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>

  return (
    <AppLayout>
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-orange-600" />
            New Estimate
          </h1>
          <p className="text-sm text-slate-500">Calculate spray foam requirements and save an estimate.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Customer Details
                </CardTitle>
                <CardDescription>Select a customer for this estimate.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.length === 0 ? (
                        <SelectItem value="none" disabled>No customers found. Add one first.</SelectItem>
                      ) : (
                        customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-orange-600" />
                  Building Dimensions
                </CardTitle>
                <CardDescription>Enter the measurements of the structure.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length (ft)</Label>
                  <Input id="length" type="number" value={length || ""} onChange={(e) => setLength(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width (ft)</Label>
                  <Input id="width" type="number" value={width || ""} onChange={(e) => setWidth(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wallHeight">Wall Height (ft)</Label>
                  <Input id="wallHeight" type="number" value={wallHeight || ""} onChange={(e) => setWallHeight(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roofPitch">Roof Pitch (x/12)</Label>
                  <Input id="roofPitch" type="number" value={roofPitch || ""} onChange={(e) => setRoofPitch(Number(e.target.value))} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-orange-600" />
                  Application Details
                </CardTitle>
                <CardDescription>Select areas to spray and material type for each.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Walls */}
                <div className="space-y-3 rounded-lg border p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeWalls" className="text-base font-semibold cursor-pointer">Walls</Label>
                    <Switch id="includeWalls" checked={includeWalls} onCheckedChange={setIncludeWalls} />
                  </div>
                  {includeWalls && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label>Foam Type</Label>
                        <Select value={wallFoamType} onValueChange={(val: "open" | "closed") => setWallFoamType(val)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="closed">Closed Cell</SelectItem>
                            <SelectItem value="open">Open Cell</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Thickness (in)</Label>
                        <Input type="number" step="0.5" value={wallThickness || ""} onChange={(e) => setWallThickness(Number(e.target.value))} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Roof Deck */}
                <div className="space-y-3 rounded-lg border p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeRoof" className="text-base font-semibold cursor-pointer">Roof Deck</Label>
                    <Switch id="includeRoof" checked={includeRoof} onCheckedChange={setIncludeRoof} />
                  </div>
                  {includeRoof && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label>Foam Type</Label>
                        <Select value={roofFoamType} onValueChange={(val: "open" | "closed") => setRoofFoamType(val)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="closed">Closed Cell</SelectItem>
                            <SelectItem value="open">Open Cell</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Thickness (in)</Label>
                        <Input type="number" step="0.5" value={roofThickness || ""} onChange={(e) => setRoofThickness(Number(e.target.value))} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Gable Ends */}
                <div className="space-y-3 rounded-lg border p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeGables" className="text-base font-semibold cursor-pointer">Gable Ends</Label>
                    <Switch id="includeGables" checked={includeGables} onCheckedChange={setIncludeGables} />
                  </div>
                  {includeGables && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label>Foam Type</Label>
                        <Select value={gableFoamType} onValueChange={(val: "open" | "closed") => setGableFoamType(val)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="closed">Closed Cell</SelectItem>
                            <SelectItem value="open">Open Cell</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Thickness (in)</Label>
                        <Input type="number" step="0.5" value={gableThickness || ""} onChange={(e) => setGableThickness(Number(e.target.value))} />
                      </div>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            <Card className="bg-slate-950 text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-50">
                  <Calculator className="h-5 w-5" />
                  Estimate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div>
                  <p className="text-slate-300 text-sm font-medium mb-1">Total Surface Area</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{totalArea.toLocaleString()}</span>
                    <span className="text-slate-300 text-sm">sq ft</span>
                  </div>
                </div>

                <div className="h-px bg-slate-800" />

                <div>
                  <p className="text-slate-300 text-sm font-medium mb-1">Total Board Feet</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">{totalBoardFeet.toLocaleString()}</span>
                    <span className="text-slate-300 text-sm">bd ft</span>
                  </div>
                </div>

                <div className="h-px bg-slate-800" />

                <div>
                  <p className="text-slate-300 text-sm font-medium mb-1">Sets Needed</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight text-orange-500">{totalSets.toFixed(2)}</span>
                    <span className="text-slate-300 text-sm">total sets</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {openSets > 0 && (
                      <p className="text-xs text-slate-400 flex justify-between">
                        <span>Open Cell:</span>
                        <span className="font-medium">{openSets.toFixed(2)} sets</span>
                      </p>
                    )}
                    {closedSets > 0 && (
                      <p className="text-xs text-slate-400 flex justify-between">
                        <span>Closed Cell:</span>
                        <span className="font-medium">{closedSets.toFixed(2)} sets</span>
                      </p>
                    )}
                  </div>
                </div>

                {estimatedCost > 0 && (
                  <>
                    <div className="h-px bg-slate-800" />
                    <div>
                      <p className="text-slate-300 text-sm font-medium mb-1 flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Estimated Material Cost
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold tracking-tight">${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4">
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold" 
                    size="lg"
                    onClick={handleSaveJob}
                    disabled={jobSaved || savingJob || totalSets === 0 || !selectedCustomerId}
                  >
                    {jobSaved ? (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Estimate Saved
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        Save Estimate
                      </>
                    )}
                  </Button>
                </div>

              </CardContent>
            </Card>

            <Card className="bg-slate-100 border-none">
              <CardContent className="p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Current Warehouse Stock
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Open Cell:</span>
                    <span className={`font-medium ${inventory.openCellSets < openSets ? 'text-red-600' : ''}`}>
                      {inventory.openCellSets.toFixed(2)} sets
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Closed Cell:</span>
                    <span className={`font-medium ${inventory.closedCellSets < closedSets ? 'text-red-600' : ''}`}>
                      {inventory.closedCellSets.toFixed(2)} sets
                    </span>
                  </div>
                </div>
                {(inventory.openCellSets < openSets || inventory.closedCellSets < closedSets) && (
                  <p className="text-red-600 text-xs mt-2 font-medium">
                    Warning: Insufficient stock for this job.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-100 border-none">
              <CardContent className="p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900 mb-2">Area Breakdown</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Walls:</span>
                    <span className="font-medium">{Math.round(wallArea).toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Roof Deck:</span>
                    <span className="font-medium">{Math.round(roofArea).toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gable Ends:</span>
                    <span className="font-medium">{Math.round(gableArea).toLocaleString()} sq ft</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
    </AppLayout>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
