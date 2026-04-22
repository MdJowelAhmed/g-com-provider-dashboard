import { useMemo, useState } from 'react'
import { Search, Eye, Calendar, BedDouble, Users, Star } from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import StayBookingDrawer from './StayBookingDrawer'
import {
  INITIAL_STAY_BOOKINGS,
  STAY_BOOKING_STATUS_OPTIONS,
  STAY_PAYMENT_STATUS_OPTIONS,
  BOOKING_SOURCE_LABELS,
  type StayBooking,
  type StayBookingStatus,
  type StayPaymentStatus,
} from './stayBookingTypes'

const allFilter = '__all__'

const statusToneClass: Record<StayBookingStatus, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  confirmed: 'bg-blue-500/15 text-blue-400',
  checked_in: 'bg-brand/20 text-brand-cream',
  checked_out: 'bg-accent-success/15 text-accent-success',
  cancelled: 'bg-accent-danger/15 text-accent-danger',
  no_show: 'bg-gray-500/20 text-gray-300',
}

const paymentToneClass: Record<StayPaymentStatus, string> = {
  unpaid: 'bg-accent-danger/15 text-accent-danger',
  deposit: 'bg-blue-500/15 text-blue-400',
  partial: 'bg-accent-amber/15 text-accent-amber',
  paid: 'bg-accent-success/15 text-accent-success',
  refunded: 'bg-gray-500/20 text-gray-300',
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

function statusLabel(s: StayBookingStatus) {
  return STAY_BOOKING_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function paymentLabel(s: StayPaymentStatus) {
  return STAY_PAYMENT_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function StayBookingsPage() {
  const [bookings, setBookings] = useState<StayBooking[]>(INITIAL_STAY_BOOKINGS)
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
          b.guest.name.toLowerCase().includes(q) ||
          b.guest.phone.toLowerCase().includes(q) ||
          b.guest.email.toLowerCase().includes(q) ||
          b.guest.country.toLowerCase().includes(q) ||
          b.room.roomNumber.toLowerCase().includes(q) ||
          b.room.name.toLowerCase().includes(q)
        )
      })
      .sort(
        (a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime(),
      )
  }, [bookings, search, statusFilter, paymentFilter])

  const totals = useMemo(() => {
    const t = today()
    const arrivingToday = bookings.filter(
      (b) => b.checkIn === t && (b.status === 'confirmed' || b.status === 'pending'),
    ).length
    const departingToday = bookings.filter(
      (b) => b.checkOut === t && b.status === 'checked_in',
    ).length
    const checkedIn = bookings.filter((b) => b.status === 'checked_in').length
    const upcoming = bookings.filter(
      (b) =>
        (b.status === 'confirmed' || b.status === 'pending') && b.checkIn > t,
    ).length
    const revenue = bookings
      .filter((b) => b.status === 'checked_out')
      .reduce((sum, b) => sum + b.paidAmount, 0)
    return {
      total: bookings.length,
      arrivingToday,
      departingToday,
      checkedIn,
      upcoming,
      revenue,
    }
  }, [bookings])

  const selected = openId ? bookings.find((b) => b.id === openId) ?? null : null

  const handleUpdate = (id: string, patch: Partial<StayBooking>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  const handleDelete = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div>
      <PageHeader
        title="Reservations"
        description="Every room booking — arrivals, stays in progress, departures, and cancellations."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <SummaryTile label="Total" value={totals.total} tone="neutral" />
        <SummaryTile label="Arriving today" value={totals.arrivingToday} tone="info" />
        <SummaryTile label="In-house" value={totals.checkedIn} tone="brand" />
        <SummaryTile label="Departing today" value={totals.departingToday} tone="warning" />
        <SummaryTile label="Upcoming" value={totals.upcoming} tone="success" />
        <SummaryTile
          label="Revenue"
          value={`$${totals.revenue.toFixed(0)}`}
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
            placeholder="Search by code, guest, phone, country, or room"
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
          {STAY_BOOKING_STATUS_OPTIONS.map((o) => (
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
          {STAY_PAYMENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1260px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Reservation</th>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Stay</th>
                <th className="px-4 py-3 font-medium">Guests</th>
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
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    No reservations match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="cursor-pointer border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                    onClick={() => setOpenId(b.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-gray-300">{b.code}</div>
                      <div className="mt-0.5 text-[11px] text-gray-500">
                        {BOOKING_SOURCE_LABELS[b.source]}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-100">{b.guest.name}</div>
                      <div className="text-xs text-gray-500">
                        {b.guest.country} · {b.guest.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-1 text-gray-200">
                        <BedDouble size={12} className="mt-0.5 shrink-0 text-gray-500" />
                        <div className="min-w-0">
                          <div className="text-sm">#{b.room.roomNumber}</div>
                          <div
                            className="max-w-[160px] truncate text-[11px] text-gray-500"
                            title={b.room.name}
                          >
                            {b.room.roomType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-200">
                        <Calendar size={12} className="text-gray-500" />
                        <span className="text-sm">
                          {formatShortDate(b.checkIn)} → {formatShortDate(b.checkOut)}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {b.nights} night{b.nights === 1 ? '' : 's'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-200">
                        <Users size={12} className="text-gray-500" />
                        <span className="text-sm">
                          {b.adults}A{b.children > 0 ? ` + ${b.children}C` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-semibold text-gray-100">
                        ${b.totalAmount.toFixed(2)}
                      </div>
                      {b.paidAmount > 0 && b.paidAmount < b.totalAmount ? (
                        <div className="text-xs text-gray-500">
                          paid ${b.paidAmount.toFixed(0)}
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
                      ) : b.status === 'checked_out' ? (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StayBookingDrawer
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
