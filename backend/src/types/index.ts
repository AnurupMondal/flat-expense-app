export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: "super-admin" | "admin" | "resident";
  phone?: string;
  building_id?: string;
  flat_number?: string;
  status: "pending" | "approved" | "rejected";
  approved_by?: string;
  rent_enabled: boolean;
  maintenance_enabled: boolean;
  avatar?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  admin_id?: string;
  total_units: number;
  created_at: Date;
  updated_at: Date;
}

export interface BuildingSettings {
  id: string;
  building_id: string;
  rent_amount: number;
  maintenance_amount: number;
  rent_due_date: number;
  maintenance_due_date: number;
  late_fee: number;
  tax_rate: number;
  created_at: Date;
  updated_at: Date;
}

export interface Amenity {
  id: string;
  building_id: string;
  name: string;
  icon?: string;
  available: boolean;
  created_at: Date;
}

export interface Complaint {
  id: string;
  user_id: string;
  building_id: string;
  category: string;
  description: string;
  priority: "low" | "medium" | "high" | "emergency";
  status: "submitted" | "assigned" | "in-progress" | "resolved";
  assigned_to?: string;
  attachments?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface ComplaintUpdate {
  id: string;
  complaint_id: string;
  status: string;
  note?: string;
  updated_by: string;
  created_at: Date;
}

export interface Bill {
  id: string;
  user_id: string;
  building_id: string;
  month: string;
  year: number;
  rent_amount: number;
  maintenance_amount: number;
  total_amount: number;
  due_date: Date;
  status: "pending" | "paid" | "overdue";
  paid_at?: Date;
  payment_method?: string;
  transaction_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BillBreakdown {
  id: string;
  bill_id: string;
  item: string;
  amount: number;
  type: "rent" | "maintenance" | "tax" | "other";
}

export interface Notification {
  id: string;
  user_id: string;
  building_id: string;
  type: "bill" | "complaint" | "announcement" | "system";
  title: string;
  message: string;
  urgent: boolean;
  read: boolean;
  data?: Record<string, any>;
  created_at: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  last_used_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication types
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  buildingId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  building_id?: string;
  flat_number?: string;
}

// Analytics types
export interface Analytics {
  revenue: {
    monthly: Array<{
      month: string;
      amount: number;
      collected: number;
    }>;
    yearly: Record<
      string,
      {
        total: number;
        collected: number;
        pending: number;
      }
    >;
  };
  complaints: {
    byCategory: Array<{
      category: string;
      count: number;
      resolved: number;
    }>;
    byStatus: Array<{
      status: string;
      count: number;
    }>;
  };
  occupancy: {
    total: number;
    occupied: number;
    vacant: number;
    rate: number;
  };
  users: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}
