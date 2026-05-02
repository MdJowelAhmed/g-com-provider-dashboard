import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Role } from '../../../types/role'
import { clampPermissionKeysForRole } from '../../permissions/navPermissionMap'
import { ALL_FILTER, DEFAULT_PAGE_SIZE } from '../constants'
import { seedControllersForTenant } from '../mock/seedControllers'
import type {
  ControllerFormValues,
  SortDir,
  SortKey,
  StaffController,
} from '../types'

const STORAGE_PREFIX = 'gcom.controllers.v1'

function storeKey(tenantId: string) {
  return `${STORAGE_PREFIX}.${tenantId}`
}

function readStore(tenantId: string): StaffController[] {
  try {
    const raw = localStorage.getItem(storeKey(tenantId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as StaffController[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStore(tenantId: string, rows: StaffController[]) {
  localStorage.setItem(storeKey(tenantId), JSON.stringify(rows))
}

function makeId(tenantId: string) {
  const base =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 10)
      : Date.now().toString(36)
  return `ctl_${tenantId.slice(0, 6)}_${base}`
}

function compareStrings(a: string, b: string, dir: SortDir) {
  const cmp = a.localeCompare(b, undefined, { sensitivity: 'base' })
  return dir === 'asc' ? cmp : -cmp
}

function compareTime(a: string, b: string, dir: SortDir) {
  const cmp = new Date(a).getTime() - new Date(b).getTime()
  return dir === 'asc' ? cmp : -cmp
}

export function useControllers(tenantUserId: string, dashboardRole: Role) {
  const [rows, setRows] = useState<StaffController[]>(() => {
    const existing = readStore(tenantUserId)
    if (existing.length > 0) return existing
    const seed = seedControllersForTenant(tenantUserId, dashboardRole)
    writeStore(tenantUserId, seed)
    return seed
  })

  const persist = useCallback(
    (updater: (prev: StaffController[]) => StaffController[]) => {
      setRows((prev) => {
        const next = updater(prev)
        writeStore(tenantUserId, next)
        return next
      })
    },
    [tenantUserId],
  )

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(ALL_FILTER)
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(DEFAULT_PAGE_SIZE)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setInitialLoading(false), 420)
    return () => window.clearTimeout(t)
  }, [])

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = rows.filter((r) => {
      if (statusFilter !== ALL_FILTER && r.status !== statusFilter) return false
      if (!q) return true
      return (
        r.displayName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.roleLabel.toLowerCase().includes(q)
      )
    })

    list = [...list].sort((a, b) => {
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

    return list
  }, [rows, search, statusFilter, sortKey, sortDir])

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

  const createController = useCallback(
    (values: ControllerFormValues) => {
      const now = new Date().toISOString()
      const next: StaffController = {
        id: makeId(tenantUserId),
        tenantUserId,
        displayName: values.displayName.trim(),
        email: values.email.trim().toLowerCase(),
        roleLabel: values.roleLabel.trim(),
        status: values.status,
        permissionKeys: clampPermissionKeysForRole([...new Set(values.permissionKeys)], dashboardRole),
        createdAt: now,
        updatedAt: now,
      }
      persist((prev) => [next, ...prev])
      setPage(1)
    },
    [persist, tenantUserId, dashboardRole],
  )

  const updateController = useCallback(
    (id: string, values: ControllerFormValues) => {
      const now = new Date().toISOString()
      persist((rows) =>
        rows.map((r) =>
          r.id === id
            ? {
                ...r,
                displayName: values.displayName.trim(),
                email: values.email.trim().toLowerCase(),
                roleLabel: values.roleLabel.trim(),
                status: values.status,
                permissionKeys: clampPermissionKeysForRole([...new Set(values.permissionKeys)], dashboardRole),
                updatedAt: now,
              }
            : r,
        ),
      )
    },
    [persist, dashboardRole],
  )

  const deleteController = useCallback(
    (id: string) => {
      persist((rows) => rows.filter((r) => r.id !== id))
      setSelectedIds((s) => s.filter((x) => x !== id))
    },
    [persist],
  )

  const bulkDelete = useCallback(
    (ids: string[]) => {
      const set = new Set(ids)
      persist((rows) => rows.filter((r) => !set.has(r.id)))
      clearSelection()
    },
    [persist, clearSelection],
  )

  const bulkSetStatus = useCallback(
    (ids: string[], status: StaffController['status']) => {
      const now = new Date().toISOString()
      const set = new Set(ids)
      persist((rows) =>
        rows.map((r) =>
          set.has(r.id) ? { ...r, status, updatedAt: now } : r,
        ),
      )
      clearSelection()
    },
    [persist, clearSelection],
  )

  const setControllerStatus = useCallback(
    (id: string, status: StaffController['status']) => {
      const now = new Date().toISOString()
      persist((rows) =>
        rows.map((r) =>
          r.id === id ? { ...r, status, updatedAt: now } : r,
        ),
      )
    },
    [persist],
  )

  return {
    search,
    setSearch,
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
    initialLoading,
    createController,
    updateController,
    deleteController,
    bulkDelete,
    bulkSetStatus,
    setControllerStatus,
  }
}
