"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import type { Building } from "@/types/app-types";

interface BuildingListProps {
  buildings: Building[];
  onManage?: (buildingId: string) => void;
}

export function BuildingList({ buildings, onManage }: BuildingListProps) {
  return (
    <div className="grid gap-4">
      {buildings.map((building) => (
        <Card key={building.id} className="border-0 shadow-sm bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {building.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {building.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {building.totalUnits} units
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge variant="default">Active</Badge>
                {onManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManage(building.id)}
                  >
                    Manage
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
