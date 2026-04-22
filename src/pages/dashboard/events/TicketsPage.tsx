import { useMemo, useState } from 'react'
import {
  Search,
  Eye,
  Calendar,
  Hash,
  Ticket as TicketIcon,
  CheckCircle2,
} from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import TicketDrawer from './TicketDrawer'
import {
  INITIAL_TICKETS,
  TICKET_STATUS_OPTIONS,
  TICKET_PAYMENT_STATUS_OPTIONS,
  TICKET_CHANNEL_LABELS,
  type Ticket,
  type TicketStatus,
  type TicketPaymentStatus,
} from './ticketTypes'

const allFilter = '__all__'

const statusToneClass: Record<TicketStatus, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  confirmed: 'bg-accent-success/15 text-accent-success',
  cancelled: 'bg-accent-danger/15 text-accent-danger',
  refunded: 'bg-gray-500/20 text-gray-300',
}

const paymentToneClass: Record<TicketPaymentStatus, string> = {
  unpaid: 'bg-accent-danger/15 text-accent-danger',
  paid: 'bg-accent-success/15 text-accent-success',
  refunded: 'bg-gray-500/20 text-gray-300',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(s: TicketStatus) {
  return TICKET_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function paymentLabel(s: TicketPaymentStatus) {
  return TICKET_PAYMENT_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS)
  const [search, setSearch] = useState('')
  const [eventFilter, setEventFilter] = useState<string>(allFilter)
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)
  const [paymentFilter, setPaymentFilter] = useState<string>(allFilter)
  const [checkinFilter, setCheckinFilter] = useState<string>(allFilter)
  const [openId, setOpenId] = useState<string | null>(null)

  const events = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>()
    for (const t of tickets) {
      if (!seen.has(t.event.id)) {
        seen.set(t.event.id, { id: t.event.id, name: t.event.name })
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [tickets])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tickets
      .filter((t) => {
        if (eventFilter !== allFilter && t.event.id !== eventFilter) return false
        if (statusFilter !== allFilter && t.status !== statusFilter) return false
        if (paymentFilter !== allFilter && t.paymentStatus !== paymentFilter) return false
        if (checkinFilter === 'in' && !t.checkedIn) return false
        if (checkinFilter === 'out' && t.checkedIn) return false
        if (!q) return true
        return (
          t.code.toLowerCase().includes(q) ||
          t.buyer.name.toLowerCase().includes(q) ||
          t.buyer.phone.toLowerCase().includes(q) ||
          t.buyer.email.toLowerCase().includes(q) ||
          t.event.name.toLowerCase().includes(q) ||
          t.tier.toLowerCase().includes(q)
        )
      })
      .sort(
        (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
      )
  }, [tickets, search, eventFilter, statusFilter, paymentFilter, checkinFilter])

  const totals = useMemo(() => {
    const confirmed = tickets.filter((t) => t.status === 'confirmed')
    const paid = confirmed.filter((t) => t.paymentStatus === 'paid')
    const checkedIn = tickets.filter((t) => t.checkedIn).length
    const revenue = paid.reduce((sum, t) => sum + t.total, 0)
    const unitsSold = confirmed.reduce((sum, t) => sum + t.quantity, 0)
    return {
      total: tickets.length,
      confirmed: confirmed.length,
      unitsSold,
      checkedIn,
      revenue,
    }
  }, [tickets])

  const selected = openId ? tickets.find((t) => t.id === openId) ?? null : null

  const handleUpdate = (id: string, patch: Partial<Ticket>) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const handleDelete = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div>
      <PageHeader
        title="Tickets"
        description="All tickets sold across your events — manage status, payments, and check-ins."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <SummaryTile label="Total tickets" value={totals.total} tone="neutral" />
        <SummaryTile label="Confirmed" value={totals.confirmed} tone="success" />
        <SummaryTile label="Units sold" value={totals.unitsSold} tone="brand" />
        <SummaryTile label="Checked in" value={totals.checkedIn} tone="info" />
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
            placeholder="Search by code, buyer, event, or tier"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-surface-border bg-surface-card pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All statuses</option>
          {TICKET_STATUS_OPTIONS.map((o) => (
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
          {TICKET_PAYMENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={checkinFilter}
          onChange={(e) => setCheckinFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All check-ins</option>
          <option value="in">Checked in</option>
          <option value="out">Not checked in</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1240px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 text-right font-medium">Qty</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    No tickets match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="cursor-pointer border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                    onClick={() => setOpenId(t.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TicketIcon size={14} className="text-gray-500" />
                        <div>
                          <div className="font-mono text-xs text-gray-300">{t.code}</div>
                          <div className="mt-0.5 text-[11px] text-gray-500">
                            {TICKET_CHANNEL_LABELS[t.channel]}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="max-w-[180px] truncate text-gray-200"
                        title={t.event.name}
                      >
                        {t.event.name}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Calendar size={10} />
                        {formatDate(t.event.startAt)} · {formatTime(t.event.startAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-100">{t.buyer.name}</div>
                      <div className="text-xs text-gray-500">
                        {t.buyer.phone || t.buyer.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium text-gray-200">
                        {t.tier}
                      </span>
                      {t.promoCode ? (
                        <div className="mt-0.5 font-mono text-[10px] text-gray-500">
                          {t.promoCode}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-0.5 text-gray-200">
                        <Hash size={11} className="text-gray-500" />
                        {t.quantity}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.total === 0 ? (
                        <span className="font-medium text-accent-success">Free</span>
                      ) : (
                        <div className="font-semibold text-gray-100">
                          ${t.total.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusToneClass[t.status]
                        }`}
                      >
                        {statusLabel(t.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          paymentToneClass[t.paymentStatus]
                        }`}
                      >
                        {paymentLabel(t.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {t.checkedIn ? (
                        <span className="inline-flex items-center gap-1 text-accent-success">
                          <CheckCircle2 size={13} />
                          <span className="text-xs font-medium">In</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          title="View details"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenId(t.id)
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

      <TicketDrawer
        open={openId !== null}
        ticket={selected}
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
