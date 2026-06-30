/** Shared validation-ready field styles (Contact Support + future help forms) */
export const supportInputClass =
  'w-full rounded-xl border border-surface-border/90 bg-surface-elevated/45 px-4 py-4 text-sm text-gray-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] placeholder:text-gray-600 transition duration-200 ' +
  'hover:border-surface-border hover:bg-surface-elevated/65 ' +
  'focus:border-brand focus:bg-surface-elevated/80 focus:outline-none focus:ring-2 focus:ring-brand/35 focus:ring-offset-0 focus:ring-offset-transparent ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

export const supportTextareaClass =
  supportInputClass + ' min-h-[156px] resize-y leading-relaxed'

export const supportLabelClass = 'text-xs font-medium text-gray-400'

export const supportErrorRing = 'border-accent-danger/80 focus:border-accent-danger focus:ring-accent-danger/30'
