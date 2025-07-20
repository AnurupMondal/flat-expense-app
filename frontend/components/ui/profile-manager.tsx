"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usersApi } from "@/lib/api";
import type { User } from "@/types/app-types";

interface ProfileManagerProps {
  user: User;
  onUpdate: (updates: Partial<User>) => void;
}

export function ProfileManager({ user, onUpdate }: ProfileManagerProps) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [flatNumber, setFlatNumber] = useState(user.flatNumber || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes to enable/disable buttons
  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case "name":
        setName(value);
        break;
      case "phone":
        setPhone(value);
        break;
      case "flatNumber":
        setFlatNumber(value);
        break;
    }

    // Check if there are any changes
    const currentName = field === "name" ? value : name;
    const currentPhone = field === "phone" ? value : phone;
    const currentFlat = field === "flatNumber" ? value : flatNumber;

    const anyChanges =
      currentName !== (user.name || "") ||
      currentPhone !== (user.phone || "") ||
      currentFlat !== (user.flatNumber || "");

    setHasChanges(anyChanges);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    setMessage(null);

    try {
      // Note: Backend uses snake_case, so we need to convert
      const updates: any = {
        name: name.trim(),
        phone: phone.trim() || null,
      };

      // Only include flat_number for residents
      if (user.role === "resident") {
        updates.flat_number = flatNumber.trim() || null;
      }

      const updatedUser = await usersApi.update(user.id, updates);

      if (updatedUser) {
        // Convert back to camelCase for frontend
        const frontendUser = {
          ...updatedUser,
          flatNumber:
            (updatedUser as any).flat_number || updatedUser.flatNumber || null,
          buildingId:
            (updatedUser as any).building_id || updatedUser.buildingId || null,
        };

        // Update the user in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(frontendUser));
        }

        // Call the onUpdate prop to update parent component
        onUpdate(frontendUser);

        setMessage({ type: "success", text: "Profile updated successfully!" });
        setHasChanges(false);

        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to update profile",
      });

      // Clear error message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setName(user.name || "");
    setPhone(user.phone || "");
    setFlatNumber(user.flatNumber || "");
    setHasChanges(false);
    setMessage(null);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert
            className={
              message.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            <AlertDescription
              className={
                message.type === "success" ? "text-green-800" : "text-red-800"
              }
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="email" className="text-sm">
            Email
          </Label>
          <Input
            id="email"
            value={user.email}
            disabled
            className="mt-1 bg-muted"
          />
        </div>

        <div>
          <Label htmlFor="name" className="text-sm">
            Name *
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm">
            Phone
          </Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="mt-1"
            disabled={isLoading}
            placeholder="Enter your phone number"
          />
        </div>

        {user.role === "resident" && (
          <div>
            <Label htmlFor="flat" className="text-sm">
              Flat Number
            </Label>
            <Input
              id="flat"
              value={flatNumber}
              onChange={(e) => handleInputChange("flatNumber", e.target.value)}
              className="mt-1"
              disabled={isLoading}
              placeholder="Enter your flat number"
            />
          </div>
        )}

        <div>
          <Label htmlFor="role" className="text-sm">
            Role
          </Label>
          <Input
            id="role"
            value={user.role}
            disabled
            className="mt-1 bg-muted capitalize"
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading || !hasChanges}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading || !hasChanges || !name.trim()}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
