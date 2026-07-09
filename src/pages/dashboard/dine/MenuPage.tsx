import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, ImageOff } from 'lucide-react'
import { Modal, message } from 'antd'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import PageHeader from '../../../components/dashboard/PageHeader'
import MenuFormDrawer from './MenuFormDrawer'
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from '../../../redux/api/productsApi'
import {
  uploadImageFile,
  useGetPresignedUploadUrlMutation,
} from '../../../redux/api/imageUploadApi'
import { MENU_STATUS_OPTIONS, type MenuFormValues, type MenuItem, type MenuStatus } from './menuTypes'
import { formValuesToMenuPayload, mapMenuItemFromApi } from './menuMapping'

type DrawerState =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'edit'; item: MenuItem }

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

function statusBadge(status: MenuStatus) {
  const map: Record<MenuStatus, string> = {
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

export default function MenuPage() {
  const { data, isLoading, isFetching, isError } = useGetProductsQuery({ page: 1, limit: 100 })
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()
  const [deleteProduct] = useDeleteProductMutation()
  const [getPresignedUrl] = useGetPresignedUploadUrlMutation()
  const [items, setItems] = useState<MenuItem[]>([])

  useEffect(() => {
    if (!data?.data) return
    setItems(
      data.data
        .filter((doc) => !doc.mainCategory || doc.mainCategory === 'dine')
        .map((doc) => mapMenuItemFromApi(doc)),
    )
  }, [data?.data])

  const [drawer, setDrawer] = useState<DrawerState>({ mode: 'closed' })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      if (statusFilter !== allFilter && item.status !== statusFilter) return false
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.subCategoryName ?? '').toLowerCase().includes(q)
      )
    })
  }, [items, search, statusFilter])

  const totals = useMemo(() => {
    const active = items.filter((i) => i.status === 'active').length
    const draft = items.filter((i) => i.status === 'draft').length
    const archived = items.filter((i) => i.status === 'archived').length
    return { total: items.length, active, draft, archived }
  }, [items])

  const handleSubmit = async (values: MenuFormValues) => {
    if (drawer.mode === 'closed') return
    const { imageFile, ...rest } = values

    try {
      let imageUrl = rest.image || ''
      if (imageFile) {
        imageUrl = await uploadImageFile(imageFile, async (payload) => {
          const result = await getPresignedUrl(payload).unwrap()
          return result
        })
      }

      const payload = formValuesToMenuPayload({ ...rest, image: imageUrl })

      if (drawer.mode === 'edit') {
        await updateProduct({ id: drawer.item.id, body: payload }).unwrap()
        message.success('Menu item updated')
      } else {
        await createProduct(payload).unwrap()
        message.success('Menu item created')
      }

      setDrawer({ mode: 'closed' })
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to save menu item'))
      throw error
    }
  }

  const confirmDelete = (item: MenuItem) => {
    Modal.confirm({
      title: 'Delete menu item?',
      content: (
        <span>
          Are you sure you want to delete <b>{item.name}</b>? This can&apos;t be undone.
        </span>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await deleteProduct(item.id).unwrap()
          message.success('Menu item deleted')
        } catch (error) {
          message.error(getApiErrorMessage(error, 'Failed to delete menu item'))
          throw error
        }
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="Menu"
        description="Manage your dine menu — dishes, pricing, and delivery details."
        // actions={
        //   <button
        //     type="button"
        //     onClick={() => setDrawer({ mode: 'add' })}
        //     className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
        //   >
        //     <Plus size={16} /> Add item
        //   </button>
        // }
      />

      {/* <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="Total" value={totals.total} tone="neutral" />
        <SummaryTile label="Active" value={totals.active} tone="success" />
        <SummaryTile label="Draft" value={totals.draft} tone="muted" />
        <SummaryTile label="Archived" value={totals.archived} tone="danger" />
      </div> */}

      <div className="mb-4 flex  items-center justify-end w-full gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-[300px] rounded-md border border-surface-border bg-surface-card pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none"
          />
        </div>
        <button
            type="button"
            onClick={() => setDrawer({ mode: 'add' })}
            className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus size={16} /> Add item
          </button>
        {/* <select
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
        </select> */}
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Business category</th>
                <th className="px-4 py-3 font-medium">Sub category</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Delivery fee</th>
                <th className="px-4 py-3 text-right font-medium">Delivery time</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {/* <th className="px-4 py-3 font-medium">Created</th> */}
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    Loading menu items…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    No menu items match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ItemThumb src={item.image} alt={item.name} />
                        <div className="min-w-0">
                          <span className="truncate font-medium text-gray-100">{item.name}</span>
                          {item.description ? (
                            <div className="truncate text-xs text-gray-500">{item.description}</div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{item.businessCategoryName || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{item.subCategoryName || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{item.branchName || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-100">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {formatPrice(item.deliveryFee)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {item.deliveryTime
                        ? `${item.deliveryTime} day${item.deliveryTime === '1' ? '' : 's'}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">{statusBadge(item.status)}</td>
                    {/* <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDateTime(item.createdAt)}
                    </td> */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          title="Edit"
                          onClick={() => setDrawer({ mode: 'edit', item })}
                        >
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton title="Delete" danger onClick={() => confirmDelete(item)}>
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
          Failed to load menu items from API.
        </div>
      ) : null}

      <MenuFormDrawer
        open={drawer.mode !== 'closed'}
        mode={drawer.mode === 'edit' ? 'edit' : 'add'}
        initial={drawer.mode === 'edit' ? drawer.item : null}
        submitting={isCreating || isUpdating}
        onCancel={() => setDrawer({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />
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
      className={`flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-gray-300 hover:border-surface-border hover:bg-surface-elevated ${danger ? 'hover:text-accent-danger' : 'hover:text-white'
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
