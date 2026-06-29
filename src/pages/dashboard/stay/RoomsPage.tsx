import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ImageOff,
  Bed,
  Users,
} from 'lucide-react'
import { Modal, message } from 'antd'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import PageHeader from '../../../components/dashboard/PageHeader'
import RoomFormDrawer from './RoomFormDrawer'
import { ROOM_TYPE_OPTIONS, type Room, type RoomFormValues } from './roomTypes'
import { formValuesToRoomPayload, mapRoomFromApi } from './roomMapping'
import {
  useCreateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomsQuery,
  useUpdateRoomMutation,
} from '../../../redux/api/roomApi'
import { useGetBusinessCategoriesQuery } from '../../../redux/api/businessCategoryApi'
import { useGetShopsQuery } from '../../../redux/api/shopManagementApi'

type ModalState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; room: Room }

const allFilter = '__all__'

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

function formatPrice(n: number | null | undefined) {
  if (n === null || n === undefined) return '—'
  return `$${n.toFixed(0)}`
}

export default function RoomsPage() {
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>(allFilter)
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)

  const { data, isLoading, isFetching, isError } = useGetRoomsQuery({ page: 1, limit: 100 })
  const { data: shopsData } = useGetShopsQuery({ page: 1, limit: 100 })
  const { data: categoriesData } = useGetBusinessCategoriesQuery()

  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation()
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation()
  const [deleteRoom] = useDeleteRoomMutation()

  const branchNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const shop of shopsData?.data ?? []) {
      map.set(shop._id, shop.branchName)
    }
    return map
  }, [shopsData?.data])

  const businessCategoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categoriesData?.data ?? []) {
      map.set(category._id, category.name)
    }
    return map
  }, [categoriesData?.data])

  const rooms = useMemo(
    () => (data?.data ?? []).map((doc) => mapRoomFromApi(doc)),
    [data?.data],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rooms.filter((r) => {
      if (typeFilter !== allFilter && r.roomType !== typeFilter) return false
      if (statusFilter !== allFilter && r.status !== statusFilter) return false
      if (!q) return true
      const branchName = branchNameById.get(r.branchId) ?? ''
      const categoryName = businessCategoryNameById.get(r.businessCategoryId) ?? ''
      return (
        r.roomNumber.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.roomCode.toLowerCase().includes(q) ||
        r.roomType.toLowerCase().includes(q) ||
        branchName.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q)
      )
    })
  }, [rooms, search, typeFilter, statusFilter, branchNameById, businessCategoryNameById])

  const totals = useMemo(() => {
    const active = rooms.filter((r) => r.status === 'active').length
    const avgRate =
      rooms.length > 0 ? rooms.reduce((sum, r) => sum + r.basePrice, 0) / rooms.length : 0
    return { total: rooms.length, active, avgRate }
  }, [rooms])

  const handleSubmit = async (values: RoomFormValues) => {
    const payload = formValuesToRoomPayload(values)
    try {
      if (modal.mode === 'edit') {
        await updateRoom({ id: modal.room.id, body: payload }).unwrap()
        message.success('Room updated')
      } else if (modal.mode === 'add') {
        await createRoom(payload).unwrap()
        message.success('Room created')
      }
      setModal({ mode: 'closed' })
    } catch (error) {
      message.error(
        getApiErrorMessage(
          error,
          modal.mode === 'edit' ? 'Failed to update room' : 'Failed to create room',
        ),
      )
      throw error
    }
  }

  const confirmDelete = (r: Room) => {
    Modal.confirm({
      title: 'Delete room?',
      content: (
        <span>
          Delete <b>{r.name}</b> (#{r.roomNumber})? This can&apos;t be undone.
        </span>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await deleteRoom(r.id).unwrap()
          message.success('Room deleted')
        } catch (error) {
          message.error(getApiErrorMessage(error, 'Failed to delete room'))
        }
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="Rooms"
        description="Configure each room — beds, amenities, pricing, and availability."
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

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryTile label="Total" value={totals.total} tone="neutral" />
        <SummaryTile label="Active" value={totals.active} tone="success" />
        <SummaryTile
          label="Avg. rate"
          value={`$${totals.avgRate.toFixed(0)}`}
          tone="brand"
          compact
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {isError ? (
        <div className="mb-4 rounded-md border border-accent-danger/30 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger">
          Failed to load rooms. Please refresh and try again.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Bed</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Amenities</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 text-right font-medium">Price / night</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    Loading rooms…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    No rooms match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <RoomThumb src={r.image} alt={r.name} />
                        <div className="min-w-0">
                          <div className="font-mono text-xs text-gray-500">#{r.roomNumber}</div>
                          <div className="truncate font-medium text-gray-100">{r.name}</div>
                          <div className="text-[11px] text-gray-500">{r.roomCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{r.roomType}</td>
                    <td className="px-4 py-3 text-gray-300">
                      <div className="inline-flex items-center gap-1">
                        <Bed size={13} className="text-gray-500" />
                        <span>
                          {r.bedCount > 1 ? `${r.bedCount} × ` : ''}
                          {r.bedType}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <div className="inline-flex items-center gap-1">
                        <Users size={13} className="text-gray-500" />
                        <span>
                          {r.maxAdult}A
                          {r.maxChildren > 0 ? ` + ${r.maxChildren}C` : ''}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">Total {r.totalGuest}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{r.size || '—'}</td>
                    <td className="px-4 py-3">
                      {r.otherAmenities.length > 0 ? (
                        <span
                          className="rounded-full bg-surface-elevated px-2 py-0.5 text-[11px] text-gray-400"
                          title={r.otherAmenities.join(', ')}
                        >
                          {r.otherAmenities.length} amenit
                          {r.otherAmenities.length === 1 ? 'y' : 'ies'}
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {r.branchName ?? branchNameById.get(r.branchId) ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-100">
                      {formatPrice(r.basePrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.status === 'active'
                            ? 'bg-accent-success/15 text-accent-success'
                            : 'bg-gray-600/30 text-gray-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
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
        submitting={isCreating || isUpdating}
        onCancel={() => setModal({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />
    </div>
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
