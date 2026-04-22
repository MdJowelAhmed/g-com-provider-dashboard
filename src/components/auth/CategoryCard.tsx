import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import { Check } from 'lucide-react'

type Props = {
  label: string
  tagline: string
  icon: ComponentType<LucideProps>
  selected?: boolean
  onClick?: () => void
}

export default function CategoryCard({
  label,
  tagline,
  icon: Icon,
  selected = false,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors ${
        selected
          ? 'border-brand bg-brand-soft/40'
          : 'border-surface-border bg-surface-card hover:border-brand/60 hover:bg-surface-elevated'
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
          selected ? 'bg-brand text-white' : 'bg-surface-elevated text-accent-amber'
        }`}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-white">{label}</div>
        <div className="mt-0.5 text-xs text-gray-400">{tagline}</div>
      </div>
      {selected && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand">
          <Check size={14} className="text-white" />
        </div>
      )}
    </button>
  )
}
