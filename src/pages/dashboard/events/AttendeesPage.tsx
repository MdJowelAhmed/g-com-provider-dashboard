import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  CheckCircle2,
  Undo2,
  Calendar,
  MapPin,
  Hash,
  User as UserIcon,
  Phone,
  Mail,
} from 'lucide-react'
import { message, Pagination } from 'antd'
import PageHeader from '../../../components/dashboard/PageHeader'
import {
  INITIAL_TICKETS,
  TICKET_CHANNEL_LABELS,
  type Ticket,
} from './ticketTypes'

const allFilter = '__all__'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AttendeesPage() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS)
  const [eventFilter, setEventFilter] = useState<string>(allFilter)
  const [checkinFilter, setCheckinFilter] = useState<string>(allFilter)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    setPage(1)
  }, [eventFilter, checkinFilter, search])

  const events = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; startAt: string; venueLabel: string }>()
    for (const t of tickets) {
      if (!seen.has(t.event.id)) {
        seen.set(t.event.id, {
          id: t.event.id,
          name: t.event.name,
          startAt: t.event.startAt,
          venueLabel: t.event.venueLabel,
        })
      }
    }
    return Array.from(seen.values()).sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )
  }, [tickets])

  const confirmedTickets = useMemo(
    () => tickets.filter((t) => t.status === 'confirmed'),
    [tickets],
  )

  const scopedTickets = useMemo(
    () =>
      eventFilter === allFilter
        ? confirmedTickets
        : confirmedTickets.filter((t) => t.event.id === eventFilter),
    [confirmedTickets, eventFilter],
  )

  const metrics = useMemo(() => {
    const expected = scopedTickets.reduce((sum, t) => sum + t.quantity, 0)
    const arrived = scopedTickets
      .filter((t) => t.checkedIn)
      .reduce((sum, t) => sum + t.quantity, 0)
    const pending = Math.max(0, expected - arrived)
    const rate = expected > 0 ? Math.round((arrived / expected) * 100) : 0
    return {
      tickets: scopedTickets.length,
      expected,
      arrived,
      pending,
      rate,
    }
  }, [scopedTickets])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return scopedTickets
      .filter((t) => {
        if (checkinFilter === 'in' && !t.checkedIn) return false
        if (checkinFilter === 'out' && t.checkedIn) return false
        if (!q) return true
        return (
          t.buyer.name.toLowerCase().includes(q) ||
          t.buyer.phone.toLowerCase().includes(q) ||
          t.buyer.email.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.seatLabel.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (a.checkedIn !== b.checkedIn) return a.checkedIn ? 1 : -1
        return a.buyer.name.localeCompare(b.buyer.name)
      })
  }, [scopedTickets, search, checkinFilter])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const selectedEvent = events.find((e) => e.id === eventFilter) ?? null

  const checkIn = (id: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, checkedIn: true, checkedInAt: new Date().toISOString() }
          : t,
      ),
    )
    const t = tickets.find((x) => x.id === id)
    message.success(`${t?.buyer.name ?? 'Guest'} checked in`)
  }

  const undoCheckIn = (id: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, checkedIn: false, checkedInAt: null } : t,
      ),
    )
  }

  return (
    <div>
      <PageHeader
        title="Attendees"
        description="Door ops — pick an event, look up the guest, tap Check in."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-surface-border bg-surface-card p-4">
        <div className="min-w-[260px] flex-1">
          <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
            Event
          </div>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="h-10 w-full rounded-md border border-surface-border bg-surface-elevated px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
          >
            <option value={allFilter}>All events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name} — {formatDate(ev.startAt)}
              </option>
            ))}
          </select>
          {selectedEvent ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Calendar size={11} />
                {formatDate(selectedEvent.startAt)} · {formatTime(selectedEvent.startAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} />
                {selectedEvent.venueLabel}
              </span>
            </div>
          ) : (
            <div className="mt-2 text-xs text-gray-500">
              Showing attendees across all events.
            </div>
          )}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <SummaryTile label="Tickets" value={metrics.tickets} tone="neutral" />
        <SummaryTile label="Expected guests" value={metrics.expected} tone="neutral" />
        <SummaryTile label="Arrived" value={metrics.arrived} tone="success" />
        <SummaryTile label="Still pending" value={metrics.pending} tone="warning" />
        <SummaryTile label="Check-in rate" value={`${metrics.rate}%`} tone="brand" />
      </div>

      <div className="mb-5 rounded-xl border border-surface-border bg-surface-card p-4">
        <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
          <span>
            {metrics.arrived} of {metrics.expected} guest
            {metrics.expected === 1 ? '' : 's'} checked in
          </span>
          <span className="font-semibold text-gray-100">{metrics.rate}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
          <div
            className={`h-full rounded-full transition-all ${
              metrics.rate >= 95
                ? 'bg-accent-success'
                : metrics.rate >= 50
                  ? 'bg-brand'
                  : 'bg-accent-amber'
            }`}
            style={{ width: `${metrics.rate}%` }}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by name, phone, email, ticket code, or seat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-surface-border bg-surface-card pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={checkinFilter}
          onChange={(e) => setCheckinFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All statuses</option>
          <option value="out">Not yet checked in</option>
          <option value="in">Checked in</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 text-right font-medium">Party</th>
                <th className="px-4 py-3 font-medium">Seat</th>
                <th className="px-4 py-3 font-medium">Arrival</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No attendees match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((t) => (
                  <tr
                    key={t.id}
                    className={`border-b border-surface-border last:border-b-0 ${
                      t.checkedIn ? 'bg-accent-success/5' : 'hover:bg-surface-elevated'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-gray-400">
                          <UserIcon size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-gray-100">
                            {t.buyer.name}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0 text-[11px] text-gray-500">
                            {t.buyer.phone ? (
                              <span className="inline-flex items-center gap-1">
                                <Phone size={10} />
                                {t.buyer.phone}
                              </span>
                            ) : null}
                            {t.buyer.email ? (
                              <span className="inline-flex items-center gap-1 truncate">
                                <Mail size={10} />
                                {t.buyer.email}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-gray-300">{t.code}</div>
                      <div className="mt-0.5 text-[11px] text-gray-500">
                        {TICKET_CHANNEL_LABELS[t.channel]}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium text-gray-200">
                        {t.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-0.5 font-medium text-gray-100">
                        <Hash size={11} className="text-gray-500" />
                        {t.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {t.seatLabel ? (
                        <span
                          className="block max-w-[180px] truncate text-sm"
                          title={t.seatLabel}
                        >
                          {t.seatLabel}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {t.checkedIn && t.checkedInAt ? (
                        <div className="flex items-center gap-1 text-accent-success">
                          <CheckCircle2 size={13} />
                          <span className="text-sm font-medium">
                            {formatTime(t.checkedInAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Not yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        {t.checkedIn ? (
                          <button
                            type="button"
                            onClick={() => undoCheckIn(t.id)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-surface-border px-3 text-xs font-medium text-gray-300 hover:bg-surface-elevated hover:text-white"
                          >
                            <Undo2 size={13} /> Undo
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => checkIn(t.id)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent-success px-4 text-sm font-semibold text-white hover:opacity-90"
                          >
                            <CheckCircle2 size={14} /> Check in
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 ? (
          <div className="flex items-center justify-between border-t border-surface-border px-4 py-3">
            <div className="text-xs text-gray-500">
              Showing {Math.min((page - 1) * pageSize + 1, filtered.length)}–
              {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </div>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={filtered.length}
              onChange={(p, ps) => {
                setPage(p)
                setPageSize(ps)
              }}
              showSizeChanger
              pageSizeOptions={[10, 20, 50, 100]}
              size="small"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand'
}) {
  const toneClass: Record<typeof tone, string> = {
    neutral: 'text-gray-100',
    success: 'text-accent-success',
    warning: 'text-accent-amber',
    danger: 'text-accent-danger',
    info: 'text-blue-400',
    brand: 'text-brand-cream',
  }
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${toneClass[tone]}`}>{value}</div>
    </div>
  )
}
