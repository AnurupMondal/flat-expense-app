"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { StatsGrid } from "@/components/ui/stats-grid";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { ApprovalList } from "@/components/ui/approval-list";
import { BuildingList } from "@/components/ui/building-list";
import { AddBuildingForm } from "@/components/ui/add-building-form";
import { UserCard } from "@/components/ui/user-card";
import { UserManagement } from "@/components/ui/user-management";
import { ProfileManager } from "@/components/ui/profile-manager";
import AdminBuildingAssignments from "@/components/ui/admin-building-assignments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  BarChart3,
  PieChart,
} from "lucide-react";
import { analyticsApi, usersApi } from "@/lib/api";
import type {
  User,
  Building,
  Complaint,
  Bill,
  Notification,
  Analytics,
} from "@/types/app-types";

interface SuperAdminDashboardProps {
  currentUser: User;
  users: User[];
  buildings: Building[];
  complaints: Complaint[];
  bills: Bill[];
  notifications: Notification[];
  onUpdateUsers: (users: User[]) => void;
  onUpdateBuildings: (buildings: Building[]) => void;
  onUpdateComplaints: (complaints: Complaint[]) => void;
  onUpdateBills: (bills: Bill[]) => void;
  onUpdateNotifications: (notifications: Notification[]) => void;
  onLogout: () => void;
}

