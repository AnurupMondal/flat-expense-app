import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Input } from "./input";
import { Textarea } from "./textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import {
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Calendar,
  MessageSquare,
  Filter,
  Eye,
  Edit,
  AlertCircle,
  User,
  Building,
  Phone,
  Trash2,
  Plus,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import { Complaint, User as UserType } from "../../types/app-types";

interface ComplaintsManagementProps {
  currentUser: UserType;
  complaints: Complaint[];
  users: UserType[];
  onUpdateComplaint: (
    complaintId: string,
    updates: Partial<Complaint>
  ) => Promise<void>;
  onDeleteComplaint?: (complaintId: string) => Promise<void>;
}

export function ComplaintsManagement({
  currentUser,
  complaints: propComplaints,
  users,
  onUpdateComplaint,
  onDeleteComplaint,
}: ComplaintsManagementProps) {
  const [complaints, setComplaints] = useState<Complaint[]>(propComplaints);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(
    null
  );
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Update complaints when props change
  useEffect(() => {
    console.log("🔍 ComplaintsManagement received props:", {
      propComplaints,
      currentUser,
    });
    setComplaints(propComplaints || []);
  }, [propComplaints]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="h-4 w-4" />;
      case "in-progress":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Filter and sort complaints
  const filteredAndSortedComplaints = complaints
    .filter((complaint) => {
      const matchesSearch =
        searchTerm === "" ||
        complaint.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        complaint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getUserName(complaint.userId)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || complaint.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || complaint.category === categoryFilter;
      const matchesPriority =
        priorityFilter === "all" || complaint.priority === priorityFilter;
      const matchesAssignedTo =
        assignedToFilter === "all" ||
        (assignedToFilter === "unassigned" && !complaint.assignedTo) ||
        complaint.assignedTo === assignedToFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesPriority &&
        matchesAssignedTo
      );
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "priority":
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case "category":
          aValue = a.category;
          bValue = b.category;
          break;
        case "user":
          aValue = getUserName(a.userId);
          bValue = getUserName(b.userId);
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  // Get user details by ID
  const getUserDetails = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  // Get available admins for assignment
  const getAvailableAdmins = () => {
    return users.filter((u) => u.role === "admin" || u.role === "super-admin");
  };

  // Handle status update
  const handleStatusUpdate = async (
    complaintId: string,
    newStatus: string,
    response?: string
  ) => {
    try {
      setLoading(true);
      const updates: Partial<Complaint> = {
        status: newStatus as Complaint["status"],
      };
      if (response) {
        updates.adminResponse = response;
      }
      await onUpdateComplaint(complaintId, updates);

      // Update local state
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, ...updates } : c))
      );
    } catch (error) {
      console.error("Failed to update complaint status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle assignment update
  const handleAssignmentUpdate = async (
    complaintId: string,
    assignedTo: string | null
  ) => {
    try {
      setLoading(true);
      await onUpdateComplaint(complaintId, { assignedTo });

      // Update local state
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, assignedTo } : c))
      );
    } catch (error) {
      console.error("Failed to update complaint assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle complaint edit
  const handleComplaintEdit = async (updates: Partial<Complaint>) => {
    if (!editingComplaint) return;

    try {
      setLoading(true);
      await onUpdateComplaint(editingComplaint.id, updates);

      // Update local state
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === editingComplaint.id ? { ...c, ...updates } : c
        )
      );
      setEditingComplaint(null);
    } catch (error) {
      console.error("Failed to update complaint:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle complaint deletion
  const handleComplaintDelete = async (complaintId: string) => {
    if (!onDeleteComplaint) return;

    try {
      setLoading(true);
      await onDeleteComplaint(complaintId);

      // Update local state
      setComplaints((prev) => prev.filter((c) => c.id !== complaintId));
    } catch (error) {
      console.error("Failed to delete complaint:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const categories = [...new Set(complaints.map((c) => c.category))];
  const admins = getAvailableAdmins();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Complaints Management</h2>
          <p className="text-muted-foreground">
            Manage and track all resident complaints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredAndSortedComplaints.length} complaint
            {filteredAndSortedComplaints.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="xl:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search complaints, users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            {/* Assigned To Filter */}
            <Select
              value={assignedToFilter}
              onValueChange={setAssignedToFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Assignments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>Complaints List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No complaints found
              </h3>
              <p className="text-muted-foreground text-center">
                {searchTerm ||
                  statusFilter !== "all" ||
                  categoryFilter !== "all" ||
                  priorityFilter !== "all" ||
                  assignedToFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "No complaints have been submitted yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("user")}
                        className="font-semibold"
                      >
                        User <ArrowUpDown className="h-4 w-4 ml-1" />
                      </Button>
                    </th>
                    <th className="text-left p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("category")}
                        className="font-semibold"
                      >
                        Category <ArrowUpDown className="h-4 w-4 ml-1" />
                      </Button>
                    </th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("priority")}
                        className="font-semibold"
                      >
                        Priority <ArrowUpDown className="h-4 w-4 ml-1" />
                      </Button>
                    </th>
                    <th className="text-left p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("status")}
                        className="font-semibold"
                      >
                        Status <ArrowUpDown className="h-4 w-4 ml-1" />
                      </Button>
                    </th>
                    <th className="text-left p-2">Assigned To</th>
                    <th className="text-left p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("createdAt")}
                        className="font-semibold"
                      >
                        Date <ArrowUpDown className="h-4 w-4 ml-1" />
                      </Button>
                    </th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedComplaints.map((complaint) => {
                    const userDetails = getUserDetails(complaint.userId);
                    const assignedAdmin = complaint.assignedTo
                      ? users.find((u) => u.id === complaint.assignedTo)
                      : null;

                    return (
                      <tr
                        key={complaint.id}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {getUserName(complaint.userId)}
                              </div>
                              {userDetails && (
                                <div className="text-sm text-muted-foreground">
                                  {userDetails.flatNumber
                                    ? `Flat ${userDetails.flatNumber}`
                                    : "No flat assigned"}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{complaint.category}</Badge>
                        </td>
                        <td className="p-2">
                          <div
                            className="max-w-xs truncate"
                            title={complaint.description}
                          >
                            {complaint.description}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge
                            className={getPriorityColor(complaint.priority)}
                          >
                            {complaint.priority}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(complaint.status)}
                            <Badge className={getStatusColor(complaint.status)}>
                              {complaint.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-2">
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={complaint.assignedTo || "unassigned"}
                            onChange={(e) =>
                              handleAssignmentUpdate(
                                complaint.id,
                                e.target.value === "unassigned" ? null : e.target.value
                              )
                            }
                          >
                            <option value="unassigned">Unassigned</option>
                            {admins.map((admin) => (
                              <option key={admin.id} value={admin.id}>
                                {admin.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <div className="text-sm text-gray-500">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            {/* View Details */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedComplaint(complaint)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Complaint Details</DialogTitle>
                                </DialogHeader>
                                {selectedComplaint && (
                                  <ComplaintDetailsView
                                    complaint={selectedComplaint}
                                    userDetails={getUserDetails(
                                      selectedComplaint.userId
                                    )}
                                    assignedAdmin={
                                      selectedComplaint.assignedTo
                                        ? users.find(
                                          (u) =>
                                            u.id ===
                                            selectedComplaint.assignedTo
                                        )
                                        : undefined
                                    }
                                    onStatusUpdate={handleStatusUpdate}
                                    onAssignmentUpdate={handleAssignmentUpdate}
                                    admins={admins}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* Edit Complaint */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingComplaint(complaint)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle>Edit Complaint</DialogTitle>
                                </DialogHeader>
                                {editingComplaint && (
                                  <ComplaintEditForm
                                    complaint={editingComplaint}
                                    onSave={handleComplaintEdit}
                                    onCancel={() => setEditingComplaint(null)}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* Delete Complaint */}
                            {onDeleteComplaint && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Complaint
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this
                                      complaint? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleComplaintDelete(complaint.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div >
  );
}

// Complaint Details View Component
function ComplaintDetailsView({
  complaint,
  userDetails,
  assignedAdmin,
  onStatusUpdate,
  onAssignmentUpdate,
  admins,
}: {
  complaint: Complaint;
  userDetails?: UserType;
  assignedAdmin?: UserType;
  onStatusUpdate: (
    complaintId: string,
    newStatus: string,
    response?: string
  ) => Promise<void>;
  onAssignmentUpdate: (
    complaintId: string,
    assignedTo: string | null
  ) => Promise<void>;
  admins: UserType[];
}) {
  const [newStatus, setNewStatus] = useState<Complaint["status"]>(
    complaint.status
  );
  const [adminResponse, setAdminResponse] = useState("");

  const handleStatusUpdate = async () => {
    await onStatusUpdate(complaint.id, newStatus, adminResponse);
    setAdminResponse("");
  };

  return (
    <div className="space-y-6">
      {/* User Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Submitted By</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span>{userDetails?.name || "Unknown User"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-400" />
              <span>
                {userDetails?.flatNumber
                  ? `Flat ${userDetails.flatNumber}`
                  : "No flat assigned"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{userDetails?.phone || "No phone number"}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Complaint Info</h4>
          <div className="space-y-1">
            <div>
              <strong>Category:</strong> {complaint.category}
            </div>
            <div>
              <strong>Priority:</strong> {complaint.priority}
            </div>
            <div>
              <strong>Status:</strong> {complaint.status}
            </div>
            <div>
              <strong>Created:</strong>{" "}
              {new Date(complaint.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h4 className="font-semibold mb-2">Description</h4>
        <p className="text-gray-700 bg-gray-50 p-3 rounded">
          {complaint.description}
        </p>
      </div>

      {/* Current Assignment */}
      <div>
        <h4 className="font-semibold mb-2">Assignment</h4>
        <Select
          value={complaint.assignedTo || "unassigned"}
          onValueChange={(value) =>
            onAssignmentUpdate(
              complaint.id,
              value === "unassigned" ? null : value
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Assign to admin..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {admins.map((admin) => (
              <SelectItem key={admin.id} value={admin.id}>
                {admin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Update */}
      <div>
        <h4 className="font-semibold mb-2">Update Status</h4>
        <div className="space-y-3">
          <Select
            value={newStatus}
            onValueChange={(val) => setNewStatus(val as Complaint["status"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Add admin response (optional)"
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
            rows={3}
          />

          <Button onClick={handleStatusUpdate} className="w-full">
            Update Status
          </Button>
        </div>
      </div>

      {/* Admin Response */}
      {complaint.adminResponse && (
        <div>
          <h4 className="font-semibold mb-2">Admin Response</h4>
          <p className="text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
            {complaint.adminResponse}
          </p>
        </div>
      )}
    </div>
  );
}

// Complaint Edit Form Component
function ComplaintEditForm({
  complaint,
  onSave,
  onCancel,
}: {
  complaint: Complaint;
  onSave: (updates: Partial<Complaint>) => Promise<void>;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState(complaint.category);
  const [description, setDescription] = useState(complaint.description);
  const [priority, setPriority] = useState<Complaint["priority"]>(
    complaint.priority
  );

  const handleSave = async () => {
    await onSave({
      category,
      description,
      priority,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Cleaning">Cleaning</SelectItem>
            <SelectItem value="Security">Security</SelectItem>
            <SelectItem value="Noise">Noise</SelectItem>
            <SelectItem value="Parking">Parking</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <Select
          value={priority}
          onValueChange={(val) => setPriority(val as Complaint["priority"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
}

export default ComplaintsManagement;
