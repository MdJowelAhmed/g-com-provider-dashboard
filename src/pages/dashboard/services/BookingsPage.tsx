import { useMemo, useState } from 'react'
import { Search, Eye, Clock, MapPin, Star } from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import BookingDrawer from './BookingDrawer'
import {
  INITIAL_BOOKINGS,
  BOOKING_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  type Booking,
  type BookingStatus,
  type PaymentStatus,
} from './bookingTypes'

const allFilter = '__all__'

const statusToneClass: Record<BookingStatus, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  confirmed: 'bg-blue-500/15 text-blue-400',
  in_progress: 'bg-brand/20 text-brand-cream',
  completed: 'bg-accent-success/15 text-accent-success',
  cancelled: 'bg-accent-danger/15 text-accent-danger',
  no_show: 'bg-gray-500/20 text-gray-300',
}

const paymentToneClass: Record<PaymentStatus, string> = {
  unpaid: 'bg-accent-danger/15 text-accent-danger',
  partial: 'bg-accent-amber/15 text-accent-amber',
  paid: 'bg-accent-success/15 text-accent-success',
  refunded: 'bg-gray-500/20 text-gray-300',
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  }
}

function formatDuration(mins: number) {
  if (!mins) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

function statusLabel(s: BookingStatus) {
  return BOOKING_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function paymentLabel(s: PaymentStatus) {
  return PAYMENT_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)
  const [paymentFilter, setPaymentFilter] = useState<string>(allFilter)
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return bookings
      .filter((b) => {
        if (statusFilter !== allFilter && b.status !== statusFilter) return false
        if (paymentFilter !== allFilter && b.paymentStatus !== paymentFilter) return false
        if (!q) return true
        return (
          b.code.toLowerCase().includes(q) ||
          b.customer.name.toLowerCase().includes(q) ||
          b.customer.phone.toLowerCase().includes(q) ||
          b.customer.email.toLowerCase().includes(q) ||
          b.service.name.toLowerCase().includes(q) ||
          b.location.address.toLowerCase().includes(q) ||
          b.location.city.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
  }, [bookings, search, statusFilter, paymentFilter])

  const totals = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 'pending').length
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length
    const inProgress = bookings.filter((b) => b.status === 'in_progress').length
    const completed = bookings.filter((b) => b.status === 'completed').length
    const revenue = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.paidAmount, 0)
    return { total: bookings.length, pending, confirmed, inProgress, completed, revenue }
  }, [bookings])

  const selected = openId ? bookings.find((b) => b.id === openId) ?? null : null

  const handleUpdate = (id: string, patch: Partial<Booking>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  const handleDelete = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Incoming requests from customers — manage schedule, payments, and job status."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <SummaryTile label="Total" value={totals.total} tone="neutral" />
        <SummaryTile label="Pending" value={totals.pending} tone="warning" />
        <SummaryTile label="Confirmed" value={totals.confirmed} tone="info" />
        <SummaryTile label="In progress" value={totals.inProgress} tone="brand" />
        <SummaryTile label="Completed" value={totals.completed} tone="success" />
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
            placeholder="Search by code, customer, service, or address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-surface-border bg-surface-card pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All statuses</option>
          {BOOKING_STATUS_OPTIONS.map((o) => (
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
          {PAYMENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Booking</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Schedule</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Review</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    No bookings match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const { date, time } = formatDateTime(b.scheduledAt)
                  return (
                    <tr
                      key={b.id}
                      className="cursor-pointer border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                      onClick={() => setOpenId(b.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-gray-300">{b.code}</div>
                        <div className="mt-0.5 text-[11px] text-gray-500">
                          {b.staffAssigned.length
                            ? `${b.staffAssigned.length} staff`
                            : 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-100">{b.customer.name}</div>
                        <div className="text-xs text-gray-500">{b.customer.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-200">{b.service.name}</div>
                        <div className="text-xs text-gray-500">{b.service.category}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-200">{date}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={11} /> {time} · {formatDuration(b.durationMinutes)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-1 text-gray-300">
                          <MapPin size={12} className="mt-0.5 shrink-0 text-gray-500" />
                          <div className="min-w-0">
                            <div
                              className="max-w-[180px] truncate text-sm"
                              title={b.location.address}
                            >
                              {b.location.address}
                            </div>
                            <div className="text-xs text-gray-500">{b.location.city}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-medium text-gray-100">${b.amount.toFixed(2)}</div>
                        {b.paidAmount > 0 && b.paidAmount < b.amount ? (
                          <div className="text-xs text-gray-500">
                            paid ${b.paidAmount.toFixed(2)}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusToneClass[b.status]
                          }`}
                        >
                          {statusLabel(b.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            paymentToneClass[b.paymentStatus]
                          }`}
                        >
                          {paymentLabel(b.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {b.review ? (
                          <span className="inline-flex items-center gap-1 text-gray-200">
                            <Star
                              size={13}
                              className="fill-accent-amber text-accent-amber"
                            />
                            <span className="text-sm font-medium">
                              {b.review.rating.toFixed(1)}
                            </span>
                          </span>
                        ) : b.status === 'completed' ? (
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
                              setOpenId(b.id)
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

      <BookingDrawer
        open={openId !== null}
        booking={selected}
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
