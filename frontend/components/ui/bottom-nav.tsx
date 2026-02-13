"use client";

import { cn } from "@/lib/utils";
import {
    Building2,
    Users,
    DollarSign,
    Settings,
    AlertTriangle,
    Home,
    Receipt,
    Bell,
    User as UserIcon,
    BarChart3,
    FileText
} from "lucide-react";
import type { User } from "@/types/app-types";

interface BottomNavProps {
    currentUser: User;
    activeView: string;
    onViewChange: (view: string) => void;
    pendingCount?: number;
    notificationCount?: number;
}

export function BottomNav({
    currentUser,
    activeView,
    onViewChange,
    pendingCount = 0,
    notificationCount = 0,
}: BottomNavProps) {

    const getNavItems = () => {
        switch (currentUser.role) {
            case "super-admin":
                return [
                    { title: "Home", icon: Home, id: "overview" },
                    { title: "Buildings", icon: Building2, id: "building-management" },
                    {
                        title: "Users",
                        icon: Users,
                        id: "users",
                        badge: pendingCount > 0 ? pendingCount : undefined
                    },
                    { title: "Reports", icon: DollarSign, id: "reports" },
                    { title: "Settings", icon: Settings, id: "settings" },
                ];

            case "admin":
                return [
                    { title: "Home", icon: Home, id: "overview" },
                    {
                        title: "Residents",
                        icon: Users,
                        id: "residents",
                        badge: pendingCount > 0 ? pendingCount : undefined
                    },
                    { title: "Bills", icon: Receipt, id: "bills" },
                    { title: "Buildings", icon: Building2, id: "buildings" },
                    { title: "Profile", icon: UserIcon, id: "profile" },
                ];

            case "resident":
                return [
                    { title: "Home", icon: Home, id: "overview" },
                    { title: "Bills", icon: Receipt, id: "bills" },
                    {
                        title: "Services",
                        icon: AlertTriangle,
                        id: "complaints",
                        badge: notificationCount > 0 ? notificationCount : undefined
                    },
                    { title: "Notifications", icon: Bell, id: "notifications" },
                    { title: "Profile", icon: UserIcon, id: "profile" },
                ];

            default:
                return [];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t bg-background px-2 pb-safe md:hidden shadow-lg-up">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={cn(
                            "flex flex-1 flex-col items-center justify-center gap-1 py-1 text-xs font-medium transition-colors",
                            isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-primary/80"
                        )}
                    >
                        <div className="relative">
                            <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                            {item.badge && (
                                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                        <span className="truncate max-w-[4rem]">{item.title}</span>
                    </button>
                );
            })}
        </div>
    );
}
