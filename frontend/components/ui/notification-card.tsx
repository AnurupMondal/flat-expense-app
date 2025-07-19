"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, AlertTriangle, Receipt, Megaphone, Settings, X } from "lucide-react"
import type { Notification } from "@/types/app-types"

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
  onDismiss?: (id: string) => void
  className?: string
}

export function NotificationCard({ notification, onMarkAsRead, onDismiss, className = "" }: NotificationCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bill":
        return <Receipt className="w-4 h-4" />
      case "complaint":
        return <AlertTriangle className="w-4 h-4" />
      case "announcement":
        return <Megaphone className="w-4 h-4" />
      case "system":
        return <Settings className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bill":
        return "text-green-600"
      case "complaint":
        return "text-orange-600"
      case "announcement":
        return "text-blue-600"
      case "system":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  const getBgColor = (urgent: boolean, read: boolean) => {
    if (urgent && !read) return "bg-red-50 border border-red-200"
    if (!read) return "bg-blue-50 border border-blue-200"
    return "bg-gray-50"
  }

  return (
    <Card className={`border-0 shadow-sm ${getBgColor(notification.urgent, notification.read)} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`${getTypeColor(notification.type)} flex-shrink-0 mt-0.5`}>
              {getTypeIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-semibold ${notification.urgent ? "text-red-900" : notification.read ? "text-gray-700" : "text-gray-900"}`}
                >
                  {notification.title}
                </h3>
                {notification.urgent && !notification.read && (
                  <Badge variant="destructive" className="animate-pulse text-xs">
                    Urgent
                  </Badge>
                )}
                {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>}
              </div>
              <p
                className={`text-sm ${notification.urgent ? "text-red-700" : notification.read ? "text-gray-500" : "text-gray-600"}`}
              >
                {notification.message}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {notification.createdAt.toLocaleDateString()} at{" "}
                  {notification.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <div className="flex gap-1">
                  {!notification.read && onMarkAsRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="text-xs h-6 px-2"
                    >
                      Mark as read
                    </Button>
                  )}
                  {onDismiss && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(notification.id)}
                      className="text-xs h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
