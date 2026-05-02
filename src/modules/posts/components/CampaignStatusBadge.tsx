import type { CampaignDisplayStatus } from '../types'

const styles: Record<CampaignDisplayStatus, string> = {
  active: 'bg-accent-success/15 text-accent-success ring-1 ring-accent-success/25',
  upcoming: 'bg-accent-amber/15 text-accent-amber ring-1 ring-accent-amber/25',
  expired: 'bg-gray-500/15 text-gray-400 ring-1 ring-gray-500/25',
}

const labels: Record<CampaignDisplayStatus, string> = {
  active: 'Active',
  upcoming: 'Upcoming',
  expired: 'Expired',
}

export default function CampaignStatusBadge({
  status,
}: {
  status: CampaignDisplayStatus | null
}) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-gray-500">
        —
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-sm ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
