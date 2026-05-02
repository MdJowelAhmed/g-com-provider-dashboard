import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import SupportContactForm from '../../../components/dashboard/support/SupportContactForm'
import SupportFormSkeleton from '../../../components/dashboard/support/SupportFormSkeleton'

export default function ContactSupportPage() {
  const { user } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 380)
    return () => window.clearTimeout(t)
  }, [])

  if (!user) return null

  const business = user.businessName || user.ownerName
  const email = user.email

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-brand/20 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-40 h-56 w-56 rounded-full bg-accent-amber/10 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-96 -translate-x-1/2 rounded-full bg-brand/10 blur-[80px]"
        aria-hidden
      />

      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand/95">
              Support
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Contact
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Email replies, typically within 24 hours.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08, duration: 0.3 }}
            className="flex shrink-0 flex-col items-end"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-success/35 bg-accent-success/10 px-3.5 py-1.5 text-xs font-semibold text-accent-success shadow-sm backdrop-blur-sm">
              <Clock size={14} strokeWidth={2.25} />
              ~24h response
            </span>
          </motion.div>
        </div>

        <div
          className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-brand/35 to-transparent opacity-90"
          aria-hidden
        />
      </motion.header>

      <motion.div
        layout
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-2xl"
      >
        <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-white/[0.12] to-transparent opacity-50 blur-sm" />
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-card/[0.55] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(160,82,45,0.18),transparent)]" />
          <div className="relative">
            {!ready ? (
              <SupportFormSkeleton />
            ) : (
              <SupportContactForm
                key={email}
                defaultEmail={email}
                businessLabel={business}
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
