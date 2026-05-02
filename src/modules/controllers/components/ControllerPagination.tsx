import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

type Props = {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (p: number) => void
}

export default function ControllerPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: Props) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const pages = (() => {
    const maxButtons = 5
    const arr: number[] = []
    let start = Math.max(1, page - Math.floor(maxButtons / 2))
    const end = Math.min(totalPages, start + maxButtons - 1)
    start = Math.max(1, end - maxButtons + 1)
    for (let i = start; i <= end; i += 1) arr.push(i)
    return arr
  })()

  return (
    <div className="flex flex-col items-stretch justify-between gap-3 border-t border-surface-border px-4 py-3 sm:flex-row sm:items-center">
      <p className="text-xs text-gray-500">
        Showing <span className="font-medium text-gray-300">{from}</span>–
        <span className="font-medium text-gray-300">{to}</span> of{' '}
        <span className="font-medium text-gray-300">{total}</span>
      </p>
      <div className="flex items-center justify-center gap-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-400 transition hover:border-brand/40 hover:text-white disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </motion.button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`h-9 min-w-[2.25rem] rounded-lg px-2 text-sm font-medium transition ${
              p === page
                ? 'bg-brand text-white shadow-md shadow-brand/20'
                : 'text-gray-400 hover:bg-surface-elevated hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-400 transition hover:border-brand/40 hover:text-white disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>
    </div>
  )
}
