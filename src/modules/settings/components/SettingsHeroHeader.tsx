import { motion } from 'framer-motion'

export default function SettingsHeroHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-8"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand/90">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Settings</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-[15px]">
        Manage your profile, business presence, security, and how we notify you—without leaving the
        dashboard.
      </p>
      <div
        className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-brand/30 to-transparent"
        aria-hidden
      />
      <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </motion.header>
  )
}
