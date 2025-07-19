"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
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
} from "lucide-react"
import type { Building, User as UserType } from "@/types/app-types"

interface BuildingInfoProps {
  building: Building
  currentUser: UserType
  residents: UserType[]
}

export function BuildingInfo({ building, currentUser, residents }: BuildingInfoProps) {
  const occupancyRate = Math.round((residents.length / building.totalUnits) * 100)
  const buildingAge = new Date().getFullYear() - new Date(building.createdAt).getFullYear()

  const getAmenityIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "shield":
        return Shield
      case "zap":
        return Zap
      case "droplets":
        return Droplets
      case "car":
        return Car
      case "dumbbell":
        return Dumbbell
      case "waves":
        return Waves
      default:
        return CheckCircle
    }
  }

  return (
    <div className="space-y-6">
      {/* Building Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">{building.name}</h1>
                <div className="flex items-center gap-2 text-blue-100">
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
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">{occupancyRate}% Occupied</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Unit Information */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Your Unit Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Flat Number</p>
                <p className="text-lg font-semibold text-gray-900">{currentUser.flatNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Resident Name</p>
                <p className="text-lg font-semibold text-gray-900">{currentUser.name}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Billing Services</p>
              <div className="flex gap-2">
                <Badge variant={currentUser.rentEnabled ? "default" : "secondary"}>
                  {currentUser.rentEnabled ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  Rent {currentUser.rentEnabled ? "Enabled" : "Disabled"}
                </Badge>
                <Badge variant={currentUser.maintenanceEnabled ? "default" : "secondary"}>
                  {currentUser.maintenanceEnabled ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  Maintenance {currentUser.maintenanceEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Building Statistics */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Building Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Occupancy Rate</span>
                <span className="text-sm font-semibold text-gray-900">{occupancyRate}%</span>
              </div>
              <Progress value={occupancyRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {residents.length} of {building.totalUnits} units occupied
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{residents.length}</p>
                <p className="text-sm text-blue-700">Active Residents</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{building.totalUnits - residents.length}</p>
                <p className="text-sm text-gray-700">Vacant Units</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Amenities */}
      {building.amenities && building.amenities.length > 0 && (
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Building Amenities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {building.amenities.map((amenity) => {
                const IconComponent = getAmenityIcon(amenity.icon)
                return (
                  <div
                    key={amenity.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      amenity.available
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-gray-200 bg-gray-50 text-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{amenity.name}</p>
                        <p className="text-xs">{amenity.available ? "Available" : "Not Available"}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Information */}
      {building.settings && (
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-green-600" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-700">Monthly Rent</p>
                <p className="text-xl font-bold text-blue-900">₹{building.settings.rentAmount.toLocaleString()}</p>
                <p className="text-xs text-blue-600">Due on {building.settings.rentDueDate}th</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-700">Maintenance</p>
                <p className="text-xl font-bold text-green-900">
                  ₹{building.settings.maintenanceAmount.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">Due on {building.settings.maintenanceDueDate}th</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-700">Late Fee</p>
                <p className="text-xl font-bold text-orange-900">₹{building.settings.lateFee.toLocaleString()}</p>
                <p className="text-xs text-orange-600">After due date</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-700">Tax Rate</p>
                <p className="text-xl font-bold text-purple-900">{building.settings.taxRate}%</p>
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
                For any building-related queries or maintenance requests, please contact the building administrator or
                submit a complaint through the complaint system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
