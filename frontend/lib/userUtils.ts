import type { User } from "@/types/app-types";

// Convert API response user object (snake_case) to frontend User type (camelCase)
export function normalizeUser(apiUser: any): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    password: apiUser.password || "",
    name: apiUser.name,
    role: apiUser.role,
    phone: apiUser.phone,
    buildingId: apiUser.building_id || apiUser.buildingId,
    flatNumber: apiUser.flat_number || apiUser.flatNumber,
    status: apiUser.status,
    createdAt: new Date(apiUser.created_at || apiUser.createdAt),
    approvedBy: apiUser.approved_by || apiUser.approvedBy,
    rentEnabled: apiUser.rent_enabled || apiUser.rentEnabled || false,
    maintenanceEnabled:
      apiUser.maintenance_enabled || apiUser.maintenanceEnabled || false,
    avatar: apiUser.avatar || null,
  };
}

// Convert multiple API user objects
export function normalizeUsers(apiUsers: any[]): User[] {
  return apiUsers.map(normalizeUser);
}
