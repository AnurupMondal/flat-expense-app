"use client";

import type { ReactNode } from "react";
import AppSidebar from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SidebarToggle } from "@/components/ui/sidebar-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSidebarState } from "@/hooks/useSidebarState";
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
      <div className="min-h-screen bg-background transition-all duration-500 animate-fade-in flex flex-col">
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
        <div className="flex-1 flex flex-col transition-all duration-300">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur-md px-4 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-2">
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
                        <BreadcrumbLink
                          href="#"
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {breadcrumbParent}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                    </>
                  )}
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-sm font-semibold text-foreground">
                      {breadcrumbTitle}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto">
            <div className="dashboard-content p-6 bg-background text-foreground min-h-[calc(100vh-8rem)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-16"
        } border-r border-border bg-sidebar-background flex-shrink-0 h-screen`}
      >
        <AppSidebar
          currentUser={currentUser}
          activeView={activeView}
          onViewChange={onViewChange}
          onLogout={onLogout}
          pendingCount={pendingCount}
          notificationCount={notificationCount}
          isHorizontal={false}
          collapsed={!sidebarOpen}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen bg-background overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4 bg-card/95 backdrop-blur-md z-20 shadow-sm">
          <div className="flex items-center gap-2">
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
                      <BreadcrumbLink
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {breadcrumbParent}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-semibold text-foreground">
                    {breadcrumbTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 space-y-6 max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
