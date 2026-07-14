import { useEffect, useMemo, useState } from 'react'
import { Eye, ImageOff, Hash, Ticket as TicketIcon } from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import SearchField from '../../../components/common/SearchField'
import { useSearchField } from '../../../hooks/useSearchField'
import TicketDrawer from './TicketDrawer'
import { useGetProviderOrdersQuery, type ProviderOrderApiDoc } from '../../../redux/api/myBookingApi'
import {
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

function statusLabel(s: TicketStatus) {
  return TICKET_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function paymentLabel(s: TicketPaymentStatus) {
  return TICKET_PAYMENT_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function mapStatusFromApi(order: ProviderOrderApiDoc): TicketStatus {
  const eventLineItem =
    order.lineItems && !Array.isArray(order.lineItems) && 'event' in order.lineItems
      ? order.lineItems
      : null
  const lineStatus = eventLineItem?.status?.toLowerCase()
  if (lineStatus === 'confirmed') return 'confirmed'
  if (lineStatus === 'cancelled') return 'cancelled'

  const orderStatus = (order.status ?? '').toLowerCase()
  if (orderStatus === 'cancelled') return 'cancelled'
  if (orderStatus === 'refunded') return 'refunded'
  if (orderStatus === 'paid') return 'confirmed'
  return 'pending'
}

function mapPaymentStatusFromApi(value: string | undefined): TicketPaymentStatus {
  const normalized = (value ?? '').toLowerCase()
  if (normalized === 'paid') return 'paid'
  if (normalized === 'refunded') return 'refunded'
  return 'unpaid'
}

function mapOrderToTicket(order: ProviderOrderApiDoc): Ticket | null {
  const lineItem =
    order.lineItems && !Array.isArray(order.lineItems) && 'event' in order.lineItems
      ? order.lineItems
      : null
  if (!lineItem?.event) return null

  const eventName = lineItem.event.name || 'Event'
  const issuedAt = order.createdAt || new Date().toISOString()
  const quantity = lineItem.quantity ?? 1
  const subtotal = order.subTotal ?? lineItem.price ?? 0
  const total = order.totalAmount ?? lineItem.totalAmount ?? subtotal

  return {
    id: order._id,
    code: lineItem.ticketNumber || order.orderId,
    event: {
      id: lineItem.event._id,
      name: eventName,
      code: order.orderId,
      startAt: issuedAt,
      endAt: issuedAt,
      venueLabel: '—',
    },
    buyer: {
      name: order.customer?.name || 'Unknown customer',
      phone: order.customer?.phone || '',
      email: order.customer?.email || '',
    },
    tier: 'General',
    quantity,
    unitPrice: lineItem.price ?? (quantity > 0 ? subtotal / quantity : subtotal),
    subtotal,
    discount: 0,
    total,
    promoCode: '',
    seatLabel: '',
    status: mapStatusFromApi(order),
    paymentStatus: mapPaymentStatusFromApi(order.paymentStatus),
    paymentMethod: 'online',
    channel: 'direct',
    checkedIn: false,
    checkedInAt: null,
    issuedAt,
    notes: '',
  }
}

export default function TicketsPage() {
  const { inputValue, setInputValue, searchTerm, clear, flush, isDebouncing } = useSearchField({
    minChars: 2,
  })
  const [paymentFilter, setPaymentFilter] = useState<string>(allFilter)

  const { data, isLoading, isFetching, isError } = useGetProviderOrdersQuery({
    page: 1,
    limit: 100,
    ...(searchTerm ? { searchTerm } : {}),
    ...(paymentFilter !== allFilter ? { paymentStatus: paymentFilter } : {}),
  })

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    const mapped = (data?.data ?? [])
      .filter((order) => order.orderType === 'event')
      .map((order) => mapOrderToTicket(order))
      .filter((ticket): ticket is Ticket => ticket !== null)
    setTickets(mapped)
  }, [data?.data])

  const sortedTickets = useMemo(
    () =>
      [...tickets].sort(
        (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
      ),
    [tickets],
  )

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

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchField
          value={inputValue}
          onChange={setInputValue}
          onClear={clear}
          onFlush={flush}
          minChars={2}
          loading={isDebouncing || ((isLoading || isFetching) && Boolean(searchTerm))}
          placeholder="Search by code, buyer, or event"
          aria-label="Search tickets"
        />

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
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">Preview</th>
                <th className="px-4 py-3 text-right font-medium">Qty</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                    Loading tickets...
                  </td>
                </tr>
              ) : sortedTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                    No tickets match your filters.
                  </td>
                </tr>
              ) : (
                sortedTickets.map((t) => (
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
                      <div className="max-w-[220px] truncate text-gray-200" title={t.event.name}>
                        {t.event.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-100">{t.buyer.name}</div>
                      <div className="text-xs text-gray-500">
                        {t.buyer.phone || t.buyer.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {t.event.code ? (
                        <div className="flex items-center gap-2">
                          <EventThumb alt={t.event.name} />
                          <span className="text-xs text-gray-500">{t.event.code}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
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
                        <div className="font-semibold text-gray-100">${t.total.toFixed(2)}</div>
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
      {isError ? (
        <div className="mt-4 rounded-md border border-accent-danger/30 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger">
          Failed to load tickets from API.
        </div>
      ) : null}

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

function EventThumb({ alt }: { alt: string }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-surface-border bg-surface-elevated text-gray-500">
      <ImageOff size={14} />
      <span className="sr-only">{alt}</span>
    </div>
  )
}
