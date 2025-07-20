"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Upload } from "lucide-react";
import type { Complaint, User } from "@/types/app-types";

interface ComplaintFormProps {
  currentUser: User;
  onSubmit: (
    complaint: Omit<Complaint, "id" | "createdAt" | "updates">
  ) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const COMPLAINT_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Security",
  "Cleaning",
  "Maintenance",
  "Noise",
  "Parking",
  "Elevator",
  "Water Supply",
  "Garbage Collection",
  "Other",
];

const PRIORITY_LEVELS = [
  { value: "low", label: "Low", description: "Non-urgent issue" },
  { value: "medium", label: "Medium", description: "Moderate urgency" },
  { value: "high", label: "High", description: "Urgent attention needed" },
  {
    value: "emergency",
    label: "Emergency",
    description: "Immediate action required",
  },
];

export function ComplaintForm({
  currentUser,
  onSubmit,
  onCancel,
  isLoading = false,
}: ComplaintFormProps) {
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "emergency",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.category || !formData.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.description.trim().length < 10) {
      setError(
        "Please provide a more detailed description (at least 10 characters)"
      );
      return;
    }

    try {
      const complaint: Omit<Complaint, "id" | "createdAt" | "updates"> = {
        userId: currentUser.id,
        buildingId: currentUser.buildingId!,
        category: formData.category,
        description: formData.description.trim(),
        priority: formData.priority,
        status: "submitted",
        assignedTo: undefined,
        attachments: [],
      };

      await onSubmit(complaint);

      // Reset form
      setFormData({
        category: "",
        description: "",
        priority: "medium",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit complaint"
      );
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Submit New Complaint
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select complaint category" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level *</Label>
              <Select
                value={formData.priority}
                onValueChange={(
                  value: "low" | "medium" | "high" | "emergency"
                ) => setFormData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div>
                        <div className="font-medium">{priority.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {priority.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide a detailed description of the issue..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 characters (minimum 10 required)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag and drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported: JPG, PNG, PDF (Max 5MB each)
              </p>
            </div>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Submitting..." : "Submit Complaint"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
