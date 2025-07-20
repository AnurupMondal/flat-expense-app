import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
  badge?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = "text-blue-600",
  bgColor = "bg-blue-100",
  badge,
  trend = "neutral",
}: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div
            className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}
          >
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          {change && <p className={`text-xs ${getTrendColor()}`}>{change}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
