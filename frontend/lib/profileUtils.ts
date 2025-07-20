import type { User } from "@/types/app-types";

export interface ProfileCompletionResult {
  isComplete: boolean;
  missingFields: string[];
  requiredFields: string[];
}

export function checkProfileCompletion(user: User): ProfileCompletionResult {
  const missingFields: string[] = [];
  const requiredFields: string[] = [];

  // Basic required fields for all users
  const basicFields = [
    { key: "name", label: "Full Name" },
    { key: "email", label: "Email" },
    // Make phone optional for now since demo users might not have it consistently
    // { key: "phone", label: "Phone Number" },
  ];

  // Role-specific required fields
  const roleSpecificFields: Record<
    string,
    Array<{ key: string; label: string }>
  > = {
    "super-admin": [],
    admin: [{ key: "buildingId", label: "Building Assignment" }],
    resident: [
      { key: "buildingId", label: "Building Assignment" },
      { key: "flatNumber", label: "Flat Number" },
    ],
  };

  // Check basic fields
  basicFields.forEach(({ key, label }) => {
    requiredFields.push(label);
    const value = user[key as keyof User];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      missingFields.push(label);
    }
  });

  // Check role-specific fields
  const roleFields = roleSpecificFields[user.role] || [];
  roleFields.forEach(({ key, label }) => {
    requiredFields.push(label);
    const value = user[key as keyof User];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      missingFields.push(label);
    }
  });

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    requiredFields,
  };
}

export function getProfileCompletionPercentage(user: User): number {
  const result = checkProfileCompletion(user);
  if (result.requiredFields.length === 0) return 100;

  const completedFields =
    result.requiredFields.length - result.missingFields.length;
  return Math.round((completedFields / result.requiredFields.length) * 100);
}
