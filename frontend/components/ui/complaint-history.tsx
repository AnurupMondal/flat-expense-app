import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Input } from "./input";
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
} from "./dialog";
import { Complaint } from "../../types/app-types";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  MessageSquare,
  Filter,
  Eye,
  AlertCircle,
} from "lucide-react";

interface ComplaintHistoryProps {
  currentUser: any;
  complaints: Complaint[]; // Accept complaints as prop instead of fetching
}

export function ComplaintHistory({
  currentUser,
  complaints: propComplaints,
}: ComplaintHistoryProps) {
  const [complaints, setComplaints] = useState<Complaint[]>(propComplaints);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );

  // Update complaints when props change
  useEffect(() => {
    console.log("🔍 ComplaintHistory received props:", {
      propComplaints,
      currentUser,
    });
    console.log(
      "🔍 ComplaintHistory propComplaints count:",
      propComplaints?.length
    );
    console.log("🔍 ComplaintHistory currentUser:", currentUser);
    if (propComplaints) {
      // Filter complaints for current user if resident
      let userComplaints = propComplaints;

      // TEMPORARY: Skip filtering to see all complaints
      console.log("🔍 TEMPORARY: Showing all complaints regardless of user");

      /* Original filtering logic:
      if (currentUser?.role === 'resident') {
        console.log('🔍 Filtering complaints for resident user ID:', currentUser.id);
        userComplaints = propComplaints.filter((c: Complaint) => c.userId === currentUser.id);
        console.log('🔍 Filtered complaints for resident:', userComplaints);
      }
      */

      console.log("🔍 Final user complaints to set:", userComplaints);
      setComplaints(userComplaints);
    } else {
      console.log("🔍 No propComplaints provided, setting empty array");
      setComplaints([]);
    }
  }, [propComplaints, currentUser]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="h-4 w-4" />;
      case "assigned":
        return <AlertTriangle className="h-4 w-4" />;
      case "in-progress":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "emergency":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "submitted":
        return 20;
      case "assigned":
        return 40;
      case "in-progress":
        return 70;
      case "resolved":
        return 100;
      default:
        return 0;
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      searchTerm === "" ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || complaint.category === categoryFilter;
    const matchesPriority =
      priorityFilter === "all" || complaint.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  console.log("🔍 Filtering details:", {
    complaintsInput: complaints,
    complaintsCount: complaints.length,
    searchTerm,
    statusFilter,
    categoryFilter,
    priorityFilter,
    filteredComplaints,
    filteredCount: filteredComplaints.length,
  });

  const categories = [...new Set(complaints.map((c) => c.category))];

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
          <h2 className="text-2xl font-bold">Complaint History</h2>
          <p className="text-muted-foreground">
            Track the status and progress of your complaints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredComplaints.length} complaint
            {filteredComplaints.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
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
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No complaints found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ||
              statusFilter !== "all" ||
              categoryFilter !== "all" ||
              priorityFilter !== "all"
                ? "Try adjusting your filters to see more results."
                : "You haven't submitted any complaints yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredComplaints.map((complaint) => (
            <Card
              key={complaint.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Category and Priority */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-sm">
                        {complaint.category}
                      </Badge>
                      <Badge
                        className={`text-xs ${getPriorityColor(
                          complaint.priority
                        )}`}
                      >
                        {complaint.priority}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-gray-900 line-clamp-2">
                      {complaint.description}
                    </p>

                    {/* Status and Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(complaint.status)}
                        <Badge
                          className={`text-xs ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {complaint.status}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${getProgressPercentage(
                              complaint.status
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {formatDate(complaint.createdAt)}</span>
                      </div>
                      {complaint.assignedTo && (
                        <span>Assigned to: {complaint.assignedTo}</span>
                      )}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedComplaint(complaint)}
                        className="shrink-0"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Complaint Details</DialogTitle>
                      </DialogHeader>
                      {selectedComplaint && (
                        <div className="space-y-6">
                          {/* Header Info */}
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-sm">
                                {selectedComplaint.category}
                              </Badge>
                              <Badge
                                className={`text-xs ${getPriorityColor(
                                  selectedComplaint.priority
                                )}`}
                              >
                                {selectedComplaint.priority}
                              </Badge>
                              <Badge
                                className={`text-xs ${getStatusColor(
                                  selectedComplaint.status
                                )}`}
                              >
                                {selectedComplaint.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {selectedComplaint.description}
                            </p>
                          </div>

                          {/* Timeline */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-1">Created</h4>
                              <p className="text-muted-foreground">
                                {formatDate(selectedComplaint.createdAt)}
                              </p>
                            </div>
                            {selectedComplaint.assignedTo && (
                              <div>
                                <h4 className="font-semibold mb-1">
                                  Assigned To
                                </h4>
                                <p className="text-muted-foreground">
                                  {selectedComplaint.assignedTo}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Progress Visualization */}
                          <div>
                            <h4 className="font-semibold mb-3">Progress</h4>
                            <div className="space-y-3">
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${getProgressPercentage(
                                      selectedComplaint.status
                                    )}%`,
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Submitted</span>
                                <span>Assigned</span>
                                <span>In Progress</span>
                                <span>Resolved</span>
                              </div>
                            </div>
                          </div>

                          {/* Updates */}
                          {selectedComplaint.updates &&
                            selectedComplaint.updates.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-3">Updates</h4>
                                <div className="space-y-3">
                                  {selectedComplaint.updates.map(
                                    (update, index) => (
                                      <div
                                        key={update.id || index}
                                        className="border-l-2 border-blue-200 pl-4"
                                      >
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {update.status}
                                          </Badge>
                                          <span className="text-sm text-muted-foreground">
                                            {formatDate(update.updatedAt)}
                                          </span>
                                        </div>
                                        <p className="text-sm">{update.note}</p>
                                        {update.updatedBy && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Updated by: {update.updatedBy}
                                          </p>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Attachments */}
                          {selectedComplaint.attachments &&
                            selectedComplaint.attachments.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-3">
                                  Attachments
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {selectedComplaint.attachments.map(
                                    (attachment, index) => (
                                      <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        className="justify-start"
                                        onClick={() =>
                                          window.open(attachment, "_blank")
                                        }
                                      >
                                        📎 Attachment {index + 1}
                                      </Button>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
