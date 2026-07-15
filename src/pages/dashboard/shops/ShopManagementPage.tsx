import { useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, MapPin, Clock, Phone, Eye } from 'lucide-react'
import { Modal, message } from 'antd'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import PageHeader from '../../../components/dashboard/PageHeader'
import ShopFormDrawer from './ShopFormDrawer'
import ShopDetailsDrawer from './ShopDetailsDrawer'
import { mapShopFromApi, weekdayLabel, type ShopBranch } from './shopTypes'
import {
  toShopPayload,
  useCreateShopMutation,
  useDeleteShopMutation,
  useGetShopsQuery,
  useUpdateShopMutation,
  type ShopFormValues,
} from '../../../redux/api/shopManagementApi'

type ModalState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; shop: ShopBranch }

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as FetchBaseQueryError).data
    if (data && typeof data === 'object') {
      const payload = data as { message?: unknown; errorMessages?: { message?: string }[] }
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message
      }
      const first = payload.errorMessages?.[0]?.message
      if (first?.trim()) return first
    }
  }
  return fallback
}

function formatLocation(shop: ShopBranch) {
  if (shop.locationName) return shop.locationName
  return `${shop.latitude.toFixed(4)}, ${shop.longitude.toFixed(4)}`
}

function formatHours(open: string, close: string) {
  if (!open && !close) return '—'
  return `${open || '—'} – ${close || '—'}`
}

function formatDays(days: ShopBranch['availableDay']) {
  if (!days.length) return '—'
  return days.map(weekdayLabel).join(', ')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ShopManagementPage() {
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [search, setSearch] = useState('')
  const [detailsId, setDetailsId] = useState<string | null>(null)

  const { data, isLoading, isFetching, isError } = useGetShopsQuery({ page: 1, limit: 50 })
  const [createShop, { isLoading: isCreating }] = useCreateShopMutation()
  const [updateShop, { isLoading: isUpdating }] = useUpdateShopMutation()
  const [deleteShop] = useDeleteShopMutation()

  const shops = useMemo(
    () => (data?.data ?? []).map((doc) => mapShopFromApi(doc)),
    [data?.data],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return shops
    return shops.filter(
      (s) =>
        s.branchName.toLowerCase().includes(q) ||
        s.contact.toLowerCase().includes(q) ||
        s.locationName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        formatLocation(s).toLowerCase().includes(q),
    )
  }, [shops, search])

  const detailsShop = shops.find((s) => s.id === detailsId) ?? null

 

  const handleSubmit = async (values: ShopFormValues) => {
    const payload = toShopPayload(values)
    try {
      if (modal.mode === 'edit') {
        await updateShop({ id: modal.shop.id, body: payload }).unwrap()
        void message.success('Branch updated successfully.')
      } else {
        await createShop(payload).unwrap()
        void message.success('Branch created successfully.')
      }
      setModal({ mode: 'closed' })
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Something went wrong. Please try again.'))
    }
  }

  const confirmDelete = (shop: ShopBranch) => {
    Modal.confirm({
      title: 'Delete branch?',
      content: (
        <span>
          Are you sure you want to delete <b>{shop.branchName}</b>? This can&apos;t be undone.
        </span>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await deleteShop(shop.id).unwrap()
          void message.success('Branch deleted successfully.')
        } catch {
          void message.error('Failed to delete branch.')
        }
      },
    })
  }

  const drawerLoading = isCreating || isUpdating

  return (
    <div>
      <PageHeader
        title="Shop Management"
        description="Manage your business branches — locations, contact details, and opening hours."
       
      />


        <div className="mb-4 flex items-center justify-end w-full gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by name, contact, location, or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-[300px] rounded-md border border-surface-border bg-surface-card pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none"
          />
        </div>
        <button
            type="button"
            onClick={() => setModal({ mode: 'add' })}
            className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus size={16} /> Add branch
          </button>
        </div> 

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Hours</th>
                <th className="px-4 py-3 font-medium">Open days</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    Loading branches…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-accent-danger">
                    Failed to load branches. Please try again.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No branches match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((shop) => (
                  <tr
                    key={shop.id}
                    onClick={() => setDetailsId(shop.id)}
                    className="cursor-pointer border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                  >
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-gray-100">{shop.branchName}</div>
                        {shop.description ? (
                          <div className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                            {shop.description}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <span className="inline-flex items-center gap-1">
                        <Phone size={13} className="text-gray-500" />
                        {shop.contact || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <span className="inline-flex items-start gap-1">
                        <MapPin size={13} className="mt-0.5 shrink-0 text-gray-500" />
                        <span className="line-clamp-2" title={formatLocation(shop)}>
                          {formatLocation(shop)}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={13} className="text-gray-500" />
                        {formatHours(shop.openTime, shop.closeTime)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <span className="block max-w-[200px] truncate" title={formatDays(shop.availableDay)}>
                        {formatDays(shop.availableDay)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(shop.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          title="View details"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDetailsId(shop.id)
                          }}
                        >
                          <Eye size={15} />
                        </IconButton>
                        <IconButton
                          title="Edit"
                          onClick={(e) => {
                            e.stopPropagation()
                            setModal({ mode: 'edit', shop })
                          }}
                        >
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton
                          title="Delete"
                          danger
                          onClick={(e) => {
                            e.stopPropagation()
                            confirmDelete(shop)
                          }}
                        >
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

      <ShopDetailsDrawer
        open={detailsId !== null}
        shop={detailsShop}
        onClose={() => setDetailsId(null)}
        onEdit={(shop) => setModal({ mode: 'edit', shop })}
      />

      <ShopFormDrawer
        open={modal.mode !== 'closed'}
        mode={modal.mode === 'edit' ? 'edit' : 'add'}
        initial={modal.mode === 'edit' ? modal.shop : null}
        loading={drawerLoading}
        onCancel={() => setModal({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />
    </div>
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
  onClick: (e: React.MouseEvent) => void
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

