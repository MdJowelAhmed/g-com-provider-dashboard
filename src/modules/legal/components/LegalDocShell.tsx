import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Printer, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { LegalDocumentMeta, LegalSection } from '../types'
import { useLegalScrollSpy } from '../hooks/useLegalScrollSpy'
import { useMainScrollElement } from '../hooks/useMainScrollRoot'
import { useReadingProgress } from '../hooks/useReadingProgress'
import LegalAcknowledge from './LegalAcknowledge'
import LegalProgressBar from './LegalProgressBar'
import LegalSectionBlock from './LegalSectionBlock'
import LegalTOC from './LegalTOC'

function matchesSection(section: LegalSection, q: string) {
  if (!q.trim()) return true
  const t = q.trim().toLowerCase()
  const blob = [
    section.title,
    ...section.paragraphs,
    ...(section.bullets ?? []),
    ...(section.highlights?.flatMap((h) => [h.title, h.body]) ?? []),
  ]
    .join(' ')
    .toLowerCase()
  return blob.includes(t)
}

export default function LegalDocShell({
  doc,
  backLink,
}: {
  doc: LegalDocumentMeta
  backLink?: ReactNode
}) {
  const [query, setQuery] = useState('')
  const scrollRoot = useMainScrollElement()
  const progress = useReadingProgress(scrollRoot)

  const filteredSections = useMemo(
    () => doc.sections.filter((s) => matchesSection(s, query)),
    [doc.sections, query],
  )

  const sectionIds = useMemo(() => filteredSections.map((s) => s.id), [filteredSections])

  const activeId = useLegalScrollSpy(sectionIds, scrollRoot)

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(doc.sections.map((s) => [s.id, true])),
  )

  useEffect(() => {
    setOpenMap(Object.fromEntries(doc.sections.map((s) => [s.id, true])))
  }, [doc.id, doc.sections])

  const toggleSection = (id: string) => {
    setOpenMap((m) => ({ ...m, [id]: !m[id] }))
  }

  const expandAll = () => {
    const next: Record<string, boolean> = {}
    filteredSections.forEach((s) => {
      next[s.id] = true
    })
    setOpenMap((prev) => ({ ...prev, ...next }))
  }

  const collapseAll = () => {
    const next: Record<string, boolean> = {}
    filteredSections.forEach((s) => {
      next[s.id] = false
    })
    setOpenMap((prev) => ({ ...prev, ...next }))
  }

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return
    const el = document.getElementById(`legal-section-${hash}`)
    if (!el) return
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    return () => window.clearTimeout(t)
  }, [doc.slug])

  const handlePrint = () => window.print()

  return (
    <div className="legal-print-root">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>{backLink}</div>
        <span className="text-[11px] text-gray-600">
          Version {doc.version} · Last updated {doc.lastUpdated}
        </span>
      </div>

      <LegalProgressBar progress={progress} />

      <div className="no-print mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex max-w-xl flex-1 items-center">
          <Search size={16} className="pointer-events-none absolute left-3 text-gray-500" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in this document…"
            className="h-11 w-full rounded-xl border border-white/[0.08] bg-surface-elevated/80 py-2 pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-600 shadow-inner outline-none ring-brand/0 transition focus:border-brand/40 focus:ring-2 focus:ring-brand/25"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/[0.04]"
          >
            <ChevronDown size={14} /> Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/[0.04]"
          >
            <ChevronUp size={14} /> Collapse all
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/15"
          >
            <Printer size={14} /> Print / Save PDF
          </button>
        </div>
      </div>

      {query.trim() && filteredSections.length === 0 ? (
        <p className="mb-8 rounded-xl border border-accent-amber/25 bg-accent-amber/10 px-4 py-3 text-sm text-accent-amber">
          No sections match “{query.trim()}”. Clear search to see the full document.
        </p>
      ) : null}

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <aside className="no-print lg:sticky lg:top-6 lg:w-64 lg:shrink-0">
          <div className="rounded-2xl border border-white/[0.06] bg-surface-card/40 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-md">
            <LegalTOC sections={filteredSections} activeId={activeId} />
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-gray-600">
            Tip: use the copy icon beside each heading to share a direct link to a section.
          </p>
        </aside>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0 max-w-3xl flex-1"
        >
          <header className="mb-10 border-b border-white/[0.06] pb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand/90">
              Policy · v{doc.version}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {doc.title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-400 sm:text-[15px]">{doc.description}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-500">
              <span className="rounded-full border border-white/[0.08] bg-surface-elevated/80 px-3 py-1">
                Last updated {doc.lastUpdated}
              </span>
              <span className="rounded-full border border-white/[0.08] bg-surface-elevated/80 px-3 py-1">
                Document ID · {doc.id}
              </span>
            </div>
          </header>

          <div className="divide-y divide-white/[0.04]">
            {filteredSections.map((section, index) => (
              <LegalSectionBlock
                key={section.id}
                section={section}
                index={index}
                open={openMap[section.id] ?? true}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </div>

          {doc.id === 'terms' ? <LegalAcknowledge /> : null}
        </motion.article>
      </div>
    </div>
  )
}
