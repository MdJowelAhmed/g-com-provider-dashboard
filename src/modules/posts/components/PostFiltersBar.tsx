import { Search } from 'lucide-react'
import { ALL_FILTER, CAMPAIGN_STATUS_FILTER_OPTIONS } from '../constants'

type Props = {
  search: string
  onSearchChange: (v: string) => void
  searchPlaceholder: string
  statusFilter: string
  onStatusChange: (v: string) => void
}

export default function PostFiltersBar({
  search,
  onSearchChange,
  searchPlaceholder,
  statusFilter,
  onStatusChange,
}: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-md border border-surface-border bg-surface-card/90 pl-9 pr-3 text-sm text-gray-100 shadow-inner backdrop-blur-sm placeholder:text-gray-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          aria-label="Search posts"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 shadow-sm backdrop-blur-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        aria-label="Filter by campaign status"
      >
        <option value={ALL_FILTER}>All Status</option>
        {CAMPAIGN_STATUS_FILTER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
