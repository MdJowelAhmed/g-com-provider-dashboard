import type { InputHTMLAttributes, ReactNode } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: ReactNode
  trailing?: ReactNode
}

export default function FormField({
  label,
  hint,
  trailing,
  className = '',
  ...inputProps
}: Props) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-white">{label}</span>
      <div className="relative mt-2">
        <input
          {...inputProps}
          className={`h-11 w-full rounded-md bg-white px-3 pr-10 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand-ring ${className}`}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            {trailing}
          </div>
        )}
      </div>
      {hint && <div className="mt-1.5 text-xs text-gray-400">{hint}</div>}
    </label>
  )
}
