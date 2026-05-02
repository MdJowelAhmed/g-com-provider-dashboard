import { Modal } from 'antd'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { EVENT_CAPACITY_PLAN_LIMIT } from '../capacityPlan'

type Props = {
  open: boolean
  onCancel: () => void
  /** Primary action — e.g. navigate to support */
  onContactAdmin: () => void
  planLimit?: number
}

export default function EventCapacityUpgradeModal({
  open,
  onCancel,
  onContactAdmin,
  planLimit = EVENT_CAPACITY_PLAN_LIMIT,
}: Props) {
  return (
    <Modal
      open={open}
      title={null}
      footer={null}
      closable={false}
      onCancel={onCancel}
      centered
      width={440}
      destroyOnHidden
      styles={{
        mask: {
          backdropFilter: 'blur(14px)',
          backgroundColor: 'rgba(6, 8, 12, 0.78)',
        },
      }}
      classNames={{
        container:
          '!overflow-hidden !rounded-2xl !border !border-white/[0.1] !bg-[linear-gradient(165deg,rgba(22,26,34,0.97)_0%,rgba(10,12,16,0.99)_100%)] !p-0 shadow-[0_28px_90px_-36px_rgba(0,0,0,0.9),0_0_0_1px_rgba(160,82,45,0.14)]',
        body: '!p-0',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="relative px-6 pb-6 pt-7"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-gray-500 transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
          aria-label="Close"
        >
          <X size={17} strokeWidth={1.75} />
        </button>

        <div className="pr-10">
          <h2 className="text-lg font-semibold tracking-tight text-white">Upgrade Required</h2>
          <p className="mt-3 text-[13px] leading-relaxed text-gray-400">
            To create events with capacity over {planLimit} attendees, please contact the admin team to
            upgrade your event capacity limit.
          </p>
          <p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-[12px] leading-snug text-gray-500 backdrop-blur-sm">
            Your current event capacity limit is {planLimit} attendees.
          </p>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onContactAdmin}
            className="rounded-xl border border-brand/45 bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_32px_-10px_rgba(160,82,45,0.85)] transition hover:bg-brand-hover hover:shadow-[0_0_40px_-8px_rgba(160,82,45,0.95)]"
          >
            Contact Admin
          </button>
        </div>
      </motion.div>
    </Modal>
  )
}
