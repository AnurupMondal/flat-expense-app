"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Receipt, CreditCard, Calendar, AlertCircle } from "lucide-react";
import type { Bill, User } from "@/types/app-types";

interface BillCardProps {
  bill: Bill;
  user?: User;
  showActions?: boolean;
  onPay?: (billId: string) => void;
  onDownload?: (billId: string) => void;
  className?: string;
}

export function BillCard({
  bill,
  user,
  showActions = true,
  onPay,
  onDownload,
  className = "",
}: BillCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-success";
      case "pending":
        return "text-warning";
      case "overdue":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const isOverdue = bill.status === "pending" && new Date() > bill.dueDate;
  const daysUntilDue = Math.ceil(
    (bill.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className={`hover-lift ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">
                {bill.month} {bill.year} Bill
              </span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Due: {bill.dueDate.toLocaleDateString()}
              </span>
              {isOverdue && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              )}
              {!isOverdue && bill.status === "pending" && daysUntilDue <= 3 && (
                <Badge
                  variant="secondary"
                  className="bg-warning/20 text-warning"
                >
                  Due in {daysUntilDue} days
                </Badge>
              )}
            </div>
          </div>
          <Badge
            variant={getStatusVariant(bill.status)}
            className="flex-shrink-0"
          >
            {bill.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {user && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{user.name}</span> - Flat{" "}
            {user.flatNumber}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Bill Breakdown</h4>
          <div className="space-y-1">
            {bill.breakdown?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.item}</span>
                <span className="font-medium">
                  ₹{item.amount.toLocaleString()}
                </span>
              </div>
            )) || (
              <>
                {bill.rentAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rent</span>
                    <span className="font-medium">
                      ₹{bill.rentAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                {bill.maintenanceAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Maintenance</span>
                    <span className="font-medium">
                      ₹{bill.maintenanceAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span className={`text-lg ${getStatusColor(bill.status)}`}>
                ₹{bill.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {bill.status === "paid" && bill.paidAt && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium">
                Paid on {bill.paidAt.toLocaleDateString()}
              </span>
            </div>
            {bill.paymentMethod && (
              <p className="text-sm text-green-600 mt-1">
                via {bill.paymentMethod}
                {bill.transactionId && ` • ${bill.transactionId}`}
              </p>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2">
            {bill.status === "pending" && (
              <Button
                className="flex-1 bg-success hover:bg-success/90"
                onClick={() => onPay?.(bill.id)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onDownload?.(bill.id)}
              className="bg-transparent"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
