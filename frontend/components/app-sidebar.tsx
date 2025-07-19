"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
          // Account section for user profile
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
              { title: "User Management", icon: Users, id: "residents" },
              { title: "Billing Settings", icon: Settings, id: "billing" },
            ],
          },
          {
            title: "Operations",
            items: [
              { title: "Complaints", icon: AlertTriangle, id: "complaints" },
              { title: "Generate Bills", icon: Receipt, id: "generate-bills" },
              { title: "Send Reminders", icon: Bell, id: "reminders" },
            ],
          },
          // Account section for user profile
          {
            title: "Account",
            items: [{ title: "Profile", icon: UserIcon, id: "profile" }],
          },
        ];

      case "resident":
        return [
          {
            title: "Dashboard",
            items: [
              { title: "Home", icon: Home, id: "overview" },
              {
                title: "Notifications",
                icon: Bell,
                id: "notifications",
                badge:
                  notificationCount > 0
                    ? notificationCount.toString()
                    : undefined,
              },
            ],
          },
          {
            title: "Payments",
            items: [
              { title: "Current Bills", icon: Receipt, id: "bills" },
              { title: "Payment History", icon: History, id: "payments" },
            ],
          },
          {
            title: "Services",
            items: [
              { title: "My Complaints", icon: AlertTriangle, id: "complaints" },
              { title: "Submit Complaint", icon: Plus, id: "submit-complaint" },
              { title: "Building Info", icon: Building2, id: "building-info" },
            ],
          },
          // Account section for user profile
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

  // Flatten all items for horizontal display
  const allItems = sidebarItems.flatMap((group) => group.items);

  if (isHorizontal) {
    return (
      <div className="horizontal-sidebar bg-white border-b border-gray-200 shadow-sm transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between px-4 py-3 max-w-full overflow-hidden">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-gray-900">
                FlatManager Pro
              </h1>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1 flex-1 justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 px-4">
            {allItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                    activeView === item.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline text-xs">{item.title}</span>
                  {item.badge && (
                    <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 flex-shrink-0">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}

            {/* More items dropdown for smaller screens */}
            {allItems.length > 6 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* User Profile and Logout */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                {currentUser.name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-gray-900 max-w-24 truncate">
                {currentUser.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-1 text-xs">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Vertical sidebar (original layout)
  return (
    <Sidebar
      collapsible="icon"
      className="transition-all duration-300 ease-in-out"
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          e.stopPropagation();
        }
      }}
    >
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <h1 className="text-sm font-bold text-gray-900 truncate">
              FlatManager Pro
            </h1>
            <p className="text-xs text-gray-500 capitalize truncate">
              {currentUser.role.replace("-", " ")} Panel
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 py-2 group-data-[collapsible=icon]:items-center">
        {sidebarItems.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex} className="mb-6 last:mb-2">
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-4 mb-2 group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1 px-2 group-data-[collapsible=icon]:px-0">
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeView === item.id}
                        onClick={() => onViewChange(item.id)}
                        className="w-full justify-start group transition-all duration-200 h-10 px-3 gap-3 hover:bg-gray-100 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 group-data-[collapsible=icon]:justify-center"
                        tooltip={item.title}
                        asChild={false}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                        {item.badge && (
                          <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 flex-shrink-0 h-5 group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:top-0 group-data-[collapsible=icon]:right-0 group-data-[collapsible=icon]:translate-x-1 group-data-[collapsible=icon]:-translate-y-1">
                            {item.badge}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 group-data-[collapsible=icon]:p-2 border-t">
          <div className="flex items-center gap-3 mb-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
