import { Modal } from 'antd'
import { useEffect, useState, type ReactNode } from 'react'
import type { RoleMessagingConfig } from '../types'
import type { CreateOfferInput } from '../hooks/useMessaging'
import { useOfferCatalog } from '../hooks/useOfferCatalog'
import { BUSINESS_MAIN_CATEGORIES } from '../../../types/businessCategory'
import {
  buildOfferMeta,
  catalogEmptyLabel,
  catalogItemLabel,
  itemTypeForCategory,
  OFFER_DELIVERY_METHOD_OPTIONS,
  supportsDeliveryFee,
} from '../utils/offerHelpers'

type Props = {
  open: boolean
  businessCategory?: string
  config: RoleMessagingConfig
  submitting?: boolean
  onClose: () => void
  onSubmit: (input: CreateOfferInput) => Promise<void>
}

const inputClass =
  'messaging-input mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25'

export default function OfferModal({
  open,
  businessCategory,
  config,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const { category, items, isLoading } = useOfferCatalog(businessCategory)

  const [selectedId, setSelectedId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [price, setPrice] = useState(0)
  const [qty, setQty] = useState(1)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [startTime, setStartTime] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState('delivery')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adult, setAdult] = useState(1)
  const [children, setChildren] = useState(0)
  const [eventDate, setEventDate] = useState('')

  const selectedItem = items.find((item) => item.id === selectedId)
  const itemType = itemTypeForCategory(category)
  const showDeliveryFee = supportsDeliveryFee(category)
  const itemLabel = catalogItemLabel(category)

  useEffect(() => {
    if (!open || items.length === 0) return
    const first = items[0]
    setSelectedId(first.id)
    setTitle(first.name)
    setDescription(first.description)
    setNotes('')
    setPrice(first.price)
    setQty(1)
    setDeliveryFee(0)
    setStartTime('')
    setDeliveryMethod('delivery')
    setCheckIn('')
    setCheckOut('')
    setAdult(1)
    setChildren(0)
    setEventDate('')
  }, [open, items])

  const handleItemChange = (itemId: string) => {
    setSelectedId(itemId)
    const item = items.find((entry) => entry.id === itemId)
    if (!item) return
    setTitle(item.name)
    setDescription(item.description)
    setPrice(item.price)
  }

  const subtotal = price * qty
  const total = subtotal + (showDeliveryFee ? deliveryFee : 0)

  const handleOk = async () => {
    if (!selectedId || !title.trim()) return
    const meta = buildOfferMeta(category, {
      startTime,
      deliveryMethod,
      checkIn,
      checkOut,
      adult,
      children,
      eventDate,
    })
    await onSubmit({
      itemId: selectedId,
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim(),
      price: Number(price),
      quantity: qty,
      itemType,
      ...(showDeliveryFee ? { deliveryFee: Number(deliveryFee) } : {}),
      ...(meta ? { meta } : {}),
    })
  }

  return (
    <Modal
      title={
        <span className="text-base font-semibold text-gray-100">
          {config.labels.offerModalTitle}
        </span>
      }
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Send offer"
      cancelText="Cancel"
      confirmLoading={submitting}
      width={560}
      centered
      rootClassName="gcom-offer-modal dark-modal-surface"
      classNames={{
        header: '!border-b !border-surface-border !bg-surface-card !p-4 !mb-0',
        body: '!bg-surface-card !p-5 !pt-4',
        footer: '!border-t !border-surface-border !bg-surface-card !mt-0',
      }}
      okButtonProps={{
        className: '!bg-brand hover:!bg-brand-hover !text-white !border-none',
        disabled: !selectedId || !title.trim() || isLoading,
        loading: submitting,
      }}
    >
      <div className="space-y-4 text-sm text-gray-200">
        <Field label={itemLabel}>
          {isLoading ? (
            <p className="mt-1 text-xs text-gray-500">Loading items…</p>
          ) : items.length === 0 ? (
            <p className="mt-1 text-xs text-accent-amber">{catalogEmptyLabel(category)}</p>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => handleItemChange(e.target.value)}
              className={inputClass}
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — ${item.price.toFixed(2)}
                  {item.subtitle ? ` (${item.subtitle})` : ''}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Offer title"
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-y`}
            placeholder="Describe what is included in this offer"
          />
        </Field>

        <Field label="Notes">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
            placeholder="Optional note for the customer"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price">
            <input
              type="number"
              min={0}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))}
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Field label="Quantity">
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className={`${inputClass} font-mono`}
            />
          </Field>
        </div>

        {showDeliveryFee ? (
          <>
            <Field label="Delivery method">
              <select
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                className={inputClass}
              >
                {OFFER_DELIVERY_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Delivery fee">
              <input
                type="number"
                min={0}
                step={0.01}
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value) || 0))}
                className={`${inputClass} font-mono`}
              />
            </Field>
          </>
        ) : null}

        {category === BUSINESS_MAIN_CATEGORIES.SERVICES ? (
          <Field label="Start time (optional)">
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            />
          </Field>
        ) : null}

        {category === BUSINESS_MAIN_CATEGORIES.STAY ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Check-in">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Check-out">
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Adults">
                <input
                  type="number"
                  min={1}
                  value={adult}
                  onChange={(e) => setAdult(Math.max(1, Number(e.target.value) || 1))}
                  className={`${inputClass} font-mono`}
                />
              </Field>
              <Field label="Children">
                <input
                  type="number"
                  min={0}
                  value={children}
                  onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))}
                  className={`${inputClass} font-mono`}
                />
              </Field>
            </div>
          </>
        ) : null}

        {category === BUSINESS_MAIN_CATEGORIES.EVENT ? (
          <Field label="Event date">
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={inputClass}
            />
          </Field>
        ) : null}

        <div className="rounded-xl border border-surface-border bg-surface-elevated p-4">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal</span>
            <span className="font-mono text-gray-300">USD {subtotal.toFixed(2)}</span>
          </div>
          {showDeliveryFee ? (
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Delivery fee</span>
              <span className="font-mono text-gray-300">USD {deliveryFee.toFixed(2)}</span>
            </div>
          ) : null}
          <div className="mt-3 flex justify-between border-t border-surface-border pt-3 text-sm font-semibold text-white">
            <span>Customer pays</span>
            <span className="font-mono">USD {total.toFixed(2)}</span>
          </div>
          {selectedItem ? (
            <p className="mt-2 text-[11px] text-gray-500">
              Item type · {itemType}
              {selectedItem.subtitle ? ` · ${selectedItem.subtitle}` : ''}
            </p>
          ) : null}
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
