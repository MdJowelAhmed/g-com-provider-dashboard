import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { SortDir, SortKey, StaffController } from '../types'
import ControllerRowActions from './ControllerRowActions'
import ControllerStatusBadge from './ControllerStatusBadge'
import ControllersTableSkeleton from './ControllersTableSkeleton'

type Props = {
  rows: StaffController[]
  loading?: boolean
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
  selectedIds: string[]
  onToggleRow: (id: string) => void
  onSelectAllPage: () => void
  allOnPageSelected: boolean
  someOnPageSelected: boolean
  onEdit: (row: StaffController) => void
  onDelete: (row: StaffController) => void
  onSetStatus: (row: StaffController, status: StaffController['status']) => void
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SortTh({
  label,
  active,
  dir,
  onClick,
  className = '',
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
  className?: string
}) {
  return (
    <th className={`px-4 py-3 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-400 transition hover:text-gray-200"
      >
        {label}
        {active ? (
          dir === 'asc' ? (
            <ArrowUp size={13} className="text-brand" />
          ) : (
            <ArrowDown size={13} className="text-brand" />
          )
        ) : (
          <ArrowUpDown size={13} className="opacity-40" />
        )}
      </button>
    </th>
  )
}

export default function ControllerTable({
  rows,
  loading,
  sortKey,
  sortDir,
  onSort,
  selectedIds,
  onToggleRow,
  onSelectAllPage,
  allOnPageSelected,
  someOnPageSelected,
  onEdit,
  onDelete,
  onSetStatus,
}: Props) {
  const colCount = 8

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card/95 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] backdrop-blur-sm">
      <div className="max-h-[min(640px,calc(100vh-16rem))] overflow-auto messaging-scrollbar">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="sticky top-0 z-20 border-b border-surface-border bg-surface-elevated/95 text-left text-xs uppercase tracking-wide text-gray-400 shadow-sm backdrop-blur-md">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-surface-border bg-surface-card text-brand shadow-sm transition focus:ring-2 focus:ring-brand/35"
                  checked={allOnPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected
                  }}
                  onChange={onSelectAllPage}
                  aria-label="Select all on page"
                />
              </th>
              <SortTh
                label="Controller"
                active={sortKey === 'displayName'}
                dir={sortDir}
                onClick={() => onSort('displayName')}
              />
              <SortTh
                label="Email"
                active={sortKey === 'email'}
                dir={sortDir}
                onClick={() => onSort('email')}
              />
              <SortTh
                label="Role"
                active={sortKey === 'roleLabel'}
                dir={sortDir}
                onClick={() => onSort('roleLabel')}
              />
              <SortTh
                label="Status"
                active={sortKey === 'status'}
                dir={sortDir}
                onClick={() => onSort('status')}
              />
              <th className="px-4 py-3 font-medium">Permissions</th>
              <SortTh
                label="Updated"
                active={sortKey === 'updatedAt'}
                dir={sortDir}
                onClick={() => onSort('updatedAt')}
              />
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <ControllersTableSkeleton cols={colCount} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-14 text-center">
                  <div className="mx-auto max-w-sm">
                    <div className="text-sm font-medium text-gray-300">No controllers match your filters</div>
                    <p className="mt-1 text-xs text-gray-500">
                      Create a controller to delegate dashboard access with granular permissions.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const selected = selectedIds.includes(row.id)
                return (
                  <motion.tr
                    layout
                    key={row.id}
                    className={`group border-b border-surface-border transition-colors last:border-b-0 ${
                      selected
                        ? 'bg-brand/10 shadow-[inset_3px_0_0_0_rgba(160,82,45,0.85)]'
                        : 'hover:bg-surface-elevated/85 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'
                    }`}
                  >
                    <td className="px-4 py-3 align-middle">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-surface-border bg-surface-card text-brand shadow-sm transition focus:ring-2 focus:ring-brand/35"
                        checked={selected}
                        onChange={() => onToggleRow(row.id)}
                        aria-label={`Select ${row.displayName}`}
                      />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="font-medium text-gray-100">{row.displayName}</div>
                      <div className="text-xs text-gray-500">ID · {row.id.slice(-10)}</div>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 align-middle text-gray-300">
                      {row.email}
                    </td>
                    <td className="px-4 py-3 align-middle text-gray-300">{row.roleLabel}</td>
                    <td className="px-4 py-3 align-middle">
                      <ControllerStatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className="inline-flex rounded-full border border-white/[0.08] bg-surface-elevated/80 px-2 py-0.5 text-[11px] font-medium text-gray-300">
                        {row.permissionKeys.length} granted
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-gray-400">{fmtShort(row.updatedAt)}</td>
                    <td className="px-4 py-3 align-middle text-right">
                      <ControllerRowActions
                        row={row}
                        onEdit={() => onEdit(row)}
                        onDelete={() => onDelete(row)}
                        onSetStatus={(s) => onSetStatus(row, s)}
                      />
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
