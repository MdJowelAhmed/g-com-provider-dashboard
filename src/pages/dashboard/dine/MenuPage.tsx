import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ImageOff } from 'lucide-react'
import { Modal, message } from 'antd'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import PageHeader from '../../../components/dashboard/PageHeader'
import SearchField from '../../../components/common/SearchField'
import { useSearchField } from '../../../hooks/useSearchField'
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
import type { MenuFormValues, MenuItem, MenuStatus } from './menuTypes'
import { formValuesToMenuPayload, mapMenuItemFromApi } from './menuMapping'

type DrawerState =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'edit'; item: MenuItem }

function formatPrice(n: number | null | undefined) {
  if (n === null || n === undefined) return '—'
  return `GH₵ ${n.toFixed(2)}`
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
  const { inputValue, setInputValue, searchTerm, clear, flush, isDebouncing } = useSearchField({
    minChars: 2,
  })

  const { data, isLoading, isFetching, isError } = useGetProductsQuery({
    page: 1,
    limit: 100,
    ...(searchTerm ? { searchTerm } : {}),
  })
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()
  const [deleteProduct] = useDeleteProductMutation()
  const [getPresignedUrl] = useGetPresignedUploadUrlMutation()
  const [items, setItems] = useState<MenuItem[]>([])
  const [drawer, setDrawer] = useState<DrawerState>({ mode: 'closed' })

  useEffect(() => {
    if (!data?.data) {
      setItems([])
      return
    }
    setItems(
      data.data
        .filter((doc) => !doc.mainCategory || doc.mainCategory === 'dine')
        .map((doc) => mapMenuItemFromApi(doc)),
    )
  }, [data?.data])

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
      />

      <div className="mb-4 flex w-full items-center justify-end gap-2">
        <SearchField
          value={inputValue}
          onChange={setInputValue}
          onClear={clear}
          onFlush={flush}
          minChars={2}
          loading={isDebouncing || ((isLoading || isFetching) && Boolean(searchTerm))}
          placeholder="Search by name or description"
          aria-label="Search menu items"
        />
        <button
          type="button"
          onClick={() => setDrawer({ mode: 'add' })}
          className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
        >
          <Plus size={16} /> Add item
        </button>
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
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                    Loading menu items…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                    No menu items match your search.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
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
      className={`flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-gray-300 hover:border-surface-border hover:bg-surface-elevated ${
        danger ? 'hover:text-accent-danger' : 'hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
