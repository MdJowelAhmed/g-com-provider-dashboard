import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export default function PrimaryButton({
  children,
  className = '',
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`h-11 w-full rounded-md bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand-ring disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  )
}
