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
  Bed,
  Users,
  Wifi,
  Snowflake,
  Coffee,
  Maximize2,
} from 'lucide-react'
import { Modal } from 'antd'
import PageHeader from '../../../components/dashboard/PageHeader'
import RoomFormDrawer from './RoomFormDrawer'
import ReviewsDrawer, { type ReviewEntry } from '../../../components/dashboard/ReviewsDrawer'
import {
  INITIAL_ROOMS,
  ROOM_TYPE_OPTIONS,
  ROOM_OPERATIONAL_STATUS_OPTIONS,
  BED_TYPE_OPTIONS,
  type Room,
  type RoomOperationalStatus,
  type BedType,
} from './roomTypes'
import { INITIAL_STAY_BOOKINGS } from './stayBookingTypes'

type ModalState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; room: Room }

const allFilter = '__all__'

const statusToneClass: Record<RoomOperationalStatus, string> = {
  available: 'bg-accent-success/15 text-accent-success',
  occupied: 'bg-blue-500/15 text-blue-400',
  cleaning: 'bg-accent-amber/15 text-accent-amber',
  maintenance: 'bg-brand/20 text-brand-cream',
  out_of_service: 'bg-accent-danger/15 text-accent-danger',
}

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `r_${crypto.randomUUID().slice(0, 8)}`
  }
  return `r_${Date.now().toString(36)}`
}

function formatPrice(n: number | null | undefined) {
  if (n === null || n === undefined) return '—'
  return `$${n.toFixed(0)}`
}

