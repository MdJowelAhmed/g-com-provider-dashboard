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
  Clock,
} from 'lucide-react'
import { Modal } from 'antd'
import PageHeader from '../../../components/dashboard/PageHeader'
import ServiceFormDrawer from './ServiceFormDrawer'
import ReviewsDrawer, { type ReviewEntry } from '../../../components/dashboard/ReviewsDrawer'
import {
  INITIAL_SERVICES,
  SERVICE_CATEGORIES,
  SERVICE_STATUS_OPTIONS,
  PRICING_TYPE_OPTIONS,
  type Service,
  type ServiceStatus,
  type PricingType,
} from './serviceTypes'
import { INITIAL_BOOKINGS } from './bookingTypes'

type ModalState =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'edit'; service: Service }

const allFilter = '__all__'

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `s_${crypto.randomUUID().slice(0, 8)}`
  }
  return `s_${Date.now().toString(36)}`
}

function formatPrice(n: number | null | undefined) {
  if (n === null || n === undefined) return '—'
  return `$${n.toFixed(2)}`
}

function formatDuration(mins: number) {
  if (!mins) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

function pricingLabel(t: PricingType) {
  return PRICING_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t
}

function statusBadge(status: ServiceStatus) {
  const map: Record<ServiceStatus, string> = {
    active: 'bg-accent-success/15 text-accent-success',
    draft: 'bg-gray-500/15 text-gray-300',
    archived: 'bg-accent-danger/15 text-accent-danger',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status]}`}>
      {status}
    </span>
  )
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES)
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>(allFilter)
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)
  const [reviewsOpenId, setReviewsOpenId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return services.filter((s) => {
      if (categoryFilter !== allFilter && s.category !== categoryFilter) return false
      if (statusFilter !== allFilter && s.status !== statusFilter) return false
      if (!q) return true
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.tags.toLowerCase().includes(q) ||
        s.serviceArea.toLowerCase().includes(q)
      )
    })
  }, [services, search, categoryFilter, statusFilter])

  const totals = useMemo(() => {
    const active = services.filter((s) => s.status === 'active').length
    const draft = services.filter((s) => s.status === 'draft').length
    const featured = services.filter((s) => s.featured).length
    const hidden = services.filter((s) => s.hidden).length
    return { total: services.length, active, draft, featured, hidden }
  }, [services])

  const reviewsByService = useMemo(() => {
    const map = new Map<string, ReviewEntry[]>()
    for (const b of INITIAL_BOOKINGS) {
      if (!b.review) continue
      const arr = map.get(b.service.id) ?? []
      arr.push({
        id: b.id,
        referenceCode: b.code,
        customerName: b.customer.name,
        referenceLabel: b.service.category,
        rating: b.review.rating,
        comment: b.review.comment,
        createdAt: b.review.createdAt,
      })
      map.set(b.service.id, arr)
    }
    return map
  }, [])

  const ratingByService = useMemo(() => {
    const out = new Map<string, { avg: number; count: number }>()
    for (const [id, reviews] of reviewsByService) {
      const sum = reviews.reduce((s, r) => s + r.rating, 0)
      out.set(id, { avg: sum / reviews.length, count: reviews.length })
    }
    return out
  }, [reviewsByService])

  const handleSubmit = (values: Omit<Service, 'id' | 'createdAt'>) => {
    if (modal.mode === 'edit') {
      setServices((prev) =>
        prev.map((s) => (s.id === modal.service.id ? { ...s, ...values } : s)),
      )
    } else if (modal.mode === 'add') {
      const next: Service = {
        ...values,
        id: makeId(),
        createdAt: new Date().toISOString(),
      }
      setServices((prev) => [next, ...prev])
    }
    setModal({ mode: 'closed' })
  }

  const toggleHidden = (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s)))
  }

  const confirmDelete = (s: Service) => {
    Modal.confirm({
      title: 'Delete service?',
      content: (
        <span>
          Are you sure you want to permanently delete <b>{s.name}</b>? This can't be undone.
        </span>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: () => setServices((prev) => prev.filter((x) => x.id !== s.id)),
    })
  }

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage the services you offer — pricing, duration, coverage and visibility."
        actions={
          <button
            type="button"
            onClick={() => setModal({ mode: 'add' })}
            className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus size={16} /> Add service
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-5">
        <SummaryTile label="Total" value={totals.total} tone="neutral" />
        <SummaryTile label="Active" value={totals.active} tone="success" />
        <SummaryTile label="Draft" value={totals.draft} tone="warning" />
        <SummaryTile label="Featured" value={totals.featured} tone="neutral" />
        <SummaryTile label="Hidden" value={totals.hidden} tone="muted" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by name, code, area, or tag"
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
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All statuses</option>
          {SERVICE_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1160px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Coverage</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Visibility</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                    No services match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className={`border-b border-surface-border last:border-b-0 hover:bg-surface-elevated ${
                      s.hidden ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ServiceThumb src={s.image} alt={s.name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-medium text-gray-100">{s.name}</span>
                            {s.featured && (
                              <Star
                                size={12}
                                className="shrink-0 fill-accent-amber text-accent-amber"
                              />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Code · {s.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{s.category}</td>
                    <td className="px-4 py-3 text-right">
                      {s.salePrice != null ? (
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-gray-100">
                            {formatPrice(s.salePrice)}
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(s.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-100">{formatPrice(s.price)}</span>
                      )}
                      <div className="text-[11px] uppercase tracking-wide text-gray-500">
                        {pricingLabel(s.pricingType)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={13} className="text-gray-500" />
                        {formatDuration(s.durationMinutes)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const r = ratingByService.get(s.id)
                        if (!r) return <span className="text-gray-600">—</span>
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setReviewsOpenId(s.id)
                            }}
                            className="flex flex-col items-start gap-0 rounded-md px-1 py-0.5 hover:bg-surface-elevated"
                            title="View reviews"
                          >
                            <span className="inline-flex items-center gap-1 text-gray-100">
                              <Star
                                size={13}
                                className="fill-accent-amber text-accent-amber"
                              />
                              <span className="text-sm font-semibold">
                                {r.avg.toFixed(1)}
                              </span>
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {r.count} review{r.count === 1 ? '' : 's'}
                            </span>
                          </button>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <span className="block max-w-[180px] truncate" title={s.serviceArea}>
                        {s.serviceArea || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{statusBadge(s.status)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.hidden
                            ? 'bg-gray-500/15 text-gray-400'
                            : 'bg-accent-success/15 text-accent-success'
                        }`}
                      >
                        {s.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                        {s.hidden ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          title={s.hidden ? 'Show in listing' : 'Hide from listing'}
                          onClick={() => toggleHidden(s.id)}
                        >
                          {s.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                        </IconButton>
                        <IconButton
                          title="Edit"
                          onClick={() => setModal({ mode: 'edit', service: s })}
                        >
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton title="Delete" danger onClick={() => confirmDelete(s)}>
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

      <ServiceFormDrawer
        open={modal.mode !== 'closed'}
        mode={modal.mode === 'edit' ? 'edit' : 'add'}
        initial={modal.mode === 'edit' ? modal.service : null}
        onCancel={() => setModal({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />

      <ReviewsDrawer
        open={reviewsOpenId !== null}
        subject={
          reviewsOpenId
            ? services.find((s) => s.id === reviewsOpenId)?.name ?? null
            : null
        }
        subjectCode={
          reviewsOpenId
            ? services.find((s) => s.id === reviewsOpenId)?.code ?? null
            : null
        }
        reviews={reviewsOpenId ? reviewsByService.get(reviewsOpenId) ?? [] : []}
        onClose={() => setReviewsOpenId(null)}
      />
    </div>
  )
}

function ServiceThumb({ src, alt }: { src: string; alt: string }) {
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
        const el = e.currentTarget
        el.style.display = 'none'
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
}: {
  label: string
  value: number
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'muted'
}) {
  const toneClass: Record<typeof tone, string> = {
    neutral: 'text-gray-100',
    success: 'text-accent-success',
    warning: 'text-accent-amber',
    danger: 'text-accent-danger',
    muted: 'text-gray-400',
  }
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${toneClass[tone]}`}>{value}</div>
    </div>
  )
}
