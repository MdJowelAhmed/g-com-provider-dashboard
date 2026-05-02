import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { ALL_FILTER, STATUS_OPTIONS } from '../constants'

type Props = {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: string
  onStatusChange: (v: string) => void
}

export default function ControllerFiltersBar({
  search,
  onSearchChange,
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
      <label className="relative flex min-w-0 flex-1 items-center">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 text-gray-500"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, email, or role label…"
          className="h-11 w-full rounded-lg border border-white/[0.08] bg-surface-elevated/80 py-2 pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-600 shadow-inner outline-none ring-brand/0 transition focus:border-brand/45 focus:ring-2 focus:ring-brand/25"
        />
      </label>
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
