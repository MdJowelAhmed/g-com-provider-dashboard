import { Loader2, Search, X } from 'lucide-react'
import type { KeyboardEvent } from 'react'

export type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Show spinner (e.g. while an API search is in flight). */
  loading?: boolean
  disabled?: boolean
  /** Called when Enter is pressed (after flush), only if minChars is satisfied. */
  onSubmit?: (value: string) => void
  /** Called when clear (✕) / Escape is pressed. Defaults to `onChange('')`. */
  onClear?: () => void
  /**
   * Flush debounce before submit.
   * May return `false` when minChars validation fails.
   */
  onFlush?: () => boolean | void
  /** Minimum characters; shows a hint when below. Blocks Enter submit when below. */
  minChars?: number
  /** Show “type N+ characters” hint when below min. Default: `true` when minChars > 0. */
  showMinHint?: boolean
  className?: string
  inputClassName?: string
  /** Fixed width class. Default: `w-[300px]`. */
  widthClass?: string
  'aria-label'?: string
  id?: string
  name?: string
  autoFocus?: boolean
}

/**
 * Reusable dashboard search input.
 *
 * Pair with `useSearchField` and pass `searchTerm` to backend list APIs.
 */
export default function SearchField({
  value,
  onChange,
  placeholder = 'Search…',
  loading = false,
  disabled = false,
  onSubmit,
  onClear,
  onFlush,
  minChars = 0,
  showMinHint,
  className = '',
  inputClassName = '',
  widthClass = 'w-[300px]',
  'aria-label': ariaLabel = 'Search',
  id,
  name,
  autoFocus,
}: SearchFieldProps) {
  const trimmed = value.trim()
  const isBelowMin = trimmed.length > 0 && trimmed.length < minChars
  const shouldShowHint = showMinHint ?? minChars > 0
  const canClear = value.length > 0 && !disabled

  const handleClear = () => {
    if (onClear) onClear()
    else onChange('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      if (!canClear) return
      handleClear()
      return
    }

    if (e.key !== 'Enter') return
    e.preventDefault()

    // Block submit while below minimum characters
    if (trimmed.length > 0 && trimmed.length < minChars) return

    const ok = onFlush?.()
    if (ok === false) return
    onSubmit?.(trimmed)
  }

  return (
    <div className={`relative min-w-[220px] flex-1 ${className}`}>
      <Search
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        aria-hidden
      />
      <input
        id={id}
        name={name}
        type="search"
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={isBelowMin || undefined}
        aria-describedby={isBelowMin && shouldShowHint ? `${id ?? 'search'}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={[
          'h-10 rounded-md border border-surface-border bg-surface-card pl-9 text-sm text-gray-100',
          'placeholder:text-gray-500 focus:border-brand focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-60',
          '[appearance:textfield] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden',
          canClear || loading ? 'pr-9' : 'pr-3',
          widthClass,
          inputClassName,
        ].join(' ')}
      />

      {loading ? (
        <Loader2
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
          aria-hidden
        />
      ) : canClear ? (
        <button
          type="button"
          title="Clear search"
          aria-label="Clear search"
          onClick={handleClear}
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:bg-surface-elevated hover:text-gray-100"
        >
          <X size={14} />
        </button>
      ) : null}

      {isBelowMin && shouldShowHint ? (
        <p
          id={`${id ?? 'search'}-hint`}
          className="mt-1 text-xs text-accent-amber"
          role="status"
        >
          Type at least {minChars} characters to search
        </p>
      ) : null}
    </div>
  )
}
