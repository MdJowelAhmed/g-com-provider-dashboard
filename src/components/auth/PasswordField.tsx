import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import FormField from './FormField'

type Props = {
  label: string
  name?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  hint?: string
}

export default function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password',
  hint,
}: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <FormField
      label={label}
      name={name}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      hint={hint}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:text-gray-700"
        >
          {visible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      }
    />
  )
}
