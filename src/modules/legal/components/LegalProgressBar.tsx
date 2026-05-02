import { motion } from 'framer-motion'

export default function LegalProgressBar({ progress }: { progress: number }) {
  const pct = Math.round(progress * 100)
  return (
    <div
      className="mb-8 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/[0.06]"
      aria-hidden
      title={`Reading progress ${pct}%`}
    >
      <motion.div
        className="h-1 rounded-full bg-gradient-to-r from-brand/90 via-brand to-accent-amber/90 shadow-[0_0_12px_-2px_rgba(160,82,45,0.8)]"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 38 }}
      />
    </div>
  )
}
