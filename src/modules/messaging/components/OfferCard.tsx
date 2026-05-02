import { motion } from 'framer-motion'
import { Package, Truck } from 'lucide-react'
import type { Offer } from '../types'

type Props = {
  offer: Offer
  onWithdraw?: (id: string) => void
}

const statusStyle: Record<
  Offer['status'],
  { label: string; className: string }
> = {
  draft: { label: 'Draft', className: 'bg-gray-600/30 text-gray-300' },
  pending: { label: 'Pending', className: 'bg-accent-amber/15 text-accent-amber' },
  accepted: { label: 'Accepted', className: 'bg-accent-success/15 text-accent-success' },
  declined: { label: 'Declined', className: 'bg-accent-danger/15 text-accent-danger' },
  withdrawn: { label: 'Withdrawn', className: 'bg-gray-600/30 text-gray-400' },
  expired: { label: 'Expired', className: 'bg-gray-600/30 text-gray-400' },
}

/** Compact offer card — layout preserved for all roles */
export default function OfferCard({ offer, onWithdraw }: Props) {
  const meta = statusStyle[offer.status]
  const canWithdraw = offer.status === 'pending' && offer.createdBy === 'local'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-[min(100%,380px)] rounded-xl border border-surface-border bg-surface-elevated p-3 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <Package size={18} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-100">{offer.title}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Truck size={11} />
                {offer.deliveryMethod.replace(/_/g, ' ')}
              </span>
              <span>
                Updated {new Date(offer.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.className}`}>
          {meta.label}
        </span>
      </div>

      <ul className="mt-3 space-y-1.5 border-t border-surface-border pt-3">
        {offer.lineItems.map((line) => (
          <li key={line.id} className="flex justify-between gap-3 text-xs text-gray-300">
            <span className="min-w-0 truncate">
              {line.label}{' '}
              <span className="text-gray-500">
                ×{line.quantity}
              </span>
            </span>
            <span className="shrink-0 font-mono text-gray-200">
              {offer.currency} {(line.unitPrice * line.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-3 text-sm">
        <span className="text-gray-500">Total</span>
        <span className="font-semibold text-white">
          {offer.currency} {offer.total.toFixed(2)}
        </span>
      </div>

      {canWithdraw && onWithdraw ? (
        <button
          type="button"
          onClick={() => onWithdraw(offer.id)}
          className="mt-3 w-full rounded-lg border border-surface-border py-2 text-xs font-medium text-gray-300 transition hover:border-accent-danger/50 hover:bg-accent-danger/10 hover:text-accent-danger"
        >
          Withdraw offer
        </button>
      ) : null}
    </motion.div>
  )
}
