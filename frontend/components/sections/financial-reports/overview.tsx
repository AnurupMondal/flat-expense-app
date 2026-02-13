"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bill } from "@/types/app-types";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

interface FinancialOverviewProps {
    bills: Bill[];
}

export function FinancialOverview({ bills }: FinancialOverviewProps) {
    // Calculate statistics from bills
    const totalBilled = bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const totalCollected = bills
        .filter((b) => b.status === "paid")
        .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const totalPending = bills
        .filter((b) => b.status === "pending" || b.status === "overdue")
        .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

    const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    // Group by month (simplified)
    const monthlyData = bills.reduce((acc, bill) => {
        let month = "Unknown";
        try {
            month = format(new Date(bill.dueDate), "MMM yyyy");
        } catch (e) {
            console.error("Invalid date for bill", bill);
        }

        if (!acc[month]) {
            acc[month] = {
                name: month,
                billed: 0,
                collected: 0,
                pending: 0,
                bills: [],
            };
        }
        acc[month].billed += (bill.totalAmount || 0);
        if (bill.status === "paid") acc[month].collected += (bill.totalAmount || 0);
        else acc[month].pending += (bill.totalAmount || 0);
        acc[month].bills.push(bill);
        return acc;
    }, {} as Record<string, any>);

    const months = Object.values(monthlyData).sort(
        (a: any, b: any) => {
            if (a.name === "Unknown") return 1;
            if (b.name === "Unknown") return -1;
            return new Date(b.name).getTime() - new Date(a.name).getTime();
        }
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalBilled.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Lifetime bill generation</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Collected</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₹{totalCollected.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {collectionRate.toFixed(1)}% collection rate
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ₹{totalPending.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Unpaid or overdue bills
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{bills.length}</div>
                        <p className="text-xs text-muted-foreground">Total bills generated</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Monthly Breakdown</CardTitle>
                    <CardDescription>
                        Financial performance by billing period
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period</TableHead>
                                <TableHead>Billed</TableHead>
                                <TableHead>Collected</TableHead>
                                <TableHead>Pending</TableHead>
                                <TableHead className="text-right">Collection Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {months.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">No data available</TableCell>
                                </TableRow>
                            ) : (
                                months.map((month: any) => (
                                    <TableRow key={month.name}>
                                        <TableCell className="font-medium">{month.name}</TableCell>
                                        <TableCell>₹{(month.billed || 0).toLocaleString()}</TableCell>
                                        <TableCell className="text-green-600">
                                            ₹{(month.collected || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-red-600">
                                            ₹{(month.pending || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                variant={
                                                    month.collected === month.billed
                                                        ? "default"
                                                        : month.collected > month.billed * 0.5
                                                            ? "secondary"
                                                            : "destructive"
                                                }
                                            >
                                                {Math.round((month.collected / (month.billed || 1)) * 100)}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
