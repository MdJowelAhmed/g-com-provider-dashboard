import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  ImageOff,
  Calendar,
  Clock,
  MapPin,
  Users,
  Globe,
} from 'lucide-react'
import { Modal } from 'antd'
import PageHeader from '../../../components/dashboard/PageHeader'
import EventFormDrawer from './EventFormDrawer'
import {
  INITIAL_EVENTS,
  EVENT_CATEGORIES,
  EVENT_TYPE_OPTIONS,
  EVENT_LIFECYCLE_STATUS_OPTIONS,
  EVENT_PUBLISH_STATUS_OPTIONS,
  type Event,
  type EventType,
  type EventLifecycleStatus,
  type EventPublishStatus,
} from './eventTypes'

type ModalState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; event: Event }

const allFilter = '__all__'

const lifecycleToneClass: Record<EventLifecycleStatus, string> = {
  scheduled: 'bg-blue-500/15 text-blue-400',
  in_progress: 'bg-brand/20 text-brand-cream',
  completed: 'bg-accent-success/15 text-accent-success',
  cancelled: 'bg-accent-danger/15 text-accent-danger',
  postponed: 'bg-accent-amber/15 text-accent-amber',
}

const publishToneClass: Record<EventPublishStatus, string> = {
  draft: 'bg-gray-500/20 text-gray-300',
  active: 'bg-accent-success/15 text-accent-success',
  archived: 'bg-accent-danger/15 text-accent-danger',
}

const typeToneClass: Record<EventType, string> = {
  in_person: 'bg-brand/20 text-brand-cream',
  online: 'bg-blue-500/15 text-blue-400',
  hybrid: 'bg-accent-amber/15 text-accent-amber',
}

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `e_${crypto.randomUUID().slice(0, 8)}`
  }
  return `e_${Date.now().toString(36)}`
}

