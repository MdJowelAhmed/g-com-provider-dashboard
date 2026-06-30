import { Modal } from 'antd'
import { useEffect, useState } from 'react'
import ImageUploader from '../../../components/common/ImageUploader'
import type { ProviderOrder } from './providerOrderTypes'

type Props = {
  open: boolean
  order: ProviderOrder | null
  submitting?: boolean
  onClose: () => void
  onSubmit: (deliveryProof: string) => Promise<void>
}

export default function DeliverOrderModal({
  open,
  order,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const [deliveryProof, setDeliveryProof] = useState('')

  useEffect(() => {
    if (!open) return
    setDeliveryProof(order?.deliveryProof ?? '')
  }, [open, order])

  const handleOk = async () => {
    if (!deliveryProof.trim()) return
    await onSubmit(deliveryProof.trim())
  }

  return (
    <Modal
      title="Mark order as delivered"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Confirm delivery"
      cancelText="Cancel"
      confirmLoading={submitting}
      centered
      destroyOnHidden
      okButtonProps={{
        disabled: !deliveryProof.trim(),
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
            Upload delivery proof for order{' '}
            <span className="font-mono text-gray-300">{order.orderId}</span>
          </p>
        ) : null}

        <ImageUploader
          label="Delivery proof"
          required
          value={deliveryProof}
          onChange={setDeliveryProof}
          autoUpload
          heightClass="h-48"
          hint="Upload a photo showing the order was delivered"
          disabled={submitting}
        />
      </div>
    </Modal>
  )
}
