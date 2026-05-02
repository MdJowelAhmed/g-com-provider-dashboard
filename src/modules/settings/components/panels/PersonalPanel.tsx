import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { User } from '../../../../context/AuthContext'
import {
  supportInputClass,
  supportLabelClass,
} from '../../../../components/dashboard/support/supportFieldClasses'
import SettingsCard from '../SettingsCard'
import SettingsPrimaryButton from '../SettingsPrimaryButton'

type Props = {
  user: User
  updateUser: (p: Partial<User>) => void
  onDirty: () => void
  onSaved: () => void
}

export default function PersonalPanel({ user, updateUser, onDirty, onSaved }: Props) {
  const [ownerName, setOwnerName] = useState(user.ownerName)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone)
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    setOwnerName(user.ownerName)
    setEmail(user.email)
    setPhone(user.phone)
  }, [user])

  const save = () => {
    setSaving(true)
    setOk(false)
    window.setTimeout(() => {
      updateUser({ ownerName: ownerName.trim(), email: email.trim(), phone: phone.trim() })
      setSaving(false)
      onSaved()
      setOk(true)
      window.setTimeout(() => setOk(false), 2800)
    }, 550)
  }

  const change =
    (fn: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      fn(e.target.value)
      onDirty()
    }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {ok ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-accent-success/30 bg-accent-success/10 px-4 py-2 text-sm text-accent-success"
          role="status"
        >
          Personal details saved.
        </motion.p>
      ) : null}

      <SettingsCard
        title="Personal information"
        description="Your name and contact details shown on receipts and customer communications."
        footer={<SettingsPrimaryButton onClick={save} loading={saving}>Save changes</SettingsPrimaryButton>}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="set-owner" className={supportLabelClass}>
              Full name
            </label>
            <input
              id="set-owner"
              value={ownerName}
              onChange={change(setOwnerName)}
              className={supportInputClass}
              placeholder="Your full name"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="set-email" className={supportLabelClass}>
              Email
            </label>
            <input
              id="set-email"
              type="email"
              value={email}
              onChange={change(setEmail)}
              className={supportInputClass}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="set-phone" className={supportLabelClass}>
              Phone
            </label>
            <input
              id="set-phone"
              type="tel"
              value={phone}
              onChange={change(setPhone)}
              className={supportInputClass}
              placeholder="+1 555 000 0000"
              autoComplete="tel"
            />
          </div>
        </div>
      </SettingsCard>
    </motion.div>
  )
}
