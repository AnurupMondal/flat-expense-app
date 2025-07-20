"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle, Clock, CheckCircle, User } from "lucide-react";
import type { Complaint, User as UserType } from "@/types/app-types";

interface ComplaintCardProps {
  complaint: Complaint;
  user?: UserType;
  showActions?: boolean;
  onUpdate?: (complaintId: string) => void;
  onResolve?: (complaintId: string) => void;
  className?: string;
}

export function ComplaintCard({
  complaint,
  user,
  showActions = false,
  onUpdate,
  onResolve,
  className = "",
}: ComplaintCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "bg-primary/10 text-primary border-primary/20";
      case "assigned":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "in-progress":
        return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "medium":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "low":
        return "bg-success/20 text-success border-success/30";
      case "emergency":
        return "bg-destructive text-destructive-foreground animate-pulse border-destructive";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return <Clock className="w-4 h-4" />;
      case "assigned":
        return <User className="w-4 h-4" />;
      case "in-progress":
        return <AlertTriangle className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`border-0 shadow-sm bg-card ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="font-mono text-xs">
                {complaint.id}
              </Badge>
              <Badge className={getPriorityColor(complaint.priority)}>
                {complaint.priority}
              </Badge>
              <Badge className={getStatusColor(complaint.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(complaint.status)}
                  {complaint.status}
                </span>
              </Badge>
            </div>
            <CardTitle className="text-lg">{complaint.category}</CardTitle>
            {user && (
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {user.flatNumber || user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {user.name} - Flat {user.flatNumber}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground">{complaint.description}</p>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Created: {complaint.createdAt.toLocaleDateString()}</span>
          {complaint.assignedTo && (
            <span>Assigned to: {complaint.assignedTo}</span>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdate?.(complaint.id)}
              className="flex-1"
            >
              Update Status
            </Button>
            {complaint.status !== "resolved" && (
              <Button
                size="sm"
                className="bg-success hover:bg-success/90"
                onClick={() => onResolve?.(complaint.id)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Resolve
              </Button>
            )}
          </div>
        )}

        {complaint.updates.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium text-muted-foreground">
              Latest Update:
            </p>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={getStatusColor(
                      complaint.updates[complaint.updates.length - 1].status
                    )}
                    variant="outline"
                  >
                    {complaint.updates[complaint.updates.length - 1].status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {complaint.updates[
                      complaint.updates.length - 1
                    ].updatedAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-1">
                  {complaint.updates[complaint.updates.length - 1].note}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
