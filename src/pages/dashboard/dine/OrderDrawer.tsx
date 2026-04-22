import { useEffect, useMemo, useState } from 'react'
import {
  Drawer,
  Button,
  Space,
  Divider,
  Input,
  Select,
  Popconfirm,
  message,
} from 'antd'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  Building2,
  User as UserIcon,
  Star,
  Utensils,
  Package,
  Bike,
  Hash,
  ExternalLink,
} from 'lucide-react'
import {
  ORDER_STATUS_OPTIONS,
  ORDER_PAYMENT_STATUS_OPTIONS,
  ORDER_PAYMENT_METHOD_LABELS,
  ORDER_SOURCE_LABELS,
  type Order,
  type OrderStatus,
  type OrderPaymentStatus,
  type OrderType,
} from './orderTypes'

type Props = {
  open: boolean
  order: Order | null
  onClose: () => void
  onUpdate: (id: string, patch: Partial<Order>) => void
  onDelete: (id: string) => void
}

const statusToneClass: Record<OrderStatus, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  confirmed: 'bg-blue-500/15 text-blue-400',
  preparing: 'bg-brand/20 text-brand-cream',
  ready: 'bg-accent-success/15 text-accent-success',
  out_for_delivery: 'bg-blue-500/15 text-blue-400',
  completed: 'bg-accent-success/15 text-accent-success',
  cancelled: 'bg-accent-danger/15 text-accent-danger',
}

const paymentToneClass: Record<OrderPaymentStatus, string> = {
  unpaid: 'bg-accent-danger/15 text-accent-danger',
  paid: 'bg-accent-success/15 text-accent-success',
  refunded: 'bg-gray-500/20 text-gray-300',
}

const typeToneClass: Record<OrderType, string> = {
  dine_in: 'bg-brand/20 text-brand-cream',
  takeout: 'bg-accent-amber/15 text-accent-amber',
  delivery: 'bg-blue-500/15 text-blue-400',
}

const typeLabel: Record<OrderType, string> = {
  dine_in: 'Dine-in',
  takeout: 'Takeout',
  delivery: 'Delivery',
}

