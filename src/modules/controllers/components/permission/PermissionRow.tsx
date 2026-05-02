import type { PermissionDef } from '../../../permissions/registry'

type Props = {
  permission: PermissionDef
  checked: boolean
  onToggle: () => void
}

export default function PermissionRow({ permission, checked, onToggle }: Props) {
  return (
    <label
      className={`group relative flex cursor-pointer gap-3 rounded-xl border px-3.5 py-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-brand/35 ${
        checked
          ? 'border-brand/45 bg-brand/[0.09] shadow-[0_0_0_1px_rgba(160,82,45,0.15),0_12px_36px_-20px_rgba(160,82,45,0.55)]'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-brand/25 hover:bg-white/[0.04]'
      }`}
    >
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="peer sr-only"
          aria-describedby={`perm-desc-${permission.id.replace(/\./g, '-')}`}
        />
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
            checked
              ? 'border-brand bg-brand text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
              : 'border-white/25 bg-surface-card/80 group-hover:border-brand/50 group-hover:bg-surface-elevated'
          }`}
        >
          {checked ? (
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M2.5 6l2.5 2.5L9.5 3.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold tracking-tight text-gray-100">{permission.label}</span>
        <span
          id={`perm-desc-${permission.id.replace(/\./g, '-')}`}
          className="mt-0.5 block text-[13px] leading-snug text-gray-500"
        >
          {permission.description}
        </span>
        <span className="mt-1.5 inline-flex items-center rounded-md border border-white/[0.06] bg-black/25 px-2 py-0.5 font-mono text-[10px] tracking-wide text-gray-500">
          {permission.id}
        </span>
      </span>
    </label>
  )
}
