import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Flame,
  ImageOff,
  Award,
  Sparkles,
  Star,
} from 'lucide-react'
import { Modal } from 'antd'
import PageHeader from '../../../components/dashboard/PageHeader'
import MenuFormDrawer from './MenuFormDrawer'
import ReviewsDrawer, { type ReviewEntry } from '../../../components/dashboard/ReviewsDrawer'
import {
  INITIAL_MENU_ITEMS,
  MENU_CATEGORIES,
  MENU_STATUS_OPTIONS,
  DIETARY_OPTIONS,
  SPICY_LEVEL_OPTIONS,
  type MenuItem,
  type MenuStatus,
  type DietaryType,
  type SpicyLevel,
} from './menuTypes'
import { INITIAL_ORDERS, ORDER_TYPE_OPTIONS } from './orderTypes'

type ModalState =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'edit'; item: MenuItem }

const allFilter = '__all__'

const statusToneClass: Record<MenuStatus, string> = {
  active: 'bg-accent-success/15 text-accent-success',
  draft: 'bg-gray-500/20 text-gray-300',
  archived: 'bg-accent-danger/15 text-accent-danger',
}

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `m_${crypto.randomUUID().slice(0, 8)}`
  }
  return `m_${Date.now().toString(36)}`
}

function formatPrice(n: number | null | undefined) {
  if (n === null || n === undefined) return '—'
  return `$${n.toFixed(2)}`
}

