"use client";

import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSidebarState } from "@/hooks/useSidebarState";
import { SidebarToggle } from "@/components/ui/sidebar-toggle";
import type { User } from "@/types/app-types";

interface DashboardLayoutProps {
  currentUser: User;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  pendingCount?: number;
  notificationCount?: number;
  breadcrumbTitle: string;
  breadcrumbParent?: string;
  children: ReactNode;
}

export function DashboardLayout({
  currentUser,
  activeView,
  onViewChange,
  onLogout,
  pendingCount = 0,
  notificationCount = 0,
  breadcrumbTitle,
  breadcrumbParent,
  children,
}: DashboardLayoutProps) {
  const {
    sidebarOpen,
    setSidebarOpen,
    isHorizontal,
    toggleOrientation,
    toggleSidebar,
  } = useSidebarState(true);

  if (isHorizontal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-300">
        {/* Horizontal Sidebar */}
        <AppSidebar
          currentUser={currentUser}
          activeView={activeView}
          onViewChange={onViewChange}
          onLogout={onLogout}
          pendingCount={pendingCount}
          notificationCount={notificationCount}
          isHorizontal={true}
        />

        {/* Main Content */}
        <div className="flex-1 transition-all duration-300">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 sticky top-0 z-10">
            <SidebarToggle
              className="-ml-1"
              onToggleOrientation={toggleOrientation}
              isHorizontal={isHorizontal}
              onToggleSidebar={toggleSidebar}
            />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbParent && (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#" className="text-sm">
                        {breadcrumbParent}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-medium">
                    {breadcrumbTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="dashboard-content">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      defaultOpen={true}
    >
      <AppSidebar
        currentUser={currentUser}
        activeView={activeView}
        onViewChange={onViewChange}
        onLogout={onLogout}
        pendingCount={pendingCount}
        notificationCount={notificationCount}
        isHorizontal={false}
      />
      <SidebarInset className="transition-all duration-300 ease-in-out">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white sticky top-0 z-10">
          <SidebarToggle
            className="-ml-1"
            onToggleOrientation={toggleOrientation}
            isHorizontal={isHorizontal}
            onToggleSidebar={toggleSidebar}
          />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbParent && (
                <>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#" className="text-sm">
                      {breadcrumbParent}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium">
                  {breadcrumbTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="dashboard-content">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
