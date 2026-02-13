"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Download,
    FileSpreadsheet,
    Building as BuildingIcon,
    FileText
} from "lucide-react";
import type { User, Building, Bill, Complaint } from "@/types/app-types";
import { format } from "date-fns";
import { useState } from "react";

interface ExportDataProps {
    users: User[];
    buildings: Building[];
    bills: Bill[];
    complaints: Complaint[];
}

export function ExportData({
    users,
    buildings,
    bills,
    complaints,
}: ExportDataProps) {
    const [isExporting, setIsExporting] = useState(false);

    const exportToCSV = (data: any[], filename: string) => {
        setIsExporting(true);
        if (!data || data.length === 0) {
            alert("No data available to export");
            setIsExporting(false);
            return;
        }

        try {
            // Get all unique keys from all objects to ensure complete headers
            const allKeys = Array.from(new Set(data.flatMap(Object.keys)));

            const csvContent = [
                allKeys.join(","), // Header row
                ...data.map((row) =>
                    allKeys
                        .map((header) => {
                            const value = row[header];
                            if (value === null || value === undefined) return "";
                            if (typeof value === "object") {
                                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                            }
                            return `"${String(value).replace(/"/g, '""')}"`;
                        })
                        .join(",")
                ),
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export data");
        } finally {
            setIsExporting(false);
        }
    };

    const exportOptions = [
        {
            title: "Users Data",
            description: "Export full list of residents and admins including contact info.",
            count: users.length,
            onExport: () => exportToCSV(users, "users_export"),
            icon: FileText,
        },
        {
            title: "Buildings Data",
            description: "Export building details and unit counts.",
            count: buildings.length,
            onExport: () => exportToCSV(buildings, "buildings_export"),
            icon: BuildingIcon,
        },
        {
            title: "Financial Records",
            description: "Export bill history, payments, and dues.",
            count: bills.length,
            onExport: () => exportToCSV(bills, "bills_export"),
            icon: FileSpreadsheet,
        },
        {
            title: "Complaints Log",
            description: "Export all complaints and their resolution status.",
            count: complaints.length,
            onExport: () => exportToCSV(complaints, "complaints_export"),
            icon: FileSpreadsheet,
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2">
                {exportOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="grid gap-1">
                                    <CardTitle className="text-lg">{option.title}</CardTitle>
                                    <CardDescription>{option.count} records available</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {option.description}
                                </p>
                                <Button
                                    onClick={option.onExport}
                                    className="w-full"
                                    variant="outline"
                                    disabled={isExporting || option.count === 0}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    {isExporting ? "Exporting..." : "Download CSV"}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Export History</CardTitle>
                    <CardDescription>Recent data export activities</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        <Download className="h-8 w-8 mb-2 opacity-50" />
                        <p>No recent export history found.</p>
                        <p className="text-xs mt-1">Exports are generated client-side and not stored.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