export default function SuperAdminDashboard({
  currentUser,
  users,
  buildings,
  complaints,
  bills,
  onUpdateUsers,
  onUpdateBuildings,
  onLogout,
}: SuperAdminDashboardProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [activeView, setActiveView] = useState("overview");
  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const pendingUsers = users.filter((u) => u.status === "pending");
  const approvedUsers = users.filter((u) => u.status === "approved");

  // Calculate real revenue from bills
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const collectedRevenue = bills
    .filter((b) => b.status === "paid")
    .reduce((sum, bill) => sum + bill.totalAmount, 0);

  // Calculate active complaints
  const activeComplaints = complaints.filter(
    (c) => c.status !== "resolved"
  ).length;

  const stats = [
    {
      title: "Total Buildings",
      value: buildings.length.toString(),
      change: "+3 this month",
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      change: `₹${collectedRevenue.toLocaleString()} collected`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Active Users",
      value: approvedUsers.length.toString(),
      change: `${pendingUsers.length} pending approval`,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Active Complaints",
      value: activeComplaints.toString(),
      change: `${complaints.length} total complaints`,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  // Generate recent activities from actual data
  const activities = [
    ...pendingUsers.slice(0, 2).map((user) => ({
      type: "info" as const,
      title: "New user registration",
      description: `${user.name} registered for ${
        user.flatNumber ? `Flat ${user.flatNumber}` : user.role
      }`,
      time: new Date(user.createdAt).toLocaleDateString(),
    })),
    ...bills
      .filter((b) => b.status === "paid")
      .slice(0, 2)
      .map((bill) => ({
        type: "success" as const,
        title: "Payment received",
        description: `₹${bill.totalAmount.toLocaleString()} for ${bill.month} ${
          bill.year
        }`,
        time: bill.paidAt
          ? new Date(bill.paidAt).toLocaleDateString()
          : "Recently",
      })),
    ...complaints.slice(0, 2).map((complaint) => ({
      type: "warning" as const,
      title: "New complaint",
      description: `${complaint.category} issue reported`,
      time: new Date(complaint.createdAt).toLocaleDateString(),
    })),
  ].slice(0, 5);

  const handleApproveUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const updatedUser = await usersApi.updateStatus(userId, "approved");

      if (updatedUser) {
        const updatedUsers = users.map((user) =>
          user.id === userId ? updatedUser : user
        );
        onUpdateUsers(updatedUsers);
        setMessage({ type: "success", text: "User approved successfully" });
      } else {
        setMessage({ type: "error", text: "Failed to approve user" });
      }
    } catch (error) {
      console.error("Error approving user:", error);
      setMessage({ type: "error", text: "Failed to approve user" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const updatedUser = await usersApi.updateStatus(userId, "rejected");

      if (updatedUser) {
        const updatedUsers = users.map((user) =>
          user.id === userId ? updatedUser : user
        );
        onUpdateUsers(updatedUsers);
        setMessage({ type: "success", text: "User rejected" });
      } else {
        setMessage({ type: "error", text: "Failed to reject user" });
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      setMessage({ type: "error", text: "Failed to reject user" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, ...updates } : user
    );
    onUpdateUsers(updatedUsers);
    setMessage({ type: "success", text: "User updated successfully" });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter((user) => user.id !== userId);
    onUpdateUsers(updatedUsers);
    setMessage({ type: "success", text: "User deleted successfully" });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddBuilding = (
    buildingData: Omit<Building, "id" | "createdAt">
  ) => {
    const building: Building = {
      id: `building-${Date.now()}`,
      ...buildingData,
      createdAt: new Date(),
    };

    onUpdateBuildings([...buildings, building]);
    setShowAddBuilding(false);
    setMessage({ type: "success", text: "Building added successfully" });
    setTimeout(() => setMessage(null), 3000);
  };

  const getBreadcrumbTitle = () => {
    switch (activeView) {
      case "overview":
        return "Dashboard Overview";
      case "approvals":
        return "User Approvals";
      case "buildings":
        return "Building Management";
      case "users":
        return "All Users";
      case "admin-assignments":
        return "Admin Assignments";
      case "analytics":
        return "Analytics";
      case "profile":
        return "Profile";
      default:
        return "Dashboard";
    }
  };

  const renderContent = () => {
    console.log("SuperAdminDashboard - Current activeView:", activeView);
    console.log("SuperAdminDashboard - Current user:", currentUser);

    switch (activeView) {
      case "overview":
        return (
          <>
            <DashboardHeader
              title="Dashboard Overview"
              description="System-wide analytics and insights"
            />
            <StatsGrid stats={stats} showBadge />
            {activities.length > 0 && (
              <ActivityFeed
                activities={activities}
                description="Latest system activities and updates"
              />
            )}
          </>
        );

      case "approvals":
        return (
          <>
            <DashboardHeader
              title="User Approvals"
              description="Review and approve new user registrations"
            >
              <Badge variant="secondary">{pendingUsers.length} pending</Badge>
            </DashboardHeader>
            <ApprovalList
              users={pendingUsers}
              buildings={buildings}
              onApprove={handleApproveUser}
              onReject={handleRejectUser}
            />
          </>
        );

      case "buildings":
        return (
          <>
            <DashboardHeader
              title="Building Management"
              description="Manage all buildings in the system"
            >
              <Button onClick={() => setShowAddBuilding(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Building
              </Button>
            </DashboardHeader>
            {showAddBuilding && (
              <div className="mb-6">
                <AddBuildingForm
                  onAdd={handleAddBuilding}
                  onCancel={() => setShowAddBuilding(false)}
                />
              </div>
            )}
            <BuildingList buildings={buildings} />
          </>
        );

      case "users":
        return (
          <>
            <UserManagement
              users={users}
              buildings={buildings}
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onApproveUser={handleApproveUser}
              onRejectUser={handleRejectUser}
            />
          </>
        );

      case "admin-assignments":
        return (
          <>
            <AdminBuildingAssignments />
          </>
        );

      case "analytics":
        if (loadingAnalytics) {
          return <p>Loading analytics...</p>;
        }
        if (!analytics) {
          return <p>No analytics data available.</p>;
        }
        // Prepare stats from analytics
        const totalRevenue = Object.values(analytics.revenue.yearly).reduce(
          (sum, y) => sum + y.total,
          0
        );
        const pendingRevenue = Object.values(analytics.revenue.yearly).reduce(
          (sum, y) => sum + y.pending,
          0
        );
        const totalComplaints = analytics.complaints.byStatus.reduce(
          (sum, c) => sum + c.count,
          0
        );
        const statsAnalytics = [
          {
            title: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString()}`,
            change: `₹${(
              totalRevenue - pendingRevenue
            ).toLocaleString()} collected`,
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-100",
          },
          {
            title: "Complaints",
            value: totalComplaints.toString(),
            change: "",
            icon: TrendingUp,
            color: "text-orange-600",
            bg: "bg-orange-100",
          },
          {
            title: "Occupancy Rate",
            value: `${analytics.occupancy.rate}%`,
            change: "",
            icon: Building2,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            title: "Total Users",
            value: analytics.users.total.toString(),
            change: "",
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-100",
          },
        ];
        return (
          <>
            <DashboardHeader
              title="Analytics"
              description="System-wide analytics"
            />
            <StatsGrid stats={statsAnalytics} />
          </>
        );

      case "profile":
        return (
          <>
            <DashboardHeader
              title="Profile"
              description="Manage your account information and settings"
            />
            <ProfileManager
              user={currentUser}
              onUpdate={(updates) => {
                // Handle profile updates if needed
                console.log("Profile updated:", updates);
              }}
            />
          </>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Select an option from the sidebar
            </p>
          </div>
        );
    }
  };

  useEffect(() => {
    // Load analytics data on mount
    (async () => {
      try {
        const data = await analyticsApi.getAll();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoadingAnalytics(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout
      currentUser={currentUser}
      activeView={activeView}
      onViewChange={setActiveView}
      onLogout={onLogout}
      pendingCount={pendingUsers.length}
      breadcrumbTitle={getBreadcrumbTitle()}
      breadcrumbParent="Super Admin"
    >
      {message && (
        <Alert
          className={`mb-6 ${
            message.type === "error"
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          <AlertDescription
            className={
              message.type === "error" ? "text-red-700" : "text-green-700"
            }
          >
            {message.text}
          </AlertDescription>
        </Alert>
      )}
      {renderContent()}
    </DashboardLayout>
  );
}
