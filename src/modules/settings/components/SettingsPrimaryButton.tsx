import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'danger'
}

export default function SettingsPrimaryButton({
  children,
  onClick,
  type = 'button',
  loading,
  disabled,
  variant = 'primary',
}: Props) {
  const base =
    variant === 'danger'
      ? 'border border-accent-danger/40 bg-accent-danger/15 text-accent-danger hover:bg-accent-danger/25 hover:shadow-[0_8px_24px_-6px_rgba(239,68,68,0.35)]'
      : 'border border-brand/40 bg-brand text-white shadow-[0_8px_24px_-6px_rgba(160,82,45,0.45)] hover:bg-brand-hover hover:shadow-[0_12px_28px_-5px_rgba(160,82,45,0.55)]'

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className={`group relative inline-flex h-10 min-w-[132px] items-center justify-center gap-2 overflow-hidden rounded-xl px-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-45 ${base}`}
    >
      {variant === 'primary' ? (
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
      ) : null}
      {loading ? <Loader2 size={17} className="animate-spin" /> : null}
      {children}
    </motion.button>
  )
}
