"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface QuickAction {
  title: string
  icon: LucideIcon
  onClick: () => void
  variant?: "default" | "outline"
  className?: string
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {actions.map((action, index) => {
        const Icon = action.icon
        return (
          <Card key={index} className="border-0 shadow-sm bg-white">
            <CardContent className="p-4">
              <Button
                variant={action.variant || "default"}
                className={`w-full justify-start ${action.className || ""}`}
                onClick={action.onClick}
              >
                <Icon className="w-4 h-4 mr-2" />
                {action.title}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
