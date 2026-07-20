import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { Role } from '../../../types/role'
import { useSearchField } from '../../../hooks/useSearchField'
import { clampPermissionKeysForRole, getAllowedNavPermissionIdsForRole } from '../../permissions/navPermissionMap'
import {
  useCreateControllerMutation,
  useDeleteControllerMutation,
  useGetControllersQuery,
  useUpdateControllerMutation,
} from '../../../redux/api/controllerApi'
import { ALL_FILTER, DEFAULT_PAGE_SIZE } from '../constants'
import {
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  mapControllerFromApi,
} from '../permissionMapping'
import type { ControllerFormValues, SortDir, SortKey, StaffController } from '../types'

function compareStrings(a: string, b: string, dir: SortDir) {
  const cmp = a.localeCompare(b, undefined, { sensitivity: 'base' })
  return dir === 'asc' ? cmp : -cmp
}

function compareTime(a: string, b: string, dir: SortDir) {
  const cmp = new Date(a).getTime() - new Date(b).getTime()
  return dir === 'asc' ? cmp : -cmp
}

export function getControllerApiErrorMessage(error: unknown, fallback: string) {
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

export function useControllers(tenantUserId: string, dashboardRole: Role) {
  const {
    inputValue,
    setInputValue,
    searchTerm,
    clear: clearSearch,
    flush,
    isDebouncing,
  } = useSearchField({ minChars: 2 })
  const [statusFilter, setStatusFilter] = useState<string>(ALL_FILTER)
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(DEFAULT_PAGE_SIZE)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data, isLoading, isFetching, isError } = useGetControllersQuery({
    page: 1,
    limit: 100,
    ...(searchTerm ? { searchTerm } : {}),
    ...(statusFilter !== ALL_FILTER ? { status: statusFilter } : {}),
  })
  const [createController, { isLoading: isCreating }] = useCreateControllerMutation()
  const [updateController, { isLoading: isUpdating }] = useUpdateControllerMutation()
  const [deleteController, { isLoading: isDeleting }] = useDeleteControllerMutation()

  const roleNavIds = useMemo(
    () => getAllowedNavPermissionIdsForRole(dashboardRole),
    [dashboardRole],
  )

  const rows = useMemo(
    () => (data?.data ?? []).map((doc) => mapControllerFromApi(doc, tenantUserId, roleNavIds)),
    [data?.data, tenantUserId, roleNavIds],
  )

  useEffect(() => {
    setPage(1)
    setSelectedIds([])
  }, [searchTerm, statusFilter])

  const filteredSorted = useMemo(() => {
    // Search + status are handled by the backend (`searchTerm`, `status`).
    // Keep client-side sort for table column headers.
    return [...rows].sort((a, b) => {
      switch (sortKey) {
        case 'displayName':
          return compareStrings(a.displayName, b.displayName, sortDir)
        case 'email':
          return compareStrings(a.email, b.email, sortDir)
        case 'roleLabel':
          return compareStrings(a.roleLabel, b.roleLabel, sortDir)
        case 'status':
          return compareStrings(a.status, b.status, sortDir)
        case 'updatedAt':
        default:
          return compareTime(a.updatedAt, b.updatedAt, sortDir)
      }
    })
  }, [rows, sortKey, sortDir])

  const total = filteredSorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const effectivePage = Math.min(Math.max(1, page), totalPages)

  const paginated = useMemo(() => {
    const start = (effectivePage - 1) * pageSize
    return filteredSorted.slice(start, start + pageSize)
  }, [filteredSorted, effectivePage, pageSize])

  const toggleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev !== key) {
        setSortDir(key === 'displayName' || key === 'email' || key === 'roleLabel' ? 'asc' : 'desc')
        return key
      }
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      return prev
    })
  }, [])

  const clearSelection = useCallback(() => setSelectedIds([]), [])

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }, [])

  const selectAllVisible = useCallback(() => {
    setSelectedIds(paginated.map((p) => p.id))
  }, [paginated])

  const withClampedPermissions = useCallback(
    (values: ControllerFormValues): ControllerFormValues => ({
      ...values,
      permissionKeys: clampPermissionKeysForRole([...new Set(values.permissionKeys)], dashboardRole),
    }),
    [dashboardRole],
  )

  const createControllerRow = useCallback(
    async (values: ControllerFormValues) => {
      const payload = formValuesToCreatePayload(withClampedPermissions(values))
      await createController(payload).unwrap()
      setPage(1)
    },
    [createController, withClampedPermissions],
  )

  const updateControllerRow = useCallback(
    async (id: string, values: ControllerFormValues) => {
      const body = formValuesToUpdatePayload(withClampedPermissions(values))
      await updateController({ id, body }).unwrap()
    },
    [updateController, withClampedPermissions],
  )

  const deleteControllerRow = useCallback(
    async (id: string) => {
      await deleteController(id).unwrap()
      setSelectedIds((s) => s.filter((x) => x !== id))
    },
    [deleteController],
  )

  const bulkDelete = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteController(id).unwrap()))
      clearSelection()
    },
    [deleteController, clearSelection],
  )

  const bulkSetStatus = useCallback(
    async (ids: string[], status: StaffController['status']) => {
      await Promise.all(
        ids.map((id) => updateController({ id, body: { status } }).unwrap()),
      )
      clearSelection()
    },
    [updateController, clearSelection],
  )

  const setControllerStatus = useCallback(
    async (id: string, status: StaffController['status']) => {
      await updateController({ id, body: { status } }).unwrap()
    },
    [updateController],
  )

  return {
    search: inputValue,
    setSearch: setInputValue,
    searchTerm,
    clearSearch,
    flushSearch: flush,
    isDebouncing,
    statusFilter,
    setStatusFilter,
    sortKey,
    sortDir,
    toggleSort,
    page: effectivePage,
    setPage,
    pageSize,
    total,
    totalPages,
    paginated,
    selectedIds,
    toggleRow,
    selectAllVisible,
    clearSelection,
    initialLoading: isLoading || isFetching,
    isFetching,
    isError,
    isSaving: isCreating || isUpdating || isDeleting,
    createController: createControllerRow,
    updateController: updateControllerRow,
    deleteController: deleteControllerRow,
    bulkDelete,
    bulkSetStatus,
    setControllerStatus,
  }
}
