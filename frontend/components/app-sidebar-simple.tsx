"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  Settings,
  BarChart3,
  Clock,
  Bell,
  LogOut,
  Home,
  Receipt,
  History,
  Plus,
  FileText,
  MoreHorizontal,
  User as UserIcon,
} from "lucide-react";
import type { User } from "@/types/app-types";

interface AppSidebarProps {
  currentUser: User;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  pendingCount?: number;
  notificationCount?: number;
  isHorizontal?: boolean;
}

export default function AppSidebar({
  currentUser,
  activeView,
  onViewChange,
  onLogout,
  pendingCount = 0,
  notificationCount = 0,
  isHorizontal = false,
}: AppSidebarProps) {
  const getSidebarItems = () => {
    switch (currentUser.role) {
      case "super-admin":
        return [
          {
            title: "Dashboard",
            items: [
              { title: "Overview", icon: Home, id: "overview" },
              { title: "Analytics", icon: BarChart3, id: "analytics" },
            ],
          },
          {
            title: "Management",
            items: [
              {
                title: "User Approvals",
                icon: Clock,
                id: "approvals",
                badge: pendingCount > 0 ? pendingCount.toString() : undefined,
              },
              { title: "Buildings", icon: Building2, id: "buildings" },
              { title: "User Management", icon: Users, id: "users" },
              { title: "System Settings", icon: Settings, id: "settings" },
            ],
          },
          {
            title: "Reports",
            items: [
              { title: "Financial Reports", icon: DollarSign, id: "reports" },
              { title: "Export Data", icon: FileText, id: "export" },
            ],
          },
          {
            title: "Account",
            items: [{ title: "Profile", icon: UserIcon, id: "profile" }],
          },
        ];

      case "admin":
        return [
          {
            title: "Dashboard",
            items: [
              { title: "Overview", icon: Home, id: "overview" },
              { title: "Analytics", icon: BarChart3, id: "analytics" },
            ],
          },
          {
            title: "Residents",
            items: [
              {
                title: "Approvals",
                icon: Clock,
                id: "approvals",
                badge: pendingCount > 0 ? pendingCount.toString() : undefined,
              },
              { title: "Residents", icon: Users, id: "residents" },
            ],
          },
          {
            title: "Building Management",
            items: [
              { title: "Buildings", icon: Building2, id: "buildings" },
              { title: "Bills", icon: Receipt, id: "bills" },
              { title: "Complaints", icon: AlertTriangle, id: "complaints" },
            ],
          },
          {
            title: "Account",
            items: [{ title: "Profile", icon: UserIcon, id: "profile" }],
          },
        ];

      case "resident":
        return [
          {
            title: "Dashboard",
            items: [{ title: "Overview", icon: Home, id: "overview" }],
          },
          {
            title: "Bills & Payments",
            items: [
              { title: "Bills", icon: Receipt, id: "bills" },
              {
                title: "Payment History",
                icon: History,
                id: "payment-history",
              },
            ],
          },
          {
            title: "Services",
            items: [
              {
                title: "Complaints",
                icon: AlertTriangle,
                id: "complaints",
                badge:
                  notificationCount > 0
                    ? notificationCount.toString()
                    : undefined,
              },
              { title: "Notifications", icon: Bell, id: "notifications" },
            ],
          },
          {
            title: "Account",
            items: [{ title: "Profile", icon: UserIcon, id: "profile" }],
          },
        ];

      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className="h-full flex flex-col bg-sidebar-background text-sidebar-foreground">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Flat Expense</span>
            <span className="truncate text-xs text-muted-foreground">
              Management
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-4">
        {sidebarItems.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6 last:mb-2">
            <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {group.title}
            </div>
            <div className="space-y-1 px-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-left font-normal",
                      isActive &&
                        "bg-secondary text-secondary-foreground shadow-sm",
                      !isActive &&
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    onClick={() => onViewChange(item.id)}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-auto h-5 w-auto min-w-[1.25rem] text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 text-sm">
            <div className="font-medium">{currentUser.name}</div>
            <div className="text-xs text-muted-foreground">
              {currentUser.email}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
