import type { ReactNode } from 'react'

type Props = {
  illustration?: ReactNode
  children: ReactNode
}

export default function AuthLayout({ illustration, children }: Props) {
  if (!illustration) {
    return (
      <div className="min-h-screen bg-surface-page text-gray-100 flex items-center justify-center px-4 py-10">
        <div className="w-full flex justify-center">{children}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-page text-gray-100">
      <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 items-center gap-8 px-6 py-10 lg:grid-cols-2 lg:px-16">
        <div className="order-2 hidden items-center justify-center lg:order-1 lg:flex">
          {illustration}
        </div>
        <div className="order-1 flex items-center justify-center lg:order-2">
          {children}
        </div>
      </div>
    </div>
  )
}
