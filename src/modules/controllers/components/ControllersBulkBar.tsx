import { motion } from 'framer-motion'
import { Ban, CheckCircle2, ShieldAlert, Trash2, X } from 'lucide-react'

type Props = {
  count: number
  onActivate: () => void
  onDeactivate: () => void
  onSuspend: () => void
  onDelete: () => void
  onClear: () => void
}

export default function ControllersBulkBar({
  count,
  onActivate,
  onDeactivate,
  onSuspend,
  onDelete,
  onClear,
}: Props) {
  if (count <= 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/30 bg-surface-card/95 px-4 py-3 shadow-lg shadow-black/25 backdrop-blur-md"
    >
      <div className="text-sm text-gray-200">
        <span className="font-semibold text-white">{count}</span> selected
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onActivate}
          className="inline-flex items-center gap-1 rounded-lg bg-accent-success/90 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm shadow-accent-success/20 hover:bg-accent-success"
        >
          <CheckCircle2 size={14} /> Mark active
        </button>
        <button
          type="button"
          onClick={onDeactivate}
          className="inline-flex items-center gap-1 rounded-lg border border-surface-border px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-surface-elevated"
        >
          <Ban size={14} /> Mark inactive
        </button>
        <button
          type="button"
          onClick={onSuspend}
          className="inline-flex items-center gap-1 rounded-lg border border-accent-amber/35 bg-accent-amber/10 px-3 py-1.5 text-xs font-medium text-accent-amber hover:bg-accent-amber/15"
        >
          <ShieldAlert size={14} /> Suspend
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-lg border border-accent-danger/40 px-3 py-1.5 text-xs font-medium text-accent-danger hover:bg-accent-danger/10"
        >
          <Trash2 size={14} /> Remove
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:text-white"
          aria-label="Clear selection"
        >
          <X size={14} /> Clear
        </button>
      </div>
    </motion.div>
  )
}
