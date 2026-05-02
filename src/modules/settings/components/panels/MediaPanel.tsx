import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { User } from '../../../../context/AuthContext'
import { readExtra } from '../../utils/extra'
import MediaUploadTile from '../MediaUploadTile'
import SettingsCard from '../SettingsCard'
import SettingsPrimaryButton from '../SettingsPrimaryButton'

type Props = {
  user: User
  updateUser: (p: Partial<User>) => void
  onDirty: () => void
  onSaved: () => void
}

export default function MediaPanel({ user, updateUser, onDirty, onSaved }: Props) {
  const avKey = readExtra(user, 'avatar_public_url')
  const cvKey = readExtra(user, 'cover_public_url')

  const [avatarPreview, setAvatarPreview] = useState<string | null>(() =>
    avKey.startsWith('http') ? avKey : null,
  )
  const [coverPreview, setCoverPreview] = useState<string | null>(() =>
    cvKey.startsWith('http') ? cvKey : null,
  )
  const blobRef = useRef<{ avatar?: string; cover?: string }>({})

  useEffect(() => {
    return () => {
      if (blobRef.current.avatar?.startsWith('blob:'))
        URL.revokeObjectURL(blobRef.current.avatar)
      if (blobRef.current.cover?.startsWith('blob:'))
        URL.revokeObjectURL(blobRef.current.cover)
    }
  }, [])

  const patchBlob = (kind: 'avatar' | 'cover', url: string | null) => {
    const prev = blobRef.current[kind]
    if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
    blobRef.current[kind] = url ?? undefined
  }

  const onAvatar = (file: File | null) => {
    if (!file) {
      patchBlob('avatar', null)
      setAvatarPreview(null)
      onDirty()
      return
    }
    const url = URL.createObjectURL(file)
    patchBlob('avatar', url)
    setAvatarPreview(url)
    onDirty()
  }

  const onCover = (file: File | null) => {
    if (!file) {
      patchBlob('cover', null)
      setCoverPreview(null)
      onDirty()
      return
    }
    const url = URL.createObjectURL(file)
    patchBlob('cover', url)
    setCoverPreview(url)
    onDirty()
  }

  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)

  const save = () => {
    setSaving(true)
    setOk(false)
    window.setTimeout(() => {
      updateUser({
        extra: {
          ...user.extra,
          avatar_public_url: avatarPreview ?? '',
          cover_public_url: coverPreview ?? '',
          media_updated_at: new Date().toISOString(),
        },
      })
      setSaving(false)
      onSaved()
      setOk(true)
      window.setTimeout(() => setOk(false), 2600)
    }, 600)
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
          Media settings saved.
        </p>
      ) : null}

      <SettingsCard
        title="Profile & cover images"
        description="Square logo for avatar; wide banner for cover (recommended min 1600×600)."
        footer={<SettingsPrimaryButton onClick={save} loading={saving}>Save media</SettingsPrimaryButton>}
      >
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
          <MediaUploadTile
            label="Profile photo"
            hint="Shown on receipts and your listing."
            variant="avatar"
            previewUrl={avatarPreview}
            onFile={onAvatar}
          />
          <div className="min-w-0 flex-1">
            <MediaUploadTile
              label="Cover image"
              hint="Top banner on your public profile."
              variant="cover"
              previewUrl={coverPreview}
              onFile={onCover}
            />
          </div>
        </div>
      </SettingsCard>
    </motion.div>
  )
}
