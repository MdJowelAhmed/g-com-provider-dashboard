import { AnimatePresence } from 'framer-motion'
import { Modal, message } from 'antd'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import type { Role } from '../../../types/role'
import { getRolePostConfig } from '../config/rolePostConfig'
import { getHubPostApiErrorMessage, usePosts } from '../hooks/usePosts'
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
      const label = post.caption.trim() || post.itemId || 'this post'
      Modal.confirm({
        title: 'Delete post?',
        content: (
          <span>
            Permanently delete <b>{label}</b>? This cannot be undone.
          </span>
        ),
        okText: 'Delete',
        okButtonProps: { danger: true },
        cancelText: 'Cancel',
        centered: true,
        onOk: async () => {
          try {
            await postsApi.deletePost(post.id)
            message.success('Post deleted')
          } catch (error) {
            message.error(getHubPostApiErrorMessage(error, 'Failed to delete post'))
          }
        },
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
      onOk: async () => {
        try {
          await postsApi.bulkDelete(postsApi.selectedIds)
          message.success(`Deleted ${n} post${n === 1 ? '' : 's'}`)
        } catch (error) {
          message.error(getHubPostApiErrorMessage(error, 'Failed to delete posts'))
        }
      },
    })
  }, [postsApi])

  const handleFormSubmit = useCallback(
    async (values: Parameters<typeof postsApi.createPost>[0]) => {
      try {
        if (formModal.mode === 'edit' && formModal.post) {
          await postsApi.updatePost(formModal.post.id, values)
          message.success('Post updated')
        } else {
          await postsApi.createPost(values)
          message.success('Post created')
        }
        setFormModal({ mode: 'closed' })
      } catch (error) {
        message.error(
          getHubPostApiErrorMessage(
            error,
            formModal.mode === 'edit' ? 'Failed to update post' : 'Failed to create post',
          ),
        )
        throw error
      }
    },
    [formModal.mode, formModal.post, postsApi],
  )

  return (
    <div>
      <PostFiltersBar
        search={postsApi.search}
        onSearchChange={postsApi.setSearch}
        searchPlaceholder="Search by panel, item, or caption"
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
        loading={postsApi.initialLoading || postsApi.isFetching}
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
        submitting={postsApi.isSubmitting}
        onCancel={() => setFormModal({ mode: 'closed' })}
        onSubmit={handleFormSubmit}
      />

      <PostDetailModal open={detailPost !== null} post={detailPost} onClose={() => setDetailPost(null)} />
    </div>
  )
}
