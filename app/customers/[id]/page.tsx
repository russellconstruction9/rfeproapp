"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Edit, Trash2, Plus, FileText, CheckCircle2, Phone, MapPin, User, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CustomerDashboard() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const { customers, estimates, updateCustomer, deleteCustomer, markEstimateSold, deleteEstimate, loading } = useSupabaseData()
  const [isEditing, setIsEditing] = useState(false)

  const customer = customers.find(c => c.id === id)
  const customerEstimates = estimates.filter(e => e.customerId === id)

  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" })

  useEffect(() => {
    if (customer) {
      setEditForm({ name: customer.name, phone: customer.phone, address: customer.address })
    }
  }, [customer])

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>
  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Customer not found</h2>
        <Link href="/customers">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers</Button>
        </Link>
      </div>
    )
  }

  const handleUpdate = async () => {
    if (!editForm.name) return alert("Name is required")
    await updateCustomer(id, editForm)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this customer and all their estimates? This action cannot be undone.")) {
      await deleteCustomer(id)
      router.push("/customers")
    }
  }

  const totalEstimates = customerEstimates.length
  const totalValue = customerEstimates.reduce((sum, est) => sum + est.estimatedCost, 0)
  const soldValue = customerEstimates.filter(e => e.status === 'sold').reduce((sum, est) => sum + est.estimatedCost, 0)

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/customers">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <User className="h-6 w-6 text-orange-600" />
                {customer.name}
              </h1>
              <p className="text-sm text-slate-500">Customer Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? "Cancel Edit" : "Edit Details"}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Customer Details & Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                    </div>
                    <Button onClick={handleUpdate} className="w-full bg-orange-600 hover:bg-orange-700 text-white">Save Changes</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Phone</p>
                        <p className="text-sm text-slate-500">{customer.phone || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Address</p>
                        <p className="text-sm text-slate-500">{customer.address || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-900 text-white border-none">
                <CardContent className="p-4">
                  <p className="text-sm text-slate-400 font-medium">Total Estimates</p>
                  <p className="text-3xl font-bold mt-1">{totalEstimates}</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-600 text-white border-none">
                <CardContent className="p-4">
                  <p className="text-sm text-orange-200 font-medium">Sold Value</p>
                  <p className="text-2xl font-bold mt-1">${soldValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="p-4 flex justify-between items-center">
                <p className="text-sm font-medium text-slate-600">Pipeline Value</p>
                <p className="text-lg font-bold text-slate-900">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Estimates List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Estimates</h2>
              <Link href={`/?customerId=${customer.id}`}>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  New Estimate
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {customerEstimates.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-slate-500">
                    <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p>No estimates found for this customer.</p>
                    <Link href={`/?customerId=${customer.id}`}>
                      <Button variant="link" className="text-orange-600 mt-2">Create their first estimate</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                customerEstimates.map((estimate) => (
                  <Card key={estimate.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {new Date(estimate.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${estimate.status === 'sold' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                            {estimate.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {estimate.totalArea.toLocaleString()} sq ft • {estimate.totalBoardFeet.toLocaleString()} bd ft
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          Cost: ${estimate.estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {estimate.status === 'draft' && (
                          <Button 
                            onClick={() => markEstimateSold(estimate.id)}
                            className="bg-orange-600 hover:bg-orange-700 text-white flex-1 sm:flex-none"
                            size="sm"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark Sold
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
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
