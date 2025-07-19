"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Building } from "@/types/app-types"

interface AddBuildingFormProps {
  onAdd: (building: Omit<Building, "id" | "createdAt">) => void
  onCancel: () => void
}

export function AddBuildingForm({ onAdd, onCancel }: AddBuildingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    totalUnits: "",
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.address || !formData.totalUnits) {
      return
    }

    onAdd({
      name: formData.name,
      address: formData.address,
      adminId: "",
      totalUnits: Number.parseInt(formData.totalUnits),
    })

    setFormData({ name: "", address: "", totalUnits: "" })
  }

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Add New Building</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Building Name</Label>
            <Input
              placeholder="e.g., Sunrise Apartments"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Total Units</Label>
            <Input
              type="number"
              placeholder="e.g., 45"
              value={formData.totalUnits}
              onChange={(e) => setFormData((prev) => ({ ...prev, totalUnits: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input
            placeholder="Full address"
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
          />
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSubmit}>Add Building</Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
