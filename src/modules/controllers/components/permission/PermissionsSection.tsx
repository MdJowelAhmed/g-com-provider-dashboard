import type { PermissionGroup } from '../../../permissions/registry'
import PermissionGroupCard from './PermissionGroupCard'

type GroupState = { all: boolean; some: boolean; none: boolean }

type Props = {
  groups: PermissionGroup[]
  permSet: Set<string>
  allIds: string[]
  onTogglePerm: (id: string) => void
  onSelectAll: () => void
  onClearAll: () => void
  onToggleGroup: (ids: string[], checked: boolean) => void
  groupState: (ids: string[]) => GroupState
}

export default function PermissionsSection({
  groups,
  permSet,
  allIds,
  onTogglePerm,
  onSelectAll,
  onClearAll,
  onToggleGroup,
  groupState,
}: Props) {
  const total = allIds.length
  const selected = permSet.size

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col rounded-2xl border border-white/[0.08] bg-surface-page/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
      <div className="shrink-0 space-y-4 border-b border-white/[0.06] p-5 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1.5">
            <h2 className="text-base font-semibold tracking-tight text-white">Permissions</h2>
            <p className="max-w-2xl text-[13px] leading-relaxed text-gray-500">
              Same routes as this dashboard sidebar. Grant only what each staff member needs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={onSelectAll}
              className="rounded-lg border border-brand/40 bg-brand/12 px-3.5 py-2 text-xs font-semibold text-brand shadow-[0_0_24px_-12px_rgba(160,82,45,0.9)] transition hover:bg-brand/20"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-lg border border-white/[0.1] px-3.5 py-2 text-xs font-medium text-gray-300 transition hover:bg-white/[0.05] hover:text-white"
            >
              Deselect all
            </button>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-600">Selected</span>
              <span className="font-mono text-xs font-semibold tabular-nums text-brand">
                {selected}
                <span className="text-gray-600"> / </span>
                {total}
              </span>
            </div>
          </div>
        </div>

        {selected === 0 ? (
          <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.08] px-4 py-3 text-[13px] text-accent-amber">
            No permissions selected. Assign at least one route before saving production staff accounts.
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 messaging-scrollbar">
        <div className="space-y-5">
          {groups.map((group) => {
            const ids = group.permissions.map((p) => p.id)
            const gs = groupState(ids)
            return (
              <PermissionGroupCard
                key={group.id}
                group={group}
                permSet={permSet}
                groupState={gs}
                onTogglePerm={onTogglePerm}
                onToggleGroup={onToggleGroup}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
