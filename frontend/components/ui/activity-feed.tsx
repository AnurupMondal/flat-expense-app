import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ActivityItem {
  type: "info" | "success" | "warning" | "error";
  title: string;
  description: string;
  time: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  description?: string;
}

export function ActivityFeed({
  activities,
  title = "Recent Activity",
  description,
}: ActivityFeedProps) {
  const getActivityColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50";
      case "warning":
        return "bg-orange-50";
      case "error":
        return "bg-red-50";
      default:
        return "bg-blue-50";
    }
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-orange-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 ${getActivityColor(
                activity.type
              )} rounded-lg`}
            >
              <div
                className={`w-2 h-2 ${getDotColor(
                  activity.type
                )} rounded-full flex-shrink-0`}
              ></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
