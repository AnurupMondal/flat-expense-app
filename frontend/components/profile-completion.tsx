"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usersApi } from "@/lib/api";
import {
  checkProfileCompletion,
  getProfileCompletionPercentage,
} from "@/lib/profileUtils";
import { User, AlertTriangle, CheckCircle, UserCheck } from "lucide-react";
import type { User as UserType, Building } from "@/types/app-types";

interface ProfileCompletionProps {
  user: UserType;
  buildings: Building[];
  onProfileComplete: (updatedUser: UserType) => void;
  onLogout: () => void;
}

export default function ProfileCompletion({
  user,
  buildings,
  onProfileComplete,
  onLogout,
}: ProfileCompletionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const profileCheck = checkProfileCompletion(user);
  const completionPercentage = getProfileCompletionPercentage(user);

  // Form state with current user data
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    buildingId: user.buildingId || "",
    flatNumber: user.flatNumber || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate required fields based on role
      const requiredFields: Record<string, string> = {
        name: "Full Name",
        phone: "Phone Number",
      };

      if (user.role === "admin" || user.role === "resident") {
        requiredFields.buildingId = "Building";
      }

      if (user.role === "resident") {
        requiredFields.flatNumber = "Flat Number";
      }

      // Check for missing required fields
      const missingFields = Object.entries(requiredFields).filter(
        ([key]) => !formData[key as keyof typeof formData]?.trim()
      );

      if (missingFields.length > 0) {
        setMessage({
          type: "error",
          text: `Please fill in: ${missingFields
            .map(([, label]) => label)
            .join(", ")}`,
        });
        setIsLoading(false);
        return;
      }

      // Check if flat is already occupied (for residents)
      if (
        user.role === "resident" &&
        formData.flatNumber &&
        formData.buildingId
      ) {
        // We would need to pass all users to check this, but for now we'll let the backend handle it
      }

      // Update user profile
      const updatedUser = await usersApi.update(user.id, {
        name: formData.name,
        phone: formData.phone,
        buildingId: formData.buildingId || null,
        flatNumber: formData.flatNumber || null,
      });

      if (updatedUser) {
        // Check if profile is now complete
        const newProfileCheck = checkProfileCompletion(updatedUser);
        if (newProfileCheck.isComplete) {
          setMessage({
            type: "success",
            text: "Profile completed successfully!",
          });
          setTimeout(() => {
            onProfileComplete(updatedUser);
          }, 1500);
        } else {
          setMessage({
            type: "error",
            text: `Profile still incomplete. Missing: ${newProfileCheck.missingFields.join(
              ", "
            )}`,
          });
        }
      } else {
        setMessage({ type: "error", text: "Failed to update profile" });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBuilding = buildings.find((b) => b.id === formData.buildingId);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <UserCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground">
            Please complete your profile information to access the platform
          </p>
        </div>

        {/* Progress Card */}
        <Card className="border-0 shadow-lg bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Completion
              </CardTitle>
              <Badge
                variant={completionPercentage === 100 ? "default" : "outline"}
              >
                {completionPercentage}%
              </Badge>
            </div>
            <CardDescription>
              Fill in the required information to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={completionPercentage} className="h-2" />

            {profileCheck.missingFields.length > 0 && (
              <Alert className="border-warning/30 bg-warning/10">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-warning-foreground">
                  Missing fields: {profileCheck.missingFields.join(", ")}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="border-0 shadow-xl bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              {(user.role === "admin" || user.role === "resident") && (
                <div className="space-y-2">
                  <Label htmlFor="building">
                    Building <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.buildingId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, buildingId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your building" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map((building) => (
                        <SelectItem key={building.id} value={building.id}>
                          {building.name} - {building.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {user.role === "resident" && (
                <div className="space-y-2">
                  <Label htmlFor="flatNumber">
                    Flat Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="flatNumber"
                    placeholder="e.g., 301, A-102"
                    value={formData.flatNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        flatNumber: e.target.value,
                      }))
                    }
                    required={user.role === "resident"}
                  />
                  {selectedBuilding && (
                    <p className="text-sm text-muted-foreground">
                      Building: {selectedBuilding.name} (
                      {selectedBuilding.totalUnits} units)
                    </p>
                  )}
                </div>
              )}

              {message && (
                <Alert
                  className={
                    message.type === "error"
                      ? "border-red-200 bg-red-50"
                      : "border-green-200 bg-green-50"
                  }
                >
                  {message.type === "error" ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <AlertDescription
                    className={
                      message.type === "error"
                        ? "text-red-700"
                        : "text-green-700"
                    }
                  >
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Complete Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onLogout}
                  disabled={isLoading}
                >
                  Logout
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <Card className="border-0 shadow-lg bg-blue-50/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-blue-800 font-medium">
                Need help completing your profile?
              </p>
              <p className="text-xs text-blue-700">
                Contact your building administrator or super admin for
                assistance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
