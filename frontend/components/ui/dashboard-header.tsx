import type { ReactNode } from "react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function DashboardHeader({
  title,
  description,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground font-medium">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
