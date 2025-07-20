"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  AlertTriangle,
  Receipt,
  Megaphone,
  Settings,
  X,
} from "lucide-react";
import type { Notification } from "@/types/app-types";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDismiss,
  className = "",
}: NotificationCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bill":
        return <Receipt className="w-4 h-4" />;
      case "complaint":
        return <AlertTriangle className="w-4 h-4" />;
      case "announcement":
        return <Megaphone className="w-4 h-4" />;
      case "system":
        return <Settings className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bill":
        return "text-green-600";
      case "complaint":
        return "text-orange-600";
      case "announcement":
        return "text-blue-600";
      case "system":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  const getBgColor = (urgent: boolean, read: boolean) => {
    if (urgent && !read)
      return "bg-destructive/10 border border-destructive/20";
    if (!read) return "bg-primary/10 border border-primary/20";
    return "bg-muted";
  };

  return (
    <Card
      className={`border-0 shadow-sm ${getBgColor(
        notification.urgent,
        notification.read
      )} ${className}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`${getTypeColor(
                notification.type
              )} flex-shrink-0 mt-0.5`}
            >
              {getTypeIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-semibold ${
                    notification.urgent
                      ? "text-destructive"
                      : notification.read
                      ? "text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {notification.title}
                </h3>
                {notification.urgent && !notification.read && (
                  <Badge
                    variant="destructive"
                    className="animate-pulse text-xs"
                  >
                    Urgent
                  </Badge>
                )}
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                )}
              </div>
              <p
                className={`text-sm ${
                  notification.urgent
                    ? "text-destructive"
                    : notification.read
                    ? "text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {notification.message}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {notification.createdAt.toLocaleDateString()} at{" "}
                  {notification.createdAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
  );
}