function formatPrice(n: number | null | undefined) {
  if (n == null) return '—'
  return `$${n.toFixed(0)}`
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function durationLabel(startIso: string, endIso: string) {
  if (!startIso || !endIso) return ''
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  if (isNaN(start) || isNaN(end)) return ''
  const mins = Math.max(0, Math.round((end - start) / 60000))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

function lifecycleLabel(s: EventLifecycleStatus) {
  return EVENT_LIFECYCLE_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function publishLabel(s: EventPublishStatus) {
  return EVENT_PUBLISH_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function typeLabel(t: EventType) {
  return EVENT_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t
}

function typeIcon(t: EventType) {
  if (t === 'online') return <Globe size={10} />
  if (t === 'hybrid') return <Globe size={10} />
  return <MapPin size={10} />
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS)
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>(allFilter)
  const [typeFilter, setTypeFilter] = useState<string>(allFilter)
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return events
      .filter((e) => {
        if (categoryFilter !== allFilter && e.category !== categoryFilter) return false
        if (typeFilter !== allFilter && e.eventType !== typeFilter) return false
        if (statusFilter !== allFilter && e.status !== statusFilter) return false
        if (!q) return true
        return (
          e.name.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.tags.toLowerCase().includes(q) ||
          e.venueName.toLowerCase().includes(q) ||
          e.venueCity.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }, [events, search, categoryFilter, typeFilter, statusFilter])

  const totals = useMemo(() => {
    const now = Date.now()
    const upcoming = events.filter(
      (e) => new Date(e.startAt).getTime() > now && e.status === 'scheduled',
    ).length
    const inProgress = events.filter((e) => e.status === 'in_progress').length
    const nearCapacity = events.filter(
      (e) => e.maxCapacity > 0 && e.bookedCount / e.maxCapacity >= 0.85,
    ).length
    const totalAttendees = events.reduce((sum, e) => sum + e.bookedCount, 0)
    const revenue = events
      .filter((e) => e.pricingType === 'paid')
      .reduce((sum, e) => sum + e.price * e.bookedCount, 0)
    return {
      total: events.length,
      upcoming,
      inProgress,
      nearCapacity,
      totalAttendees,
      revenue,
    }
  }, [events])

  const handleSubmit = (values: Omit<Event, 'id' | 'createdAt'>) => {
    if (modal.mode === 'edit') {
      setEvents((prev) =>
        prev.map((e) => (e.id === modal.event.id ? { ...e, ...values } : e)),
      )
    } else if (modal.mode === 'add') {
      const next: Event = {
        ...values,
        id: makeId(),
        createdAt: new Date().toISOString(),
      }
      setEvents((prev) => [next, ...prev])
    }
    setModal({ mode: 'closed' })
  }

  const toggleHidden = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, hidden: !e.hidden } : e)))
  }

  const confirmDelete = (ev: Event) => {
    Modal.confirm({
      title: 'Delete event?',
      content: (
        <span>
          Delete <b>{ev.name}</b>? This can't be undone.
        </span>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: () => setEvents((prev) => prev.filter((x) => x.id !== ev.id)),
    })
  }

  return (
    <div>
      <PageHeader
        title="Events"
        description="Create and manage events — schedule, capacity, pricing, and visibility."
        actions={
          <button
            type="button"
            onClick={() => setModal({ mode: 'add' })}
            className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus size={16} /> Create event
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <SummaryTile label="Total" value={totals.total} tone="neutral" />
        <SummaryTile label="Upcoming" value={totals.upcoming} tone="info" />
        <SummaryTile label="In progress" value={totals.inProgress} tone="brand" />
        <SummaryTile label="Near capacity" value={totals.nearCapacity} tone="warning" />
        <SummaryTile label="Attendees" value={totals.totalAttendees} tone="success" />
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
            placeholder="Search by name, code, category, venue, or tag"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-surface-border bg-surface-card pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All categories</option>
          {EVENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All types</option>
          {EVENT_TYPE_OPTIONS.map((o) => (
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
          {EVENT_LIFECYCLE_STATUS_OPTIONS.map((o) => (
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
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Schedule</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Publish</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                    No events match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr
                    key={e.id}
                    className={`border-b border-surface-border last:border-b-0 hover:bg-surface-elevated ${
                      e.hidden ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <EventThumb src={e.image} alt={e.name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-medium text-gray-100">
                              {e.name}
                            </span>
                            {e.featured && (
                              <Star
                                size={12}
                                className="shrink-0 fill-accent-amber text-accent-amber"
                              />
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {e.category} · {e.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          typeToneClass[e.eventType]
                        }`}
                      >
                        {typeIcon(e.eventType)} {typeLabel(e.eventType)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1 text-gray-200">
                        <Calendar size={12} className="text-gray-500" />
                        <span className="text-sm">{formatDate(e.startAt)}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                        <Clock size={10} /> {formatTime(e.startAt)}
                        {' · '}
                        {durationLabel(e.startAt, e.endAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {e.eventType === 'online' ? (
                        <div className="text-sm text-gray-200">{e.onlinePlatform || '—'}</div>
                      ) : (
                        <>
                          <div
                            className="max-w-[180px] truncate text-sm text-gray-200"
                            title={e.venueName}
                          >
                            {e.venueName || '—'}
                          </div>
                          <div className="text-[11px] text-gray-500">{e.venueCity}</div>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <CapacityBar
                        booked={e.bookedCount}
                        max={e.maxCapacity}
                        min={e.minCapacity}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {e.pricingType === 'free' ? (
                        <span className="font-medium text-accent-success">Free</span>
                      ) : e.earlyBirdPrice != null ? (
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-gray-100">
                            {formatPrice(e.earlyBirdPrice)}
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(e.price)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-accent-amber">
                            Early bird
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-100">
                          {formatPrice(e.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          lifecycleToneClass[e.status]
                        }`}
                      >
                        {lifecycleLabel(e.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          publishToneClass[e.publishStatus]
                        }`}
                      >
                        {publishLabel(e.publishStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          title={e.hidden ? 'Show in listing' : 'Hide from listing'}
                          onClick={() => toggleHidden(e.id)}
                        >
                          {e.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                        </IconButton>
                        <IconButton
                          title="Edit"
                          onClick={() => setModal({ mode: 'edit', event: e })}
                        >
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton title="Delete" danger onClick={() => confirmDelete(e)}>
                          <Trash2 size={15} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EventFormDrawer
        open={modal.mode !== 'closed'}
        mode={modal.mode === 'edit' ? 'edit' : 'add'}
        initial={modal.mode === 'edit' ? modal.event : null}
        onCancel={() => setModal({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

function CapacityBar({
  booked,
  max,
  min,
}: {
  booked: number
  max: number
  min: number
}) {
  const pct = max > 0 ? Math.min(100, Math.round((booked / max) * 100)) : 0
  const reachedMin = booked >= min
  const barColor =
    pct >= 95
      ? 'bg-accent-danger'
      : pct >= 80
        ? 'bg-accent-amber'
        : reachedMin
          ? 'bg-accent-success'
          : 'bg-gray-500'
  return (
    <div className="w-[140px]">
      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span className="inline-flex items-center gap-1">
          <Users size={10} />
          {booked} / {max}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-surface-elevated">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-0.5 text-[10px] text-gray-500">Min {min}</div>
    </div>
  )
}

function EventThumb({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-elevated text-gray-500">
        <ImageOff size={16} />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-12 w-12 shrink-0 rounded-md border border-surface-border bg-surface-elevated object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
    />
  )
}

function IconButton({
  children,
  title,
  onClick,
  danger,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-gray-300 hover:border-surface-border hover:bg-surface-elevated ${
        danger ? 'hover:text-accent-danger' : 'hover:text-white'
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
