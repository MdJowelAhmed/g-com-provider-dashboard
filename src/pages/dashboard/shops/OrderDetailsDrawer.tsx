import { Drawer, Select, Divider, Tag } from 'antd'
import { Mail, Phone, MapPin, Package, Truck, StickyNote, Star } from 'lucide-react'
import {
  FULFILLMENT_STATUS_OPTIONS,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_OPTIONS,
  type FulfillmentStatus,
  type Order,
  type PaymentStatus,
} from './orderTypes'

type Props = {
  order: Order | null
  open: boolean
  onClose: () => void
  onChangePayment: (id: string, status: PaymentStatus) => void
  onChangeFulfillment: (id: string, status: FulfillmentStatus) => void
}

function formatMoney(n: number) {
  return `$${n.toFixed(2)}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function OrderDetailsDrawer({
  order,
  open,
  onClose,
  onChangePayment,
  onChangeFulfillment,
}: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      title={order ? `Order ${order.id}` : 'Order'}
      destroyOnHidden
    >
      {order && (
        <div className="space-y-6 text-sm">
          <div className="flex items-center justify-between text-gray-400">
            <span>Placed {formatDate(order.createdAt)}</span>
            <Tag color="default">{order.items.length} items</Tag>
          </div>

          <section>
            <SectionTitle icon={<Package size={14} />}>Status</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <LabeledControl label="Payment">
                <Select
                  size="small"
                  value={order.paymentStatus}
                  onChange={(v) => onChangePayment(order.id, v)}
                  options={PAYMENT_STATUS_OPTIONS}
                  style={{ width: '100%' }}
                />
              </LabeledControl>
              <LabeledControl label="Fulfillment">
                <Select
                  size="small"
                  value={order.fulfillmentStatus}
                  onChange={(v) => onChangeFulfillment(order.id, v)}
                  options={FULFILLMENT_STATUS_OPTIONS}
                  style={{ width: '100%' }}
                />
              </LabeledControl>
            </div>
          </section>

          <section>
            <SectionTitle>Customer</SectionTitle>
            <div className="rounded-lg border border-surface-border bg-surface-card p-3">
              <div className="font-medium text-gray-100">{order.customer.name}</div>
              <div className="mt-1 flex items-center gap-1.5 text-gray-400">
                <Mail size={12} /> {order.customer.email}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-gray-400">
                <Phone size={12} /> {order.customer.phone}
              </div>
            </div>
          </section>

          <section>
            <SectionTitle icon={<MapPin size={14} />}>Shipping address</SectionTitle>
            <div className="rounded-lg border border-surface-border bg-surface-card p-3 text-gray-300">
              <div>{order.shippingAddress.line1}</div>
              <div>
                {order.shippingAddress.city}
                {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}{' '}
                {order.shippingAddress.postalCode}
              </div>
              <div>{order.shippingAddress.country}</div>
              {!order.billingSameAsShipping && (
                <div className="mt-2 text-xs text-gray-500">
                  Billing address differs from shipping.
                </div>
              )}
            </div>
          </section>

          <section>
            <SectionTitle icon={<Truck size={14} />}>Shipping</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Method" value={order.shippingMethod} />
              <KV label="Courier" value={order.courier || '—'} />
              <KV
                label="Tracking #"
                value={order.trackingNumber || '—'}
                mono
                full
              />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Package size={14} />}>Items</SectionTitle>
            <div className="overflow-hidden rounded-lg border border-surface-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-3 py-2 font-medium">Product</th>
                    <th className="px-3 py-2 text-right font-medium">Qty</th>
                    <th className="px-3 py-2 text-right font-medium">Price</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it) => (
                    <tr
                      key={it.id}
                      className="border-t border-surface-border text-gray-200"
                    >
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-100">{it.name}</div>
                        <div className="text-xs text-gray-500">
                          SKU · {it.sku}
                          {it.variant ? ` · ${it.variant}` : ''}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">{it.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatMoney(it.unitPrice)}</td>
                      <td className="px-3 py-2 text-right">
                        {formatMoney(it.unitPrice * it.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <SectionTitle>Payment summary</SectionTitle>
            <div className="rounded-lg border border-surface-border bg-surface-card p-3">
              <SummaryRow label="Subtotal" value={formatMoney(order.subtotal)} />
              <SummaryRow label="Shipping" value={formatMoney(order.shipping)} />
              <SummaryRow label="Tax" value={formatMoney(order.tax)} />
              {order.discount > 0 && (
                <SummaryRow
                  label="Discount"
                  value={`-${formatMoney(order.discount)}`}
                  tone="danger"
                />
              )}
              <Divider style={{ margin: '8px 0' }} />
              <SummaryRow
                label="Total"
                value={formatMoney(order.total)}
                strong
              />
              <div className="mt-2 text-xs text-gray-400">
                Paid via{' '}
                <span className="text-gray-200">
                  {PAYMENT_METHOD_LABEL[order.paymentMethod]}
                </span>
              </div>
            </div>
          </section>

          {order.review ? (
            <section>
              <SectionTitle icon={<Star size={14} />}>Customer review</SectionTitle>
              <div className="rounded-lg border border-surface-border bg-surface-card p-3">
                <div className="mb-1 flex items-center justify-between">
                  <StarRating rating={order.review.rating} />
                  <span className="text-xs text-gray-500">
                    {formatDate(order.review.createdAt)}
                  </span>
                </div>
                {order.review.comment ? (
                  <div className="mt-1 text-sm text-gray-200">{order.review.comment}</div>
                ) : null}
              </div>
            </section>
          ) : order.fulfillmentStatus === 'delivered' ? (
            <section>
              <SectionTitle icon={<Star size={14} />}>Customer review</SectionTitle>
              <div className="rounded-lg border border-dashed border-surface-border bg-surface-card p-3 text-sm text-gray-500">
                No review submitted yet.
              </div>
            </section>
          ) : null}

          {order.notes && (
            <section>
              <SectionTitle icon={<StickyNote size={14} />}>Note</SectionTitle>
              <div className="rounded-lg border border-surface-border bg-surface-card p-3 text-gray-300">
                {order.notes}
              </div>
            </section>
          )}
        </div>
      )}
    </Drawer>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={14}
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

function SectionTitle({
  children,
  icon,
}: {
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-400">
      {icon}
      {children}
    </div>
  )
}

function LabeledControl({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1 text-xs text-gray-500">{label}</div>
      {children}
    </div>
  )
}

function KV({
  label,
  value,
  mono,
  full,
}: {
  label: string
  value: string
  mono?: boolean
  full?: boolean
}) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-gray-200 ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  strong,
  tone,
}: {
  label: string
  value: string
  strong?: boolean
  tone?: 'danger'
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={strong ? 'font-medium text-gray-100' : 'text-gray-400'}>
        {label}
      </span>
      <span
        className={
          tone === 'danger'
            ? 'text-accent-danger'
            : strong
              ? 'font-semibold text-gray-100'
              : 'text-gray-200'
        }
      >
        {value}
      </span>
    </div>
  )
}
