import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { LegalSection } from '../types'

type Props = {
  section: LegalSection
  index: number
  open: boolean
  onToggle: () => void
}

export default function LegalSectionBlock({
  section,
  index,
  open,
  onToggle,
}: Props) {
  return (
    <section
      id={`legal-section-${section.id}`}
      className="scroll-mt-28 border-b border-white/[0.06] pb-10 pt-2 last:border-b-0"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-mono text-xs text-brand/80">{String(index + 1).padStart(2, '0')}</span>
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{section.title}</h2>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1 shrink-0 text-gray-500"
        >
          <ChevronDown size={22} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="prose-legal mt-6 space-y-5">
              {section.paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-gray-400 sm:text-[15px]">
                  {p}
                </p>
              ))}

              {section.bullets && section.bullets.length > 0 ? (
                <ul className="list-none space-y-3 border-l-2 border-brand/35 pl-5">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="relative text-[15px] leading-relaxed text-gray-300">
                      <span className="absolute -left-4 top-2 h-1.5 w-1.5 rounded-full bg-brand/80" />
                      {b}
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.highlights?.map((h, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-brand/25 bg-brand/[0.07] px-4 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                >
                  <div className="text-sm font-semibold text-brand">{h.title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-gray-400">{h.body}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
