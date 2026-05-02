import { motion } from 'framer-motion'
import { Trash2, X } from 'lucide-react'

type Props = {
  count: number
  onDelete: () => void
  onClear: () => void
}

export default function PostsBulkBar({ count, onDelete, onClear }: Props) {
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
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-lg border border-accent-danger/40 px-3 py-1.5 text-xs font-medium text-accent-danger hover:bg-accent-danger/10"
        >
          <Trash2 size={14} /> Delete
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
