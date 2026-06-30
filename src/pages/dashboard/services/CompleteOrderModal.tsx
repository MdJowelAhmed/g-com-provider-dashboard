import { Modal } from 'antd'
import { useEffect, useState } from 'react'
import type { ProviderOrder } from './providerOrderTypes'

export const COMPLETE_REASON_OPTIONS = [
  { value: 'completed', label: 'Complete' },
  { value: 'not completed', label: 'Not complete' },
] as const

type CompleteReason = (typeof COMPLETE_REASON_OPTIONS)[number]['value']

type Props = {
  open: boolean
  order: ProviderOrder | null
  submitting?: boolean
  onClose: () => void
  onSubmit: (reason: CompleteReason) => Promise<void>
}

const selectClass =
  'mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm text-gray-100 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25'

export default function CompleteOrderModal({
  open,
  order,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const [reason, setReason] = useState<CompleteReason>('completed')

  useEffect(() => {
    if (!open) return
    setReason('completed')
  }, [open, order?.id])

  const handleOk = async () => {
    await onSubmit(reason)
  }

  return (
    <Modal
      title="Complete booking"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Submit"
      cancelText="Cancel"
      confirmLoading={submitting}
      centered
      destroyOnHidden
      okButtonProps={{
        className: '!bg-brand hover:!bg-brand-hover !text-white !border-none',
      }}
      rootClassName="dark-modal-surface"
      classNames={{
        header: '!border-b !border-surface-border !bg-surface-card !p-4 !mb-0',
        body: '!bg-surface-card !p-5 !pt-4',
        footer: '!border-t !border-surface-border !bg-surface-card !mt-0',
      }}
    >
      <div className="space-y-4 text-sm text-gray-200">
        {order ? (
          <p className="text-gray-400">
            Update completion status for order{' '}
            <span className="font-mono text-gray-300">{order.orderId}</span>
          </p>
        ) : null}

        <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
          Status
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as CompleteReason)}
            disabled={submitting}
            className={selectClass}
          >
            {COMPLETE_REASON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Modal>
  )
}
