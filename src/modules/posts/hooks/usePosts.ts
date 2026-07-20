import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { useSearchField } from '../../../hooks/useSearchField'
import type { Role } from '../../../types/role'
import {
  useCreateHubPostMutation,
  useDeleteHubPostMutation,
  useGetHubPostsQuery,
  useUpdateHubPostMutation,
} from '../../../redux/api/hubPostApi'
import { DEFAULT_PAGE_SIZE } from '../constants'
import type { PostFormValues, SortDir, SortKey } from '../types'
import { formValuesToHubPostPayload, mapHubPostFromApi } from '../utils/hubPostMapping'
import {
  campaignStatusOrder,
  getPostDisplayRow,
  localDateTimeMs,
  parseAmountSort,
} from '../utils/postDisplay'

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

export function getHubPostApiErrorMessage(error: unknown, fallback: string) {
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

export function usePosts(role: Role, serviceLabelById?: Map<string, string>) {
  const {
    inputValue,
    setInputValue,
    searchTerm,
    clear: clearSearch,
    flush,
    isDebouncing,
  } = useSearchField({ minChars: 2 })
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(DEFAULT_PAGE_SIZE)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data, isLoading, isFetching, isError } = useGetHubPostsQuery({
    page: 1,
    limit: 100,
    ...(searchTerm ? { searchTerm } : {}),
  })
  const [createHubPost, { isLoading: isCreating }] = useCreateHubPostMutation()
  const [updateHubPost, { isLoading: isUpdating }] = useUpdateHubPostMutation()
  const [deleteHubPost, { isLoading: isDeleting }] = useDeleteHubPostMutation()

  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  const posts = useMemo(
    () => (data?.data ?? []).map((doc) => mapHubPostFromApi(doc, role)),
    [data?.data, role],
  )

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => {
      const ra = getPostDisplayRow(a, serviceLabelById)
      const rb = getPostDisplayRow(b, serviceLabelById)
      switch (sortKey) {
        case 'panel':
          return compareStrings(ra.panel, rb.panel, sortDir)
        case 'category':
          return compareStrings(ra.category, rb.category, sortDir)
        case 'itemId':
          return compareStrings(ra.itemLabel, rb.itemLabel, sortDir)
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
  }, [posts, sortKey, sortDir, serviceLabelById])

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const effectivePage = Math.min(Math.max(1, page), totalPages)

  const paginated = useMemo(() => {
    const start = (effectivePage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, effectivePage, pageSize])

  const toggleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev !== key) {
        const ascFirst =
          key === 'panel' ||
          key === 'category' ||
          key === 'itemId' ||
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
    async (values: PostFormValues) => {
      const payload = formValuesToHubPostPayload(values)
      const result = await createHubPost(payload).unwrap()
      setPage(1)
      return result
    },
    [createHubPost],
  )

  const updatePost = useCallback(
    async (postId: string, values: PostFormValues) => {
      const payload = formValuesToHubPostPayload(values)
      return updateHubPost({ id: postId, body: payload }).unwrap()
    },
    [updateHubPost],
  )

  const deletePost = useCallback(
    async (postId: string) => {
      await deleteHubPost(postId).unwrap()
      setSelectedIds((ids) => ids.filter((x) => x !== postId))
    },
    [deleteHubPost],
  )

  const bulkDelete = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteHubPost(id).unwrap()))
      clearSelection()
    },
    [clearSelection, deleteHubPost],
  )

  return {
    posts,
    inputValue,
    setInputValue,
    searchTerm,
    clearSearch,
    flush,
    isDebouncing,
    sortKey,
    sortDir,
    toggleSort,
    page: effectivePage,
    setPage,
    pageSize,
    total,
    totalPages,
    paginated,
    initialLoading: isLoading,
    isFetching,
    isError,
    isSubmitting: isCreating || isUpdating,
    isDeleting,
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
