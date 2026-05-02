import { Modal } from 'antd'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { User } from '../../../../context/AuthContext'
import {
  supportInputClass,
  supportLabelClass,
} from '../../../../components/dashboard/support/supportFieldClasses'
import { readExtra } from '../../utils/extra'
import SettingsCard from '../SettingsCard'
import SettingsPrimaryButton from '../SettingsPrimaryButton'

type Props = {
  user: User
  updateUser: (p: Partial<User>) => void
  onDirty: () => void
  onSaved: () => void
}

export default function AccountPanel({ user, updateUser, onDirty, onSaved }: Props) {
  const [theme, setTheme] = useState(() => readExtra(user, 'pref_theme') || 'dark')
  const [language, setLanguage] = useState(() => readExtra(user, 'pref_language') || 'en')
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    setTheme(readExtra(user, 'pref_theme') || 'dark')
    setLanguage(readExtra(user, 'pref_language') || 'en')
  }, [user])

  const savePrefs = () => {
    setSaving(true)
    window.setTimeout(() => {
      updateUser({
        extra: {
          ...user.extra,
          pref_theme: theme,
          pref_language: language,
        },
      })
      setSaving(false)
      setOk(true)
      onSaved()
      window.setTimeout(() => setOk(false), 2600)
    }, 400)
  }

  const confirmDelete = () => {
    Modal.confirm({
      title: 'Delete account?',
      content:
        'This demo cannot remove your account from the server. In production, this would start a deletion workflow.',
      okText: 'Close',
      cancelButtonProps: { style: { display: 'none' } },
      centered: true,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {ok ? (
        <p className="rounded-xl border border-accent-success/30 bg-accent-success/10 px-4 py-2 text-sm text-accent-success">
          Account preferences saved.
        </p>
      ) : null}

      <SettingsCard
        title="Account preferences"
        description="Display and language — more options when i18n lands."
        footer={<SettingsPrimaryButton onClick={savePrefs} loading={saving}>Save preferences</SettingsPrimaryButton>}
      >
        <div className="grid max-w-xl gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="pref-theme" className={supportLabelClass}>
              Theme
            </label>
            <select
              id="pref-theme"
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value)
                onDirty()
              }}
              className={supportInputClass}
            >
              <option value="dark">Dark (default)</option>
              <option value="system">Match system</option>
              <option value="light" disabled>
                Light — coming soon
              </option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="pref-lang" className={supportLabelClass}>
              Language
            </label>
            <select
              id="pref-lang"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value)
                onDirty()
              }}
              className={supportInputClass}
            >
              <option value="en">English</option>
              <option value="bn">Bangla</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Activity"
        description="Recent security-sensitive events will appear here once the audit API is connected."
      >
        <div className="rounded-xl border border-dashed border-white/[0.08] bg-surface-elevated/30 px-4 py-10 text-center text-sm text-gray-600">
          No recent activity to show.
        </div>
      </SettingsCard>

      <SettingsCard
        title="Danger zone"
        description="Irreversible actions for your provider account."
        footer={
          <SettingsPrimaryButton variant="danger" onClick={confirmDelete}>
            Delete account
          </SettingsPrimaryButton>
        }
      >
        <p className="max-w-xl text-sm leading-relaxed text-gray-500">
          Deleting your account removes listings and disconnects payouts after any outstanding balances
          settle. This demo only shows a confirmation dialog.
        </p>
      </SettingsCard>
    </motion.div>
  )
}
