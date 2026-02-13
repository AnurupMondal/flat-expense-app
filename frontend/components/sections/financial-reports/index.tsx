"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialOverview } from "./overview";
import { BillingHistory } from "./billing-history";
import { Bill, User, Building } from "@/types/app-types";

export interface FinancialReportsProps {
    bills: Bill[];
    users: User[];
    buildings: Building[];
}

export const FinancialReports = ({ bills, users, buildings }: FinancialReportsProps) => {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="billing">Billing History</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <FinancialOverview bills={bills} />
                </TabsContent>
                <TabsContent value="billing" className="space-y-4">
                    <BillingHistory bills={bills} users={users} buildings={buildings} />
                </TabsContent>
            </Tabs>
        </div>
    );
};
