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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bill, User, Building } from "@/types/app-types";
import { format } from "date-fns";
import { Printer, Search, Filter } from "lucide-react";

interface BillingHistoryProps {
    bills: Bill[];
    users: User[];
    buildings: Building[];
}

export function BillingHistory({ bills, users, buildings }: BillingHistoryProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [buildingFilter, setBuildingFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Helper to get names
    const getUserName = (userId: string) => {
        const user = users.find((u) => u.id === userId);
        return user ? user.name : "Unknown User";
    };

    const getBuildingName = (buildingId: string) => {
        const building = buildings.find((b) => b.id === buildingId);
        return building ? building.name : "Unknown Building";
    };

    const getFlatNumber = (userId: string) => {
        const user = users.find((u) => u.id === userId);
        return user?.flatNumber ? `Flat ${user.flatNumber}` : "-";
    };

    // Filter Logic
    const filteredBills = bills.filter((bill) => {
        const userName = getUserName(bill.userId).toLowerCase();
        const buildingName = getBuildingName(bill.buildingId).toLowerCase();
        const search = searchTerm.toLowerCase();

        const matchesSearch = userName.includes(search) ||
            buildingName.includes(search) ||
            bill.description?.toLowerCase().includes(search);

        const matchesBuilding = buildingFilter === "all" || bill.buildingId === buildingFilter;
        const matchesStatus = statusFilter === "all" || bill.status === statusFilter;

        return matchesSearch && matchesBuilding && matchesStatus;
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <Card className="animate-fade-in">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Billing History</CardTitle>
                        <CardDescription>
                            View and manage payment records for all residents
                        </CardDescription>
                    </div>
                    <Button onClick={handlePrint} variant="outline" className="gap-2">
                        <Printer className="h-4 w-4" />
                        Print Statement
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search resident, building..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by Building" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Buildings</SelectItem>
                            {buildings.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Resident</TableHead>
                                <TableHead>Flat / Building</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBills.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        No billing records found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBills.map((bill) => {
                                    let dateLabel = "Invalid Date";
                                    try {
                                        dateLabel = format(new Date(bill.dueDate), "dd MMM yyyy");
                                    } catch (e) { }

                                    return (
                                        <TableRow key={bill.id}>
                                            <TableCell className="font-medium">
                                                {dateLabel}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{getUserName(bill.userId)}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs">{getFlatNumber(bill.userId)}</div>
                                                <div className="text-xs text-muted-foreground">{getBuildingName(bill.buildingId)}</div>
                                            </TableCell>
                                            <TableCell>{bill.title || bill.description || "Bill"}</TableCell>
                                            <TableCell>₹{(bill.totalAmount || 0).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        bill.status === "paid"
                                                            ? "default" // success
                                                            : bill.status === "pending"
                                                                ? "secondary" // warning
                                                                : "destructive"
                                                    }
                                                >
                                                    {bill.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
