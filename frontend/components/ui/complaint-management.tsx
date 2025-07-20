"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ComplaintCard } from "@/components/ui/complaint-card";
import { AlertTriangle } from "lucide-react";
import type { Complaint, User as UserType } from "@/types/app-types";

interface ComplaintManagementProps {
  complaints: Complaint[];
  users: UserType[];
  onUpdateComplaint: (complaintId: string, updates: Partial<Complaint>) => void;
  currentUser: UserType;
}

export function ComplaintManagement({
  complaints,
  users,
  onUpdateComplaint,
  currentUser,
}: ComplaintManagementProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [updateForm, setUpdateForm] = useState({
    status: "",
    assignedTo: "",
    note: "",
  });

  const getStatusCounts = () => {
    return {
      submitted: complaints.filter((c) => c.status === "submitted").length,
      assigned: complaints.filter((c) => c.status === "assigned").length,
      inProgress: complaints.filter((c) => c.status === "in-progress").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
    };
  };

  const statusCounts = getStatusCounts();

  const handleUpdateComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setUpdateForm({
      status: complaint.status,
      assignedTo: complaint.assignedTo || "",
      note: "",
    });
  };

  const handleSubmitUpdate = () => {
    if (!selectedComplaint) return;

    const updates: Partial<Complaint> = {
      status: updateForm.status as Complaint["status"],
      assignedTo: updateForm.assignedTo || undefined,
      updates: [
        ...selectedComplaint.updates,
        {
          id: Date.now().toString(),
          complaintId: selectedComplaint.id,
          status: updateForm.status,
          note: updateForm.note,
          updatedBy: currentUser.id,
          updatedAt: new Date(),
        },
      ],
    };

    onUpdateComplaint(selectedComplaint.id, updates);
    setSelectedComplaint(null);
    setUpdateForm({ status: "", assignedTo: "", note: "" });
  };

  const handleResolveComplaint = (complaintId: string) => {
    const complaint = complaints.find((c) => c.id === complaintId);
    if (!complaint) return;

    const updates: Partial<Complaint> = {
      status: "resolved",
      updates: [
        ...complaint.updates,
        {
          id: Date.now().toString(),
          complaintId: complaintId,
          status: "resolved",
          note: "Complaint has been resolved",
          updatedBy: currentUser.id,
          updatedAt: new Date(),
        },
      ],
    };

    onUpdateComplaint(complaintId, updates);
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-muted/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.submitted}
            </div>
            <div className="text-sm text-blue-700">Submitted</div>
          </CardContent>
        </Card>
                <Card className="border-0 shadow-sm bg-warning/10 border-warning/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning-foreground">
              {complaints.filter(c => c.status === 'assigned').length}
            </div>
            <div className="text-sm text-warning-foreground">Assigned</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-warning/20 border-warning/30">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning-foreground">
              {complaints.filter(c => c.status === 'in-progress').length}
            </div>
            <div className="text-sm text-warning-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.resolved}
            </div>
            <div className="text-sm text-green-700">Resolved</div>
          </CardContent>
        </Card>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Complaints
              </h3>
              <p className="text-muted-foreground">
                No complaints have been submitted yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          complaints.map((complaint) => {
            const complaintUser = users.find((u) => u.id === complaint.userId);
            return (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                user={complaintUser}
                showActions
                onUpdate={() => handleUpdateComplaint(complaint)}
                onResolve={() => handleResolveComplaint(complaint.id)}
              />
            );
          })
        )}
      </div>

      {/* Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Update Complaint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={updateForm.status}
                  onValueChange={(value) =>
                    setUpdateForm((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select
                  value={updateForm.assignedTo}
                  onValueChange={(value) =>
                    setUpdateForm((prev) => ({ ...prev, assignedTo: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maintenance Team">
                      Maintenance Team
                    </SelectItem>
                    <SelectItem value="Electrician Team">
                      Electrician Team
                    </SelectItem>
                    <SelectItem value="Plumber Team">Plumber Team</SelectItem>
                    <SelectItem value="Security Team">Security Team</SelectItem>
                    <SelectItem value="Cleaning Team">Cleaning Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Update Note</Label>
                <Textarea
                  placeholder="Add a note about this update..."
                  value={updateForm.note}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSubmitUpdate} className="flex-1">
                  Update Complaint
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
