import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import SettingsHeroHeader from '../../../modules/settings/components/SettingsHeroHeader'
import SettingsTabList from '../../../modules/settings/components/SettingsTabList'
import BusinessPanel from '../../../modules/settings/components/panels/BusinessPanel'
import DocumentsPanel from '../../../modules/settings/components/panels/DocumentsPanel'
import PersonalPanel from '../../../modules/settings/components/panels/PersonalPanel'
import SecurityPanel from '../../../modules/settings/components/panels/SecurityPanel'
import type { SettingsTabId } from '../../../modules/settings/types'

function SettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="rounded-2xl border border-white/[0.06] bg-surface-elevated/40 p-6 backdrop-blur-xl">
        <div className="h-4 w-40 rounded bg-surface-border" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-surface-border" />
            <div className="h-11 w-full rounded-xl bg-surface-border/80" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-surface-border" />
            <div className="h-11 w-full rounded-xl bg-surface-border/80" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState<SettingsTabId>('personal')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 380)
    return () => window.clearTimeout(t)
  }, [])

  const onDirty = useCallback(() => {}, [])
  const onSaved = useCallback(() => {}, [])

  const changeTab = (next: SettingsTabId) => {
    if (next === tab) return
    setTab(next)
  }

  if (!user) return null

  const panelProps = {
    user,
    updateUser,
    onDirty,
    onSaved,
  }

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

      <SettingsHeroHeader />

      <SettingsTabList active={tab} onChange={changeTab} />

      {!ready ? (
        <SettingsSkeleton />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'personal' ? (
              <PersonalPanel {...panelProps} />
            ) : tab === 'business' ? (
              <BusinessPanel {...panelProps} />
            ) : tab === 'documents' ? (
              <DocumentsPanel {...panelProps} />
            ) : tab === 'security' ? (
              <SecurityPanel onDirty={onDirty} onSaved={onSaved} />
          
            ) : (
              <PersonalPanel {...panelProps} />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
