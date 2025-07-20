"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Users,
  Calendar,
  Shield,
  Zap,
  Droplets,
  Car,
  Dumbbell,
  Waves,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  XCircle,
  Home,
  User,
} from "lucide-react";
import type { Building, User as UserType } from "@/types/app-types";

interface BuildingInfoProps {
  building: Building;
  currentUser: UserType;
  residents: UserType[];
}

export function BuildingInfo({
  building,
  currentUser,
  residents,
}: BuildingInfoProps) {
  const occupancyRate = Math.round(
    (residents.length / building.totalUnits) * 100
  );
  const buildingAge =
    new Date().getFullYear() - new Date(building.createdAt).getFullYear();

  const getAmenityIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "shield":
        return Shield;
      case "zap":
        return Zap;
      case "droplets":
        return Droplets;
      case "car":
        return Car;
      case "dumbbell":
        return Dumbbell;
      case "waves":
        return Waves;
      default:
        return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Building Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">{building.name}</h1>
                <div className="flex items-center gap-2 text-primary-foreground/80">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{building.address}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{buildingAge} years old</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    <span>{building.totalUnits} units</span>
                  </div>
                </div>
              </div>
            </div>
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 backdrop-blur-sm">
              {occupancyRate}% Occupied
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Unit Information */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Your Unit Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Flat Number
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {currentUser.flatNumber}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Resident Name
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {currentUser.name}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Billing Services
              </p>
              <div className="flex gap-2">
                <Badge
                  variant={currentUser.rentEnabled ? "default" : "secondary"}
                >
                  {currentUser.rentEnabled ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  Rent {currentUser.rentEnabled ? "Enabled" : "Disabled"}
                </Badge>
                <Badge
                  variant={
                    currentUser.maintenanceEnabled ? "default" : "secondary"
                  }
                >
                  {currentUser.maintenanceEnabled ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  Maintenance{" "}
                  {currentUser.maintenanceEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Building Statistics */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Building Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Occupancy Rate
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {occupancyRate}%
                </span>
              </div>
              <Progress value={occupancyRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {residents.length} of {building.totalUnits} units occupied
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {residents.length}
                </p>
                <p className="text-sm text-primary/80">Active Residents</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-muted-foreground">
                  {building.totalUnits - residents.length}
                </p>
                <p className="text-sm text-muted-foreground">Vacant Units</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Amenities */}
      {building.amenities && building.amenities.length > 0 && (
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Building Amenities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {building.amenities.map((amenity) => {
                const IconComponent = getAmenityIcon(amenity.icon);
                return (
                  <div
                    key={amenity.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      amenity.available
                        ? "border-success/20 bg-success/10 text-success-foreground"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {amenity.name}
                        </p>
                        <p className="text-xs">
                          {amenity.available ? "Available" : "Not Available"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Information */}
      {building.settings && (
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-success" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary">Monthly Rent</p>
                <p className="text-xl font-bold text-foreground">
                  ₹{building.settings.rentAmount.toLocaleString()}
                </p>
                <p className="text-xs text-primary/80">
                  Due on {building.settings.rentDueDate}th
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-700">
                  Maintenance
                </p>
                <p className="text-xl font-bold text-green-900">
                  ₹{building.settings.maintenanceAmount.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  Due on {building.settings.maintenanceDueDate}th
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-700">Late Fee</p>
                <p className="text-xl font-bold text-orange-900">
                  ₹{building.settings.lateFee.toLocaleString()}
                </p>
                <p className="text-xs text-orange-600">After due date</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-700">Tax Rate</p>
                <p className="text-xl font-bold text-purple-900">
                  {building.settings.taxRate}%
                </p>
                <p className="text-xs text-purple-600">GST applicable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Important Notice</p>
              <p className="text-sm text-orange-700 mt-1">
                For any building-related queries or maintenance requests, please
                contact the building administrator or submit a complaint through
                the complaint system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