function typeIcon(t: OrderType) {
  if (t === 'dine_in') return <Utensils size={12} />
  if (t === 'takeout') return <Package size={12} />
  return <Bike size={12} />
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(s: OrderStatus) {
  return ORDER_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function paymentLabel(s: OrderPaymentStatus) {
  return ORDER_PAYMENT_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function mapSrc(lat: number, lon: number) {
  const latDelta = 0.003
  const lonDelta = 0.005
  const minLon = lon - lonDelta
  const minLat = lat - latDelta
  const maxLon = lon + lonDelta
  const maxLat = lat + latDelta
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lon}`
}

function mapLink(lat: number, lon: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`
}

export default function OrderDrawer({ open, order, onClose, onUpdate, onDelete }: Props) {
  const [internalNotes, setInternalNotes] = useState('')

  useEffect(() => {
    setInternalNotes(order?.internalNotes ?? '')
  }, [order])

  const totalQty = useMemo(
    () => (order ? order.items.reduce((sum, it) => sum + it.quantity, 0) : 0),
    [order],
  )
  const mapUrl = useMemo(
    () =>
      order?.delivery
        ? mapSrc(order.delivery.latitude, order.delivery.longitude)
        : '',
    [order],
  )

  if (!order) {
    return <Drawer open={open} onClose={onClose} width={760} title="Order" />
  }

  const saveNotes = () => {
    onUpdate(order.id, {
      internalNotes,
      updatedAt: new Date().toISOString(),
    })
    message.success('Notes saved')
  }

  const changeStatus = (status: OrderStatus) => {
    onUpdate(order.id, { status, updatedAt: new Date().toISOString() })
  }

  const changePayment = (paymentStatus: OrderPaymentStatus) => {
    onUpdate(order.id, {
      paymentStatus,
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={780}
      placement="right"
      destroyOnHidden
      title={
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold">Order</span>
          <span className="rounded-md bg-surface-elevated px-2 py-0.5 font-mono text-xs text-gray-300">
            {order.code}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              typeToneClass[order.orderType]
            }`}
          >
            {typeIcon(order.orderType)} {typeLabel[order.orderType]}
          </span>
        </div>
      }
      extra={
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            statusToneClass[order.status]
          }`}
        >
          {statusLabel(order.status)}
        </span>
      }
      footer={
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Popconfirm
            title="Delete order?"
            description="This will permanently remove the order record."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              onDelete(order.id)
              onClose()
            }}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
          <Space>
            <Button onClick={onClose}>Close</Button>
            <Button type="primary" onClick={saveNotes}>
              Save notes
            </Button>
          </Space>
        </Space>
      }
    >
      <SectionTitle>Customer</SectionTitle>
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-surface-border bg-surface-elevated p-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-card text-gray-400">
          <UserIcon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-100">{order.customer.name}</div>
          {(order.customer.phone || order.customer.email) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
              {order.customer.phone ? (
                <a
                  href={`tel:${order.customer.phone}`}
                  className="inline-flex items-center gap-1 hover:text-brand-cream"
                >
                  <Phone size={12} />
                  {order.customer.phone}
                </a>
              ) : null}
              {order.customer.email ? (
                <a
                  href={`mailto:${order.customer.email}`}
                  className="inline-flex items-center gap-1 hover:text-brand-cream"
                >
                  <Mail size={12} />
                  {order.customer.email}
                </a>
              ) : null}
            </div>
          )}
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
            <Building2 size={11} />
            {ORDER_SOURCE_LABELS[order.source]} · Placed {formatDateTime(order.createdAt)}
          </div>
        </div>
      </div>

      {order.orderType === 'dine_in' ? (
        <>
          <SectionTitle>Table</SectionTitle>
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2">
            <Hash size={14} className="text-gray-500" />
            <span className="font-mono text-sm text-gray-100">{order.tableNumber}</span>
          </div>
        </>
      ) : null}

      {order.orderType === 'delivery' && order.delivery ? (
        <>
          <SectionTitle>Delivery</SectionTitle>
          <div className="mb-4 overflow-hidden rounded-lg border border-surface-border">
            <div className="bg-surface-elevated px-3 py-2">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-100">
                    {order.delivery.address}
                  </div>
                  <div className="text-xs text-gray-500">{order.delivery.city}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-300">
                    <Clock size={11} /> ETA: {order.delivery.eta}
                  </div>
                </div>
                <a
                  href={mapLink(order.delivery.latitude, order.delivery.longitude)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-xs text-brand-cream hover:underline"
                >
                  Open map <ExternalLink size={11} />
                </a>
              </div>
            </div>
            <iframe
              title="Delivery location"
              src={mapUrl}
              className="block h-56 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </>
      ) : null}

      {order.orderType === 'takeout' ? (
        <>
          <SectionTitle>Pickup</SectionTitle>
          <div className="mb-4 rounded-lg border border-surface-border bg-surface-elevated p-3 text-sm text-gray-200">
            Customer will pick up at the counter.
          </div>
        </>
      ) : null}

      <SectionTitle>
        Items · {order.items.length} line{order.items.length === 1 ? '' : 's'} ·{' '}
        {totalQty} {totalQty === 1 ? 'unit' : 'units'}
      </SectionTitle>
      <div className="mb-4 overflow-hidden rounded-lg border border-surface-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 text-right font-medium">Qty</th>
              <th className="px-3 py-2 text-right font-medium">Price</th>
              <th className="px-3 py-2 text-right font-medium">Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, idx) => (
              <tr
                key={`${it.menuItemId}-${idx}`}
                className="border-t border-surface-border first:border-t-0"
              >
                <td className="px-3 py-2">
                  <div className="text-gray-100">{it.name}</div>
                  <div className="font-mono text-[11px] text-gray-500">{it.code}</div>
                  {it.note ? (
                    <div className="mt-0.5 text-[11px] text-accent-amber">Note: {it.note}</div>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-right text-gray-200">×{it.quantity}</td>
                <td className="px-3 py-2 text-right text-gray-400">
                  ${it.unitPrice.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right font-medium text-gray-100">
                  ${it.lineTotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTitle>Charges</SectionTitle>
      <div className="mb-4 overflow-hidden rounded-lg border border-surface-border">
        <table className="w-full text-sm">
          <tbody>
            <ChargeRow label="Subtotal" amount={order.subtotal} />
            <ChargeRow label="Taxes & fees" amount={order.taxesFees} />
            {order.deliveryFee > 0 ? (
              <ChargeRow label="Delivery fee" amount={order.deliveryFee} />
            ) : null}
            {order.discount > 0 ? (
              <ChargeRow label="Discount" amount={-order.discount} tone="success" />
            ) : null}
            <ChargeRow label="Total" amount={order.total} bold />
          </tbody>
        </table>
      </div>

      <SectionTitle>Payment</SectionTitle>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <InfoCard icon={<CreditCard size={14} />} label="Method">
          <div className="font-medium text-gray-100">
            {ORDER_PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </div>
        </InfoCard>
        <InfoCard icon={<CreditCard size={14} />} label="Payment">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              paymentToneClass[order.paymentStatus]
            }`}
          >
            {paymentLabel(order.paymentStatus)}
          </span>
        </InfoCard>
      </div>

      {order.review ? (
        <>
          <SectionTitle>Customer review</SectionTitle>
          <div className="mb-4 rounded-lg border border-surface-border bg-surface-elevated p-3">
            <div className="mb-1 flex items-center justify-between">
              <StarRating rating={order.review.rating} />
              <span className="text-xs text-gray-500">
                {formatDateTime(order.review.createdAt)}
              </span>
            </div>
            {order.review.comment ? (
              <div className="mt-1 text-sm text-gray-200">{order.review.comment}</div>
            ) : null}
          </div>
        </>
      ) : order.status === 'completed' ? (
        <>
          <SectionTitle>Customer review</SectionTitle>
          <div className="mb-4 rounded-lg border border-dashed border-surface-border bg-surface-elevated p-3 text-sm text-gray-500">
            No review submitted yet.
          </div>
        </>
      ) : null}

      {order.specialInstructions ? (
        <>
          <SectionTitle>Special instructions</SectionTitle>
          <div className="mb-4 rounded-lg border border-surface-border bg-surface-elevated p-3 text-sm text-gray-200">
            {order.specialInstructions}
          </div>
        </>
      ) : null}

      <SectionTitle>Internal notes</SectionTitle>
      <Input.TextArea
        rows={3}
        value={internalNotes}
        onChange={(e) => setInternalNotes(e.target.value)}
        placeholder="Only visible to your team"
        className="mb-4"
      />

      <Divider />

      <SectionTitle>Manage</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">Order status</div>
          <Select
            value={order.status}
            style={{ width: '100%' }}
            options={ORDER_STATUS_OPTIONS}
            onChange={(v) => changeStatus(v)}
          />
        </div>
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">Payment status</div>
          <Select
            value={order.paymentStatus}
            style={{ width: '100%' }}
            options={ORDER_PAYMENT_STATUS_OPTIONS}
            onChange={(v) => changePayment(v)}
          />
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Placed {formatDateTime(order.createdAt)} · Updated{' '}
        {formatDateTime(order.updatedAt)}
      </div>
    </Drawer>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </div>
  )
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2">
      <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-500">
        {icon}
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  )
}

function ChargeRow({
  label,
  amount,
  tone = 'neutral',
  bold,
}: {
  label: string
  amount: number
  tone?: 'neutral' | 'muted' | 'success' | 'danger'
  bold?: boolean
}) {
  const toneClass: Record<'neutral' | 'muted' | 'success' | 'danger', string> = {
    neutral: 'text-gray-200',
    muted: 'text-gray-400',
    success: 'text-accent-success',
    danger: 'text-accent-danger',
  }
  const sign = amount < 0 ? '−' : ''
  return (
    <tr className="border-t border-surface-border first:border-t-0">
      <td className={`px-3 py-2 ${bold ? 'font-semibold text-gray-100' : 'text-gray-400'}`}>
        {label}
      </td>
      <td
        className={`px-3 py-2 text-right ${toneClass[tone]} ${bold ? 'font-semibold' : ''}`}
      >
        {sign}${Math.abs(amount).toFixed(2)}
      </td>
    </tr>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={15}
            className={
              i <= Math.round(rating)
                ? 'fill-accent-amber text-accent-amber'
                : 'text-gray-600'
            }
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-100">{rating.toFixed(1)}</span>
    </div>
  )
}
