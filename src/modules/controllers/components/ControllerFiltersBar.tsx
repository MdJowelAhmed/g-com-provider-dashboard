import { motion } from 'framer-motion'
import SearchField from '../../../components/common/SearchField'
import { ALL_FILTER, STATUS_OPTIONS } from '../constants'

type Props = {
  search: string
  onSearchChange: (v: string) => void
  onSearchClear?: () => void
  onSearchFlush?: () => boolean | void
  searchLoading?: boolean
  statusFilter: string
  onStatusChange: (v: string) => void
}

export default function ControllerFiltersBar({
  search,
  onSearchChange,
  onSearchClear,
  onSearchFlush,
  searchLoading = false,
  statusFilter,
  onStatusChange,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="mb-4 flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-surface-card/60 px-4 py-3 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
    >
      <SearchField
        value={search}
        onChange={onSearchChange}
        onClear={onSearchClear}
        onFlush={onSearchFlush}
        loading={searchLoading}
        minChars={2}
        placeholder="Search name, email, or role label…"
        aria-label="Search controllers"
        widthClass="w-full"
        inputClassName="!h-11 !rounded-lg !border-white/[0.08] !bg-surface-elevated/80 !shadow-inner focus:!border-brand/45 focus:!ring-2 focus:!ring-brand/25"
      />
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Status</span>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-11 min-w-[140px] rounded-lg border border-white/[0.08] bg-surface-elevated/90 px-3 text-sm text-gray-200 outline-none transition focus:border-brand/45 focus:ring-2 focus:ring-brand/25"
        >
          <option value={ALL_FILTER}>All statuses</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  )
}
