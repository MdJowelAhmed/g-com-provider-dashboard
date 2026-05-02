import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'gcom.legal.terms.ack.v1'

export default function LegalAcknowledge() {
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    try {
      setChecked(localStorage.getItem(STORAGE_KEY) === '1')
    } catch {
      setChecked(false)
    }
  }, [])

  const onChange = (next: boolean) => {
    setChecked(next)
    try {
      if (next) localStorage.setItem(STORAGE_KEY, '1')
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 rounded-2xl border border-white/[0.08] bg-surface-elevated/50 p-5 backdrop-blur-md"
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-surface-card text-brand focus:ring-2 focus:ring-brand/40"
        />
        <span className="text-sm leading-relaxed text-gray-400">
          I acknowledge that I have read and understood the current Terms & Conditions and agree to be
          bound by them for my provider account. This acknowledgement is stored locally for your
          records until you clear browser data.
        </span>
      </label>
    </motion.div>
  )
}
