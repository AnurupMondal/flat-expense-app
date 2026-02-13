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

  const date = new Date(notification.createdAt);
  const isValidDate = !isNaN(date.getTime());

  return (
    <Card
      className={`border-0 shadow-sm transition-all hover:shadow-md ${getBgColor(
        notification.urgent,
        notification.read
      )} ${className}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`${getTypeColor(
                notification.type
              )} flex-shrink-0 mt-1 p-2 bg-white/50 dark:bg-black/20 rounded-lg`}
            >
              {getTypeIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3
                  className={`font-bold text-base ${notification.urgent && !notification.read
                    ? "text-red-700 dark:text-red-400"
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
                    className="animate-pulse text-[10px] px-1.5 py-0 h-5"
                  >
                    URGENT
                  </Badge>
                )}
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                )}
              </div>
              <p
                className={`text-sm leading-relaxed ${notification.urgent && !notification.read
                  ? "text-red-900/80 dark:text-red-300/80 font-medium"
                  : notification.read
                    ? "text-muted-foreground/80"
                    : "text-foreground/90"
                  }`}
              >
                {notification.message}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                  {isValidDate ? (
                    <>
                      {date.toLocaleDateString()} •{" "}
                      {date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </>
                  ) : (
                    "Just now"
                  )}
                </span>
                <div className="flex gap-2">
                  {!notification.read && onMarkAsRead && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="text-[11px] h-7 px-3 font-semibold bg-white/50 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40"
                    >
                      Mark read
                    </Button>
                  )}
                  {onDismiss && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(notification.id)}
                      className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                    >
                      <X className="w-3.5 h-3.5" />
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
