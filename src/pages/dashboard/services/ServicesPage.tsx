import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ImageOff, Clock, Eye } from 'lucide-react'
import { Modal, message } from 'antd'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import PageHeader from '../../../components/dashboard/PageHeader'
import SearchField from '../../../components/common/SearchField'
import { useSearchField } from '../../../hooks/useSearchField'
import ServiceFormDrawer from './ServiceFormDrawer'
import ServiceDetailsDrawer from './ServiceDetailsDrawer'
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
  return `GH₵ ${n.toFixed(2)}`
}

function pricingLabel(t: Service['pricingType']) {
  return PRICING_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t
}

export default function ServicesPage() {
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [pricingFilter, setPricingFilter] = useState<string>(allFilter)
  const { inputValue, setInputValue, searchTerm, clear, flush, isDebouncing } =
    useSearchField({ minChars: 2 })

  const { data, isLoading, isFetching, isError } = useGetServicesQuery({
    page: 1,
    limit: 100,
    ...(searchTerm ? { searchTerm } : {}),
    ...(pricingFilter !== allFilter ? { pricingType: pricingFilter } : {}),
  })
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
  const detailsService = useMemo(() => {
    const s = services.find((x) => x.id === detailsId)
    if (!s) return null
    return {
      ...s,
      businessCategoryName:
        s.businessCategoryName ?? businessCategoryNameById.get(s.businessCategoryId),
      subCategoryName: s.subCategoryName ?? subCategoryNameById.get(s.subCategoryId),
      branchName: s.branchName ?? branchNameById.get(s.branchId),
    }
  }, [
    services,
    detailsId,
    businessCategoryNameById,
    subCategoryNameById,
    branchNameById,
  ])

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

    

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchField
          value={inputValue}
          onChange={setInputValue}
          onClear={clear}
          onFlush={flush}
          loading={isDebouncing || ((isLoading || isFetching) && Boolean(searchTerm))}
          minChars={2}
          placeholder="Search by name, code, branch, or category"
          aria-label="Search services"
        />
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
              ) : services?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    No services match your filters.
                  </td>
                </tr>
              ) : (
                services?.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setDetailsId(s.id)}
                    className="cursor-pointer border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
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
                      {s.businessCategoryName ??
                        businessCategoryNameById.get(s.businessCategoryId) ??
                        '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {s.subCategoryName ?? subCategoryNameById.get(s.subCategoryId) ?? '—'}
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
                        {s.duration || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <span
                        className="block max-w-[180px] truncate"
                        title={s.branchName ?? branchNameById.get(s.branchId)}
                      >
                        {s.branchName ?? branchNameById.get(s.branchId) ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{s.maxBookingPerDay ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          title="View details"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDetailsId(s.id)
                          }}
                        >
                          <Eye size={15} />
                        </IconButton>
                        <IconButton
                          title="Edit"
                          onClick={(e) => {
                            e.stopPropagation()
                            setModal({ mode: 'edit', service: s })
                          }}
                        >
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton
                          title="Delete"
                          danger
                          onClick={(e) => {
                            e.stopPropagation()
                            confirmDelete(s)
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

      <ServiceDetailsDrawer
        open={detailsId !== null}
        service={detailsService}
        onClose={() => setDetailsId(null)}
        onEdit={(service) => setModal({ mode: 'edit', service })}
      />

      <ServiceFormDrawer
        open={modal.mode !== 'closed'}
        mode={modal.mode === 'edit' ? 'edit' : 'add'}
        initial={modal.mode === 'edit' ? modal.service : null}
        initialPlatformCategory={
          modal.mode === 'edit'
            ? modal.service.platformCategory ||
              subCategoryPlatformById.get(modal.service.subCategoryId) ||
              null
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


