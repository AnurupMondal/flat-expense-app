"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Home, Settings, Users, ChevronLeft, ChevronRight, Building2 } from "lucide-react"

// This demonstrates the core logic from your sample
export function EnhancedSidebarExample() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Your localStorage pattern
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const newState = !prev
      localStorage.setItem("sidebarState", newState.toString())
      return newState
    })
  }

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebarState")
    if (saved !== null) setIsSidebarOpen(saved === "true")
  }, [])

  const menuItems = [
    { label: "Dashboard", icon: Home, id: "dashboard" },
    { label: "Users", icon: Users, id: "users" },
    { label: "Buildings", icon: Building2, id: "buildings" },
    { label: "Settings", icon: Settings, id: "settings" },
  ]

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`
        bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-64" : "w-16"}
      `}
      >
        {/* Toggle Button */}
        <div className="p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-8 h-8 transition-all duration-200 hover:scale-105"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="p-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isSidebarOpen && <span className="font-medium transition-opacity duration-200">{item.label}</span>}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50 transition-all duration-300">
        <h1 className="text-2xl font-bold mb-4">Sidebar is {isSidebarOpen ? "Expanded" : "Collapsed"}</h1>
        <p className="text-gray-600">Click the toggle button to see the smooth animation and state persistence.</p>
      </div>
    </div>
  )
}
