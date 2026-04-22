import { useMemo, useState } from 'react'
import {
  Search,
  Eye,
  Utensils,
  Package,
  Bike,
  Star,
  Hash,
  MapPin,
} from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import OrderDrawer from './OrderDrawer'
import {
  INITIAL_ORDERS,
  ORDER_STATUS_OPTIONS,
  ORDER_TYPE_OPTIONS,
  ORDER_PAYMENT_STATUS_OPTIONS,
  ORDER_SOURCE_LABELS,
  type Order,
  type OrderStatus,
  type OrderType,
  type OrderPaymentStatus,
} from './orderTypes'

const allFilter = '__all__'

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

function typeIcon(t: OrderType) {
  if (t === 'dine_in') return <Utensils size={11} />
  if (t === 'takeout') return <Package size={11} />
  return <Bike size={11} />
}

function typeLabel(t: OrderType) {
  return ORDER_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t
}

function statusLabel(s: OrderStatus) {
  return ORDER_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function paymentLabel(s: OrderPaymentStatus) {
  return ORDER_PAYMENT_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

function itemSummary(order: Order) {
  const qty = order.items.reduce((sum, it) => sum + it.quantity, 0)
  const preview = order.items
    .slice(0, 2)
    .map((it) => `${it.quantity}× ${it.name}`)
    .join(', ')
  const more = order.items.length > 2 ? `, +${order.items.length - 2} more` : ''
  return { qty, text: preview + more }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>(allFilter)
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)
  const [paymentFilter, setPaymentFilter] = useState<string>(allFilter)
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders
      .filter((o) => {
        if (typeFilter !== allFilter && o.orderType !== typeFilter) return false
        if (statusFilter !== allFilter && o.status !== statusFilter) return false
        if (paymentFilter !== allFilter && o.paymentStatus !== paymentFilter) return false
        if (!q) return true
        return (
          o.code.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q) ||
          o.tableNumber.toLowerCase().includes(q) ||
          (o.delivery?.address.toLowerCase().includes(q) ?? false) ||
          o.items.some((it) => it.name.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, search, typeFilter, statusFilter, paymentFilter])

  const totals = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'pending').length
    const preparing = orders.filter((o) => o.status === 'preparing').length
    const ready = orders.filter((o) => o.status === 'ready').length
    const outForDelivery = orders.filter((o) => o.status === 'out_for_delivery').length
    const revenue = orders
      .filter((o) => o.status === 'completed' && o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0)
    return {
      total: orders.length,
      pending,
      preparing,
      ready,
      outForDelivery,
      revenue,
    }
  }, [orders])

  const selected = openId ? orders.find((o) => o.id === openId) ?? null : null

  const handleUpdate = (id: string, patch: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }

  const handleDelete = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Incoming orders from dine-in, takeout, and delivery channels."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <SummaryTile label="Total" value={totals.total} tone="neutral" />
        <SummaryTile label="Pending" value={totals.pending} tone="warning" />
        <SummaryTile label="Preparing" value={totals.preparing} tone="brand" />
        <SummaryTile label="Ready" value={totals.ready} tone="success" />
        <SummaryTile label="On the way" value={totals.outForDelivery} tone="info" />
        <SummaryTile
          label="Revenue"
          value={`$${totals.revenue.toFixed(2)}`}
          tone="success"
          compact
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by code, customer, table, address, or item"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-surface-border bg-surface-card pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All types</option>
          {ORDER_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All statuses</option>
          {ORDER_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All payments</option>
          {ORDER_PAYMENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Customer / Location</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Review</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                    No orders match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const { qty, text } = itemSummary(o)
                  return (
                    <tr
                      key={o.id}
                      className="cursor-pointer border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                      onClick={() => setOpenId(o.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-gray-300">{o.code}</div>
                        <div className="mt-0.5 text-[11px] text-gray-500">
                          {ORDER_SOURCE_LABELS[o.source]} · {formatShortDate(o.createdAt)}{' '}
                          {formatTime(o.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            typeToneClass[o.orderType]
                          }`}
                        >
                          {typeIcon(o.orderType)} {typeLabel(o.orderType)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-100">{o.customer.name}</div>
                        {o.orderType === 'dine_in' ? (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Hash size={10} /> {o.tableNumber}
                          </div>
                        ) : o.orderType === 'delivery' && o.delivery ? (
                          <div className="flex items-start gap-1 text-xs text-gray-500">
                            <MapPin size={10} className="mt-0.5 shrink-0" />
                            <span
                              className="max-w-[180px] truncate"
                              title={o.delivery.address}
                            >
                              {o.delivery.address}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">{o.customer.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-200">
                          {qty} {qty === 1 ? 'unit' : 'units'}
                        </div>
                        <div
                          className="max-w-[240px] truncate text-[11px] text-gray-500"
                          title={text}
                        >
                          {text}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-gray-100">
                          ${o.total.toFixed(2)}
                        </div>
                        {o.deliveryFee > 0 ? (
                          <div className="text-[11px] text-gray-500">
                            incl. ${o.deliveryFee.toFixed(2)} delivery
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusToneClass[o.status]
                          }`}
                        >
                          {statusLabel(o.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            paymentToneClass[o.paymentStatus]
                          }`}
                        >
                          {paymentLabel(o.paymentStatus)}
                        </span>
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
                        ) : o.status === 'completed' ? (
                          <span className="text-xs text-gray-500">Awaiting</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            title="View details"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenId(o.id)
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-gray-300 hover:border-surface-border hover:bg-surface-card hover:text-white"
                          >
                            <Eye size={15} />
                          </button>
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

      <OrderDrawer
        open={openId !== null}
        order={selected}
        onClose={() => setOpenId(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  )
}

function SummaryTile({
  label,
  value,
  tone,
  compact,
}: {
  label: string
  value: number | string
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'muted' | 'info' | 'brand'
  compact?: boolean
}) {
  const toneClass: Record<typeof tone, string> = {
    neutral: 'text-gray-100',
    success: 'text-accent-success',
    warning: 'text-accent-amber',
    danger: 'text-accent-danger',
    muted: 'text-gray-400',
    info: 'text-blue-400',
    brand: 'text-brand-cream',
  }
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div
        className={`mt-1 font-semibold ${toneClass[tone]} ${
          compact ? 'text-lg' : 'text-xl'
        }`}
      >
        {value}
      </div>
    </div>
  )
}
