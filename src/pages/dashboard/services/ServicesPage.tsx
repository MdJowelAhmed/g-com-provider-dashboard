import { useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, ImageOff, Clock } from 'lucide-react'
import { Modal, message } from 'antd'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import PageHeader from '../../../components/dashboard/PageHeader'
import ServiceFormDrawer from './ServiceFormDrawer'
import { PRICING_TYPE_OPTIONS, type Service, type ServiceFormValues } from './serviceTypes'
import { formValuesToServicePayload, mapServiceFromApi } from './serviceMapping'
import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useGetServicesQuery,
  useUpdateServiceMutation,
} from '../../../redux/api/serviceApi'
import { useGetBusinessCategoriesQuery } from '../../../redux/api/businessCategoryApi'
import { useGetShopsQuery } from '../../../redux/api/shopManagementApi'
import { useSubCategoryLookup } from './useSubCategoryLookup'

type ModalState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; service: Service }

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
  return `$${n.toFixed(2)}`
}

function pricingLabel(t: Service['pricingType']) {
  return PRICING_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t
}

export default function ServicesPage() {
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [search, setSearch] = useState('')
  const [pricingFilter, setPricingFilter] = useState<string>(allFilter)

  const { data, isLoading, isFetching, isError } = useGetServicesQuery({ page: 1, limit: 100 })
  const { data: shopsData } = useGetShopsQuery({ page: 1, limit: 100 })
  const { data: categoriesData } = useGetBusinessCategoriesQuery()
  const { nameById: subCategoryNameById, platformById: subCategoryPlatformById } =
    useSubCategoryLookup()

  const [createService, { isLoading: isCreating }] = useCreateServiceMutation()
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation()
  const [deleteService] = useDeleteServiceMutation()

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

  const services = useMemo(
    () => (data?.data ?? []).map((doc) => mapServiceFromApi(doc)),
    [data?.data],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return services.filter((s) => {
      if (pricingFilter !== allFilter && s.pricingType !== pricingFilter) return false
      if (!q) return true
      const branchName = branchNameById.get(s.branchId) ?? ''
      const categoryName = businessCategoryNameById.get(s.businessCategoryId) ?? ''
      const subName = subCategoryNameById.get(s.subCategoryId) ?? ''
      return (
        s.name.toLowerCase().includes(q) ||
        s.serviceCode.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        branchName.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q) ||
        subName.toLowerCase().includes(q)
      )
    })
  }, [
    services,
    search,
    pricingFilter,
    branchNameById,
    businessCategoryNameById,
    subCategoryNameById,
  ])

  const totals = useMemo(() => {
    const fixed = services.filter((s) => s.pricingType === 'fixed').length
    const perHour = services.filter((s) => s.pricingType === 'per_hour').length
    return { total: services.length, fixed, perHour }
  }, [services])

  const handleSubmit = async (values: ServiceFormValues) => {
    const payload = formValuesToServicePayload(values)
    try {
      if (modal.mode === 'edit') {
        await updateService({ id: modal.service.id, body: payload }).unwrap()
        message.success('Service updated')
      } else if (modal.mode === 'add') {
        await createService(payload).unwrap()
        message.success('Service created')
      }
      setModal({ mode: 'closed' })
    } catch (error) {
      message.error(
        getApiErrorMessage(
          error,
          modal.mode === 'edit' ? 'Failed to update service' : 'Failed to create service',
        ),
      )
      throw error
    }
  }

  const confirmDelete = (s: Service) => {
    Modal.confirm({
      title: 'Delete service?',
      content: (
        <span>
          Are you sure you want to permanently delete <b>{s.name}</b>? This can&apos;t be undone.
        </span>
      ),
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await deleteService(s.id).unwrap()
          message.success('Service deleted')
        } catch (error) {
          message.error(getApiErrorMessage(error, 'Failed to delete service'))
        }
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage the services you offer — pricing, duration, branches and categories."
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

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryTile label="Total" value={totals.total} tone="neutral" />
        <SummaryTile label="Fixed price" value={totals.fixed} tone="success" />
        <SummaryTile label="Per hour" value={totals.perHour} tone="warning" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by name, code, branch, or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-surface-border bg-surface-card pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={pricingFilter}
          onChange={(e) => setPricingFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All pricing types</option>
          {PRICING_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isError ? (
        <div className="mb-4 rounded-md border border-accent-danger/30 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger">
          Failed to load services. Please refresh and try again.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Business category</th>
                <th className="px-4 py-3 font-medium">Sub category</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium">Max / day</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    Loading services…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    No services match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ServiceThumb src={s.image} alt={s.name} />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-gray-100">{s.name}</div>
                          <div className="text-xs text-gray-500">Code · {s.serviceCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {businessCategoryNameById.get(s.businessCategoryId) ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {subCategoryNameById.get(s.subCategoryId) ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-gray-100">{formatPrice(s.price)}</span>
                      <div className="text-[11px] uppercase tracking-wide text-gray-500">
                        {pricingLabel(s.pricingType)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={13} className="text-gray-500" />
                        {s.duration ? `${s.duration}h` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <span className="block max-w-[180px] truncate" title={branchNameById.get(s.branchId)}>
                        {branchNameById.get(s.branchId) ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{s.maxBookingPerDay ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton title="Edit" onClick={() => setModal({ mode: 'edit', service: s })}>
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
        initialPlatformCategory={
          modal.mode === 'edit'
            ? subCategoryPlatformById.get(modal.service.subCategoryId) ?? null
            : null
        }
        submitting={isCreating || isUpdating}
        onCancel={() => setModal({ mode: 'closed' })}
        onSubmit={handleSubmit}
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
