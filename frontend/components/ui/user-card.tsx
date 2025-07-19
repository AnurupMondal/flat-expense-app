"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, MoreHorizontal } from "lucide-react"
import type { User, Building } from "@/types/app-types"

interface UserCardProps {
  user: User
  buildings?: Building[]
  showActions?: boolean
  onApprove?: (userId: string) => void
  onReject?: (userId: string) => void
  onEdit?: (userId: string) => void
  className?: string
}

export function UserCard({
  user,
  buildings = [],
  showActions = false,
  onApprove,
  onReject,
  onEdit,
  className = "",
}: UserCardProps) {
  const building = buildings.find((b) => b.id === user.buildingId)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super-admin":
        return "from-purple-500 to-indigo-600"
      case "admin":
        return "from-orange-500 to-red-600"
      case "resident":
        return "from-green-500 to-emerald-600"
      default:
        return "from-blue-500 to-indigo-600"
    }
  }

  return (
    <Card className={`border-0 shadow-sm bg-white ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(user.role)} text-white font-bold`}>
                {user.flatNumber || user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {user.role.replace("-", " ")}
                </Badge>
                <Badge variant={getStatusVariant(user.status)} className="text-xs">
                  {user.status}
                </Badge>
                {building && (
                  <Badge variant="secondary" className="text-xs">
                    {building.name}
                  </Badge>
                )}
                {user.flatNumber && (
                  <Badge variant="secondary" className="text-xs">
                    Flat {user.flatNumber}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {showActions && user.status === "pending" && (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject?.(user.id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button size="sm" onClick={() => onApprove?.(user.id)} className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </div>
          )}

          {showActions && user.status !== "pending" && onEdit && (
            <Button size="sm" variant="outline" onClick={() => onEdit(user.id)} className="flex-shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
