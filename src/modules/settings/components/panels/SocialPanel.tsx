import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { User } from '../../../../context/AuthContext'
import { supportInputClass, supportLabelClass } from '../../../../components/dashboard/support/supportFieldClasses'
import { readExtra } from '../../utils/extra'
import SettingsCard from '../SettingsCard'
import SettingsPrimaryButton from '../SettingsPrimaryButton'

type Props = {
  user: User
  updateUser: (p: Partial<User>) => void
  onDirty: () => void
  onSaved: () => void
}

export default function SocialPanel({ user, updateUser, onDirty, onSaved }: Props) {
  const [twitter, setTwitter] = useState(() => readExtra(user, 'social_twitter'))
  const [instagram, setInstagram] = useState(() => readExtra(user, 'social_instagram'))
  const [facebook, setFacebook] = useState(() => readExtra(user, 'social_facebook'))
  const [linkedin, setLinkedin] = useState(() => readExtra(user, 'social_linkedin'))
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    setTwitter(readExtra(user, 'social_twitter'))
    setInstagram(readExtra(user, 'social_instagram'))
    setFacebook(readExtra(user, 'social_facebook'))
    setLinkedin(readExtra(user, 'social_linkedin'))
  }, [user])

  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      updateUser({
        extra: {
          ...user.extra,
          social_twitter: twitter.trim(),
          social_instagram: instagram.trim(),
          social_facebook: facebook.trim(),
          social_linkedin: linkedin.trim(),
        },
      })
      setSaving(false)
      onSaved()
      setOk(true)
      window.setTimeout(() => setOk(false), 2600)
    }, 450)
  }

  const row = (
    id: string,
    label: string,
    hint: string,
    value: string,
    set: (v: string) => void,
    placeholder: string,
  ) => (
    <div className="space-y-2">
      <label htmlFor={id} className={supportLabelClass}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => {
          set(e.target.value)
          onDirty()
        }}
        className={supportInputClass}
        placeholder={placeholder}
        inputMode="url"
      />
      <p className="text-[11px] text-gray-600">{hint}</p>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {ok ? (
        <p className="rounded-xl border border-accent-success/30 bg-accent-success/10 px-4 py-2 text-sm text-accent-success">
          Social links updated.
        </p>
      ) : null}

      <SettingsCard
        title="Social links"
        description="Optional — help customers discover you off-platform."
        footer={<SettingsPrimaryButton onClick={save} loading={saving}>Save links</SettingsPrimaryButton>}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {row(
            'soc-tw',
            'X (Twitter)',
            'Full profile URL.',
            twitter,
            setTwitter,
            'https://x.com/yourbusiness',
          )}
          {row(
            'soc-ig',
            'Instagram',
            'Full profile URL.',
            instagram,
            setInstagram,
            'https://instagram.com/yourbusiness',
          )}
          {row(
            'soc-fb',
            'Facebook',
            'Page URL.',
            facebook,
            setFacebook,
            'https://facebook.com/yourbusiness',
          )}
          {row(
            'soc-li',
            'LinkedIn',
            'Company or personal URL.',
            linkedin,
            setLinkedin,
            'https://linkedin.com/company/...',
          )}
        </div>
      </SettingsCard>
    </motion.div>
  )
}
