import type { ReactNode } from 'react'
import GcomLogo from './GcomLogo'

type Props = {
  title?: string
  description?: ReactNode
  children: ReactNode
  bordered?: boolean
  maxWidthClass?: string
}

export default function AuthCard({
  title,
  description,
  children,
  bordered = false,
  maxWidthClass = 'max-w-[440px]',
}: Props) {
  return (
    <div
      className={`w-full ${maxWidthClass} rounded-2xl bg-surface-card p-8 shadow-2xl transition-all ${
        bordered ? 'border border-brand' : ''
      }`}
    >
      <div className="flex flex-col items-center">
        <GcomLogo />
        {title && (
          <h1 className="mt-6 text-2xl font-semibold text-white">{title}</h1>
        )}
        {description && (
          <p className="mt-2 text-center text-sm text-gray-400">
            {description}
          </p>
        )}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  )
}
