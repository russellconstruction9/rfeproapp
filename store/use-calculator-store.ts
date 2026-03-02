import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Settings {
  openCellYield: number;
  closedCellYield: number;
  openCellPrice: number;
  closedCellPrice: number;
}

export interface Inventory {
  openCellSets: number;
  closedCellSets: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface Estimate {
  id: string;
  customerId: string;
  date: string;
  status: 'draft' | 'sold';
  openSets: number;
  closedSets: number;
  estimatedCost: number;
  totalArea: number;
  totalBoardFeet: number;
}

interface CalculatorState {
  settings: Settings;
  inventory: Inventory;
  customers: Customer[];
  estimates: Estimate[];
  updateSettings: (newSettings: Partial<Settings>) => void;
  updateInventory: (newInventory: Partial<Inventory>) => void;
  deductInventory: (openSets: number, closedSets: number) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addEstimate: (estimate: Estimate) => void;
  markEstimateSold: (estimateId: string) => void;
  deleteEstimate: (estimateId: string) => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      settings: {
        openCellYield: 16000,
        closedCellYield: 4000,
        openCellPrice: 2000,
        closedCellPrice: 2500,
      },
      inventory: {
        openCellSets: 10,
        closedCellSets: 10,
      },
      customers: [],
      estimates: [],
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      updateInventory: (newInventory) =>
        set((state) => ({
          inventory: { ...state.inventory, ...newInventory },
        })),
      deductInventory: (openSets, closedSets) =>
        set((state) => ({
          inventory: {
            openCellSets: Math.max(0, state.inventory.openCellSets - openSets),
            closedCellSets: Math.max(0, state.inventory.closedCellSets - closedSets),
          },
        })),
      addCustomer: (customer) =>
        set((state) => ({
          customers: [...state.customers, customer],
        })),
      updateCustomer: (id, data) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),
      deleteCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
          estimates: state.estimates.filter((e) => e.customerId !== id),
        })),
      addEstimate: (estimate) =>
        set((state) => ({
          estimates: [...state.estimates, estimate],
        })),
      markEstimateSold: (estimateId) =>
        set((state) => {
          const estimate = state.estimates.find((e) => e.id === estimateId);
          if (!estimate || estimate.status === 'sold') return state;

          return {
            estimates: state.estimates.map((e) =>
              e.id === estimateId ? { ...e, status: 'sold' } : e
            ),
            inventory: {
              openCellSets: Math.max(0, state.inventory.openCellSets - estimate.openSets),
              closedCellSets: Math.max(0, state.inventory.closedCellSets - estimate.closedSets),
            },
          };
        }),
      deleteEstimate: (estimateId) =>
        set((state) => ({
          estimates: state.estimates.filter((e) => e.id !== estimateId),
        })),
    }),
    {
      name: 'calculator-settings',
    }
  )
)
