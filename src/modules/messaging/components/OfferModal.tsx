import { Modal } from 'antd'
import { useMemo, useState, type ReactNode } from 'react'
import type { Role } from '../../../types/role'
import type { DeliveryMethod } from '../types'
import type { RoleMessagingConfig } from '../types'
import { getCatalogForRole } from '../mock/roleCatalogs'
import type { CreateOfferInput } from '../hooks/useMessaging'

type Props = {
  open: boolean
  role: Role
  config: RoleMessagingConfig
  onClose: () => void
  onSubmit: (input: CreateOfferInput) => void
}

export default function OfferModal({ open, role, config, onClose, onSubmit }: Props) {
  const catalog = useMemo(() => getCatalogForRole(role), [role])
  const [selectedKey, setSelectedKey] = useState<string>(catalog[0]?.id ?? '')
  const [qty, setQty] = useState(1)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
    config.deliveryMethods[0]?.value ?? 'delivery',
  )
  const [fees, setFees] = useState(0)

  const item = catalog.find((c) => c.id === selectedKey)
  const currency = item?.currency ?? 'USD'

  const lineItems = useMemo(() => {
    if (!item) return []
    return [
      {
        id: `${item.id}-line`,
        label: item.label,
        unitPrice: item.unitPrice,
        quantity: qty,
      },
    ]
  }, [item, qty])

  const subtotal = item ? item.unitPrice * qty : 0
  const total = subtotal + fees

  const handleOk = () => {
    if (!item || lineItems.length === 0) return
    onSubmit({
      title: `${item.label} × ${qty}`,
      lineItems,
      deliveryMethod,
      currency,
      fees,
    })
  }

  return (
    <Modal
      title={<span className="text-base font-semibold text-gray-100">{config.labels.offerModalTitle}</span>}
      open={open}
      afterOpenChange={(visible) => {
        if (visible && catalog[0]) {
          setSelectedKey(catalog[0].id)
          setQty(1)
          setDeliveryMethod(config.deliveryMethods[0]?.value ?? 'delivery')
          setFees(0)
        }
      }}
      onCancel={onClose}
      onOk={handleOk}
      okText="Send offer"
      cancelText="Cancel"
      width={520}
      centered
      rootClassName="gcom-offer-modal dark-modal-surface"
      classNames={{
        header: '!border-b !border-surface-border !bg-surface-card !p-4 !mb-0',
        body: '!bg-surface-card !p-5 !pt-4',
        footer: '!border-t !border-surface-border !bg-surface-card !mt-0',
      }}
      okButtonProps={{
        className: '!bg-brand hover:!bg-brand-hover !text-white !border-none',
      }}
    >
      <div className="space-y-4 text-sm text-gray-200">
        <Field label="Product / service">
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="messaging-input mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          >
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
                {c.subtitle ? ` — ${c.subtitle}` : ''} ({c.currency} {c.unitPrice})
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity">
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="messaging-input mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 font-mono text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
            />
          </Field>
          <Field label="Fees / adjustments">
            <input
              type="number"
              min={0}
              step={0.01}
              value={fees}
              onChange={(e) => setFees(Math.max(0, Number(e.target.value) || 0))}
              className="messaging-input mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 font-mono text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
            />
          </Field>
        </div>

        <Field label="Delivery method">
          <div className="mt-2 flex flex-wrap gap-2">
            {config.deliveryMethods.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDeliveryMethod(d.value)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  deliveryMethod === d.value
                    ? 'border-brand bg-brand/15 text-white ring-1 ring-brand/40'
                    : 'border-surface-border text-gray-400 hover:border-brand/40 hover:text-gray-100'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="rounded-xl border border-surface-border bg-surface-elevated p-4">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal</span>
            <span className="font-mono text-gray-300">
              {currency} {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Fees</span>
            <span className="font-mono text-gray-300">
              {currency} {fees.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 flex justify-between border-t border-surface-border pt-3 text-sm font-semibold text-white">
            <span>Customer pays</span>
            <span className="font-mono">
              {currency} {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
      {label}
      {children}
    </label>
  )
}
