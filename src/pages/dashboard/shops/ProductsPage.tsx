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
} from 'lucide-react'
import { Modal } from 'antd'
import PageHeader from '../../../components/dashboard/PageHeader'
import ProductFormModal from './ProductFormModal'
import ReviewsDrawer, { type ReviewEntry } from '../../../components/dashboard/ReviewsDrawer'
import {
  INITIAL_PRODUCTS,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUS_OPTIONS,
  type Product,
  type ProductStatus,
} from './productTypes'
import { INITIAL_ORDERS } from './orderTypes'

type ModalState =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'edit'; product: Product }

const allFilter = '__all__'

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `p_${crypto.randomUUID().slice(0, 8)}`
  }
  return `p_${Date.now().toString(36)}`
}

function formatPrice(n: number | null | undefined) {
  if (n === null || n === undefined) return '—'
  return `$${n.toFixed(2)}`
}

function stockBadge(p: Product) {
  if (p.stock <= 0) {
    return (
      <span className="rounded-full bg-accent-danger/15 px-2 py-0.5 text-xs font-medium text-accent-danger">
        Out of stock
      </span>
    )
  }
  if (p.stock <= p.lowStockThreshold) {
    return (
      <span className="rounded-full bg-accent-amber/15 px-2 py-0.5 text-xs font-medium text-accent-amber">
        Low · {p.stock}
      </span>
    )
  }
  return <span className="text-sm text-gray-200">{p.stock}</span>
}

function statusBadge(status: ProductStatus) {
  const map: Record<ProductStatus, string> = {
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>(allFilter)
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)
  const [reviewsOpenId, setReviewsOpenId] = useState<string | null>(null)

  const reviewsBySku = useMemo(() => {
    const map = new Map<string, ReviewEntry[]>()
    for (const order of INITIAL_ORDERS) {
      if (!order.review || order.fulfillmentStatus !== 'delivered') continue
      for (const item of order.items) {
        const arr = map.get(item.sku) ?? []
        if (arr.some((r) => r.id === order.id)) continue
        arr.push({
          id: order.id,
          referenceCode: order.id,
          customerName: order.customer.name,
          referenceLabel: item.variant ?? '',
          rating: order.review.rating,
          comment: order.review.comment,
          createdAt: order.review.createdAt,
        })
        map.set(item.sku, arr)
      }
    }
    return map
  }, [])

  const ratingBySku = useMemo(() => {
    const out = new Map<string, { avg: number; count: number }>()
    for (const [sku, reviews] of reviewsBySku) {
      const sum = reviews.reduce((s, r) => s + r.rating, 0)
      out.set(sku, { avg: sum / reviews.length, count: reviews.length })
    }
    return out
  }, [reviewsBySku])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (categoryFilter !== allFilter && p.category !== categoryFilter) return false
      if (statusFilter !== allFilter && p.status !== statusFilter) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.toLowerCase().includes(q)
      )
    })
  }, [products, search, categoryFilter, statusFilter])

  const totals = useMemo(() => {
    const active = products.filter((p) => p.status === 'active').length
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length
    const outOfStock = products.filter((p) => p.stock <= 0).length
    const hidden = products.filter((p) => p.hidden).length
    return { total: products.length, active, lowStock, outOfStock, hidden }
  }, [products])

  const handleSubmit = (values: Omit<Product, 'id' | 'createdAt'>) => {
    if (modal.mode === 'edit') {
      setProducts((prev) =>
        prev.map((p) => (p.id === modal.product.id ? { ...p, ...values } : p)),
      )
    } else if (modal.mode === 'add') {
      const next: Product = {
        ...values,
        id: makeId(),
        createdAt: new Date().toISOString(),
      }
      setProducts((prev) => [next, ...prev])
    }
    setModal({ mode: 'closed' })
  }

  const toggleHidden = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, hidden: !p.hidden } : p)))
  }

  const confirmDelete = (p: Product) => {
    Modal.confirm({
      title: 'Delete product?',
      content: (
        <span>
          Are you sure you want to permanently delete <b>{p.name}</b>? This can't be undone.
        </span>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: () => setProducts((prev) => prev.filter((x) => x.id !== p.id)),
    })
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your storefront catalog — pricing, inventory, and visibility."
        actions={
          <button
            type="button"
            onClick={() => setModal({ mode: 'add' })}
            className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus size={16} /> Add product
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-5">
        <SummaryTile label="Total" value={totals.total} tone="neutral" />
        <SummaryTile label="Active" value={totals.active} tone="success" />
        <SummaryTile label="Low stock" value={totals.lowStock} tone="warning" />
        <SummaryTile label="Out of stock" value={totals.outOfStock} tone="danger" />
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
            placeholder="Search by name, SKU, brand, or tag"
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
          {PRODUCT_CATEGORIES.map((c) => (
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
          {PRODUCT_STATUS_OPTIONS.map((o) => (
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
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Visibility</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                    No products match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-surface-border last:border-b-0 hover:bg-surface-elevated ${
                      p.hidden ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductThumb src={p.image} alt={p.name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-medium text-gray-100">{p.name}</span>
                            {p.featured && (
                              <Star
                                size={12}
                                className="shrink-0 fill-accent-amber text-accent-amber"
                              />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">SKU · {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{p.category}</td>
                    <td className="px-4 py-3 text-gray-300">{p.brand || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {p.salePrice != null ? (
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-gray-100">
                            {formatPrice(p.salePrice)}
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(p.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-100">{formatPrice(p.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">{stockBadge(p)}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        const rating = ratingBySku.get(p.sku)
                        if (!rating) return <span className="text-gray-600">—</span>
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setReviewsOpenId(p.id)
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
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.hidden
                            ? 'bg-gray-500/15 text-gray-400'
                            : 'bg-accent-success/15 text-accent-success'
                        }`}
                      >
                        {p.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                        {p.hidden ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          title={p.hidden ? 'Show on storefront' : 'Hide from storefront'}
                          onClick={() => toggleHidden(p.id)}
                        >
                          {p.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                        </IconButton>
                        <IconButton
                          title="Edit"
                          onClick={() => setModal({ mode: 'edit', product: p })}
                        >
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton title="Delete" danger onClick={() => confirmDelete(p)}>
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

      <ProductFormModal
        open={modal.mode !== 'closed'}
        mode={modal.mode === 'edit' ? 'edit' : 'add'}
        initial={modal.mode === 'edit' ? modal.product : null}
        onCancel={() => setModal({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />

      <ReviewsDrawer
        open={reviewsOpenId !== null}
        subject={
          reviewsOpenId
            ? products.find((p) => p.id === reviewsOpenId)?.name ?? null
            : null
        }
        subjectCode={
          reviewsOpenId
            ? products.find((p) => p.id === reviewsOpenId)?.sku ?? null
            : null
        }
        reviews={
          reviewsOpenId
            ? reviewsBySku.get(
                products.find((p) => p.id === reviewsOpenId)?.sku ?? '',
              ) ?? []
            : []
        }
        onClose={() => setReviewsOpenId(null)}
      />
    </div>
  )
}

function ProductThumb({ src, alt }: { src: string; alt: string }) {
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
