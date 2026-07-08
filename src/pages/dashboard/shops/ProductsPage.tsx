import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, ImageOff } from 'lucide-react'
import { Modal, message } from 'antd'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import PageHeader from '../../../components/dashboard/PageHeader'
import ProductFormModal, { type ProductSubmitValues } from './ProductFormModal'
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
  type ProductApiDoc,
  type ProductRelationRef,
} from '../../../redux/api/productsApi'
import {
  uploadImageFile,
  useGetPresignedUploadUrlMutation,
} from '../../../redux/api/imageUploadApi'
import {
  DELIVERY_METHOD_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  type DeliveryMethod,
  type Product,
  type ProductStatus,
} from './productTypes'

type ModalState =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'edit'; product: Product }

const allFilter = '__all__'

function formatPrice(n: number | null | undefined) {
  if (n === null || n === undefined) return '—'
  return `$${n.toFixed(2)}`
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

function normalizeDeliveryMethod(value: string | undefined): DeliveryMethod {
  const match = DELIVERY_METHOD_OPTIONS.find((o) => o.value === value)
  return match ? match.value : 'external-delivery'
}

function refId(ref: ProductRelationRef): string {
  if (!ref) return ''
  if (typeof ref === 'string') return ref
  return ref._id
}

function refName(ref: ProductRelationRef): string {
  if (!ref || typeof ref === 'string') return ''
  if ('name' in ref && ref.name) return ref.name
  if ('branchName' in ref && ref.branchName) return ref.branchName
  return ''
}

function mapProductFromApi(doc: ProductApiDoc): Product {
  const normalizedStatus = doc.status === 'archive' ? 'archived' : doc.status
  return {
    id: doc._id,
    image: doc.image ?? '',
    name: doc.name ?? '',
    sku: doc.sku ?? '—',
    description: doc.description ?? '',
    category: doc.mainCategory ?? 'Other',
    brand: '',
    price: doc.price ?? 0,
    salePrice: null,
    costPrice: null,
    stock: 0,
    lowStockThreshold: 5,
    weight: null,
    deliveryMethod: normalizeDeliveryMethod(doc.deliveryMethod),
    deliveryFee: doc.deliveryFee ?? 0,
    deliveryTime:
      typeof doc.deliveryTime === 'string'
        ? doc.deliveryTime
        : doc.deliveryTime != null
          ? String(doc.deliveryTime)
          : '',
    subCategory: refId(doc.subCategory),
    subCategoryName: refName(doc.subCategory),
    branch: refId(doc.branch),
    branchName: refName(doc.branch),
    businessCategory: refId(doc.businessCategory),
    businessCategoryName: refName(doc.businessCategory),
    variants: '',
    tags: '',
    status: normalizedStatus === 'active' || normalizedStatus === 'draft' ? normalizedStatus : 'archived',
    hidden: normalizedStatus === 'archived',
    featured: false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as FetchBaseQueryError).data
    if (data && typeof data === 'object') {
      const payload = data as { message?: unknown; errorMessages?: { message?: string }[] }
      if (typeof payload.message === 'string' && payload.message.trim()) return payload.message
      const first = payload.errorMessages?.[0]?.message
      if (first?.trim()) return first
    }
  }
  return fallback
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
  const { data, isLoading, isFetching, isError } = useGetProductsQuery({ page: 1, limit: 100 })
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()
  const [deleteProduct] = useDeleteProductMutation()
  const [getPresignedUrl] = useGetPresignedUploadUrlMutation()
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => {
    if (!data?.data) return
    setProducts(data.data.map((doc) => mapProductFromApi(doc)))
  }, [data?.data])

  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (statusFilter !== allFilter && p.status !== statusFilter) return false
      if (!q) return true
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    })
  }, [products, search, statusFilter])

  const totals = useMemo(() => {
    const active = products.filter((p) => p.status === 'active').length
    const draft = products.filter((p) => p.status === 'draft').length
    const archived = products.filter((p) => p.status === 'archived').length
    return { total: products.length, active, draft, archived }
  }, [products])

  const handleSubmit = async (values: ProductSubmitValues) => {
    if (modal.mode === 'closed') return
    const { imageFile, ...rest } = values

    try {
      let imageUrl = rest.image || ''
      if (imageFile) {
        imageUrl = await uploadImageFile(imageFile, async (payload) => {
          const result = await getPresignedUrl(payload).unwrap()
          return result
        })
      }

      const payload = {
        name: rest.name,
        description: rest.description,
        price: rest.price,
        deliveryFee: rest.deliveryFee,
        deliveryTime: String(rest.deliveryTime),
        image: imageUrl,
        businessCategory: rest.businessCategory || undefined,
        subCategory: rest.subCategory || undefined,
        branch: rest.branch || undefined,
      }

      if (modal.mode === 'edit') {
        await updateProduct({ id: modal.product.id, body: payload }).unwrap()
        message.success('Product updated')
      } else {
        await createProduct(payload).unwrap()
        message.success('Product created')
      }

      setModal({ mode: 'closed' })
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to save product'))
      throw error
    }
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
      onOk: async () => {
        try {
          await deleteProduct(p.id).unwrap()
          message.success('Product deleted')
        } catch (error) {
          message.error(getApiErrorMessage(error, 'Failed to delete product'))
          throw error
        }
      },
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

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="Total" value={totals.total} tone="neutral" />
        <SummaryTile label="Active" value={totals.active} tone="success" />
        <SummaryTile label="Draft" value={totals.draft} tone="muted" />
        <SummaryTile label="Archived" value={totals.archived} tone="danger" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by name or SKU"
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
                <th className="px-4 py-3 font-medium">Business category</th>
                <th className="px-4 py-3 font-medium">Sub category</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Delivery fee</th>
                <th className="px-4 py-3 text-right font-medium">Delivery time</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    Loading products…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    No products match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductThumb src={p.image} alt={p.name} />
                        <div className="min-w-0">
                          <span className="truncate font-medium text-gray-100">{p.name}</span>
                          <div className="text-xs text-gray-500">SKU · {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{p.businessCategoryName || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{p.subCategoryName || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{p.branchName || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-100">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {formatPrice(p.deliveryFee)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {p.deliveryTime ? `${p.deliveryTime} day${p.deliveryTime === '1' ? '' : 's'}` : '—'}
                    </td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDateTime(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
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

      {isError ? (
        <div className="mt-4 rounded-md border border-accent-danger/30 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger">
          Failed to load products from API. Showing the current list.
        </div>
      ) : null}

      <ProductFormModal
        open={modal.mode !== 'closed'}
        mode={modal.mode === 'edit' ? 'edit' : 'add'}
        initial={modal.mode === 'edit' ? modal.product : null}
        submitting={isCreating || isUpdating}
        onCancel={() => setModal({ mode: 'closed' })}
        onSubmit={handleSubmit}
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
