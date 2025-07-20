"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { StatsGrid } from "@/components/ui/stats-grid";
import { QuickActions } from "@/components/ui/quick-actions";
import { ApprovalList } from "@/components/ui/approval-list";
import { ComplaintManagement } from "@/components/ui/complaint-management";
import { UserCard } from "@/components/ui/user-card";
import { UserManagement } from "@/components/ui/user-management";
import { ProfileManager } from "@/components/ui/profile-manager";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usersApi } from "@/lib/api";
import {
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  Receipt,
  Send,
} from "lucide-react";
import type {
  User,
  Building,
  Complaint,
  Bill,
  Notification,
} from "@/types/app-types";

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  buildings: Building[];
  complaints: Complaint[];
  bills: Bill[];
  notifications: Notification[];
  onUpdateUsers: (users: User[]) => void;
  onUpdateComplaints: (complaints: Complaint[]) => void;
  onUpdateBills: (bills: Bill[]) => void;
  onUpdateNotifications: (notifications: Notification[]) => void;
  onLogout: () => void;
}

export default function AdminDashboard({
  currentUser,
  users,
  buildings,
  complaints,
  bills,
  onUpdateUsers,
  onUpdateComplaints,
  onLogout,
}: AdminDashboardProps) {
  const [activeView, setActiveView] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const currentBuilding = buildings.find(
    (b) => b.id === currentUser.buildingId
  );
  const buildingResidents = users.filter(
    (u) => u.buildingId === currentUser.buildingId && u.role === "resident"
  );
  const pendingResidents = buildingResidents.filter(
    (u) => u.status === "pending"
  );
  const approvedResidents = buildingResidents.filter(
    (u) => u.status === "approved"
  );
  const buildingComplaints = complaints.filter(
    (c) => c.buildingId === currentUser.buildingId
  );
  const buildingBills = bills.filter(
    (b) => b.buildingId === currentUser.buildingId
  );

  // Calculate real stats from data
  const monthlyCollection = buildingBills
    .filter((b) => b.status === "paid")
    .reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalBillAmount = buildingBills.reduce(
    (sum, bill) => sum + bill.totalAmount,
    0
  );
  const collectionRate =
    totalBillAmount > 0
      ? Math.round((monthlyCollection / totalBillAmount) * 100)
      : 0;
  const activeComplaintsCount = buildingComplaints.filter(
    (c) => c.status !== "resolved"
  ).length;

  const stats = [
    {
      title: "Total Residents",
      value: approvedResidents.length.toString(),
      change: `${pendingResidents.length} pending approval`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Monthly Collection",
      value: `₹${monthlyCollection.toLocaleString()}`,
      change: `${collectionRate}% collected`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Active Complaints",
      value: activeComplaintsCount.toString(),
      change: `${buildingComplaints.length} total complaints`,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Occupancy Rate",
      value: `${Math.round(
        (approvedResidents.length / (currentBuilding?.totalUnits || 1)) * 100
      )}%`,
      change: `${approvedResidents.length}/${currentBuilding?.totalUnits} units`,
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  const quickActions = [
    {
      title: "Generate Bills",
      icon: Receipt,
      onClick: () => setActiveView("generate-bills"),
      className: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Send Reminders",
      icon: Send,
      onClick: () => setActiveView("reminders"),
      variant: "outline" as const,
      className: "bg-transparent",
    },
    {
      title: "View Complaints",
      icon: AlertTriangle,
      onClick: () => setActiveView("complaints"),
      variant: "outline" as const,
      className: "bg-transparent",
    },
  ];

  const handleApproveResident = async (userId: string) => {
    try {
      setIsLoading(true);
      const updatedUser = await usersApi.updateStatus(userId, "approved");

      if (updatedUser) {
        const updatedUsers = users.map((user) =>
          user.id === userId ? updatedUser : user
        );
        onUpdateUsers(updatedUsers);
        setMessage({ type: "success", text: "Resident approved successfully" });
      } else {
        setMessage({ type: "error", text: "Failed to approve resident" });
      }
    } catch (error) {
      console.error("Error approving resident:", error);
      setMessage({ type: "error", text: "Failed to approve resident" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRejectResident = async (userId: string) => {
    try {
      setIsLoading(true);
      const updatedUser = await usersApi.updateStatus(userId, "rejected");

      if (updatedUser) {
        const updatedUsers = users.map((user) =>
          user.id === userId ? updatedUser : user
        );
        onUpdateUsers(updatedUsers);
        setMessage({ type: "success", text: "Resident rejected" });
      } else {
        setMessage({ type: "error", text: "Failed to reject resident" });
      }
    } catch (error) {
      console.error("Error rejecting resident:", error);
      setMessage({ type: "error", text: "Failed to reject resident" });
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

  const handleUpdateComplaint = (
    complaintId: string,
    updates: Partial<Complaint>
  ) => {
    const updatedComplaints = complaints.map((complaint) =>
      complaint.id === complaintId ? { ...complaint, ...updates } : complaint
    );
    onUpdateComplaints(updatedComplaints);
    setMessage({ type: "success", text: "Complaint updated successfully" });
    setTimeout(() => setMessage(null), 3000);
  };

  const getBreadcrumbTitle = () => {
    switch (activeView) {
      case "overview":
        return "Dashboard Overview";
      case "approvals":
        return "Resident Approvals";
      case "residents":
        return "User Management";
      case "complaints":
        return "Complaint Management";
      case "profile":
        return "Profile";
      default:
        return "Dashboard";
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return (
          <>
            <DashboardHeader
              title={`${currentBuilding?.name} - Overview`}
              description="Building management dashboard"
            />
            <StatsGrid stats={stats} />
            <QuickActions actions={quickActions} />
          </>
        );

      case "approvals":
        return (
          <>
            <DashboardHeader
              title="Resident Approvals"
              description="Review and approve new resident registrations"
            >
              <Badge variant="secondary">
                {pendingResidents.length} pending
              </Badge>
            </DashboardHeader>
            <ApprovalList
              users={pendingResidents}
              buildings={buildings}
              onApprove={handleApproveResident}
              onReject={handleRejectResident}
              title="Pending Resident Approvals"
            />
          </>
        );

      case "residents":
        return (
          <>
            <UserManagement
              users={users}
              buildings={buildings}
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onApproveUser={handleApproveResident}
              onRejectUser={handleRejectResident}
            />
          </>
        );

      case "complaints":
        return (
          <>
            <DashboardHeader
              title="Complaint Management"
              description="View and manage building complaints"
            />
            <ComplaintManagement
              complaints={buildingComplaints}
              users={users}
              onUpdateComplaint={handleUpdateComplaint}
              currentUser={currentUser}
            />
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

  return (
    <DashboardLayout
      currentUser={currentUser}
      activeView={activeView}
      onViewChange={setActiveView}
      onLogout={onLogout}
      pendingCount={pendingResidents.length}
      breadcrumbTitle={getBreadcrumbTitle()}
      breadcrumbParent={currentBuilding?.name}
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
