import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { User } from '../../../../context/AuthContext'
import {
  supportInputClass,
  supportLabelClass,
  supportTextareaClass,
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

export default function BusinessPanel({ user, updateUser, onDirty, onSaved }: Props) {
  const [businessName, setBusinessName] = useState(user.businessName)
  const [address, setAddress] = useState(user.address)
  const [description, setDescription] = useState(readExtra(user, 'business_description'))
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    setBusinessName(user.businessName)
    setAddress(user.address)
    setDescription(readExtra(user, 'business_description'))
  }, [user])

  const save = () => {
    setSaving(true)
    setOk(false)
    window.setTimeout(() => {
      updateUser({
        businessName: businessName.trim(),
        address: address.trim(),
        extra: {
          ...user.extra,
          business_description: description.trim(),
        },
      })
      setSaving(false)
      onSaved()
      setOk(true)
      window.setTimeout(() => setOk(false), 2800)
    }, 550)
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
          Business profile saved.
        </motion.p>
      ) : null}

      <SettingsCard
        title="Business information"
        description="Shown on your public listing and invoices."
        footer={<SettingsPrimaryButton onClick={save} loading={saving}>Save changes</SettingsPrimaryButton>}
      >
        <div className="grid gap-5">
          <div className="space-y-2">
            <label htmlFor="set-biz" className={supportLabelClass}>
              Business name
            </label>
            <input
              id="set-biz"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value)
                onDirty()
              }}
              className={supportInputClass}
              placeholder="Business or venue name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="set-addr" className={supportLabelClass}>
              Address
            </label>
            <input
              id="set-addr"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value)
                onDirty()
              }}
              className={supportInputClass}
              placeholder="Street, city, region"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="set-desc" className={supportLabelClass}>
              Short description
            </label>
            <textarea
              id="set-desc"
              value={description}
              maxLength={500}
              onChange={(e) => {
                setDescription(e.target.value)
                onDirty()
              }}
              className={supportTextareaClass}
              placeholder="What customers should know about your business."
              rows={4}
            />
            <p className="text-right text-[11px] text-gray-600">{description.length} / 500</p>
          </div>
        </div>
      </SettingsCard>
    </motion.div>
  )
}
