import { Complaint } from "../types/app-types";

// API response format uses snake_case, but our interfaces use camelCase
interface ApiComplaintResponse {
  id: string;
  user_id: string;
  building_id: string;
  category: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "submitted" | "assigned" | "in-progress" | "resolved" | "rejected";
  assigned_to?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  user_name?: string;
  flat_number?: string;
  building_name?: string;
}

export function mapApiComplaintToComplaint(
  apiComplaint: ApiComplaintResponse
): Complaint {
  return {
    id: apiComplaint.id,
    userId: apiComplaint.user_id,
    buildingId: apiComplaint.building_id,
    category: apiComplaint.category,
    description: apiComplaint.description,
    priority: apiComplaint.priority,
    status: apiComplaint.status,
    createdAt: new Date(apiComplaint.created_at),
    assignedTo: apiComplaint.assigned_to,
    attachments: apiComplaint.attachments,
    updates: [], // Will be populated when we add update tracking
  };
}

export function mapApiComplaintsToComplaints(
  apiComplaints: ApiComplaintResponse[]
): Complaint[] {
  return apiComplaints.map(mapApiComplaintToComplaint);
}
