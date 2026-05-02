import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

export type SelectOptionItem = { value: string; label: string }

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  /** Simple string options — value and label are the same */
  options?: string[]
  /** Value + label pairs (takes precedence over `options`) */
  optionItems?: SelectOptionItem[]
  placeholderOption?: string
}

export default function FormSelect({
  label,
  options,
  optionItems,
  placeholderOption = 'Select an option',
  className = '',
  ...rest
}: Props) {
  const rows: SelectOptionItem[] =
    optionItems ??
    (options ?? []).map((opt) => ({
      value: opt,
      label: opt,
    }))

  return (
    <label className="block">
      <span className="block text-sm font-medium text-white">{label}</span>
      <div className="relative mt-2">
        <select
          {...rest}
          className={`h-11 w-full cursor-pointer appearance-none rounded-md border border-transparent bg-white px-3 pr-10 text-gray-900 outline-none transition-all duration-200 ease-out placeholder:text-gray-400 hover:border-brand/25 hover:shadow-sm focus:border-brand focus:shadow-[0_0_0_3px_rgba(217,164,65,0.22)] focus:ring-2 focus:ring-brand-ring ${className}`}
        >
          <option value="" disabled>
            {placeholderOption}
          </option>
          {rows.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute inset-y-0 right-3 my-auto text-gray-500"
        />
      </div>
    </label>
  )
}
