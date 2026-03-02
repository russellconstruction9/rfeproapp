"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"

// ── Types matching the DB schema ──────────────────────────────────

export interface Settings {
  openCellYield: number
  closedCellYield: number
  openCellPrice: number
  closedCellPrice: number
}

export interface Inventory {
  openCellSets: number
  closedCellSets: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  address: string
}

export interface Estimate {
  id: string
  customerId: string
  date: string
  status: "draft" | "sold"
  openSets: number
  closedSets: number
  estimatedCost: number
  totalArea: number
  totalBoardFeet: number
}

interface SupabaseData {
  loading: boolean
  userId: string | null
  settings: Settings
  inventory: Inventory
  customers: Customer[]
  estimates: Estimate[]
  // mutations
  updateSettings: (s: Partial<Settings>) => Promise<void>
  updateInventory: (i: Partial<Inventory>) => Promise<void>
  addCustomer: (c: Omit<Customer, "id">) => Promise<Customer | null>
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  addEstimate: (e: Omit<Estimate, "id">) => Promise<void>
  markEstimateSold: (id: string) => Promise<void>
  deleteEstimate: (id: string) => Promise<void>
}

// ── Default values (same as DB defaults) ──────────────────────────

const defaultSettings: Settings = {
  openCellYield: 16000,
  closedCellYield: 4000,
  openCellPrice: 2000,
  closedCellPrice: 2500,
}

const defaultInventory: Inventory = {
  openCellSets: 0,
  closedCellSets: 0,
}

// ── Hook ──────────────────────────────────────────────────────────

