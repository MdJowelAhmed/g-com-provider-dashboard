import { AnimatePresence } from 'framer-motion'
import { Modal } from 'antd'
import { useCallback, useLayoutEffect, useState } from 'react'
import type { Role } from '../../../types/role'
import { useControllers } from '../hooks/useControllers'
import type { StaffController } from '../types'
import ControllerFiltersBar from './ControllerFiltersBar'
import ControllerFormModal from './ControllerFormModal'
import ControllerPagination from './ControllerPagination'
import ControllerTable from './ControllerTable'
import ControllersBulkBar from './ControllersBulkBar'

type ModalMode = 'closed' | 'create' | 'edit'

export default function ControllersManagementShell({
  tenantUserId,
  dashboardRole,
  registerOpenCreate,
}: {
  tenantUserId: string
  /** Matches `ROLE_META` for this workspace — controller permissions are scoped to this role */
  dashboardRole: Role
  registerOpenCreate?: (open: () => void) => void
}) {
  const api = useControllers(tenantUserId, dashboardRole)

  const [formModal, setFormModal] = useState<{
    mode: ModalMode
    row?: StaffController | null
  }>({ mode: 'closed' })

  useLayoutEffect(() => {
    registerOpenCreate?.(() => setFormModal({ mode: 'create' }))
  }, [registerOpenCreate])

  const allOnPageSelected =
    api.paginated.length > 0 && api.paginated.every((p) => api.selectedIds.includes(p.id))
  const someOnPageSelected = api.paginated.some((p) => api.selectedIds.includes(p.id))

  const confirmDelete = useCallback(
    (row: StaffController) => {
      Modal.confirm({
        title: 'Remove controller?',
        content: (
          <span>
            Remove <b>{row.displayName}</b> and revoke their access? This is immediate for this
            workspace.
          </span>
        ),
        okText: 'Remove',
        okButtonProps: { danger: true },
        cancelText: 'Cancel',
        centered: true,
        onOk: () => api.deleteController(row.id),
      })
    },
    [api],
  )

  const confirmBulkDelete = useCallback(() => {
    const n = api.selectedIds.length
    if (n === 0) return
    Modal.confirm({
      title: `Remove ${n} controller${n === 1 ? '' : 's'}?`,
      content: 'Selected accounts lose dashboard access for this tenant.',
      okText: 'Remove',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: () => api.bulkDelete(api.selectedIds),
    })
  }, [api])

  const setRowStatus = useCallback(
    (row: StaffController, status: StaffController['status']) => {
      api.setControllerStatus(row.id, status)
    },
    [api],
  )

  return (
    <div>
      <ControllerFiltersBar
        search={api.search}
        onSearchChange={api.setSearch}
        statusFilter={api.statusFilter}
        onStatusChange={api.setStatusFilter}
      />

      <AnimatePresence>
        {api.selectedIds.length > 0 ? (
          <ControllersBulkBar
            key="bulk"
            count={api.selectedIds.length}
            onActivate={() => api.bulkSetStatus(api.selectedIds, 'active')}
            onDeactivate={() => api.bulkSetStatus(api.selectedIds, 'inactive')}
            onSuspend={() => api.bulkSetStatus(api.selectedIds, 'suspended')}
            onDelete={confirmBulkDelete}
            onClear={api.clearSelection}
          />
        ) : null}
      </AnimatePresence>

      <ControllerTable
        rows={api.paginated}
        loading={api.initialLoading}
        sortKey={api.sortKey}
        sortDir={api.sortDir}
        onSort={api.toggleSort}
        selectedIds={api.selectedIds}
        onToggleRow={api.toggleRow}
        onSelectAllPage={() => {
          if (allOnPageSelected) api.clearSelection()
          else api.selectAllVisible()
        }}
        allOnPageSelected={allOnPageSelected}
        someOnPageSelected={someOnPageSelected}
        onEdit={(row) => setFormModal({ mode: 'edit', row })}
        onDelete={confirmDelete}
        onSetStatus={setRowStatus}
      />

      <ControllerPagination
        page={api.page}
        totalPages={api.totalPages}
        total={api.total}
        pageSize={api.pageSize}
        onPageChange={api.setPage}
      />

      <ControllerFormModal
        open={formModal.mode !== 'closed'}
        mode={formModal.mode === 'edit' ? 'edit' : 'create'}
        dashboardRole={dashboardRole}
        initial={formModal.mode === 'edit' ? formModal.row ?? null : null}
        onCancel={() => setFormModal({ mode: 'closed' })}
        onSubmit={(values) => {
          if (formModal.mode === 'edit' && formModal.row) {
            api.updateController(formModal.row.id, values)
          } else {
            api.createController(values)
          }
          setFormModal({ mode: 'closed' })
        }}
      />
    </div>
  )
}
