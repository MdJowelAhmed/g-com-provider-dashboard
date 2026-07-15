import { message } from 'antd'
import { motion } from 'framer-motion'
import { useState } from 'react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import ImageUploader from '../../../../components/common/ImageUploader'
import {
  supportInputClass,
  supportLabelClass,
} from '../../../../components/dashboard/support/supportFieldClasses'
import {
  useGetMyProfileQuery,
  useVerificationDocumentMutation,
} from '../../../../redux/api/authApi'
import {
  uploadPrivateImageFile,
  usePrivateUploadImageMutation,
  type ImageUploadPayload,
  type ImageUploadResponse,
} from '../../../../redux/api/imageUploadApi'
import SettingsCard from '../SettingsCard'
import SettingsPrimaryButton from '../SettingsPrimaryButton'

type Props = {
  onDirty: () => void
  onSaved: () => void
}

const DOC_TYPE_OPTIONS = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'driving_license', label: 'Driving license' },
]

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as FetchBaseQueryError).data
    if (data && typeof data === 'object') {
      const payload = data as { message?: unknown; errorMessages?: { message?: string }[] }
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message
      }
      const first = payload.errorMessages?.[0]?.message
      if (first?.trim()) return first
    }
  }
  return fallback
}

export default function DocumentsPanel({ onDirty, onSaved }: Props) {
  const [verificationDocumentType, setVerificationDocumentType] = useState('passport')
  const [businessProofFile, setBusinessProofFile] = useState<File | null>(null)
  const [verificationDocFile, setVerificationDocFile] = useState<File | null>(null)
  const [uploaderKey, setUploaderKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)

  const { data: profileResponse } = useGetMyProfileQuery()
  const isBusinessVerified = Boolean(profileResponse?.data?.business?.isBusinessVerified)

  const [getPrivatePresignedUrl] = usePrivateUploadImageMutation()
  const [submitVerification] = useVerificationDocumentMutation()

  const formLocked = saving || isBusinessVerified

  const save = async () => {
    if (isBusinessVerified) return

    if (!verificationDocFile) {
      message.error('Please select a verification document.')
      return
    }

    setSaving(true)
    try {
      const getUrl = (payload: ImageUploadPayload): Promise<ImageUploadResponse> =>
        getPrivatePresignedUrl(payload).unwrap()

      let businessProofKey: string | undefined
      if (businessProofFile) {
        businessProofKey = await uploadPrivateImageFile(businessProofFile, getUrl)
      }

      const verificationDocumentKey = await uploadPrivateImageFile(verificationDocFile, getUrl)

      await submitVerification({
        ...(businessProofKey ? { businessProof: businessProofKey } : {}),
        verificationDocumentType,
        verificationDocument: verificationDocumentKey,
      }).unwrap()

      setBusinessProofFile(null)
      setVerificationDocFile(null)
      setUploaderKey((k) => k + 1)
      onSaved()
      setOk(true)
      message.success('Verification documents submitted.')
      window.setTimeout(() => setOk(false), 2600)
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to submit documents.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {isBusinessVerified ? (
        <p className="rounded-xl border border-accent-success/30 bg-accent-success/10 px-4 py-2 text-sm text-accent-success">
          Your business is already verified. Document submission is locked.
        </p>
      ) : ok ? (
        <p className="rounded-xl border border-accent-success/30 bg-accent-success/10 px-4 py-2 text-sm text-accent-success">
          Verification request submitted. Our team will review your documents.
        </p>
      ) : null}

      <SettingsCard
        title="Verification documents"
        description={
          isBusinessVerified
            ? 'This business account has already been verified.'
            : 'Select documents first, then click Submit — files upload privately only on submit.'
        }
        footer={
          <SettingsPrimaryButton onClick={save} loading={saving} disabled={formLocked} >
            {isBusinessVerified ? 'Already verified' : 'Submit for verification'}
          </SettingsPrimaryButton>
        }
      >
        <div className="space-y-5">
          <div>
            <label className={supportLabelClass} htmlFor="doc-type">
              Document type
            </label>
            <select
              id="doc-type"
              value={verificationDocumentType}
              onChange={(e) => {
                setVerificationDocumentType(e.target.value)
                onDirty()
              }}
              disabled={formLocked}
              className={supportInputClass}
            >
              {DOC_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-6">
            <ImageUploader
              key={`business-proof-${uploaderKey}`}
              label="Business proof"
              onFileSelect={(file) => {
                setBusinessProofFile(file)
                onDirty()
              }}
              autoUpload={false}
              heightClass="h-48"
              disabled={formLocked}
              accept="image/*,.pdf"
              hint="Optional — selected now, uploaded on submit"
            />

            <ImageUploader
              key={`verification-doc-${uploaderKey}`}
              label="Verification document"
              onFileSelect={(file) => {
                setVerificationDocFile(file)
                onDirty()
              }}
              autoUpload={false}
              required
              heightClass="h-48"
              disabled={formLocked}
              accept="image/*,.pdf"
              hint="Required — selected now, uploaded on submit"
            />
          </div>
        </div>
      </SettingsCard>
    </motion.div>
  )
}
