import { useMemo, useState } from 'react'
import { Search, Eye, Ban, Printer, CreditCard, Wallet, Star } from 'lucide-react'
import { Modal } from 'antd'
import PageHeader from '../../../components/dashboard/PageHeader'
import OrderDetailsDrawer from './OrderDetailsDrawer'
import {
  FULFILLMENT_STATUS_OPTIONS,
  INITIAL_ORDERS,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_OPTIONS,
  type FulfillmentStatus,
  type Order,
  type PaymentMethod,
  type PaymentStatus,
} from './orderTypes'

const allFilter = '__all__'

const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
  paid: 'bg-accent-success/15 text-accent-success',
  pending: 'bg-accent-amber/15 text-accent-amber',
  refunded: 'bg-gray-500/15 text-gray-300',
  failed: 'bg-accent-danger/15 text-accent-danger',
}

const FULFILLMENT_STATUS_STYLE: Record<FulfillmentStatus, string> = {
  unfulfilled: 'bg-gray-500/15 text-gray-300',
  processing: 'bg-accent-amber/15 text-accent-amber',
  shipped: 'bg-blue-500/15 text-blue-300',
  out_for_delivery: 'bg-blue-500/15 text-blue-300',
  delivered: 'bg-accent-success/15 text-accent-success',
  cancelled: 'bg-accent-danger/15 text-accent-danger',
  returned: 'bg-accent-danger/15 text-accent-danger',
}

function labelFor<T extends string>(
  value: T,
  options: { value: T; label: string }[],
) {
  return options.find((o) => o.value === value)?.label ?? value
}

