"use client"

import { useState, useEffect } from "react"
import { useCalculatorStore } from "@/store/use-calculator-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, CheckCircle2, Trash2 } from "lucide-react"
import Link from "next/link"

export default function EstimatesPage() {
  const { estimates, customers, markEstimateSold, deleteEstimate } = useCalculatorStore()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-orange-600" />
              Estimates
            </h1>
            <p className="text-sm text-slate-500">View and manage your estimates.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {estimates.length === 0 && (
            <p className="text-slate-500 text-center py-8">No estimates found. Create one from the calculator.</p>
          )}
          {estimates.map((estimate) => {
            const customer = customers.find((c) => c.id === estimate.customerId)
            return (
              <Card key={estimate.id}>
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{customer?.name || "Unknown Customer"}</h3>
                    <p className="text-sm text-slate-500">Date: {new Date(estimate.date).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-500">Total Area: {estimate.totalArea.toLocaleString()} sq ft</p>
                    <p className="text-sm text-slate-500">Cost: ${estimate.estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estimate.status === 'sold' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                      {estimate.status.toUpperCase()}
                    </span>
                    {estimate.status === 'draft' && (
                      <Button 
                        onClick={() => markEstimateSold(estimate.id)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as Sold
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this estimate?")) {
                          deleteEstimate(estimate.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
