import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Role } from '../../../types/role'
import { getRolePostConfig } from '../config/rolePostConfig'
import { ALL_FILTER, DEFAULT_PAGE_SIZE } from '../constants'
import { seedPostsForRole } from '../mock/seedPosts'
import type { Post, PostFormValues, SortDir, SortKey } from '../types'
import {
  campaignStatusOrder,
  getPostDisplayRow,
  localDateTimeMs,
  parseAmountSort,
} from '../utils/postDisplay'
import { mapFormValuesToPostFields } from '../utils/postFormMapping'

function makePostId(role: Role) {
  const base =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Date.now().toString(36)
  return `${role}_${base}`
}

function compareStrings(a: string, b: string, dir: SortDir) {
  const cmp = a.localeCompare(b, undefined, { sensitivity: 'base' })
  return dir === 'asc' ? cmp : -cmp
}

function compareNumbers(a: number, b: number, dir: SortDir) {
  const cmp = a - b
  return dir === 'asc' ? cmp : -cmp
}

function compareTime(a: string | null, b: string | null, dir: SortDir) {
  const ta = a ? new Date(a).getTime() : 0
  const tb = b ? new Date(b).getTime() : 0
  const cmp = ta - tb
  return dir === 'asc' ? cmp : -cmp
}

export function usePosts(role: Role) {
  const [posts, setPosts] = useState<Post[]>(() => seedPostsForRole(role))
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
    let list = posts.filter((p) => {
      const row = getPostDisplayRow(p)
      if (statusFilter !== ALL_FILTER) {
        if (!row.campaignStatus || row.campaignStatus !== statusFilter) return false
      }
      if (!q) return true
      return (
        row.shopName.toLowerCase().includes(q) ||
        row.productName.toLowerCase().includes(q) ||
        row.about.toLowerCase().includes(q)
      )
    })

    list = [...list].sort((a, b) => {
      const ra = getPostDisplayRow(a)
      const rb = getPostDisplayRow(b)
      switch (sortKey) {
        case 'shopName':
          return compareStrings(ra.shopName, rb.shopName, sortDir)
        case 'productName':
          return compareStrings(ra.productName, rb.productName, sortDir)
        case 'about':
          return compareStrings(ra.about, rb.about, sortDir)
        case 'amount':
          return compareNumbers(parseAmountSort(ra.amount), parseAmountSort(rb.amount), sortDir)
        case 'startAt':
          return compareNumbers(localDateTimeMs(ra.startLocal), localDateTimeMs(rb.startLocal), sortDir)
        case 'endAt':
          return compareNumbers(localDateTimeMs(ra.endLocal), localDateTimeMs(rb.endLocal), sortDir)
        case 'campaignStatus':
          return compareNumbers(
            campaignStatusOrder(ra.campaignStatus),
            campaignStatusOrder(rb.campaignStatus),
            sortDir,
          )
        case 'updatedAt':
        default:
          return compareTime(a.updatedAt, b.updatedAt, sortDir)
      }
    })

    return list
  }, [posts, search, statusFilter, sortKey, sortDir])

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
        const ascFirst =
          key === 'shopName' ||
          key === 'productName' ||
          key === 'about' ||
          key === 'amount'
        setSortDir(ascFirst ? 'asc' : 'desc')
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

  const createPost = useCallback(
    (values: PostFormValues) => {
      const now = new Date().toISOString()
      const cfg = getRolePostConfig(role)
      const fields = mapFormValuesToPostFields(values, cfg)
      const next: Post = {
        id: makePostId(role),
        role,
        ...fields,
        createdAt: now,
        updatedAt: now,
      }
      setPosts((prev) => [next, ...prev])
      setPage(1)
    },
    [role],
  )

  const updatePost = useCallback(
    (postId: string, values: PostFormValues) => {
      const now = new Date().toISOString()
      const cfg = getRolePostConfig(role)
      const fields = mapFormValuesToPostFields(values, cfg)
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p
          return {
            ...p,
            ...fields,
            publishedAt: p.publishedAt ?? fields.publishedAt,
            updatedAt: now,
          }
        }),
      )
    },
    [role],
  )

  const deletePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    setSelectedIds((ids) => ids.filter((x) => x !== postId))
  }, [])

  const bulkDelete = useCallback((ids: string[]) => {
    setPosts((prev) => prev.filter((p) => !ids.includes(p.id)))
    clearSelection()
  }, [clearSelection])

  return {
    posts,
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
    initialLoading,
    selectedIds,
    toggleRow,
    selectAllVisible,
    clearSelection,
    createPost,
    updatePost,
    deletePost,
    bulkDelete,
  }
}
