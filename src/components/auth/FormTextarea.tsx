import type { TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
}

export default function FormTextarea({ label, className = '', ...rest }: Props) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-white">{label}</span>
      <textarea
        {...rest}
        rows={rest.rows ?? 3}
        className={`mt-2 w-full rounded-md bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand-ring ${className}`}
      />
    </label>
  )
}
