"use client";

import { useState, useEffect } from "react";
import AuthPage from "@/components/auth-page";
import SuperAdminDashboard from "@/components/super-admin-dashboard";
import AdminDashboard from "@/components/admin-dashboard";
import ResidentDashboard from "@/components/resident-dashboard";
import ProfileCompletion from "@/components/profile-completion";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { checkProfileCompletion } from "@/lib/profileUtils";
import { normalizeUser } from "@/lib/userUtils";
import {
  authApi,
  usersApi,
  buildingsApi,
  complaintsApi,
  billsApi,
  notificationsApi,
} from "@/lib/api";
import type {
  User,
  Building,
  Complaint,
  Bill,
  Notification,
} from "@/types/app-types";

export default function FlatExpenseApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Loading initial data...");

        // Check for existing session
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          const user = await usersApi.getById(userData.id);
          if (user && user.status === "approved") {
            // Normalize user data to handle API inconsistencies
            const normalizedUser = normalizeUser(user);
            setCurrentUser(normalizedUser);
            console.log("Restored user session:", normalizedUser);

            // Check if profile is complete for restored session
            const profileCheck = checkProfileCompletion(normalizedUser);
            console.log("Profile check on restore:", profileCheck);
            if (!profileCheck.isComplete) {
              console.log(
                "Restored user has incomplete profile:",
                profileCheck.missingFields
              );
              setShowProfileCompletion(true);
            }
          } else {
            localStorage.removeItem("currentUser");
          }
        }

        // Load all data in parallel
        const [usersData, buildingsData, complaintsData, billsData] =
          await Promise.all([
            usersApi.getAll(),
            buildingsApi.getAll(),
            complaintsApi.getAll(),
            billsApi.getAll(),
          ]);

        console.log("Loaded data:", {
          users: usersData?.users?.length || 0,
          buildings: buildingsData?.length || 0,
          complaints: complaintsData?.length || 0,
          bills: billsData?.length || 0,
        });

        setUsers(usersData?.users || []);
        setBuildings(buildingsData || []);
        setComplaints(complaintsData || []);
        setBills(billsData || []);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load user-specific data when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          console.log("Loading notifications for user:", currentUser.id);
          const notificationsData = await notificationsApi.getByUser(
            currentUser.id
          );
          setNotifications(notificationsData);
          console.log("Loaded notifications:", notificationsData.length);
        } catch (err) {
          console.error("Failed to load user notifications:", err);
        }
      }
    };

    loadUserData();
  }, [currentUser]);

  const handleLogin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      console.log("Attempting login for:", email);
      const result = await authApi.login(email, password);

      if (result.error) {
        return { success: false, message: result.error };
      }

      if (!result.user) {
        return { success: false, message: "Invalid email or password" };
      }

      const user = result.user;

      if (user.status === "pending") {
        return {
          success: false,
          message: "Your account is pending approval from the admin",
        };
      }

      if (user.status === "rejected") {
        return {
          success: false,
          message: "Your account has been rejected. Please contact support",
        };
      }

      console.log("Login successful for user:", user);

      // Normalize user data to handle API inconsistencies
      const normalizedUser = normalizeUser(user);
      setCurrentUser(normalizedUser);

      // Check if profile is complete
      const profileCheck = checkProfileCompletion(normalizedUser);
      console.log("Profile check result:", profileCheck);

      if (!profileCheck.isComplete) {
        console.log(
          "Profile incomplete, showing profile completion:",
          profileCheck.missingFields
        );
        setShowProfileCompletion(true);
        return {
          success: true,
          message: "Profile completion required",
          user: normalizedUser,
        };
      }

      // Load user notifications
      const notificationsData = await notificationsApi.getByUser(
        normalizedUser.id
      );
      setNotifications(notificationsData);

      return {
        success: true,
        message: "Login successful",
        user: normalizedUser,
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed. Please try again." };
    }
  };

  const handleRegister = async (
    userData: Partial<User>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      console.log("Attempting registration:", userData);

      // Check if email already exists
      if (users.find((u) => u.email === userData.email)) {
        return { success: false, message: "Email already exists" };
      }

      // Check if flat is already occupied (for residents)
      if (userData.role === "resident" && userData.flatNumber) {
        const existingResident = users.find(
          (u) =>
            u.buildingId === userData.buildingId &&
            u.flatNumber === userData.flatNumber &&
            u.status !== "rejected"
        );
        if (existingResident) {
          return { success: false, message: "This flat is already occupied" };
        }
      }

      const newUser = await usersApi.create({
        email: userData.email!,
        password: userData.password!,
        name: userData.name!,
        role: userData.role!,
        phone: userData.phone!,
        buildingId: userData.buildingId || null,
        flatNumber: userData.flatNumber || null,
        status: userData.role === "super-admin" ? "approved" : "pending",
        approvedBy: null,
        rentEnabled: false,
        maintenanceEnabled: false,
      });

      if (!newUser) {
        throw new Error("Failed to create user");
      }

      // Update local state
      setUsers((prev) => [...prev, newUser]);
      console.log("Registration successful:", newUser);

      return {
        success: true,
        message:
          userData.role === "super-admin"
            ? "Super admin account created successfully"
            : "Registration successful! Your account is pending approval from the admin",
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    }
  };

  const handleLogout = () => {
    console.log("Logging out user");
    setCurrentUser(null);
    setNotifications([]);
    setShowProfileCompletion(false);
    localStorage.removeItem("currentUser");
  };

  const handleProfileComplete = async (updatedUser: User) => {
    console.log("Profile completed for user:", updatedUser);
    setCurrentUser(updatedUser);
    setShowProfileCompletion(false);

    // Update user in the users array
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );

    // Save updated user to localStorage
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    // Load user notifications now that profile is complete
    try {
      const notificationsData = await notificationsApi.getByUser(
        updatedUser.id
      );
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const updateUsers = async (updatedUsers: User[]) => {
    console.log("Updating users:", updatedUsers.length);
    setUsers(updatedUsers);
    // Update current user if they were modified
    if (currentUser) {
      const updatedCurrentUser = updatedUsers.find(
        (u) => u.id === currentUser.id
      );
      if (updatedCurrentUser) {
        setCurrentUser(updatedCurrentUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));
      }
    }
  };

  const updateBuildings = (updatedBuildings: Building[]) => {
    console.log("Updating buildings:", updatedBuildings.length);
    setBuildings(updatedBuildings);
  };

  const updateComplaints = (updatedComplaints: Complaint[]) => {
    console.log("Updating complaints:", updatedComplaints.length);
    setComplaints(updatedComplaints);
  };

  const updateBills = (updatedBills: Bill[]) => {
    console.log("Updating bills:", updatedBills.length);
    setBills(updatedBills);
  };

  const updateNotifications = (updatedNotifications: Notification[]) => {
    console.log("Updating notifications:", updatedNotifications.length);
    setNotifications(updatedNotifications);
  };

  const handleProfileUpdate = async (updates: Partial<User>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      localStorage.setItem("currentUser", JSON.stringify(updated));
      // also update users list
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    }
  };

  const commonProps = {
    currentUser,
    users,
    buildings,
    complaints,
    bills,
    notifications,
    onUpdateUsers: updateUsers,
    onUpdateBuildings: updateBuildings,
    onUpdateComplaints: updateComplaints,
    onUpdateBills: updateBills,
    onUpdateNotifications: updateNotifications,
    onLogout: handleLogout,
    onUpdateProfile: handleProfileUpdate,
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Application
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <ErrorBoundary>
        <AuthPage
          onLogin={handleLogin}
          onRegister={handleRegister}
          buildings={buildings}
        />
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
      currentUser, // Override to ensure non-null currentUser
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
        {renderDashboard()}
      </div>
    </ErrorBoundary>
  );
}
