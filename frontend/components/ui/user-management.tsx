"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Check,
  X,
  UserPlus,
  Clock,
  Shield,
  Home,
  Settings,
  Eye,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import type { User, Building } from "@/types/app-types";

interface UserManagementProps {
  users: User[];
  buildings: Building[];
  currentUser: User;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onApproveUser: (userId: string) => void;
  onRejectUser: (userId: string) => void;
}

export function UserManagement({
  users,
  buildings,
  currentUser,
  onUpdateUser,
  onDeleteUser,
  onApproveUser,
  onRejectUser,
}: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({});

  // Filter users based on current user's permissions
  const getFilteredUsers = () => {
    let filteredUsers = users;

    // Super admins can see all users, admins can only see their building users
    if (currentUser.role === "admin") {
      filteredUsers = users.filter(
        (user) =>
          user.buildingId === currentUser.buildingId ||
          user.role === "super-admin"
      );
    }

    // Apply search filter
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.flatNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === statusFilter
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.role === roleFilter);
    }

    // Apply building filter
    if (buildingFilter !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.buildingId === buildingFilter
      );
    }

    return filteredUsers;
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      flatNumber: user.flatNumber,
      buildingId: user.buildingId,
      role: user.role,
      rentEnabled: user.rentEnabled,
      maintenanceEnabled: user.maintenanceEnabled,
    });
  };

  const handleUpdateUser = () => {
    if (editingUser && userFormData) {
      onUpdateUser(editingUser.id, userFormData);
      setEditingUser(null);
      setUserFormData({});
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
    } as const;

    const colors = {
      approved: "text-success bg-success/20",
      pending: "text-warning bg-warning/20",
      rejected: "text-destructive bg-destructive/20",
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      "super-admin": "text-purple-700 bg-purple-100",
      admin: "text-orange-700 bg-orange-100",
      resident: "text-blue-700 bg-blue-100",
    };

    return (
      <Badge variant="outline" className={colors[role as keyof typeof colors]}>
        {role === "super-admin"
          ? "Super Admin"
          : role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const pendingUsers = users.filter((u) => u.status === "pending");
  const filteredUsers = getFilteredUsers();

  return (
    <div className="content-spacing">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl lg:text-3xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-warning/20 rounded-lg">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Approval
                </p>
                <p className="text-2xl lg:text-3xl font-bold">
                  {pendingUsers.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-success/20 rounded-lg">
                <Check className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl lg:text-3xl font-bold">
                  {users.filter((u) => u.status === "approved").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/20 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl lg:text-3xl font-bold">
                  {users.filter((u) => u.role !== "resident").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            <div className="form-group">
              <Label htmlFor="search" className="text-sm font-medium">
                Search Users
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or flat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            <div className="form-group">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="form-group">
              <Label className="text-sm font-medium">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="resident">Resident</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentUser.role === "super-admin" && (
              <div className="form-group">
                <Label>Building</Label>
                <Select
                  value={buildingFilter}
                  onValueChange={setBuildingFilter}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Buildings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buildings</SelectItem>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end justify-end">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Clear Filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Users ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approval ({pendingUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No users found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="card-spacing">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="border-0 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="w-12 h-12 lg:w-14 lg:h-14">
                          <AvatarImage src={user.avatar || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg lg:text-xl font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground truncate text-base lg:text-lg">
                              {user.name}
                            </h3>
                            {getStatusBadge(user.status)}
                            {getRoleBadge(user.role)}
                          </div>

                          <div className="flex flex-wrap gap-4 lg:gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                            {user.buildingId && (
                              <div className="flex items-center gap-2">
                                <Home className="w-4 h-4 flex-shrink-0" />
                                <span>
                                  {
                                    buildings.find(
                                      (b) => b.id === user.buildingId
                                    )?.name
                                  }
                                </span>
                              </div>
                            )}
                            {user.flatNumber && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>Flat {user.flatNumber}</span>
                              </div>
                            )}
                          </div>

                          {user.role === "resident" && (
                            <div className="flex gap-4 mt-3 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                  Rent:
                                </span>
                                <Badge
                                  variant={
                                    user.rentEnabled ? "default" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {user.rentEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                  Maintenance:
                                </span>
                                <Badge
                                  variant={
                                    user.maintenanceEnabled
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {user.maintenanceEnabled
                                    ? "Enabled"
                                    : "Disabled"}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {user.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRejectUser(user.id)}
                              className="text-destructive border-destructive/20 hover:bg-destructive/10 gap-1"
                            >
                              <X className="w-4 h-4" />
                              <span className="hidden sm:inline">Reject</span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => onApproveUser(user.id)}
                              className="bg-success hover:bg-success/90 gap-1"
                            >
                              <Check className="w-4 h-4" />
                              <span className="hidden sm:inline">Approve</span>
                            </Button>
                          </>
                        )}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                              className="gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader className="pb-4">
                              <DialogTitle className="text-xl">
                                User Details
                              </DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-6">
                                <div className="flex items-center gap-4 pb-4 border-b">
                                  <Avatar className="w-16 h-16">
                                    <AvatarImage
                                      src={selectedUser.avatar || ""}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-semibold">
                                      {selectedUser.name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="text-xl font-semibold">
                                      {selectedUser.name}
                                    </h3>
                                    <div className="flex gap-2 mt-2">
                                      {getStatusBadge(selectedUser.status)}
                                      {getRoleBadge(selectedUser.role)}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="form-group">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                      Email
                                    </Label>
                                    <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md">
                                      {selectedUser.email}
                                    </p>
                                  </div>
                                  <div className="form-group">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                      Phone
                                    </Label>
                                    <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md">
                                      {selectedUser.phone}
                                    </p>
                                  </div>
                                  <div className="form-group">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                      Building
                                    </Label>
                                    <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md">
                                      {selectedUser.buildingId
                                        ? buildings.find(
                                            (b) =>
                                              b.id === selectedUser.buildingId
                                          )?.name || "Unknown"
                                        : "Not assigned"}
                                    </p>
                                  </div>
                                  <div className="form-group">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                      Flat Number
                                    </Label>
                                    <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md">
                                      {selectedUser.flatNumber ||
                                        "Not assigned"}
                                    </p>
                                  </div>
                                  <div className="form-group">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                      Registration Date
                                    </Label>
                                    <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md">
                                      {new Date(
                                        selectedUser.createdAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="form-group">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                      Approved By
                                    </Label>
                                    <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md">
                                      {selectedUser.approvedBy
                                        ? users.find(
                                            (u) =>
                                              u.id === selectedUser.approvedBy
                                          )?.name || "Unknown"
                                        : "Not approved"}
                                    </p>
                                  </div>
                                </div>

                                {selectedUser.role === "resident" && (
                                  <div className="space-y-3 pt-4 border-t">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                      Billing Services
                                    </Label>
                                    <div className="flex gap-6">
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground">
                                          Rent Billing:
                                        </span>
                                        <Badge
                                          variant={
                                            selectedUser.rentEnabled
                                              ? "default"
                                              : "secondary"
                                          }
                                          className="text-xs"
                                        >
                                          {selectedUser.rentEnabled
                                            ? "Enabled"
                                            : "Disabled"}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground">
                                          Maintenance Billing:
                                        </span>
                                        <Badge
                                          variant={
                                            selectedUser.maintenanceEnabled
                                              ? "default"
                                              : "secondary"
                                          }
                                          className="text-xs"
                                        >
                                          {selectedUser.maintenanceEnabled
                                            ? "Enabled"
                                            : "Disabled"}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {(currentUser.role === "super-admin" ||
                          (currentUser.role === "admin" &&
                            user.role === "resident" &&
                            user.buildingId === currentUser.buildingId)) && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-name">Name</Label>
                                  <Input
                                    id="edit-name"
                                    value={userFormData.name || ""}
                                    onChange={(e) =>
                                      setUserFormData({
                                        ...userFormData,
                                        name: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-email">Email</Label>
                                  <Input
                                    id="edit-email"
                                    value={userFormData.email || ""}
                                    onChange={(e) =>
                                      setUserFormData({
                                        ...userFormData,
                                        email: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-phone">Phone</Label>
                                  <Input
                                    id="edit-phone"
                                    value={userFormData.phone || ""}
                                    onChange={(e) =>
                                      setUserFormData({
                                        ...userFormData,
                                        phone: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                {user.role === "resident" && (
                                  <>
                                    <div>
                                      <Label htmlFor="edit-flat">
                                        Flat Number
                                      </Label>
                                      <Input
                                        id="edit-flat"
                                        value={userFormData.flatNumber || ""}
                                        onChange={(e) =>
                                          setUserFormData({
                                            ...userFormData,
                                            flatNumber: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Label htmlFor="rent-enabled">
                                          Rent Billing
                                        </Label>
                                        <Switch
                                          id="rent-enabled"
                                          checked={
                                            userFormData.rentEnabled || false
                                          }
                                          onCheckedChange={(checked) =>
                                            setUserFormData({
                                              ...userFormData,
                                              rentEnabled: checked,
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <Label htmlFor="maintenance-enabled">
                                          Maintenance Billing
                                        </Label>
                                        <Switch
                                          id="maintenance-enabled"
                                          checked={
                                            userFormData.maintenanceEnabled ||
                                            false
                                          }
                                          onCheckedChange={(checked) =>
                                            setUserFormData({
                                              ...userFormData,
                                              maintenanceEnabled: checked,
                                            })
                                          }
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={handleUpdateUser}
                                    className="flex-1"
                                  >
                                    Save Changes
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {currentUser.role === "super-admin" &&
                          user.id !== currentUser.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive border-destructive/20 hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete User
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.name}?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDeleteUser(user.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingUsers.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No pending approvals
                </h3>
                <p className="text-muted-foreground">
                  All user registrations have been processed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingUsers.map((user) => (
                <Card
                  key={user.id}
                  className="border-0 shadow-sm border-l-4 border-l-yellow-400"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">
                              {user.name}
                            </h3>
                            {getRoleBadge(user.role)}
                            <Badge className="text-warning-foreground bg-warning/20">
                              Pending
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>{user.email}</span>
                            <span>{user.phone}</span>
                            {user.buildingId && (
                              <span>
                                {
                                  buildings.find(
                                    (b) => b.id === user.buildingId
                                  )?.name
                                }
                              </span>
                            )}
                            {user.flatNumber && (
                              <span>Flat {user.flatNumber}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Registered on{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRejectUser(user.id)}
                          className="text-destructive border-destructive/20 hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onApproveUser(user.id)}
                          className="bg-success hover:bg-success/90"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
