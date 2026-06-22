import { AnimatePresence } from 'framer-motion'
import { Modal, message } from 'antd'
import { useCallback, useLayoutEffect, useState } from 'react'
import type { Role } from '../../../types/role'
import { getControllerApiErrorMessage, useControllers } from '../hooks/useControllers'
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
        onOk: async () => {
          try {
            await api.deleteController(row.id)
            void message.success('Controller removed successfully.')
          } catch (error) {
            void message.error(getControllerApiErrorMessage(error, 'Failed to remove controller.'))
          }
        },
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
      onOk: async () => {
        try {
          await api.bulkDelete(api.selectedIds)
          void message.success('Selected controllers removed.')
        } catch (error) {
          void message.error(getControllerApiErrorMessage(error, 'Failed to remove controllers.'))
        }
      },
    })
  }, [api])

  const setRowStatus = useCallback(
    async (row: StaffController, status: StaffController['status']) => {
      try {
        await api.setControllerStatus(row.id, status)
        void message.success('Controller status updated.')
      } catch (error) {
        void message.error(getControllerApiErrorMessage(error, 'Failed to update status.'))
      }
    },
    [api],
  )

  const handleFormSubmit = async (values: Parameters<typeof api.createController>[0]) => {
    try {
      if (formModal.mode === 'edit' && formModal.row) {
        await api.updateController(formModal.row.id, values)
        void message.success('Controller updated successfully.')
      } else {
        await api.createController(values)
        void message.success('Controller created successfully.')
      }
      setFormModal({ mode: 'closed' })
    } catch (error) {
      void message.error(getControllerApiErrorMessage(error, 'Something went wrong. Please try again.'))
    }
  }

  return (
    <div>
      {api.isError ? (
        <div className="mb-4 rounded-xl border border-accent-danger/30 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger">
          Failed to load controllers. Please refresh and try again.
        </div>
      ) : null}

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
            onActivate={async () => {
              try {
                await api.bulkSetStatus(api.selectedIds, 'active')
                void message.success('Controllers activated.')
              } catch (error) {
                void message.error(getControllerApiErrorMessage(error, 'Failed to activate controllers.'))
              }
            }}
            onDeactivate={async () => {
              try {
                await api.bulkSetStatus(api.selectedIds, 'inactive')
                void message.success('Controllers deactivated.')
              } catch (error) {
                void message.error(getControllerApiErrorMessage(error, 'Failed to deactivate controllers.'))
              }
            }}
            onSuspend={async () => {
              try {
                await api.bulkSetStatus(api.selectedIds, 'suspended')
                void message.success('Controllers suspended.')
              } catch (error) {
                void message.error(getControllerApiErrorMessage(error, 'Failed to suspend controllers.'))
              }
            }}
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
        onSetStatus={(row, status) => void setRowStatus(row, status)}
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
        loading={api.isSaving}
        initial={formModal.mode === 'edit' ? formModal.row ?? null : null}
        onCancel={() => setFormModal({ mode: 'closed' })}
        onSubmit={(values) => void handleFormSubmit(values)}
      />
    </div>
  )
}
