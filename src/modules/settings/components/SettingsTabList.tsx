import { motion } from 'framer-motion'
import { SETTINGS_TABS } from '../constants'
import type { SettingsTabId } from '../types'

type Props = {
  active: SettingsTabId
  onChange: (id: SettingsTabId) => void
}

export default function SettingsTabList({ active, onChange }: Props) {
  return (
    <nav
      className="relative z-[1] mb-8 flex flex-wrap gap-1 border-b border-white/[0.06] sm:gap-2"
      aria-label="Settings sections"
    >
      {SETTINGS_TABS.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative px-3 py-3 text-xs font-medium transition sm:px-4 sm:text-sm ${
              isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="relative z-[1]">{tab.label}</span>
            {isActive ? (
              <motion.span
                layoutId="settings-tab-indicator"
                className="absolute inset-x-1 bottom-0 top-0 -z-10 rounded-md bg-brand/12 ring-1 ring-brand/25"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            ) : null}
            {isActive ? (
              <motion.span
                layoutId="settings-tab-line"
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-brand"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            ) : null}
          </button>
        )
      })}
    </nav>
  )
}