function formatMoney(n: number) {
  return `$${n.toFixed(2)}`
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function PaymentMethodIcon({ method }: { method: PaymentMethod }) {
  if (method === 'cod') return <Wallet size={12} />
  return <CreditCard size={12} />
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<string>(allFilter)
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>(allFilter)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (paymentFilter !== allFilter && o.paymentStatus !== paymentFilter) return false
      if (fulfillmentFilter !== allFilter && o.fulfillmentStatus !== fulfillmentFilter)
        return false
      if (!q) return true
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        (o.trackingNumber ?? '').toLowerCase().includes(q)
      )
    })
  }, [orders, search, paymentFilter, fulfillmentFilter])

  const totals = useMemo(() => {
    const revenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0)
    return {
      total: orders.length,
      unfulfilled: orders.filter(
        (o) =>
          o.fulfillmentStatus === 'unfulfilled' ||
          o.fulfillmentStatus === 'processing',
      ).length,
      shipped: orders.filter(
        (o) =>
          o.fulfillmentStatus === 'shipped' ||
          o.fulfillmentStatus === 'out_for_delivery',
      ).length,
      needsAttention: orders.filter(
        (o) => o.paymentStatus === 'failed' || o.paymentStatus === 'pending',
      ).length,
      revenue,
    }
  }, [orders])

  const updatePayment = (id: string, status: PaymentStatus) =>
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, paymentStatus: status } : o)),
    )

  const updateFulfillment = (id: string, status: FulfillmentStatus) =>
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, fulfillmentStatus: status } : o)),
    )

  const cancelOrder = (o: Order) => {
    Modal.confirm({
      title: `Cancel order ${o.id}?`,
      content: (
        <span>
          This will mark the order as cancelled. If payment was captured, you'll need to refund it
          separately.
        </span>
      ),
      okText: 'Cancel order',
      okButtonProps: { danger: true },
      cancelText: 'Keep order',
      centered: true,
      onOk: () => updateFulfillment(o.id, 'cancelled'),
    })
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Track purchases, payments, and fulfillment across your store."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <SummaryTile label="Total orders" value={totals.total.toString()} tone="neutral" />
        <SummaryTile
          label="Unfulfilled"
          value={totals.unfulfilled.toString()}
          tone="warning"
        />
        <SummaryTile label="In transit" value={totals.shipped.toString()} tone="info" />
        <SummaryTile
          label="Needs attention"
          value={totals.needsAttention.toString()}
          tone="danger"
        />
        <SummaryTile
          label="Paid revenue"
          value={formatMoney(totals.revenue)}
          tone="success"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by order #, customer, email, or tracking"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-surface-border bg-surface-card pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All payments</option>
          {PAYMENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={fulfillmentFilter}
          onChange={(e) => setFulfillmentFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All fulfillment</option>
          {FULFILLMENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1140px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 text-right font-medium">Items</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Fulfillment</th>
                <th className="px-4 py-3 font-medium">Ship to</th>
                <th className="px-4 py-3 font-medium">Review</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    No orders match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const itemCount = o.items.reduce((n, it) => n + it.quantity, 0)
                  const isFinal =
                    o.fulfillmentStatus === 'cancelled' ||
                    o.fulfillmentStatus === 'delivered' ||
                    o.fulfillmentStatus === 'returned'
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                    >
                      <td className="px-4 py-3 font-medium text-gray-100">{o.id}</td>
                      <td className="px-4 py-3 text-gray-300">
                        {formatShortDate(o.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-100">{o.customer.name}</div>
                        <div className="text-xs text-gray-500">{o.customer.email}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-200">{itemCount}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-100">
                        {formatMoney(o.total)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex w-max items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                              PAYMENT_STATUS_STYLE[o.paymentStatus]
                            }`}
                          >
                            {labelFor(o.paymentStatus, PAYMENT_STATUS_OPTIONS)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <PaymentMethodIcon method={o.paymentMethod} />
                            {PAYMENT_METHOD_LABEL[o.paymentMethod]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex w-max items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            FULFILLMENT_STATUS_STYLE[o.fulfillmentStatus]
                          }`}
                        >
                          {labelFor(o.fulfillmentStatus, FULFILLMENT_STATUS_OPTIONS)}
                        </span>
                        {o.trackingNumber && (
                          <div className="mt-1 font-mono text-[11px] text-gray-500">
                            {o.courier ? `${o.courier} · ` : ''}
                            {o.trackingNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {o.shippingAddress.city}, {o.shippingAddress.country}
                      </td>
                      <td className="px-4 py-3">
                        {o.review ? (
                          <span className="inline-flex items-center gap-1 text-gray-200">
                            <Star
                              size={13}
                              className="fill-accent-amber text-accent-amber"
                            />
                            <span className="text-sm font-medium">
                              {o.review.rating.toFixed(1)}
                            </span>
                          </span>
                        ) : o.fulfillmentStatus === 'delivered' ? (
                          <span className="text-xs text-gray-500">Awaiting</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            title="View details"
                            onClick={() => setSelectedId(o.id)}
                          >
                            <Eye size={15} />
                          </IconButton>
                          <IconButton
                            title="Print invoice"
                            onClick={() => window.print()}
                          >
                            <Printer size={15} />
                          </IconButton>
                          <IconButton
                            title={isFinal ? 'Order already closed' : 'Cancel order'}
                            danger
                            disabled={isFinal}
                            onClick={() => cancelOrder(o)}
                          >
                            <Ban size={15} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailsDrawer
        order={selectedOrder}
        open={selectedOrder != null}
        onClose={() => setSelectedId(null)}
        onChangePayment={updatePayment}
        onChangeFulfillment={updateFulfillment}
      />
    </div>
  )
}

function IconButton({
  children,
  title,
  onClick,
  danger,
  disabled,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-gray-300 disabled:cursor-not-allowed disabled:opacity-40 ${
        disabled
          ? ''
          : `hover:border-surface-border hover:bg-surface-elevated ${
              danger ? 'hover:text-accent-danger' : 'hover:text-white'
            }`
      }`}
    >
      {children}
    </button>
  )
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}) {
  const toneClass: Record<typeof tone, string> = {
    neutral: 'text-gray-100',
    success: 'text-accent-success',
    warning: 'text-accent-amber',
    danger: 'text-accent-danger',
    info: 'text-blue-300',
  }
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${toneClass[tone]}`}>{value}</div>
    </div>
  )
}
