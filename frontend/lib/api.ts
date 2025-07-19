// API service layer for data management
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get token from localStorage (if on client side)
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error("API call failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Import types
import type {
  User,
  Building,
  Complaint,
  Bill,
  Notification,
  Analytics,
} from "@/types/app-types";

// Authentication API
export const authApi = {
  async login(
    email: string,
    password: string
  ): Promise<{ token?: string; user?: User; error?: string }> {
    const result = await apiCall<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (result.success && result.data) {
      // Store token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }
      return result.data;
    }

    return { error: result.error };
  },

  async register(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    building_id?: string;
    flat_number?: string;
  }): Promise<{ user?: User; error?: string }> {
    const result = await apiCall<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    return result.success ? result.data! : { error: result.error };
  },

  async logout(): Promise<void> {
    await apiCall("/auth/logout", { method: "POST" });

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },
};

// Users API
export const usersApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  }): Promise<{ users: User[]; pagination?: any } | null> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.role) queryParams.append("role", params.role);

    const result = await apiCall<{ users: User[]; pagination: any }>(
      `/users?${queryParams.toString()}`
    );
    return result.success ? result.data! : null;
  },

  async getById(id: string): Promise<User | null> {
    const result = await apiCall<{ user: User }>(`/users/${id}`);
    return result.success ? result.data!.user : null;
  },

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const result = await apiCall<{ user: User }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return result.success ? result.data!.user : null;
  },

  async updateStatus(
    id: string,
    status: "approved" | "rejected"
  ): Promise<User | null> {
    const result = await apiCall<{ user: User }>(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return result.success ? result.data!.user : null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await apiCall(`/users/${id}`, { method: "DELETE" });
    return result.success;
  },

  async getPendingApprovals(): Promise<User[]> {
    const result = await apiCall<{ pendingUsers: User[] }>(
      "/users/pending/approvals"
    );
    return result.success ? result.data!.pendingUsers : [];
  },

  async create(userData: Partial<User>): Promise<User | null> {
    const result = await apiCall<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return result.success ? result.data!.user : null;
  },
};

// Buildings API
export const buildingsApi = {
  async getAll(): Promise<Building[]> {
    const result = await apiCall<{ buildings: Building[] }>("/buildings");
    return result.success ? result.data!.buildings : [];
  },

  async create(
    buildingData: Omit<Building, "id" | "createdAt">
  ): Promise<Building | null> {
    const result = await apiCall<{ building: Building }>("/buildings", {
      method: "POST",
      body: JSON.stringify(buildingData),
    });
    return result.success ? result.data!.building : null;
  },
};

// Bills API
export const billsApi = {
  async getAll(): Promise<Bill[]> {
    const result = await apiCall<{ bills: Bill[] }>("/bills");
    return result.success ? result.data!.bills : [];
  },

  async getById(id: string): Promise<Bill | null> {
    const result = await apiCall<{ bill: Bill }>(`/bills/${id}`);
    return result.success ? result.data!.bill : null;
  },

  async create(billData: {
    userId: string;
    buildingId?: string;
    title: string;
    description?: string;
    amount: number;
    dueDate: string;
    type?: string;
    items?: Array<{ name: string; amount: number; description?: string }>;
  }): Promise<Bill | null> {
    const result = await apiCall<{ bill: Bill }>("/bills", {
      method: "POST",
      body: JSON.stringify(billData),
    });
    return result.success ? result.data!.bill : null;
  },

  async updateStatus(
    id: string,
    status: string,
    paymentDetails?: any
  ): Promise<Bill | null> {
    const result = await apiCall<{ bill: Bill }>(`/bills/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, paymentDetails }),
    });
    return result.success ? result.data!.bill : null;
  },

  async delete(id: string): Promise<Bill | null> {
    const result = await apiCall<{ bill: Bill }>(`/bills/${id}`, {
      method: "DELETE",
    });
    return result.success ? result.data!.bill : null;
  },
};

// Complaints API
export const complaintsApi = {
  async getAll(): Promise<Complaint[]> {
    const result = await apiCall<{ complaints: Complaint[] }>("/complaints");
    return result.success ? result.data!.complaints : [];
  },

  async create(complaintData: {
    title: string;
    description: string;
    type: string;
    priority: string;
    location?: string;
    updates?: Array<{
      description: string;
      timestamp: string;
    }>;
  }): Promise<Complaint | null> {
    const result = await apiCall<{ complaint: Complaint }>("/complaints", {
      method: "POST",
      body: JSON.stringify(complaintData),
    });
    return result.success ? result.data!.complaint : null;
  },

  async getById(id: string): Promise<Complaint | null> {
    const result = await apiCall<{ complaint: Complaint }>(`/complaints/${id}`);
    return result.success ? result.data!.complaint : null;
  },

  async updateStatus(
    id: string,
    status: string,
    response?: string
  ): Promise<Complaint | null> {
    const result = await apiCall<{ complaint: Complaint }>(
      `/complaints/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, response }),
      }
    );
    return result.success ? result.data!.complaint : null;
  },
};

// Notifications API
export const notificationsApi = {
  async getAll(): Promise<Notification[]> {
    const result = await apiCall<{ notifications: Notification[] }>(
      "/notifications"
    );
    return result.success ? result.data!.notifications : [];
  },

  async getByUser(userId: string): Promise<Notification[]> {
    const result = await apiCall<{ notifications: Notification[] }>(
      `/notifications/user/${userId}`
    );
    return result.success ? result.data!.notifications : [];
  },

  async create(notificationData: {
    userId?: string;
    buildingId?: string;
    title: string;
    message: string;
    type?: string;
  }): Promise<Notification | null> {
    const result = await apiCall<{ notification: Notification }>(
      "/notifications",
      {
        method: "POST",
        body: JSON.stringify(notificationData),
      }
    );
    return result.success ? result.data!.notification : null;
  },

  async markAsRead(id: string): Promise<Notification | null> {
    const result = await apiCall<{ notification: Notification }>(
      `/notifications/${id}/read`,
      {
        method: "PATCH",
      }
    );
    return result.success ? result.data!.notification : null;
  },

  async markAllAsRead(): Promise<number> {
    const result = await apiCall<{ updatedCount: number }>(
      "/notifications/mark-all-read",
      {
        method: "PATCH",
      }
    );
    return result.success ? result.data!.updatedCount : 0;
  },

  async getUnreadCount(): Promise<number> {
    const result = await apiCall<{ unreadCount: number }>(
      "/notifications/unread-count"
    );
    return result.success ? result.data!.unreadCount : 0;
  },
};

// Analytics API
export const analyticsApi = {
  async getAll(): Promise<Analytics | null> {
    const result = await apiCall<Analytics>("/analytics");
    return result.success ? result.data! : null;
  },
};

// File Upload API
export const uploadApi = {
  async uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();
      return result.success ? result.data.url : null;
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  },
};
