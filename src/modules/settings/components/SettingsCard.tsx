import type { ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

/** Glass section shell — consistent across Settings tabs */
export default function SettingsCard({ title, description, children, footer }: Props) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-surface-card/[0.52] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.65)] backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.4] bg-[radial-gradient(ellipse_90%_40%_at_50%_-20%,rgba(160,82,45,0.14),transparent)]"
        aria-hidden
      />
      <div className="relative z-[1] border-b border-white/[0.06] px-5 py-5 sm:px-8 sm:py-6">
        <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500">{description}</p>
        ) : null}
      </div>
      <div className="relative z-[1] space-y-5 px-5 py-6 sm:space-y-6 sm:px-8 sm:py-8">{children}</div>
      {footer ? (
        <div className="relative z-[1] flex flex-col gap-3 border-t border-white/[0.06] bg-surface-elevated/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-8">
          {footer}
        </div>
      ) : null}
    </section>
  )
}
