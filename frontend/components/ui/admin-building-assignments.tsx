import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './select';
import { Input } from './input';
import { Label } from './label';
import { toast } from './use-toast';
import { adminAssignmentsApi, buildingsApi } from '../../lib/api';
import { Building, Users, UserPlus, Trash2, Search } from 'lucide-react';
import { Building as BuildingType } from '../../types/app-types';

interface Admin {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface AdminAssignment {
  id: number;
  admin_id: number;
  building_id: number;
  admin_name: string;
  admin_email: string;
  building_name: string;
  building_address: string;
  assigned_at: string;
  assigned_by_name: string;
  is_active: boolean;
}

const AdminBuildingAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<AdminAssignment[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [buildings, setBuildings] = useState<BuildingType[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadAssignments();
    loadAdmins();
    loadBuildings();
  }, []);

  const loadAssignments = async () => {
    try {
      const response = await adminAssignmentsApi.getAssignments();
      if (response.success) {
        setAssignments(response.data as AdminAssignment[]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load admin assignments',
        variant: 'destructive',
      });
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await adminAssignmentsApi.getAvailableAdmins();
      if (response.success) {
        setAdmins(response.data as Admin[]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load admins',
        variant: 'destructive',
      });
    }
  };

  const loadBuildings = async () => {
    try {
      const buildings = await buildingsApi.getAll();
      setBuildings(buildings);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load buildings',
        variant: 'destructive',
      });
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedAdmin || !selectedBuilding) {
      toast({
        title: 'Error',
        description: 'Please select both admin and building',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await adminAssignmentsApi.assignAdmin(
        parseInt(selectedAdmin),
        parseInt(selectedBuilding)
      );

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Admin assigned to building successfully',
        });
        setIsDialogOpen(false);
        setSelectedAdmin('');
        setSelectedBuilding('');
        loadAssignments();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign admin',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to remove this assignment?')) {
      return;
    }

    try {
      const response = await adminAssignmentsApi.removeAssignment(assignmentId);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Assignment removed successfully',
        });
        loadAssignments();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove assignment',
        variant: 'destructive',
      });
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.admin_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group assignments by admin
  const groupedAssignments = filteredAssignments.reduce((acc, assignment) => {
    const adminKey = assignment.admin_id;
    if (!acc[adminKey]) {
      acc[adminKey] = {
        admin: {
          id: assignment.admin_id,
          name: assignment.admin_name,
          email: assignment.admin_email,
        },
        buildings: [],
      };
    }
    acc[adminKey].buildings.push(assignment);
    return acc;
  }, {} as Record<number, { admin: { id: number; name: string; email: string }; buildings: AdminAssignment[] }>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Building Assignments</h2>
          <p className="text-muted-foreground">
            Manage which buildings each admin is responsible for
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Admin to Building</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin">Select Admin</Label>
                <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id.toString()}>
                        {admin.name} ({admin.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="building">Select Building</Label>
                <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name} - {building.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignAdmin} disabled={loading}>
                  {loading ? 'Assigning...' : 'Assign'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search admins or buildings..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {Object.keys(groupedAssignments).length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No admin assignments found</p>
              <p className="text-sm">Start by assigning admins to buildings</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {Object.values(groupedAssignments).map(({ admin, buildings }) => (
            <Card key={admin.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>{admin.name}</span>
                    <Badge variant="secondary">{admin.email}</Badge>
                  </div>
                  <Badge variant="outline">
                    {buildings.length} building{buildings.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {buildings.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center space-x-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{assignment.building_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.building_address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Assigned on {new Date(assignment.assigned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBuildingAssignments;
