import SearchField from '../../../components/common/SearchField'
import { ALL_FILTER, CAMPAIGN_STATUS_FILTER_OPTIONS } from '../constants'

type Props = {
  value: string
  onChange: (v: string) => void
  onClear: () => void
  onFlush: () => boolean
  loading?: boolean
  searchPlaceholder: string
  statusFilter: string
  onStatusChange: (v: string) => void
}

export default function PostFiltersBar({
  value,
  onChange,
  onClear,
  onFlush,
  loading = false,
  searchPlaceholder,
  statusFilter,
  onStatusChange,
}: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <SearchField
        value={value}
        onChange={onChange}
        onClear={onClear}
        onFlush={onFlush}
        minChars={2}
        loading={loading}
        placeholder={searchPlaceholder}
        aria-label="Search posts"
        widthClass="w-full"
        className="min-w-[220px] flex-1"
      />
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