function statusLabel(s: MenuStatus) {
  return MENU_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function dietaryLabel(d: DietaryType) {
  return DIETARY_OPTIONS.find((o) => o.value === d)?.label ?? d
}

function spicyLabel(s: SpicyLevel) {
  return SPICY_LEVEL_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function spicyFlameCount(s: SpicyLevel): number {
  switch (s) {
    case 'mild':
      return 1
    case 'medium':
      return 2
    case 'hot':
      return 3
    case 'extra_hot':
      return 4
    default:
      return 0
  }
}

function DietDot({ type }: { type: DietaryType }) {
  const color =
    type === 'vegetarian' || type === 'vegan'
      ? 'border-accent-success'
      : type === 'non_vegetarian'
        ? 'border-accent-danger'
        : 'border-accent-amber'
  const innerColor =
    type === 'vegetarian' || type === 'vegan'
      ? 'bg-accent-success'
      : type === 'non_vegetarian'
        ? 'bg-accent-danger'
        : 'bg-accent-amber'
  return (
    <span
      title={dietaryLabel(type)}
      className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border-[1.5px] ${color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${innerColor}`} />
    </span>
  )
}

function SpicyIndicator({ level }: { level: SpicyLevel }) {
  const count = spicyFlameCount(level)
  if (count === 0) return <span className="text-xs text-gray-500">—</span>
  return (
    <span className="inline-flex items-center gap-0.5" title={spicyLabel(level)}>
      {Array.from({ length: count }).map((_, i) => (
        <Flame key={i} size={12} className="fill-accent-danger text-accent-danger" />
      ))}
    </span>
  )
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS)
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>(allFilter)
  const [dietaryFilter, setDietaryFilter] = useState<string>(allFilter)
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)
  const [reviewsOpenId, setReviewsOpenId] = useState<string | null>(null)

  const reviewsByItem = useMemo(() => {
    const typeLabelLookup: Record<string, string> = {}
    for (const opt of ORDER_TYPE_OPTIONS) typeLabelLookup[opt.value] = opt.label
    const map = new Map<string, ReviewEntry[]>()
    for (const order of INITIAL_ORDERS) {
      if (!order.review || order.status !== 'completed') continue
      for (const item of order.items) {
        const arr = map.get(item.menuItemId) ?? []
        if (arr.some((r) => r.id === order.id)) continue
        arr.push({
          id: order.id,
          referenceCode: order.code,
          customerName: order.customer.name,
          referenceLabel: typeLabelLookup[order.orderType] ?? order.orderType,
          rating: order.review.rating,
          comment: order.review.comment,
          createdAt: order.review.createdAt,
        })
        map.set(item.menuItemId, arr)
      }
    }
    return map
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((it) => {
      if (categoryFilter !== allFilter && it.category !== categoryFilter) return false
      if (dietaryFilter !== allFilter && it.dietary !== dietaryFilter) return false
      if (statusFilter !== allFilter && it.status !== statusFilter) return false
      if (!q) return true
      return (
        it.name.toLowerCase().includes(q) ||
        it.code.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q)
      )
    })
  }, [items, search, categoryFilter, dietaryFilter, statusFilter])

  const totals = useMemo(() => {
    const active = items.filter((i) => i.status === 'active').length
    const bestSellers = items.filter((i) => i.bestSeller).length
    const newItems = items.filter((i) => i.isNew).length
    const avgPrice =
      items.length > 0
        ? items.reduce((sum, i) => sum + i.price, 0) / items.length
        : 0
    return {
      total: items.length,
      active,
      bestSellers,
      newItems,
      avgPrice,
    }
  }, [items])

  const handleSubmit = (values: Omit<MenuItem, 'id' | 'createdAt'>) => {
    if (modal.mode === 'edit') {
      setItems((prev) =>
        prev.map((i) => (i.id === modal.item.id ? { ...i, ...values } : i)),
      )
    } else if (modal.mode === 'add') {
      const next: MenuItem = {
        ...values,
        id: makeId(),
        createdAt: new Date().toISOString(),
      }
      setItems((prev) => [next, ...prev])
    }
    setModal({ mode: 'closed' })
  }

  const toggleHidden = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, hidden: !i.hidden } : i)))
  }

  const confirmDelete = (item: MenuItem) => {
    Modal.confirm({
      title: 'Delete menu item?',
      content: (
        <span>
          Delete <b>{item.name}</b>? This can't be undone.
        </span>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: () => setItems((prev) => prev.filter((x) => x.id !== item.id)),
    })
  }

  return (
    <div>
      <PageHeader
        title="Menu"
        description="Upload every dish — photo, price, diet info."
        actions={
          <button
            type="button"
            onClick={() => setModal({ mode: 'add' })}
            className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus size={16} /> Add item
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <SummaryTile label="Total items" value={totals.total} tone="neutral" />
        <SummaryTile label="Active" value={totals.active} tone="success" />
        <SummaryTile label="Best sellers" value={totals.bestSellers} tone="warning" />
        <SummaryTile label="New" value={totals.newItems} tone="info" />
        <SummaryTile
          label="Avg. price"
          value={`$${totals.avgPrice.toFixed(2)}`}
          tone="neutral"
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
            placeholder="Search by name, code, or category"
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
          {MENU_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={dietaryFilter}
          onChange={(e) => setDietaryFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All diets</option>
          {DIETARY_OPTIONS.map((o) => (
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
          {MENU_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Portion</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Highlights</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    No menu items match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((it) => (
                  <tr
                    key={it.id}
                    className={`border-b border-surface-border last:border-b-0 hover:bg-surface-elevated ${
                      it.hidden ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ItemThumb src={it.image} alt={it.name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <DietDot type={it.dietary} />
                            <span className="truncate font-medium text-gray-100">
                              {it.name}
                            </span>
                            <SpicyIndicator level={it.spicyLevel} />
                          </div>
                          <div className="text-[11px] text-gray-500">Code · {it.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{it.category}</td>
                    <td className="px-4 py-3 text-right">
                      {it.salePrice != null ? (
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-gray-100">
                            {formatPrice(it.salePrice)}
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(it.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-100">
                          {formatPrice(it.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <div className="text-sm">{it.portionSize}</div>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const reviews = reviewsByItem.get(it.id) ?? []
                        if (reviews.length === 0) {
                          return <span className="text-gray-600">—</span>
                        }
                        const avg =
                          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setReviewsOpenId(it.id)
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
                                {avg.toFixed(1)}
                              </span>
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {reviews.length} review{reviews.length === 1 ? '' : 's'}
                            </span>
                          </button>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <Highlights item={it} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusToneClass[it.status]
                        }`}
                      >
                        {statusLabel(it.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          title={it.hidden ? 'Show on menu' : 'Hide from menu'}
                          onClick={() => toggleHidden(it.id)}
                        >
                          {it.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                        </IconButton>
                        <IconButton
                          title="Edit"
                          onClick={() => setModal({ mode: 'edit', item: it })}
                        >
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton title="Delete" danger onClick={() => confirmDelete(it)}>
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

      <MenuFormDrawer
        open={modal.mode !== 'closed'}
        mode={modal.mode === 'edit' ? 'edit' : 'add'}
        initial={modal.mode === 'edit' ? modal.item : null}
        onCancel={() => setModal({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />

      <ReviewsDrawer
        open={reviewsOpenId !== null}
        subject={
          reviewsOpenId ? items.find((i) => i.id === reviewsOpenId)?.name ?? null : null
        }
        subjectCode={
          reviewsOpenId ? items.find((i) => i.id === reviewsOpenId)?.code ?? null : null
        }
        reviews={reviewsOpenId ? reviewsByItem.get(reviewsOpenId) ?? [] : []}
        onClose={() => setReviewsOpenId(null)}
      />
    </div>
  )
}

function Highlights({ item }: { item: MenuItem }) {
  const items: { key: string; icon: React.ReactNode; label: string; tone: string }[] = []
  if (item.bestSeller) {
    items.push({
      key: 'best',
      icon: <Award size={11} />,
      label: 'Best',
      tone: 'bg-accent-amber/15 text-accent-amber',
    })
  }
  if (item.isNew) {
    items.push({
      key: 'new',
      icon: <Sparkles size={11} />,
      label: 'New',
      tone: 'bg-blue-500/15 text-blue-400',
    })
  }
  if (items.length === 0) return <span className="text-[11px] text-gray-500">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((h) => (
        <span
          key={h.key}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${h.tone}`}
        >
          {h.icon}
          {h.label}
        </span>
      ))}
    </div>
  )
}

function ItemThumb({ src, alt }: { src: string; alt: string }) {
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
