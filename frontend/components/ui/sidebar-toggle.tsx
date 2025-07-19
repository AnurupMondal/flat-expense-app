"use client"

import { Button } from "@/components/ui/button"
import { PanelLeft, Menu } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { useCallback } from "react"

interface SidebarToggleProps {
  className?: string
  onToggleOrientation?: () => void
  isHorizontal?: boolean
  onToggleSidebar?: () => void
}

export function SidebarToggle({
  className = "",
  onToggleOrientation,
  isHorizontal = false,
  onToggleSidebar,
}: SidebarToggleProps) {
  const sidebarContext = useSidebar()

  // Choose the correct toggle function
  const toggleSidebar = useCallback(() => {
    if (typeof onToggleSidebar === "function") {
      onToggleSidebar()
    } else if (typeof sidebarContext?.toggleSidebar === "function") {
      sidebarContext.toggleSidebar()
    }
  }, [onToggleSidebar, sidebarContext])

  // Single click: toggle sidebar or orientation
  const handleClick = () => {
    if (isHorizontal && typeof onToggleOrientation === "function") {
      onToggleOrientation()
    } else {
      toggleSidebar()
    }
  }

  // Double click: force orientation toggle
  const handleDoubleClick = () => {
    if (typeof onToggleOrientation === "function") {
      onToggleOrientation()
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-7 w-7 transition-transform duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title={
        isHorizontal
          ? "Switch to vertical sidebar"
          : "Toggle sidebar (double-click to switch orientation)"
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {isHorizontal ? (
        <Menu className="h-4 w-4" />
      ) : (
        <PanelLeft className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isHorizontal ? "Switch to vertical sidebar" : "Toggle Sidebar"}
      </span>
    </Button>
  )
}
