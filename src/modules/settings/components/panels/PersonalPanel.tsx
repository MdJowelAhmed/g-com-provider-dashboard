import { message } from 'antd'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import ImageUploader from '../../../../components/common/ImageUploader'
import {
  supportInputClass,
  supportLabelClass,
} from '../../../../components/dashboard/support/supportFieldClasses'
import type { User } from '../../../../context/AuthContext'
import { resolveMediaUrl } from '../../../../redux/api/chatApi'
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from '../../../../redux/api/authApi'
import {
  uploadImageFile,
  useGetPresignedUploadUrlMutation,
} from '../../../../redux/api/imageUploadApi'
import SettingsCard from '../SettingsCard'
import SettingsPrimaryButton from '../SettingsPrimaryButton'

type Props = {
  user: User
  updateUser: (p: Partial<User>) => void
  onDirty: () => void
  onSaved: () => void
}

function profileImageDisplayUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return resolveMediaUrl(url)
  return url
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data
    if (data?.message?.trim()) return data.message
  }
  return fallback
}

export default function PersonalPanel({ updateUser, onDirty, onSaved }: Props) {
  const { data: profileResponse, isLoading } = useGetMyProfileQuery()
  const [getPresignedUrl] = useGetPresignedUploadUrlMutation()
  const [updateMyProfile] = useUpdateMyProfileMutation()

  const profile = profileResponse?.data

  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [uploaderKey, setUploaderKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!profile) return
    setOwnerName(profile.name ?? '')
    setEmail(profile.email ?? '')
    setPhone(profile.phone ?? '')
    setAddress(profile.address ?? '')
    setProfileImage(profile.profileImage ?? '')
  }, [profile])

  const save = async () => {
    if (!ownerName.trim()) {
      message.warning('Full name is required.')
      return
    }

    setOk(false)
    setSaving(true)
    try {
      let imageUrl = profileImage.trim()

      if (profileImageFile) {
        imageUrl = await uploadImageFile(profileImageFile, (payload) =>
          getPresignedUrl(payload).unwrap(),
        )
      }

      const result = await updateMyProfile({
        name: ownerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        profileImage: imageUrl,
      }).unwrap()

      if (result.data) {
        const nextProfileImage = result.data.profileImage ?? imageUrl
        setProfileImage(nextProfileImage)
        updateUser({
          ownerName: result.data.name ?? ownerName.trim(),
          phone: result.data.phone ?? phone.trim(),
          address: result.data.address ?? address.trim(),
          profileImage: nextProfileImage,
        })
      }

      setProfileImageFile(null)
      setUploaderKey((k) => k + 1)
      onSaved()
      setOk(true)
      message.success(result.message || 'Personal details saved.')
      window.setTimeout(() => setOk(false), 2800)
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to update profile.'))
    } finally {
      setSaving(false)
    }
  }

  const change =
    (fn: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      fn(e.target.value)
      onDirty()
    }

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-16 text-sm text-gray-500">
        <Loader2 size={18} className="animate-spin" />
        Loading profile…
      </div>
    )
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
        footer={
          <SettingsPrimaryButton onClick={save} loading={saving}>
            Save changes
          </SettingsPrimaryButton>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <ImageUploader
              key={`profile-photo-${uploaderKey}`}
              label="Profile photo"
              value={profileImageDisplayUrl(profileImage)}
              onFileSelect={(file) => {
                setProfileImageFile(file)
                onDirty()
              }}
              autoUpload={false}
              heightClass="h-40"
              hint="Selected now, uploaded when you save changes"
              disabled={saving}
              className="w-40"
            />
          </div>

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
              disabled={saving}
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
              readOnly
              className={`${supportInputClass} cursor-not-allowed opacity-70`}
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
              placeholder="+233 24 123 4567"
              autoComplete="tel"
              disabled={saving}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="set-address" className={supportLabelClass}>
              Address
            </label>
            <textarea
              id="set-address"
              rows={3}
              value={address}
              onChange={change(setAddress)}
              className={`${supportInputClass} resize-y`}
              placeholder="Your address"
              autoComplete="street-address"
              disabled={saving}
            />
          </div>
        </div>
      </SettingsCard>
    </motion.div>
  )
}
