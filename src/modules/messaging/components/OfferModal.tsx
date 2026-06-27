import { Modal } from 'antd'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useGetServicesQuery } from '../../../redux/api/serviceApi'
import { mapServiceFromApi } from '../../../pages/dashboard/services/serviceMapping'
import type { Role } from '../../../types/role'
import type { RoleMessagingConfig } from '../types'
import type { CreateOfferInput } from '../hooks/useMessaging'
import { itemTypeForRole, toIsoStartTime } from '../utils/offerHelpers'

type Props = {
  open: boolean
  role: Role
  config: RoleMessagingConfig
  submitting?: boolean
  onClose: () => void
  onSubmit: (input: CreateOfferInput) => Promise<void>
}

const inputClass =
  'messaging-input mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25'

export default function OfferModal({
  open,
  role,
  config,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const { data: servicesData, isLoading: servicesLoading } = useGetServicesQuery({
    page: 1,
    limit: 100,
  })

  const services = useMemo(
    () => (servicesData?.data ?? []).map((doc) => mapServiceFromApi(doc)),
    [servicesData?.data],
  )

  const [selectedId, setSelectedId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [price, setPrice] = useState(0)
  const [qty, setQty] = useState(1)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [startTime, setStartTime] = useState('')

  const selectedService = services.find((s) => s.id === selectedId)
  const itemType = itemTypeForRole(role)
  const showStartTime = role === 'services' || role === 'events' || role === 'stay'

  useEffect(() => {
    if (!open || services.length === 0) return
    const first = services[0]
    setSelectedId(first.id)
    setTitle(first.name)
    setDescription(first.description)
    setNotes('')
    setPrice(first.price)
    setQty(1)
    setDeliveryFee(0)
    setStartTime('')
  }, [open, services])

  const handleServiceChange = (serviceId: string) => {
    setSelectedId(serviceId)
    const service = services.find((s) => s.id === serviceId)
    if (!service) return
    setTitle(service.name)
    setDescription(service.description)
    setPrice(service.price)
  }

  const subtotal = price * qty
  const total = subtotal + deliveryFee

  const handleOk = async () => {
    if (!selectedId || !title.trim()) return
    const isoStart = toIsoStartTime(startTime)
    await onSubmit({
      itemId: selectedId,
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim(),
      price: Number(price),
      quantity: qty,
      deliveryFee: Number(deliveryFee),
      itemType,
      ...(isoStart ? { startTime: isoStart } : {}),
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
        disabled: !selectedId || !title.trim() || servicesLoading,
        loading: submitting,
      }}
    >
      <div className="space-y-4 text-sm text-gray-200">
        <Field label="Service / item">
          {servicesLoading ? (
            <p className="mt-1 text-xs text-gray-500">Loading items…</p>
          ) : services.length === 0 ? (
            <p className="mt-1 text-xs text-accent-amber">
              No services found. Add a service first to send an offer.
            </p>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className={inputClass}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — ${s.price.toFixed(2)}
                  {s.serviceCode ? ` (${s.serviceCode})` : ''}
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

        {showStartTime ? (
          <Field label="Start time (optional)">
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            />
          </Field>
        ) : null}

        <div className="rounded-xl border border-surface-border bg-surface-elevated p-4">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal</span>
            <span className="font-mono text-gray-300">USD {subtotal.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Delivery fee</span>
            <span className="font-mono text-gray-300">USD {deliveryFee.toFixed(2)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-surface-border pt-3 text-sm font-semibold text-white">
            <span>Customer pays</span>
            <span className="font-mono">USD {total.toFixed(2)}</span>
          </div>
          {selectedService ? (
            <p className="mt-2 text-[11px] text-gray-500">
              Item type · {itemType}
              {selectedService.duration ? ` · ${selectedService.duration}` : ''}
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
