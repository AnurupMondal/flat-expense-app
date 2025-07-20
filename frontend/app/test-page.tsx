"use client";

import { useState, useEffect } from "react";
import ProfileCompletion from "@/components/profile-completion";
import SuperAdminDashboard from "@/components/super-admin-dashboard";
import AdminDashboard from "@/components/admin-dashboard";
import ResidentDashboard from "@/components/resident-dashboard";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { checkProfileCompletion } from "@/lib/profileUtils";
import type {
  User,
  Building,
  Complaint,
  Bill,
  Notification,
} from "@/types/app-types";

// Mock data for testing
const mockBuildings: Building[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Sunset Apartments",
    address: "123 Main Street, Downtown, City 12345",
    adminId: "550e8400-e29b-41d4-a716-446655440000",
    totalUnits: 50,
    createdAt: new Date(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Ocean View Complex",
    address: "456 Beach Road, Seaside, City 67890",
    adminId: "550e8400-e29b-41d4-a716-446655440000",
    totalUnits: 30,
    createdAt: new Date(),
  },
];

const mockUsers: User[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "superadmin@flatmanager.com",
    password: "",
    name: "Super Administrator",
    role: "super-admin",
    phone: "+1234567890",
    buildingId: null,
    flatNumber: null,
    status: "approved",
    createdAt: new Date(),
    approvedBy: null,
    rentEnabled: false,
    maintenanceEnabled: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    email: "admin@flatmanager.com",
    password: "",
    name: "Building Administrator",
    role: "admin",
    phone: "+1234567891",
    buildingId: null, // This should trigger profile completion
    flatNumber: null,
    status: "approved",
    createdAt: new Date(),
    approvedBy: null,
    rentEnabled: false,
    maintenanceEnabled: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    email: "resident@flatmanager.com",
    password: "",
    name: "John Resident",
    role: "resident",
    phone: "+1234567892",
    buildingId: null, // This should trigger profile completion
    flatNumber: null, // This should trigger profile completion
    status: "approved",
    createdAt: new Date(),
    approvedBy: null,
    rentEnabled: false,
    maintenanceEnabled: false,
  },
];

export default function TestFlatExpenseApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>(mockUsers);
  const [buildings] = useState<Building[]>(mockBuildings);
  const [complaints] = useState<Complaint[]>([]);
  const [bills] = useState<Bill[]>([]);
  const [notifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [selectedTestUser, setSelectedTestUser] = useState<string>("");

  const handleTestLogin = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) return;

    console.log("Test login for user:", user);
    setCurrentUser(user);

    // Save to localStorage for testing session restoration
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Check if profile is complete
    const profileCheck = checkProfileCompletion(user);
    console.log("Profile check result:", profileCheck);

    if (!profileCheck.isComplete) {
      console.log(
        "Profile incomplete, showing profile completion:",
        profileCheck.missingFields
      );
      setShowProfileCompletion(true);
    } else {
      console.log("Profile complete, showing dashboard");
      setShowProfileCompletion(false);
    }
  };

  const handleLogout = () => {
    console.log("Logging out user");
    setCurrentUser(null);
    setShowProfileCompletion(false);
    localStorage.removeItem("currentUser");
    setSelectedTestUser("");
  };

  const handleProfileComplete = (updatedUser: User) => {
    console.log("Profile completed for user:", updatedUser);
    setCurrentUser(updatedUser);
    setShowProfileCompletion(false);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  };

  // Test session restoration on page load
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      console.log("Restoring user session:", userData);
      setCurrentUser(userData);

      const profileCheck = checkProfileCompletion(userData);
      console.log("Profile check on restore:", profileCheck);
      if (!profileCheck.isComplete) {
        console.log(
          "Restored user has incomplete profile:",
          profileCheck.missingFields
        );
        setShowProfileCompletion(true);
      }
    }
  }, []);

  const commonProps = {
    currentUser,
    users,
    buildings,
    complaints,
    bills,
    notifications,
    onUpdateUsers: () => {},
    onUpdateBuildings: () => {},
    onUpdateComplaints: () => {},
    onUpdateBills: () => {},
    onUpdateNotifications: () => {},
    onLogout: handleLogout,
    onUpdateProfile: () => {},
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  // Test UI for selecting users
  if (!currentUser) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Profile Completion Test
              </h1>
              <p className="text-gray-600">
                Select a user to test profile completion logic
              </p>
            </div>

            <div className="space-y-4">
              {mockUsers.map((user) => {
                const profileCheck = checkProfileCompletion(user);
                return (
                  <button
                    key={user.id}
                    onClick={() => handleTestLogin(user.id)}
                    className="w-full p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow text-left"
                  >
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-sm text-gray-500">
                      Role: {user.role}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        profileCheck.isComplete
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      Profile:{" "}
                      {profileCheck.isComplete ? "Complete" : "Incomplete"}
                      {!profileCheck.isComplete && (
                        <span className="block text-xs">
                          Missing: {profileCheck.missingFields.join(", ")}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-center text-sm text-gray-500">
              Test the profile completion popup by logging in as admin or
              resident users
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Show profile completion if needed
  if (showProfileCompletion) {
    return (
      <ErrorBoundary>
        <ProfileCompletion
          user={currentUser}
          buildings={buildings}
          onProfileComplete={handleProfileComplete}
          onLogout={handleLogout}
        />
      </ErrorBoundary>
    );
  }

  const renderDashboard = () => {
    if (!currentUser) {
      return <div>No user data available</div>;
    }

    const propsWithCurrentUser = {
      ...commonProps,
      currentUser,
    };

    switch (currentUser.role) {
      case "super-admin":
        return <SuperAdminDashboard {...propsWithCurrentUser} />;
      case "admin":
        return <AdminDashboard {...propsWithCurrentUser} />;
      case "resident":
        return <ResidentDashboard {...propsWithCurrentUser} />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Test controls */}
        <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border">
          <div className="text-sm font-medium mb-2">Test Controls</div>
          <div className="text-xs text-gray-600 mb-2">
            Current: {currentUser.name} ({currentUser.role})
          </div>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Logout & Reset
          </button>
        </div>
        {renderDashboard()}
      </div>
    </ErrorBoundary>
  );
}
