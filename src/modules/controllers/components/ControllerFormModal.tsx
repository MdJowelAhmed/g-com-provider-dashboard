import { Form, Input, Modal, Select } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import {
  clampPermissionKeysForRole,
  getNavPermissionGroupsForRole,
} from '../../permissions/navPermissionMap'
import type { Role } from '../../../types/role'
import { CONTROLLER_MODAL_BASE_STATUS_OPTIONS } from '../constants'
import { isNavPermissionMappable } from '../permissionMapping'
import type { ControllerFormValues, ControllerStatus, StaffController } from '../types'
import PermissionsSection from './permission/PermissionsSection'

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  dashboardRole: Role
  initial?: StaffController | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: ControllerFormValues) => void
}

type FormShape = {
  displayName: string
  email: string
  roleLabel: string
  status: ControllerFormValues['status']
}

function blankForm(): FormShape {
  return {
    displayName: '',
    email: '',
    roleLabel: '',
    status: 'active',
  }
}

function rowToForm(row: StaffController): FormShape {
  return {
    displayName: row.displayName,
    email: row.email,
    roleLabel: row.roleLabel,
    status: row.status,
  }
}

export default function ControllerFormModal({
  open,
  mode,
  dashboardRole,
  initial,
  loading,
  onCancel,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<FormShape>()
  const [permSet, setPermSet] = useState<Set<string>>(() => new Set())

  const permissionGroups = useMemo(
    () =>
      getNavPermissionGroupsForRole(dashboardRole)
        .map((group) => ({
          ...group,
          permissions: group.permissions.filter((permission) =>
            isNavPermissionMappable(permission.id),
          ),
        }))
        .filter((group) => group.permissions.length > 0),
    [dashboardRole],
  )

  const allIds = useMemo(
    () => permissionGroups.flatMap((g) => g.permissions.map((p) => p.id)),
    [permissionGroups],
  )

  const statusOptions = useMemo((): { value: ControllerStatus; label: string }[] => {
    const base = CONTROLLER_MODAL_BASE_STATUS_OPTIONS.map((o) => ({ ...o }))
    const extra: { value: ControllerStatus; label: string }[] = []
    if (mode === 'edit' && initial?.status === 'pending') {
      extra.push({ value: 'pending', label: 'Pending' })
    }
    if (mode === 'edit' && initial?.status === 'suspended') {
      extra.push({ value: 'suspended', label: 'Suspended' })
    }
    return [...base, ...extra]
  }, [mode, initial])

  /* Modal open / mode sync — reset controlled form + permission selection */
  /* eslint-disable react-hooks/set-state-in-effect -- intentional when dialog opens */
  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initial) {
      form.setFieldsValue(rowToForm(initial))
      setPermSet(new Set(clampPermissionKeysForRole(initial.permissionKeys, dashboardRole)))
    } else {
      form.setFieldsValue(blankForm())
      setPermSet(new Set())
    }
  }, [open, mode, initial, form, dashboardRole])
  /* eslint-enable react-hooks/set-state-in-effect */

  const togglePerm = (id: string) => {
    setPermSet((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setPermSet(new Set(allIds))
  const clearAll = () => setPermSet(new Set())

  const toggleGroup = (ids: string[], checked: boolean) => {
    setPermSet((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => {
        if (checked) next.add(id)
        else next.delete(id)
      })
      return next
    })
  }

  const groupState = (ids: string[]) => {
    const onCount = ids.filter((id) => permSet.has(id)).length
    return {
      all: onCount === ids.length,
      some: onCount > 0 && onCount < ids.length,
      none: onCount === 0,
    }
  }

  const handleSubmit = async () => {
    const v = await form.validateFields()
    const payload: ControllerFormValues = {
      displayName: v.displayName,
      email: v.email,
      roleLabel: v.roleLabel,
      status: v.status,
      permissionKeys: Array.from(permSet),
    }
    onSubmit(payload)
  }

  const allSelected = allIds.length > 0 && allIds.every((id) => permSet.has(id))
  const title = mode === 'edit' ? 'Edit controller' : 'Create controller'
  const primaryLabel = mode === 'edit' ? 'Save changes' : 'Create controller'

  return (
    <Modal
      open={open}
      title={null}
      footer={null}
      onCancel={onCancel}
      closable={false}
      width={820}
      destroyOnHidden
      centered
      styles={{
        mask: { backdropFilter: 'blur(12px)', backgroundColor: 'rgba(6, 8, 12, 0.72)' },
      }}
      classNames={{
        container:
          '!overflow-hidden !rounded-2xl !border !border-white/[0.08] !bg-[linear-gradient(180deg,rgba(18,22,28,0.98)_0%,rgba(12,14,18,0.99)_100%)] !p-0 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85),0_0_0_1px_rgba(160,82,45,0.12)]',
        body: '!p-0',
      }}
    >
      <div className="flex max-h-[min(92vh,900px)] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.06] px-6 pb-5 pt-6">
          <div className="min-w-0 space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
            <p className="text-sm leading-relaxed text-gray-500">
              Define identity, status, and granular access for this staff controller.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-gray-400 transition hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden px-6 py-5">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 space-y-5"
          >
            <Form layout="vertical" form={form} requiredMark={false} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Form.Item
                  name="displayName"
                  label={<span className="text-[13px] font-medium text-gray-400">Display name</span>}
                  rules={[{ required: true, message: 'Display name is required' }]}
                  hasFeedback
                >
                  <Input
                    placeholder="e.g. Jordan Lee"
                    className="!h-11 !rounded-xl !border-white/[0.08] !bg-surface-elevated/90 !px-3.5 !text-gray-100 placeholder:!text-gray-600"
                  />
                </Form.Item>
                <Form.Item
                  name="email"
                  label={<span className="text-[13px] font-medium text-gray-400">Work email</span>}
                  rules={[
                    { required: true, message: 'Work email is required' },
                    { type: 'email', message: 'Enter a valid email address' },
                  ]}
                  hasFeedback
                >
                  <Input
                    placeholder="name@company.com"
                    className="!h-11 !rounded-xl !border-white/[0.08] !bg-surface-elevated/90 !px-3.5 !text-gray-100 placeholder:!text-gray-600"
                  />
                </Form.Item>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Form.Item
                  name="roleLabel"
                  label={<span className="text-[13px] font-medium text-gray-400">Role name</span>}
                  rules={[{ required: true, message: 'Role name is required' }]}
                  hasFeedback
                >
                  <Input
                    placeholder="e.g. manager"
                    className="!h-11 !rounded-xl !border-white/[0.08] !bg-surface-elevated/90 !px-3.5 !text-gray-100 placeholder:!text-gray-600"
                  />
                </Form.Item>
                {mode === 'edit' ? (
                  <Form.Item
                    name="status"
                    label={<span className="text-[13px] font-medium text-gray-400">Status</span>}
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Select status"
                      options={statusOptions.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      className="controller-status-select !h-11 [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-white/[0.08] [&_.ant-select-selector]:!bg-surface-elevated/90 [&_.ant-select-selector]:!px-3 [&_.ant-select-selection-item]:!text-gray-100"
                    />
                  </Form.Item>
                ) : null}
              </div>
            </Form>
          </motion.div>

          <div className="flex min-h-0 min-h-[280px] flex-1 flex-col overflow-hidden">
            <PermissionsSection
              groups={permissionGroups}
              permSet={permSet}
              allIds={allIds}
              onTogglePerm={togglePerm}
              onSelectAll={selectAll}
              onClearAll={clearAll}
              onToggleGroup={toggleGroup}
              groupState={groupState}
            />
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] bg-black/30 px-6 py-4 backdrop-blur-sm">
          <p className="text-[12px] text-gray-500">
            <span className="font-mono font-semibold tabular-nums text-brand">{permSet.size}</span>
            <span className="text-gray-600"> / </span>
            <span className="font-mono tabular-nums text-gray-500">{allIds.length}</span>
            <span className="ml-2 text-gray-600">
              permissions
              {allSelected ? ' · Full access' : ''}
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.05] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="rounded-xl border border-brand/40 bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_28px_-8px_rgba(160,82,45,0.85)] transition hover:bg-brand-hover hover:shadow-[0_0_36px_-8px_rgba(160,82,45,0.95)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {primaryLabel}
            </button>
          </div>
        </footer>
      </div>
    </Modal>
  )
}
