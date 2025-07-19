export interface User {
  id: string
  email: string
  password: string
  name: string
  role: "super-admin" | "admin" | "resident"
  phone: string
  buildingId: string | null
  flatNumber: string | null
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  approvedBy: string | null
  rentEnabled: boolean
  maintenanceEnabled: boolean
  avatar?: string | null
}

export interface Building {
  id: string
  name: string
  address: string
  adminId: string
  totalUnits: number
  createdAt: Date
  amenities?: Amenity[]
  settings?: BuildingSettings
}

export interface Amenity {
  id: string
  name: string
  icon: string
  available: boolean
}

export interface BuildingSettings {
  rentAmount: number
  maintenanceAmount: number
  rentDueDate: number
  maintenanceDueDate: number
  lateFee: number
  taxRate: number
}

export interface Complaint {
  id: string
  userId: string
  buildingId: string
  category: string
  description: string
  priority: "low" | "medium" | "high" | "emergency"
  status: "submitted" | "assigned" | "in-progress" | "resolved"
  createdAt: Date
  assignedTo?: string
  attachments?: string[]
  updates: ComplaintUpdate[]
}

export interface ComplaintUpdate {
  id: string
  complaintId: string
  status: string
  note: string
  updatedBy: string
  updatedAt: Date
}

export interface Bill {
  id: string
  userId: string
  buildingId: string
  month: string
  year: number
  rentAmount: number
  maintenanceAmount: number
  totalAmount: number
  dueDate: Date
  status: "pending" | "paid" | "overdue"
  paidAt?: Date
  paymentMethod?: string
  transactionId?: string
  breakdown?: BillBreakdown[]
}

export interface BillBreakdown {
  item: string
  amount: number
  type: "rent" | "maintenance" | "tax" | "other"
}

export interface Notification {
  id: string
  userId: string
  buildingId: string
  type: "bill" | "complaint" | "announcement" | "system"
  title: string
  message: string
  urgent: boolean
  read: boolean
  createdAt: Date
  data?: Record<string, any>
}

export interface Analytics {
  revenue: {
    monthly: Array<{
      month: string
      amount: number
      collected: number
    }>
    yearly: Record<
      string,
      {
        total: number
        collected: number
        pending: number
      }
    >
  }
  complaints: {
    byCategory: Array<{
      category: string
      count: number
      resolved: number
    }>
    byStatus: Array<{
      status: string
      count: number
    }>
  }
  occupancy: {
    total: number
    occupied: number
    vacant: number
    rate: number
  }
  users: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
}
