import type { ControllerStatus } from '../types'

export default function ControllerStatusBadge({ status }: { status: ControllerStatus }) {
  const styles: Record<ControllerStatus, string> = {
    active:
      'border-accent-success/35 bg-accent-success/12 text-accent-success shadow-[0_0_12px_-4px_rgba(34,197,94,0.45)]',
    inactive: 'border-white/[0.08] bg-surface-elevated/90 text-gray-400',
    pending:
      'border-accent-amber/35 bg-accent-amber/10 text-accent-amber shadow-[0_0_12px_-4px_rgba(251,191,36,0.35)]',
    suspended:
      'border-accent-danger/35 bg-accent-danger/10 text-accent-danger shadow-[0_0_12px_-4px_rgba(248,113,113,0.35)]',
  }
  const labels: Record<ControllerStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    suspended: 'Suspended',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