function statusLabel(s: RoomOperationalStatus) {
  return ROOM_OPERATIONAL_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function bedLabel(b: BedType) {
  return BED_TYPE_OPTIONS.find((o) => o.value === b)?.label ?? b
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS)
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>(allFilter)
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)
  const [acFilter, setAcFilter] = useState<string>(allFilter)
  const [reviewsOpenId, setReviewsOpenId] = useState<string | null>(null)

  const reviewsByRoom = useMemo(() => {
    const map = new Map<string, ReviewEntry[]>()
    for (const b of INITIAL_STAY_BOOKINGS) {
      if (!b.review) continue
      const arr = map.get(b.room.id) ?? []
      arr.push({
        id: b.id,
        referenceCode: b.code,
        customerName: b.guest.name,
        referenceLabel: `${b.nights} night${b.nights === 1 ? '' : 's'}`,
        rating: b.review.rating,
        comment: b.review.comment,
        createdAt: b.review.createdAt,
      })
      map.set(b.room.id, arr)
    }
    return map
  }, [])

  const ratingByRoom = useMemo(() => {
    const out = new Map<string, { avg: number; count: number }>()
    for (const [id, reviews] of reviewsByRoom) {
      const sum = reviews.reduce((s, r) => s + r.rating, 0)
      out.set(id, { avg: sum / reviews.length, count: reviews.length })
    }
    return out
  }, [reviewsByRoom])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rooms.filter((r) => {
      if (typeFilter !== allFilter && r.roomType !== typeFilter) return false
      if (statusFilter !== allFilter && r.status !== statusFilter) return false
      if (acFilter === 'ac' && !r.hasAc) return false
      if (acFilter === 'nonac' && r.hasAc) return false
      if (!q) return true
      return (
        r.roomNumber.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.roomType.toLowerCase().includes(q)
      )
    })
  }, [rooms, search, typeFilter, statusFilter, acFilter])

  const totals = useMemo(() => {
    const available = rooms.filter((r) => r.status === 'available').length
    const occupied = rooms.filter((r) => r.status === 'occupied').length
    const cleaning = rooms.filter((r) => r.status === 'cleaning').length
    const maintenance = rooms.filter(
      (r) => r.status === 'maintenance' || r.status === 'out_of_service',
    ).length
    const avgRate =
      rooms.length > 0
        ? rooms.reduce((sum, r) => sum + r.basePrice, 0) / rooms.length
        : 0
    return {
      total: rooms.length,
      available,
      occupied,
      cleaning,
      maintenance,
      avgRate,
    }
  }, [rooms])

  const handleSubmit = (values: Omit<Room, 'id' | 'createdAt'>) => {
    if (modal.mode === 'edit') {
      setRooms((prev) =>
        prev.map((r) => (r.id === modal.room.id ? { ...r, ...values } : r)),
      )
    } else if (modal.mode === 'add') {
      const next: Room = {
        ...values,
        id: makeId(),
        createdAt: new Date().toISOString(),
      }
      setRooms((prev) => [next, ...prev])
    }
    setModal({ mode: 'closed' })
  }

  const toggleHidden = (id: string) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, hidden: !r.hidden } : r)))
  }

  const confirmDelete = (r: Room) => {
    Modal.confirm({
      title: 'Delete room?',
      content: (
        <span>
          Delete <b>{r.name}</b> (#{r.roomNumber})? This can't be undone.
        </span>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: () => setRooms((prev) => prev.filter((x) => x.id !== r.id)),
    })
  }

  return (
    <div>
      <PageHeader
        title="Rooms"
        description="Configure each room — beds, facilities, pricing, and availability."
        actions={
          <button
            type="button"
            onClick={() => setModal({ mode: 'add' })}
            className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus size={16} /> Add room
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <SummaryTile label="Total" value={totals.total} tone="neutral" />
        <SummaryTile label="Available" value={totals.available} tone="success" />
        <SummaryTile label="Occupied" value={totals.occupied} tone="info" />
        <SummaryTile label="Cleaning" value={totals.cleaning} tone="warning" />
        <SummaryTile label="Out of service" value={totals.maintenance} tone="danger" />
        <SummaryTile
          label="Avg. rate"
          value={`$${totals.avgRate.toFixed(0)}`}
          tone="brand"
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
            placeholder="Search by room #, name, code, or type"
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
          {ROOM_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All statuses</option>
          {ROOM_OPERATIONAL_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={acFilter}
          onChange={(e) => setAcFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>AC & Non-AC</option>
          <option value="ac">AC only</option>
          <option value="nonac">Non-AC only</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Bed</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Size / Floor</th>
                <th className="px-4 py-3 font-medium">Facilities</th>
                <th className="px-4 py-3 text-right font-medium">Price / night</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    No rooms match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-b border-surface-border last:border-b-0 hover:bg-surface-elevated ${
                      r.hidden ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <RoomThumb src={r.image} alt={r.name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-gray-500">
                              #{r.roomNumber}
                            </span>
                            {r.featured && (
                              <Star
                                size={12}
                                className="shrink-0 fill-accent-amber text-accent-amber"
                              />
                            )}
                          </div>
                          <div className="truncate font-medium text-gray-100">{r.name}</div>
                          <div className="text-[11px] text-gray-500">{r.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{r.roomType}</td>
                    <td className="px-4 py-3 text-gray-300">
                      <div className="inline-flex items-center gap-1">
                        <Bed size={13} className="text-gray-500" />
                        <span>
                          {r.bedCount > 1 ? `${r.bedCount} × ` : ''}
                          {bedLabel(r.bedType)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <div className="inline-flex items-center gap-1">
                        <Users size={13} className="text-gray-500" />
                        <span>
                          {r.maxAdults}A
                          {r.maxChildren > 0 ? ` + ${r.maxChildren}C` : ''}
                        </span>
                      </div>
                      {r.extraBedAvailable ? (
                        <div className="text-[11px] text-gray-500">Extra bed ok</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <div className="text-sm">Floor {r.floor}</div>
                      {r.sizeSqm ? (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Maximize2 size={10} />
                          {r.sizeSqm} m²
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <FacilityIcons room={r} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-semibold text-gray-100">
                        {formatPrice(r.basePrice)}
                      </div>
                      {r.weekendPrice ? (
                        <div className="text-[11px] text-gray-500">
                          Weekend {formatPrice(r.weekendPrice)}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const rating = ratingByRoom.get(r.id)
                        if (!rating) return <span className="text-gray-600">—</span>
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setReviewsOpenId(r.id)
                            }}
                            className="flex flex-col items-start gap-0 rounded-md px-1 py-0.5 hover:bg-surface-card"
                            title="View reviews"
                          >
                            <span className="inline-flex items-center gap-1 text-gray-100">
                              <Star
                                size={13}
                                className="fill-accent-amber text-accent-amber"
                              />
                              <span className="text-sm font-semibold">
                                {rating.avg.toFixed(1)}
                              </span>
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {rating.count} review{rating.count === 1 ? '' : 's'}
                            </span>
                          </button>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusToneClass[r.status]
                        }`}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          title={r.hidden ? 'Show on booking site' : 'Hide from booking site'}
                          onClick={() => toggleHidden(r.id)}
                        >
                          {r.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                        </IconButton>
                        <IconButton
                          title="Edit"
                          onClick={() => setModal({ mode: 'edit', room: r })}
                        >
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton title="Delete" danger onClick={() => confirmDelete(r)}>
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

      <RoomFormDrawer
        open={modal.mode !== 'closed'}
        mode={modal.mode === 'edit' ? 'edit' : 'add'}
        initial={modal.mode === 'edit' ? modal.room : null}
        onCancel={() => setModal({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />

      <ReviewsDrawer
        open={reviewsOpenId !== null}
        subject={
          reviewsOpenId
            ? rooms.find((r) => r.id === reviewsOpenId)?.name ?? null
            : null
        }
        subjectCode={
          reviewsOpenId
            ? rooms.find((r) => r.id === reviewsOpenId)?.code ?? null
            : null
        }
        reviews={reviewsOpenId ? reviewsByRoom.get(reviewsOpenId) ?? [] : []}
        onClose={() => setReviewsOpenId(null)}
      />
    </div>
  )
}

function FacilityIcons({ room }: { room: Room }) {
  return (
    <div className="flex flex-wrap gap-1">
      <FacilityBadge
        active={room.hasAc}
        label={room.hasAc ? 'AC' : 'No AC'}
        icon={<Snowflake size={11} />}
      />
      <FacilityBadge
        active={room.hasWifi}
        label="Wi-Fi"
        icon={<Wifi size={11} />}
        mutedIfInactive
      />
      <FacilityBadge
        active={room.breakfastIncluded}
        label="Breakfast"
        icon={<Coffee size={11} />}
        mutedIfInactive
      />
      {room.amenities.length > 0 ? (
        <span
          className="rounded-full bg-surface-elevated px-2 py-0.5 text-[11px] text-gray-400"
          title={room.amenities.join(', ')}
        >
          +{room.amenities.length}
        </span>
      ) : null}
    </div>
  )
}

function FacilityBadge({
  active,
  label,
  icon,
  mutedIfInactive,
}: {
  active: boolean
  label: string
  icon: React.ReactNode
  mutedIfInactive?: boolean
}) {
  if (!active && mutedIfInactive) return null
  const cls = active
    ? 'bg-accent-success/15 text-accent-success'
    : 'bg-gray-500/20 text-gray-400'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      {icon}
      {label}
    </span>
  )
}

function RoomThumb({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-surface-elevated text-gray-500">
        <ImageOff size={18} />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-14 w-14 shrink-0 rounded-md border border-surface-border bg-surface-elevated object-cover"
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
