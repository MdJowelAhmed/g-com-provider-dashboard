type Props = {
  current: number
  steps: string[]
}

export default function StepIndicator({ current, steps }: Props) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {steps.map((label, idx) => {
        const stepNum = idx + 1
        const isActive = stepNum === current
        const isDone = stepNum < current
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                isDone
                  ? 'bg-brand text-white'
                  : isActive
                    ? 'bg-brand text-white ring-2 ring-brand-ring/40'
                    : 'bg-surface-elevated text-gray-400'
              }`}
            >
              {stepNum}
            </div>
            <div
              className={`hidden text-xs sm:block ${
                isActive ? 'text-white font-medium' : 'text-gray-500'
              }`}
            >
              {label}
            </div>
            {idx < steps.length - 1 && (
              <div className="h-px flex-1 bg-surface-border" />
            )}
          </div>
        )
      })}
    </div>
  )
}
