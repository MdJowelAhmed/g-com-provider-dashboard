import { AnimatePresence } from 'framer-motion'
import { Modal } from 'antd'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import type { Role } from '../../../types/role'
import { getRolePostConfig } from '../config/rolePostConfig'
import { usePosts } from '../hooks/usePosts'
import type { Post } from '../types'
import PostDetailModal from './PostDetailModal'
import PostFiltersBar from './PostFiltersBar'
import PostFormModal from './PostFormModal'
import PostPagination from './PostPagination'
import PostTable from './PostTable'
import PostsBulkBar from './PostsBulkBar'

type ModalMode = 'closed' | 'create' | 'edit'

export default function PostsManagementShell({
  role,
  registerOpenCreate,
}: {
  role: Role
  /** Parent registers PageHeader "New post" — avoids cross-component effect coupling. */
  registerOpenCreate?: (open: () => void) => void
}) {
  const config = useMemo(() => getRolePostConfig(role), [role])
  const postsApi = usePosts(role)

  const [formModal, setFormModal] = useState<{ mode: ModalMode; post?: Post | null }>({
    mode: 'closed',
  })
  const [detailPost, setDetailPost] = useState<Post | null>(null)

  useLayoutEffect(() => {
    registerOpenCreate?.(() => setFormModal({ mode: 'create' }))
  }, [registerOpenCreate])

  const allOnPageSelected =
    postsApi.paginated.length > 0 &&
    postsApi.paginated.every((p) => postsApi.selectedIds.includes(p.id))
  const someOnPageSelected = postsApi.paginated.some((p) =>
    postsApi.selectedIds.includes(p.id),
  )

  const confirmDelete = useCallback(
    (post: Post) => {
      const title = post.title || 'this post'
      Modal.confirm({
        title: 'Delete post?',
        content: (
          <span>
            Permanently delete <b>{title}</b>? This cannot be undone.
          </span>
        ),
        okText: 'Delete',
        okButtonProps: { danger: true },
        cancelText: 'Cancel',
        centered: true,
        onOk: () => postsApi.deletePost(post.id),
      })
    },
    [postsApi],
  )

  const confirmBulkDelete = useCallback(() => {
    const n = postsApi.selectedIds.length
    if (n === 0) return
    Modal.confirm({
      title: `Delete ${n} post${n === 1 ? '' : 's'}?`,
      content: 'Selected posts will be removed permanently.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: () => postsApi.bulkDelete(postsApi.selectedIds),
    })
  }, [postsApi])

  return (
    <div>
      <PostFiltersBar
        search={postsApi.search}
        onSearchChange={postsApi.setSearch}
        searchPlaceholder="Search by shop, product, or description"
        statusFilter={postsApi.statusFilter}
        onStatusChange={postsApi.setStatusFilter}
      />

      <AnimatePresence>
        {postsApi.selectedIds.length > 0 ? (
          <PostsBulkBar
            key="bulk"
            count={postsApi.selectedIds.length}
            onDelete={confirmBulkDelete}
            onClear={postsApi.clearSelection}
          />
        ) : null}
      </AnimatePresence>

      <PostTable
        posts={postsApi.paginated}
        loading={postsApi.initialLoading}
        sortKey={postsApi.sortKey}
        sortDir={postsApi.sortDir}
        onSort={postsApi.toggleSort}
        selectedIds={postsApi.selectedIds}
        onToggleRow={postsApi.toggleRow}
        onSelectAllPage={() => {
          if (allOnPageSelected) postsApi.clearSelection()
          else postsApi.selectAllVisible()
        }}
        allOnPageSelected={allOnPageSelected}
        someOnPageSelected={someOnPageSelected}
        onView={setDetailPost}
        onEdit={(p) => setFormModal({ mode: 'edit', post: p })}
        onDelete={confirmDelete}
      />

      <PostPagination
        page={postsApi.page}
        totalPages={postsApi.totalPages}
        total={postsApi.total}
        pageSize={postsApi.pageSize}
        onPageChange={postsApi.setPage}
      />

      <PostFormModal
        open={formModal.mode !== 'closed'}
        mode={formModal.mode === 'edit' ? 'edit' : 'create'}
        initialPost={formModal.mode === 'edit' ? formModal.post ?? null : null}
        config={config}
        onCancel={() => setFormModal({ mode: 'closed' })}
        onSubmit={(values) => {
          if (formModal.mode === 'edit' && formModal.post) {
            postsApi.updatePost(formModal.post.id, values)
          } else {
            postsApi.createPost(values)
          }
          setFormModal({ mode: 'closed' })
        }}
      />

      <PostDetailModal open={detailPost !== null} post={detailPost} onClose={() => setDetailPost(null)} />
    </div>
  )
}
