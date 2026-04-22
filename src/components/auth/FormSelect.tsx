import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: string[]
}

export default function FormSelect({
  label,
  options,
  className = '',
  ...rest
}: Props) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-white">{label}</span>
      <div className="relative mt-2">
        <select
          {...rest}
          className={`h-11 w-full appearance-none rounded-md bg-white px-3 pr-10 text-gray-900 outline-none focus:ring-2 focus:ring-brand-ring ${className}`}
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
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
