"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Building2, Plus, UserPlus, Users, X, Edit, Trash2, User } from "lucide-react";
import { adminAssignmentsApi, buildingsApi } from "@/lib/api";
import type { Building } from "@/types/app-types";

interface Admin {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

interface AdminAssignment {
    id: string;
    admin_id: string;
    building_id: string;
    admin_name: string;
    admin_email: string;
    assigned_at: string;
}

interface BuildingManagementProps {
    initialBuildings?: Building[];
    onBuildingsChange?: (buildings: Building[]) => void;
}

export default function BuildingManagement({
    initialBuildings = [],
    onBuildingsChange,
}: BuildingManagementProps) {
    const { toast } = useToast();
    const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
    const [assignments, setAssignments] = useState<AdminAssignment[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(false);

    // Building form state
    const [showAddBuilding, setShowAddBuilding] = useState(false);
    const [buildingForm, setBuildingForm] = useState({
        name: "",
        address: "",
        totalUnits: "",
    });



    // Building Management Dialog State
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    const [selectedAdminForAssign, setSelectedAdminForAssign] = useState("");

    useEffect(() => {
        if (initialBuildings.length > 0) {
            setBuildings(initialBuildings);
        }
        loadAssignments();
        loadAdmins();
    }, [initialBuildings]);

    const loadAssignments = async () => {
        try {
            const response = await adminAssignmentsApi.getAssignments();
            if (response && response.success) {
                const data = Array.isArray(response.data) ? response.data : (response.data as any)?.assignments || [];
                setAssignments(data);
            }
        } catch (error) {
            console.error("Failed to load assignments:", error);
        }
    };

    const loadAdmins = async () => {
        try {
            const response = await adminAssignmentsApi.getAvailableAdmins();
            if (response && response.success) {
                const data = Array.isArray(response.data) ? response.data : (response.data as any)?.admins || (response.data as any)?.data || [];
                setAdmins(data);
            }
        } catch (error) {
            console.error("Failed to load admins:", error);
        }
    };

    const handleCreateBuilding = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const units = parseInt(buildingForm.totalUnits);
            if (isNaN(units) || units <= 0) {
                toast({ title: "Error", description: "Total units must be a positive number", variant: "destructive" });
                setLoading(false);
                return;
            }

            const response = await buildingsApi.create({
                name: buildingForm.name,
                address: buildingForm.address,
                total_units: units,
                admin_id: "",
            } as any);

            const mappedBuilding = response ? {
                ...response,
                totalUnits: (response as any).total_units || response.totalUnits,
                adminId: (response as any).admin_id || response.adminId || "",
                createdAt: (response as any).created_at || response.createdAt,
            } : null;

            if (mappedBuilding) {
                toast({
                    title: "Success",
                    description: "Building created successfully",
                });
                setBuildings([...buildings, mappedBuilding]);
                if (onBuildingsChange) {
                    onBuildingsChange([...buildings, mappedBuilding]);
                }
                setBuildingForm({ name: "", address: "", totalUnits: "" });
                setShowAddBuilding(false);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to create building",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Failed to create building:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create building",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };



    const handleAssignAdmin = async () => {
        if (!selectedBuilding || !selectedAdminForAssign) {
            console.log("Missing building or admin selection");
            return;
        }

        setLoading(true);
        try {
            console.log("Assigning admin:", { adminId: selectedAdminForAssign, buildingId: selectedBuilding.id });
            const response = await adminAssignmentsApi.assignAdmin(
                selectedAdminForAssign,
                selectedBuilding.id
            );
            console.log("Assign response:", response);

            if (response && response.success) {
                toast({
                    title: "Success",
                    description: "Admin assigned successfully",
                });
                setSelectedAdminForAssign("");
                await loadAssignments();
            } else {
                console.error("Assign failed:", response);
                toast({
                    title: "Error",
                    description: (response as any).error || "Failed to assign admin",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Execption in assign:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to assign admin",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAssignment = async (assignmentId: string) => {
        // Prevent event bubbling if called from card view (though we moved to dialog now)
        setLoading(true);
        try {
            const response = await adminAssignmentsApi.removeAssignment(assignmentId);

            if (response.success) {
                toast({
                    title: "Success",
                    description: "Admin removed from building",
                });
                loadAssignments();
            } else {
                toast({
                    title: "Error",
                    description: response.error || "Failed to remove assignment",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to remove assignment",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Get assignments for a specific building
    const getAssignmentsForBuilding = (buildingId: string) => {
        return assignments.filter((a) => a.building_id === buildingId);
    };

    // Get admins already assigned to current selected building (for filtering)
    const adminsForCurrentBuilding = selectedBuilding
        ? assignments
            .filter((a) => a.building_id === selectedBuilding.id)
            .map((a) => a.admin_id)
        : [];

    // Filter available admins for assignment
    const availableAdmins = selectedBuilding
        ? admins.filter((admin) => !adminsForCurrentBuilding.includes(admin.id))
        : admins;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Building Management</h2>
                    <p className="text-muted-foreground">
                        Manage buildings and their admin assignments
                    </p>
                </div>

                <div className="flex gap-2">


                    <Dialog open={showAddBuilding} onOpenChange={setShowAddBuilding}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Building
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Building</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateBuilding} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Building Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Sunrise Apartments"
                                        value={buildingForm.name}
                                        onChange={(e) =>
                                            setBuildingForm({ ...buildingForm, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        placeholder="Full address"
                                        value={buildingForm.address}
                                        onChange={(e) =>
                                            setBuildingForm({ ...buildingForm, address: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="units">Total Units</Label>
                                    <Input
                                        id="units"
                                        type="number"
                                        placeholder="Number of units"
                                        value={buildingForm.totalUnits}
                                        onChange={(e) =>
                                            setBuildingForm({ ...buildingForm, totalUnits: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAddBuilding(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? "Creating..." : "Create Building"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Buildings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buildings.map((building) => {
                    const buildingAssignments = getAssignmentsForBuilding(building.id);

                    return (
                        <Card
                            key={building.id}
                            className="hover:shadow-lg transition-all cursor-pointer border-transparent hover:border-primary/20"
                            onClick={() => setSelectedBuilding(building)}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-primary" />
                                            {building.name}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {building.address}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total Units</span>
                                    <Badge variant="secondary">{building.totalUnits}</Badge>
                                </div>

                                <Separator />

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            Assigned Admins
                                        </span>
                                        <Badge variant={buildingAssignments.length > 0 ? "default" : "outline"}>
                                            {buildingAssignments.length}
                                        </Badge>
                                    </div>

                                    {buildingAssignments.length > 0 ? (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {buildingAssignments.slice(0, 3).map(a => (
                                                <Badge key={a.id} variant="secondary" className="text-xs">
                                                    {a.admin_name}
                                                </Badge>
                                            ))}
                                            {buildingAssignments.length > 3 && (
                                                <Badge variant="secondary" className="text-xs">+{buildingAssignments.length - 3}</Badge>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic mt-1">No admins assigned</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {buildings.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center mb-4">
                            No buildings yet. Create your first building to get started.
                        </p>
                        <Button onClick={() => setShowAddBuilding(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Building
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Building Management Dialog */}
            <Dialog open={!!selectedBuilding} onOpenChange={(open) => !open && setSelectedBuilding(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Manage Building: {selectedBuilding?.name}</DialogTitle>
                        <DialogDescription>{selectedBuilding?.address}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Current Admins List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Current Admins
                            </h3>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                                {selectedBuilding && getAssignmentsForBuilding(selectedBuilding.id).length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No admins currently assigned to this building.
                                    </p>
                                ) : (
                                    selectedBuilding && getAssignmentsForBuilding(selectedBuilding.id).map((assignment) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{assignment.admin_name}</p>
                                                    <p className="text-xs text-muted-foreground">{assignment.admin_email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemoveAssignment(assignment.id)}
                                                disabled={loading}
                                            >
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">Remove</span>
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Add New Admin Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Assign New Admin
                            </h3>
                            <div className="flex gap-2 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="admin-select">Select Admin</Label>
                                    <Select
                                        value={selectedAdminForAssign}
                                        onValueChange={setSelectedAdminForAssign}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose an admin to assign..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableAdmins.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    No available admins to assign
                                                </div>
                                            ) : (
                                                availableAdmins.map((admin) => (
                                                    <SelectItem key={admin.id} value={admin.id}>
                                                        {admin.name} ({admin.email})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleAssignAdmin}
                                    disabled={!selectedAdminForAssign || loading}
                                >
                                    {loading ? "Assigning..." : "Assign Admin"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedBuilding(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
