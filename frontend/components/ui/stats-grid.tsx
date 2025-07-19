import { StatCard } from "@/components/ui/stat-card"
import type { LucideIcon } from "lucide-react"

interface StatItem {
  title: string
  value: string
  change: string
  icon: LucideIcon
  color: string
  bg: string
}

interface StatsGridProps {
  stats: StatItem[]
  showBadge?: boolean
}

export function StatsGrid({ stats, showBadge = false }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
          bgColor={stat.bg}
          badge={showBadge ? "Live" : undefined}
        />
      ))}
    </div>
  )
}
