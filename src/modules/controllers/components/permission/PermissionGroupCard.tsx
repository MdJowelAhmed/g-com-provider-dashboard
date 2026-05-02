import type { PermissionGroup } from '../../../permissions/registry'
import PermissionRow from './PermissionRow'

type GroupState = { all: boolean; some: boolean; none: boolean }

type Props = {
  group: PermissionGroup
  permSet: Set<string>
  groupState: GroupState
  onTogglePerm: (id: string) => void
  onToggleGroup: (ids: string[], checked: boolean) => void
}

export default function PermissionGroupCard({
  group,
  permSet,
  groupState,
  onTogglePerm,
  onToggleGroup,
}: Props) {
  const ids = group.permissions.map((p) => p.id)

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-white">{group.label}</h3>
            {groupState.some ? (
              <span className="rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                Partial
              </span>
            ) : null}
          </div>
          {group.description ? (
            <p className="max-w-xl text-[13px] leading-relaxed text-gray-500">{group.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onToggleGroup(ids, true)}
            className="rounded-lg border border-brand/35 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/18"
          >
            Select group
          </button>
          <button
            type="button"
            onClick={() => onToggleGroup(ids, false)}
            className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-gray-200"
          >
            Clear group
          </button>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {group.permissions.map((p) => (
          <PermissionRow
            key={p.id}
            permission={p}
            checked={permSet.has(p.id)}
            onToggle={() => onTogglePerm(p.id)}
          />
        ))}
      </div>
    </section>
  )
}
