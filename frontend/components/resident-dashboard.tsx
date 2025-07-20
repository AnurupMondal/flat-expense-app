"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { QuickActions } from "@/components/ui/quick-actions";
import { ComplaintCard } from "@/components/ui/complaint-card";
import { ComplaintForm } from "@/components/ui/complaint-form";
import { BillCard } from "@/components/ui/bill-card";
import { NotificationCard } from "@/components/ui/notification-card";
import { BuildingInfo } from "@/components/ui/building-info";
import { ProfileManager } from "@/components/ui/profile-manager";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  History,
  Home,
  Plus,
  Receipt,
  ArrowLeft,
} from "lucide-react";
import { complaintsApi } from "@/lib/api";
import type {
  User as UserType,
  Building,
  Complaint,
  Bill,
  Notification,
} from "@/types/app-types";

interface ResidentDashboardProps {
  currentUser: UserType;
  users: UserType[];
  buildings: Building[];
  complaints: Complaint[];
  bills: Bill[];
  notifications: Notification[];
  onUpdateComplaints: (complaints: Complaint[]) => void;
  onUpdateBills: (bills: Bill[]) => void;
  onUpdateNotifications: (notifications: Notification[]) => void;
  onLogout: () => void;
}

export default function ResidentDashboard({
  currentUser,
  users,
  buildings,
  complaints,
  bills,
  notifications,
  onUpdateComplaints,
  onLogout,
}: ResidentDashboardProps) {
  const [activeView, setActiveView] = useState("overview");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  const currentBuilding = buildings.find(
    (b) => b.id === currentUser.buildingId
  );
  const buildingResidents = users.filter(
    (u) => u.buildingId === currentUser.buildingId && u.role === "resident"
  );
  const userComplaints = complaints.filter((c) => c.userId === currentUser.id);
  const userBills = bills.filter((b) => b.userId === currentUser.id);
  const pendingBills = userBills.filter((b) => b.status === "pending");
  const unreadNotifications = notifications.filter((n) => !n.read);

  const quickActions = [
    {
      title: "Submit Complaint",
      icon: AlertTriangle,
      onClick: () => setActiveView("submit-complaint"),
      className: "bg-orange-600 hover:bg-orange-700",
    },
    {
      title: "Payment History",
      icon: History,
      onClick: () => setActiveView("payments"),
      variant: "outline" as const,
      className: "bg-transparent",
    },
    {
      title: "Building Info",
      icon: Home,
      onClick: () => setActiveView("building-info"),
      variant: "outline" as const,
      className: "bg-transparent",
    },
  ];

  const handleSubmitComplaint = async (
    complaintData: Omit<Complaint, "id" | "createdAt" | "updates">
  ) => {
    try {
      setIsSubmittingComplaint(true);

      const newComplaint = await complaintsApi.create({
        title: complaintData.category, // Map category to title
        description: complaintData.description,
        type: complaintData.category, // Map category to type
        priority: complaintData.priority,
        location: complaintData.attachments?.join(", ") || "", // Map attachments to location for now
        updates: [
          {
            description: "Complaint submitted by resident",
            timestamp: new Date().toISOString(),
          },
        ],
      });

      if (!newComplaint) {
        throw new Error("Failed to create complaint");
      }

      // Update local state
      onUpdateComplaints([...complaints, newComplaint]);

      setMessage({
        type: "success",
        text: "Complaint submitted successfully! You will receive updates on its progress.",
      });
      setActiveView("complaints");

      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to submit complaint. Please try again.",
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  const getBreadcrumbTitle = () => {
    switch (activeView) {
      case "overview":
        return "Home";
      case "bills":
        return "Current Bills";
      case "payments":
        return "Payment History";
      case "complaints":
        return "My Complaints";
      case "submit-complaint":
        return "Submit Complaint";
      case "notifications":
        return "Notifications";
      case "building-info":
        return "Building Information";
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
              title={`Welcome, ${currentUser.name}`}
              description={`Flat ${currentUser.flatNumber}, ${currentBuilding?.name}`}
            />

            {!currentUser.rentEnabled && !currentUser.maintenanceEnabled && (
              <Card className="border-orange-200 bg-orange-50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-orange-900">
                        No billing services enabled
                      </p>
                      <p className="text-sm text-orange-700">
                        Contact your building admin to enable rent and/or
                        maintenance billing
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Show pending bills */}
            {pendingBills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  Pending Bills ({pendingBills.length})
                </h3>
                <div className="grid gap-4">
                  {pendingBills.slice(0, 2).map((bill) => (
                    <BillCard key={bill.id} bill={bill} user={currentUser} />
                  ))}
                </div>
                {pendingBills.length > 2 && (
                  <Button
                    variant="outline"
                    className="mt-4 bg-transparent"
                    onClick={() => setActiveView("bills")}
                  >
                    View All Bills ({pendingBills.length})
                  </Button>
                )}
              </div>
            )}

            {/* Show recent complaints */}
            {userComplaints.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  Recent Complaints
                </h3>
                <div className="space-y-4">
                  {userComplaints.slice(0, 2).map((complaint) => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      user={currentUser}
                    />
                  ))}
                </div>
                {userComplaints.length > 2 && (
                  <Button
                    variant="outline"
                    className="mt-4 bg-transparent"
                    onClick={() => setActiveView("complaints")}
                  >
                    View All Complaints ({userComplaints.length})
                  </Button>
                )}
              </div>
            )}

            <QuickActions actions={quickActions} />
          </>
        );

      case "bills":
        return (
          <>
            <DashboardHeader
              title="Current Bills"
              description="View and pay your current bills"
            />
            {userBills.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-12 text-center">
                  <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Bills Available
                  </h3>
                  <p className="text-gray-600">
                    You don't have any bills at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userBills.map((bill) => (
                  <BillCard key={bill.id} bill={bill} user={currentUser} />
                ))}
              </div>
            )}
          </>
        );

      case "complaints":
        return (
          <>
            <DashboardHeader
              title="My Complaints"
              description="Track your submitted complaints"
            >
              <Button
                onClick={() => setActiveView("submit-complaint")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Complaint
              </Button>
            </DashboardHeader>

            {userComplaints.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No complaints submitted yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Have an issue in your building? Submit a complaint and track
                    its progress.
                  </p>
                  <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => setActiveView("submit-complaint")}
                  >
                    Submit Your First Complaint
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    user={currentUser}
                  />
                ))}
              </div>
            )}
          </>
        );

      case "submit-complaint":
        return (
          <>
            <DashboardHeader
              title="Submit New Complaint"
              description="Report an issue in your building"
            >
              <Button
                variant="outline"
                onClick={() => setActiveView("complaints")}
                className="bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Complaints
              </Button>
            </DashboardHeader>
            <ComplaintForm
              currentUser={currentUser}
              onSubmit={handleSubmitComplaint}
              onCancel={() => setActiveView("complaints")}
              isLoading={isSubmittingComplaint}
            />
          </>
        );

      case "notifications":
        return (
          <>
            <DashboardHeader
              title="Notifications"
              description="Stay updated with important announcements"
            />
            {notifications.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No notifications available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </>
        );

      case "building-info":
        return (
          <>
            <DashboardHeader
              title="Building Information"
              description="Complete details about your building and amenities"
            />
            {currentBuilding && (
              <BuildingInfo
                building={currentBuilding}
                currentUser={currentUser}
                residents={buildingResidents}
              />
            )}
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
            <p className="text-gray-500">Select an option from the sidebar</p>
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
      notificationCount={unreadNotifications.length}
      breadcrumbTitle={getBreadcrumbTitle()}
      breadcrumbParent={`Flat ${currentUser.flatNumber}`}
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
