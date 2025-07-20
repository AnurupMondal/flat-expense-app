"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useCallback } from "react";

interface SidebarToggleProps {
  className?: string;
  onToggleOrientation?: () => void;
  isHorizontal?: boolean;
  onToggleSidebar?: () => void;
}

export function SidebarToggle({
  className = "",
  onToggleOrientation,
  isHorizontal = false,
  onToggleSidebar,
}: SidebarToggleProps) {
  const toggleSidebar = useCallback(() => {
    if (typeof onToggleSidebar === "function") {
      onToggleSidebar();
    }
  }, [onToggleSidebar]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-7 w-7 ${className}`}
      onClick={toggleSidebar}
    >
      <Menu className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
