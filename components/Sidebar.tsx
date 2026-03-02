"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calculator, Users, FileText, Package, Settings, Droplets, LogOut } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Calculator", icon: Calculator },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/estimates", label: "Estimates", icon: FileText },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignore sign-out errors and redirect anyway
    }
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
        <div className="bg-orange-600 p-2 rounded-lg shrink-0">
          <Droplets className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white leading-tight">FoamCalc Pro</p>
          <p className="text-xs text-slate-400">Spray Foam Estimator</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-orange-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