export function useSupabaseData(): SupabaseData {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [inventory, setInventory] = useState<Inventory>(defaultInventory)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [estimates, setEstimates] = useState<Estimate[]>([])

  // ── Initial fetch ────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user || cancelled) {
          setLoading(false)
          return
        }

        setUserId(user.id)

        // Fetch everything in parallel
        const [settingsRes, inventoryRes, customersRes, estimatesRes] = await Promise.all([
          supabase.from("settings").select("*").eq("user_id", user.id).single(),
          supabase.from("inventory").select("*").eq("user_id", user.id).single(),
          supabase.from("customers").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("estimates").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        ])

        if (cancelled) return

        if (settingsRes.data) {
          setSettings({
            openCellYield: Number(settingsRes.data.open_cell_yield),
            closedCellYield: Number(settingsRes.data.closed_cell_yield),
            openCellPrice: Number(settingsRes.data.open_cell_price),
            closedCellPrice: Number(settingsRes.data.closed_cell_price),
          })
        }

        if (inventoryRes.data) {
          setInventory({
            openCellSets: Number(inventoryRes.data.open_cell_sets),
            closedCellSets: Number(inventoryRes.data.closed_cell_sets),
          })
        }

        if (customersRes.data) {
          setCustomers(
            customersRes.data.map((c: any) => ({
              id: c.id,
              name: c.name,
              phone: c.phone || "",
              address: c.address || "",
            }))
          )
        }

        if (estimatesRes.data) {
          setEstimates(
            estimatesRes.data.map((e: any) => ({
              id: e.id,
              customerId: e.customer_id,
              date: e.date || e.created_at,
              status: e.status as "draft" | "sold",
              openSets: Number(e.open_sets),
              closedSets: Number(e.closed_sets),
              estimatedCost: Number(e.estimated_cost),
              totalArea: Number(e.total_area),
              totalBoardFeet: Number(e.total_board_feet),
            }))
          )
        }
      } catch (err) {
        console.error("Error loading data:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Mutations ────────────────────────────────────────────────────

  const updateSettings = useCallback(
    async (partial: Partial<Settings>) => {
      const merged = { ...settings, ...partial }
      setSettings(merged)

      const { error } = await supabase
        .from("settings")
        .update({
          open_cell_yield: merged.openCellYield,
          closed_cell_yield: merged.closedCellYield,
          open_cell_price: merged.openCellPrice,
          closed_cell_price: merged.closedCellPrice,
        })
        .eq("user_id", userId!)

      if (error) console.error("Error updating settings:", error)
    },
    [settings, userId, supabase]
  )

  const updateInventory = useCallback(
    async (partial: Partial<Inventory>) => {
      const merged = { ...inventory, ...partial }
      setInventory(merged)

      const { error } = await supabase
        .from("inventory")
        .update({
          open_cell_sets: merged.openCellSets,
          closed_cell_sets: merged.closedCellSets,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId!)

      if (error) console.error("Error updating inventory:", error)
    },
    [inventory, userId, supabase]
  )

  const addCustomer = useCallback(
    async (customer: Omit<Customer, "id">): Promise<Customer | null> => {
      const { data, error } = await supabase
        .from("customers")
        .insert({
          user_id: userId!,
          name: customer.name,
          phone: customer.phone || null,
          address: customer.address || null,
        })
        .select()
        .single()

      if (error) {
        console.error("Error adding customer:", error)
        return null
      }

      const newCustomer: Customer = {
        id: data.id,
        name: data.name,
        phone: data.phone || "",
        address: data.address || "",
      }
      setCustomers((prev) => [newCustomer, ...prev])
      return newCustomer
    },
    [userId, supabase]
  )

  const updateCustomer = useCallback(
    async (id: string, data: Partial<Customer>) => {
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      )

      const updateObj: any = {}
      if (data.name !== undefined) updateObj.name = data.name
      if (data.phone !== undefined) updateObj.phone = data.phone || null
      if (data.address !== undefined) updateObj.address = data.address || null

      const { error } = await supabase
        .from("customers")
        .update(updateObj)
        .eq("id", id)

      if (error) console.error("Error updating customer:", error)
    },
    [supabase]
  )

  const deleteCustomer = useCallback(
    async (id: string) => {
      setCustomers((prev) => prev.filter((c) => c.id !== id))
      setEstimates((prev) => prev.filter((e) => e.customerId !== id))

      // estimates cascade-delete via FK, just delete the customer
      const { error } = await supabase.from("customers").delete().eq("id", id)

      if (error) console.error("Error deleting customer:", error)
    },
    [supabase]
  )

  const addEstimate = useCallback(
    async (estimate: Omit<Estimate, "id">) => {
      const { data, error } = await supabase
        .from("estimates")
        .insert({
          user_id: userId!,
          customer_id: estimate.customerId,
          date: estimate.date,
          status: estimate.status,
          open_sets: estimate.openSets,
          closed_sets: estimate.closedSets,
          estimated_cost: estimate.estimatedCost,
          total_area: estimate.totalArea,
          total_board_feet: estimate.totalBoardFeet,
        })
        .select()
        .single()

      if (error) {
        console.error("Error adding estimate:", error)
        return
      }

      const newEst: Estimate = {
        id: data.id,
        customerId: data.customer_id,
        date: data.date || data.created_at,
        status: data.status as "draft" | "sold",
        openSets: Number(data.open_sets),
        closedSets: Number(data.closed_sets),
        estimatedCost: Number(data.estimated_cost),
        totalArea: Number(data.total_area),
        totalBoardFeet: Number(data.total_board_feet),
      }
      setEstimates((prev) => [newEst, ...prev])
    },
    [userId, supabase]
  )

  const markEstimateSold = useCallback(
    async (id: string) => {
      const est = estimates.find((e) => e.id === id)
      if (!est || est.status === "sold") return

      // Update estimate status
      setEstimates((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "sold" as const } : e))
      )

      // Deduct inventory
      const newInventory = {
        openCellSets: Math.max(0, inventory.openCellSets - est.openSets),
        closedCellSets: Math.max(0, inventory.closedCellSets - est.closedSets),
      }
      setInventory(newInventory)

      // Persist both
      const [estErr, invErr] = await Promise.all([
        supabase.from("estimates").update({ status: "sold" }).eq("id", id),
        supabase
          .from("inventory")
          .update({
            open_cell_sets: newInventory.openCellSets,
            closed_cell_sets: newInventory.closedCellSets,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId!),
      ])

      if (estErr.error) console.error("Error marking sold:", estErr.error)
      if (invErr.error) console.error("Error deducting inventory:", invErr.error)
    },
    [estimates, inventory, userId, supabase]
  )

  const deleteEstimate = useCallback(
    async (id: string) => {
      setEstimates((prev) => prev.filter((e) => e.id !== id))

      const { error } = await supabase.from("estimates").delete().eq("id", id)

      if (error) console.error("Error deleting estimate:", error)
    },
    [supabase]
  )

  return {
    loading,
    userId,
    settings,
    inventory,
    customers,
    estimates,
    updateSettings,
    updateInventory,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addEstimate,
    markEstimateSold,
    deleteEstimate,
  }
}
