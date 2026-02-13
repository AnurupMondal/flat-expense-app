"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Analytics } from "@/types/app-types";
import {
    Building2,
    Users,
    DollarSign,
    AlertCircle,
    TrendingUp,
    Download
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsViewProps {
    data: Analytics;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ data }) => {
    // Prepare data for charts
    const revenueData = data.revenue.monthly.map((m) => ({
        name: m.month,
        billed: m.amount,
        collected: m.collected,
    }));

    const complaintStatusData = data.complaints.byStatus.map((s) => ({
        name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
        value: s.count,
    }));

    const complaintCategoryData = data.complaints.byCategory.map((c) => ({
        name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
        count: c.count,
        resolved: c.resolved,
    }));

    const userData = [
        { name: "Approved", value: data.users.approved },
        { name: "Pending", value: data.users.pending },
        { name: "Rejected", value: data.users.rejected },
    ];

    return (
        <div className="space-y-6">
            {/* Overview Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Occupancy Rate</p>
                                <h3 className="text-3xl font-bold mt-1 text-indigo-600">{data.occupancy.rate}%</h3>
                            </div>
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <Building2 className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{data.occupancy.occupied} Occupied</span>
                            <span>{data.occupancy.vacant} Vacant</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                                <h3 className="text-3xl font-bold mt-1 text-emerald-600">
                                    ₹{Object.values(data.revenue.yearly)[0]?.total.toLocaleString() || 0}
                                </h3>
                            </div>
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <DollarSign className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                            <span>₹{Object.values(data.revenue.yearly)[0]?.collected.toLocaleString() || 0} collected</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Users</p>
                                <h3 className="text-3xl font-bold mt-1 text-purple-600">{data.users.total}</h3>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div> {data.users.approved} Active</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Tasks</p>
                                <h3 className="text-3xl font-bold mt-1 text-orange-600">
                                    {data.complaints.byStatus.find(s => s.status === 'open')?.count || 0}
                                </h3>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <AlertCircle className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground">
                            Across all categories
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <Card className="shadow-modern overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Revenue Analytics</CardTitle>
                            <CardDescription>Monthly billing vs collection trends</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                            <Download className="h-3.5 w-3.5" />
                            <span>Export</span>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Area
                                        type="monotone"
                                        dataKey="billed"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorBilled)"
                                        name="Total Billed"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="collected"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCollected)"
                                        name="Total Collected"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Complaints Categories */}
                <Card className="shadow-modern overflow-hidden">
                    <CardHeader>
                        <CardTitle>Complaint Categories</CardTitle>
                        <CardDescription>Distribution of issues by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={complaintCategoryData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Bar dataKey="count" name="Total Filed" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                    <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Complaint Status Distribution */}
                <Card className="shadow-modern overflow-hidden">
                    <CardHeader>
                        <CardTitle>Complaint Status</CardTitle>
                        <CardDescription>Resolution progress overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={complaintStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {complaintStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* User Status */}
                <Card className="shadow-modern overflow-hidden">
                    <CardHeader>
                        <CardTitle>User Demographics</CardTitle>
                        <CardDescription>Account status distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userData}
                                        cx="50%"
                                        cy="50%"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {userData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
