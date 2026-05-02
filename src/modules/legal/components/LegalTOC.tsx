import { motion } from 'framer-motion'
import { Link2 } from 'lucide-react'
import { useState } from 'react'
import type { LegalSection } from '../types'

type Props = {
  sections: LegalSection[]
  activeId: string | null
}

export default function LegalTOC({ sections, activeId }: Props) {
  const [copied, setCopied] = useState<string | null>(null)

  const scrollTo = (id: string) => {
    document.getElementById(`legal-section-${id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const copyAnchor = async (id: string) => {
    const path = `${window.location.pathname}#${id}`
    const url = `${window.location.origin}${path}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(id)
      window.setTimeout(() => setCopied(null), 2000)
    } catch {
      setCopied(null)
    }
  }

  return (
    <nav className="space-y-1" aria-label="On this page">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-white/[0.08] pl-3">
        {sections.map((s, idx) => {
          const active = activeId === s.id
          return (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="relative"
            >
              {active ? (
                <span
                  className="absolute -left-3 top-1.5 h-5 w-0.5 rounded-full bg-brand shadow-[0_0_10px_rgba(160,82,45,0.9)]"
                  aria-hidden
                />
              ) : null}
              <div className="flex items-start gap-1">
                <button
                  type="button"
                  onClick={() => scrollTo(s.id)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-left text-sm transition ${
                    active
                      ? 'bg-brand/15 font-medium text-white ring-1 ring-brand/30'
                      : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
                  }`}
                >
                  {s.title}
                </button>
                <button
                  type="button"
                  className="no-print mt-1 rounded p-1 text-gray-600 hover:bg-white/[0.06] hover:text-brand"
                  title="Copy link to section"
                  aria-label={`Copy link to ${s.title}`}
                  onClick={() => copyAnchor(s.id)}
                >
                  <Link2 size={14} />
                </button>
              </div>
              {copied === s.id ? (
                <span className="mt-0.5 block pl-2 text-[10px] text-accent-success">Copied</span>
              ) : null}
            </motion.li>
          )
        })}
      </ul>
    </nav>
  )
}
