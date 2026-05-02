import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react'
import { useCallback, useState } from 'react'
import {
  supportErrorRing,
  supportInputClass,
  supportLabelClass,
  supportTextareaClass,
} from './supportFieldClasses'

const CATEGORIES = [
  { id: 'billing', label: 'Billing' },
  { id: 'orders', label: 'Orders' },
  { id: 'account', label: 'Account' },
  { id: 'technical', label: 'Technical' },
  { id: 'other', label: 'Other' },
] as const

type CategoryId = (typeof CATEGORIES)[number]['id']

type Props = {
  defaultEmail: string
  businessLabel: string
}

type FieldErr = Partial<Record<'email' | 'subject' | 'message' | 'category', string>>

export default function SupportContactForm({ defaultEmail, businessLabel }: Props) {
  const [category, setCategory] = useState<CategoryId | ''>('')
  const [email, setEmail] = useState(() => defaultEmail)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<FieldErr>({})
  const [submitting, setSubmitting] = useState(false)
  const [banner, setBanner] = useState<'idle' | 'success' | 'fields' | 'network'>('idle')

  const validate = useCallback((): boolean => {
    const next: FieldErr = {}
    if (!email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email'
    if (!category) next.category = 'Pick a topic'
    if (!subject.trim()) next.subject = 'Add a subject'
    else if (subject.trim().length < 3) next.subject = 'Too short'
    if (!message.trim()) next.message = 'Add a message'
    else if (message.trim().length < 10) next.message = 'Add a little more detail'
    setErrors(next)
    return Object.keys(next).length === 0
  }, [category, email, message, subject])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, subject: true, message: true, category: true })
    if (!validate()) {
      setBanner('fields')
      return
    }
    setBanner('idle')
    setSubmitting(true)
    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 1100))
      setBanner('success')
      setSubject('')
      setMessage('')
      setCategory('')
      setErrors({})
      setTouched({})
    } catch {
      setBanner('network')
    } finally {
      setSubmitting(false)
    }
  }

  const inputErr = (key: keyof FieldErr) =>
    touched[key] && errors[key] ? `${supportErrorRing} border-accent-danger/70` : ''

  return (
    <motion.form
      layout
      onSubmit={handleSubmit}
      className="relative space-y-5"
      noValidate
    >
      <input type="hidden" name="business" value={businessLabel} readOnly />

      <AnimatePresence mode="wait">
        {banner === 'success' ? (
          <motion.div
            key="ok"
            role="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl border border-accent-success/35 bg-accent-success/10 px-4 py-3 text-sm text-accent-success backdrop-blur-sm"
          >
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            <div>
              <div className="font-semibold text-accent-success">Sent</div>
              <p className="mt-0.5 text-xs text-accent-success/90">
                We&apos;ll reply at <span className="font-mono">{email}</span>.
              </p>
            </div>
          </motion.div>
        ) : banner === 'fields' ? (
          <motion.div
            key="err-fields"
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl border border-accent-danger/35 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger backdrop-blur-sm"
          >
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <div>
              <div className="font-semibold">Incomplete</div>
              <p className="mt-0.5 text-xs text-accent-danger/90">See highlighted fields.</p>
            </div>
          </motion.div>
        ) : banner === 'network' ? (
          <motion.div
            key="err-net"
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl border border-accent-danger/35 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger"
          >
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <div>
              <div className="font-semibold">Couldn&apos;t send</div>
              <p className="mt-0.5 text-xs">Try again shortly.</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div>
        <span id="support-cat-label" className={`${supportLabelClass} text-gray-300`}>
          Topic
        </span>
        <div
          className="mt-1.5 flex flex-wrap gap-2"
          role="group"
          aria-labelledby="support-cat-label"
        >
          {CATEGORIES.map((c) => {
            const active = category === c.id
            return (
              <motion.button
                key={c.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCategory(c.id)
                  setTouched((t) => ({ ...t, category: true }))
                }}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'border-brand/60 bg-brand/20 text-white shadow-md shadow-brand/15 ring-1 ring-brand/30'
                    : 'border-surface-border bg-surface-elevated/40 text-gray-400 hover:border-brand/35 hover:text-gray-200'
                }`}
              >
                {c.label}
              </motion.button>
            )
          })}
        </div>
        <input type="hidden" name="category" value={category} readOnly />
        {touched.category && errors.category ? (
          <p className="mt-1.5 text-xs text-accent-danger">{errors.category}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="support-email" className={`${supportLabelClass} text-gray-300`}>
            Email
          </label>
          <input
            id="support-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            className={`${supportInputClass} ${inputErr('email')}`}
            placeholder="you@company.com"
          />
          {touched.email && errors.email ? (
            <p className="text-xs text-accent-danger">{errors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="support-subject" className={`${supportLabelClass} text-gray-300`}>
            Subject
          </label>
          <input
            id="support-subject"
            name="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, subject: true }))}
            className={`${supportInputClass} ${inputErr('subject')}`}
            placeholder="Summary"
          />
          {touched.subject && errors.subject ? (
            <p className="text-xs text-accent-danger">{errors.subject}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="support-message" className={`${supportLabelClass} text-gray-300`}>
            Message
          </label>
          <textarea
            id="support-message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, message: true }))}
            className={`${supportTextareaClass} ${inputErr('message')}`}
            placeholder="What happened?"
          />
          {touched.message && errors.message ? (
            <p className="text-xs text-accent-danger">{errors.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-end">
        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ scale: submitting ? 1 : 1.01 }}
          whileTap={{ scale: submitting ? 1 : 0.99 }}
          className="group relative inline-flex h-11 min-w-[160px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-[0_8px_24px_-4px_rgba(160,82,45,0.55)] ring-1 ring-brand/40 transition hover:bg-brand-hover hover:shadow-[0_12px_28px_-4px_rgba(160,82,45,0.65)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-55"
        >
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
          <span className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 skew-x-12 bg-white/10 opacity-0 blur-md transition group-hover:opacity-40" />
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send size={17} />
              Send
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  )
}
