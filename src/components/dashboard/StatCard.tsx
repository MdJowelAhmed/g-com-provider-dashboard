import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

type Props = {
  label: string
  value: string
  delta?: string
  trend?: 'up' | 'down'
  icon: ComponentType<LucideProps>
}

export default function StatCard({ label, value, delta, trend = 'up', icon: Icon }: Props) {
  const trendColor = trend === 'up' ? 'text-accent-success' : 'text-accent-danger'
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5">
      <div className="flex items-start justify-between">
        <div className="text-sm text-gray-400">{label}</div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
      {delta && (
        <div className={`mt-2 flex items-center gap-1 text-xs ${trendColor}`}>
          <TrendIcon size={14} /> {delta}
        </div>
      )}
    </div>
  )
}
