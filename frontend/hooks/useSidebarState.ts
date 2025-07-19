"use client"

import { useState, useEffect } from "react"

export function useSidebarState(defaultOpen = true) {
  const [sidebarOpen, setSidebarOpen] = useState(defaultOpen)
  const [isHorizontal, setIsHorizontal] = useState(false)

  // Load saved state on mount
  useEffect(() => {
    const savedOpen = localStorage.getItem("sidebar-state")
    const savedOrientation = localStorage.getItem("sidebar-orientation")

    if (savedOpen !== null) {
      setSidebarOpen(savedOpen === "true")
    }
    if (savedOrientation !== null) {
      setIsHorizontal(savedOrientation === "horizontal")
    }
  }, [])

  // Save state when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-state", sidebarOpen.toString())
  }, [sidebarOpen])

  useEffect(() => {
    localStorage.setItem("sidebar-orientation", isHorizontal ? "horizontal" : "vertical")
  }, [isHorizontal])

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newState = !prev
      localStorage.setItem("sidebar-state", newState.toString())
      return newState
    })
  }

  const toggleOrientation = () => {
    setIsHorizontal((prev) => {
      const newOrientation = !prev
      localStorage.setItem("sidebar-orientation", newOrientation ? "horizontal" : "vertical")
      return newOrientation
    })
  }

  return {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    isHorizontal,
    setIsHorizontal,
    toggleOrientation,
  }
}
