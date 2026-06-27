import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { IconType } from 'react-icons'
import { FaFacebook, FaInstagram, FaLinkedinIn } from 'react-icons/fa'
import AuthLayout from '../../layouts/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import FormField from '../../components/auth/FormField'
import FormSelect from '../../components/auth/FormSelect'
import FormTextarea from '../../components/auth/FormTextarea'
import PasswordField from '../../components/auth/PasswordField'
import PrimaryButton from '../../components/auth/PrimaryButton'
import ImageUploader from '../../components/common/ImageUploader'
import GoogleMapLocationPicker, {
  type GoogleMapLocationPickerRef,
} from '../../components/common/GoogleMapLocationPicker'
import { mapUserProfileToUser } from '../../auth/userProfile'
import { useAuth } from '../../context/AuthContext'
import { getDashboardPath } from '../../routing/roleRedirect'
import {
  DELIVERY_METHOD,
  DELIVERY_METHOD_OPTIONS,
  type DeliveryMethodValue,
  useBusinessInfoVerifyMutation,
  useBusinessInformationMutation,
  useBusinessRegisterMutation,
  useLazyGetMyProfileQuery,
  useResentOtpMutation,
  useVerifyEmailMutation,
} from '../../redux/api/authApi'

type SocialKey = 'instagram' | 'facebook' | 'linkedin'

const OTP_LENGTH = 6

const CATEGORY_OPTIONS = [
  { value: 'service', label: 'Services' },
  { value: 'stay', label: 'Stay' },
  { value: 'dine', label: 'Dine' },
  { value: 'shop', label: 'Shop' },
  { value: 'event', label: 'Events' },
]

const DOC_TYPE_OPTIONS = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'driving_license', label: 'Driving license' },
]

const SOCIAL_META: Record<SocialKey, { label: string; placeholder: string; icon: IconType }> = {
  instagram: {
    label: 'Instagram',
    placeholder: 'Link to your Instagram page…',
    icon: FaInstagram,
  },
  facebook: {
    label: 'Facebook',
    placeholder: 'Link to your Facebook page…',
    icon: FaFacebook,
  },
  linkedin: {
    label: 'LinkedIn',
    placeholder: 'Link to your LinkedIn page…',
    icon: FaLinkedinIn,
  },
}

function getAuthApiErrorMessage(error: unknown, fallback: string) {
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

export default function Register() {
  const navigate = useNavigate()
  const { setUserFromProfile } = useAuth()

  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [otpDigits, setOtpDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ''),
  )
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([])
  const locationPickerRef = useRef<GoogleMapLocationPickerRef>(null)

  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [activeSocial, setActiveSocial] = useState<SocialKey>('instagram')
  const [socialLinks, setSocialLinks] = useState<Record<SocialKey, string>>({
    instagram: '',
    facebook: '',
    linkedin: '',
  })
  const [businessPhone, setBusinessPhone] = useState('')
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodValue[]>([
    DELIVERY_METHOD.PICKUP,
  ])
  const [businessAddress, setBusinessAddress] = useState('')
  const [businessLocation, setBusinessLocation] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [businessLogo, setBusinessLogo] = useState('')
  const [coverImage, setCoverImage] = useState('')

  const [businessProof, setBusinessProof] = useState('')
  const [verificationDocumentType, setVerificationDocumentType] = useState('passport')
  const [verificationDocument, setVerificationDocument] = useState('')

  const [businessRegister, { isLoading: registering }] = useBusinessRegisterMutation()
  const [verifyEmail, { isLoading: verifyingEmail }] = useVerifyEmailMutation()
  const [resendOtp, { isLoading: resendingOtp }] = useResentOtpMutation()
  const [businessInformation, { isLoading: savingInfo }] = useBusinessInformationMutation()
  const [businessInfoVerify, { isLoading: verifying }] = useBusinessInfoVerifyMutation()
  const [fetchProfile] = useLazyGetMyProfileQuery()

  const otp = useMemo(() => otpDigits.join(''), [otpDigits])
  const busy = registering || verifyingEmail || resendingOtp || savingInfo || verifying

  useEffect(() => {
    if (step === 2) {
      otpInputRefs.current[0]?.focus()
    }
  }, [step])

  const setOtpDigit = (index: number, value: string) => {
    setOtpDigits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleOtpChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '')
    if (!value) {
      setOtpDigit(index, '')
      return
    }

    const chars = value.slice(0, OTP_LENGTH - index).split('')
    setOtpDigits((prev) => {
      const next = [...prev]
      for (let i = 0; i < chars.length; i++) {
        next[index + i] = chars[i]
      }
      return next
    })

    const nextIndex = Math.min(index + chars.length, OTP_LENGTH - 1)
    otpInputRefs.current[nextIndex]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        setOtpDigit(index, '')
        return
      }
      if (index > 0) {
        otpInputRefs.current[index - 1]?.focus()
        setOtpDigit(index - 1, '')
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) otpInputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const submitAccount = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email, and password are required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      await businessRegister({
        name: name.trim(),
        email: email.trim(),
        password,
      }).unwrap()
      setStep(2)
    } catch (err) {
      setError(getAuthApiErrorMessage(err, 'Registration failed. Please try again.'))
    }
  }

  const submitEmailVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (otp.length !== OTP_LENGTH || otpDigits.some((d) => !d)) {
      setError(`Please enter the ${OTP_LENGTH}-digit code.`)
      return
    }

    try {
      await verifyEmail({
        email: email.trim(),
        oneTimeCode: Number(otp),
      }).unwrap()
      setStep(3)
    } catch (err) {
      setError(getAuthApiErrorMessage(err, 'Invalid or expired verification code.'))
    }
  }

  const handleResendOtp = async () => {
    setError(null)
    try {
      await resendOtp({ email: email.trim() }).unwrap()
    } catch (err) {
      setError(getAuthApiErrorMessage(err, 'Could not resend code. Please try again.'))
    }
  }

  const submitBusinessInfo = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!businessName.trim() || !category) {
      setError('Business name and category are required.')
      return
    }
    if (!businessPhone.trim()) {
      setError('Business phone number is required.')
      return
    }
    if (deliveryMethods.length === 0) {
      setError('Select at least one delivery method.')
      return
    }
    if (!businessLogo.trim() || !coverImage.trim()) {
      setError('Please upload both a logo and a cover photo.')
      return
    }

    let resolvedLocation = businessLocation.trim()
    let lat = latitude
    let lng = longitude

    if (!resolvedLocation || lat == null || lng == null) {
      const resolved = await locationPickerRef.current?.resolveLocation()
      if (!resolved) {
        setError('Please enter a valid business location on the map.')
        return
      }
      resolvedLocation = resolved.locationName
      lat = resolved.latitude
      lng = resolved.longitude
      setBusinessLocation(resolvedLocation)
      setLatitude(lat)
      setLongitude(lng)
    }

    try {
      await businessInformation({
        businessName: businessName.trim(),
        description: description.trim() || businessName.trim(),
        category,
        socialLinks: {
          facebook: socialLinks.facebook.trim() || undefined,
          instagram: socialLinks.instagram.trim() || undefined,
          linkedin: socialLinks.linkedin.trim() || undefined,
        },
        coverImage: coverImage.trim(),
        businessLogo: businessLogo.trim(),
        businessAddress: businessAddress.trim() || resolvedLocation,
        businessLocation: resolvedLocation,
        deliveryMethods,
        latitude: lat,
        longitude: lng,
        businessPhone: businessPhone.trim(),
      }).unwrap()
      setStep(4)
    } catch (err) {
      setError(getAuthApiErrorMessage(err, 'Failed to save business information.'))
    }
  }

  const submitVerification = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!businessProof.trim() || !verificationDocument.trim()) {
      setError('Please upload both business proof and verification document.')
      return
    }

    try {
      await businessInfoVerify({
        businessProof: businessProof.trim(),
        verificationDocumentType,
        verificationDocument: verificationDocument.trim(),
      }).unwrap()

      const profileResponse = await fetchProfile().unwrap()
      if (profileResponse.success && profileResponse.data) {
        const user = mapUserProfileToUser(profileResponse.data)
        setUserFromProfile(user)
        navigate(getDashboardPath(user.role), { replace: true })
        return
      }

      navigate('/login', { replace: true })
    } catch (err) {
      setError(getAuthApiErrorMessage(err, 'Verification failed. Please try again.'))
    }
  }

  if (step === 1) {
    return (
      <AuthLayout>
        <AuthCard title="Create an account">
          <form onSubmit={submitAccount} className="space-y-4">
            <FormField
              label="Name*"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoComplete="name"
              required
              disabled={busy}
            />
            <FormField
              label="Email*"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              disabled={busy}
            />
            <PasswordField
              label="Password*"
              value={password}
              onChange={setPassword}
              placeholder="Create a password"
              autoComplete="new-password"
              hint="Must be at least 8 characters."
              disabled={busy}
            />
            <PasswordField
              label="Confirm Password*"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Create a password"
              autoComplete="new-password"
              hint="Must be at least 8 characters."
              disabled={busy}
            />

            {error ? <p className="text-xs text-accent-danger">{error}</p> : null}

            <PrimaryButton type="submit" disabled={busy}>
              {registering ? 'Creating account…' : 'Sign Up'}
            </PrimaryButton>

            <p className="text-center text-sm text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-white hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </AuthCard>
      </AuthLayout>
    )
  }

  if (step === 2) {
    return (
      <AuthLayout>
        <AuthCard
          title="Verify your email"
          description={`Enter the 6-digit code we sent to ${email}.`}
        >
          <form onSubmit={submitEmailVerify} className="space-y-5">
            <div className="flex items-center justify-between gap-2">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpInputRefs.current[i] = el
                  }}
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  aria-label={`Digit ${i + 1}`}
                  value={otpDigits[i]}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-12 w-12 rounded-md bg-white text-center text-lg font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-brand-ring"
                  maxLength={OTP_LENGTH}
                  disabled={busy}
                />
              ))}
            </div>

            <div className="text-xs text-gray-400">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                className="font-medium text-accent-amber hover:underline disabled:opacity-50"
                onClick={handleResendOtp}
                disabled={busy}
              >
                {resendingOtp ? 'Sending…' : 'Resend'}
              </button>
            </div>

            {error ? <p className="text-xs text-accent-danger">{error}</p> : null}

            <PrimaryButton type="submit" disabled={busy}>
              {verifyingEmail ? 'Verifying…' : 'Verify email'}
            </PrimaryButton>
          </form>
        </AuthCard>
      </AuthLayout>
    )
  }

  if (step === 3) {
    const ActiveSocialIcon = SOCIAL_META[activeSocial].icon

    return (
      <AuthLayout>
        <AuthCard title="Business Information" bordered>
          <form onSubmit={submitBusinessInfo} className="space-y-4">
            <FormField
              label="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your Business name"
              required
              disabled={busy}
            />

            <FormSelect
              label="Category"
              optionItems={CATEGORY_OPTIONS}
              placeholderOption="Select a category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={busy}
            />

            <FormTextarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your business"
              disabled={busy}
            />

            <div>
              <span className="block text-sm font-medium text-white">Social Media Links</span>
              <div className="mt-2 flex gap-2">
                {(Object.keys(SOCIAL_META) as SocialKey[]).map((key) => {
                  const Icon = SOCIAL_META[key].icon
                  const active = activeSocial === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveSocial(key)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                        active
                          ? 'border-white bg-white text-gray-900'
                          : 'border-surface-border bg-surface-elevated text-gray-300 hover:border-brand/40'
                      }`}
                      title={SOCIAL_META[key].label}
                    >
                      <Icon size={18} />
                    </button>
                  )
                })}
              </div>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
                  <ActiveSocialIcon size={16} />
                </div>
                <input
                  type="url"
                  value={socialLinks[activeSocial]}
                  onChange={(e) =>
                    setSocialLinks((prev) => ({ ...prev, [activeSocial]: e.target.value }))
                  }
                  placeholder={SOCIAL_META[activeSocial].placeholder}
                  disabled={busy}
                  className="h-11 w-full rounded-md bg-white py-2 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand-ring"
                />
              </div>
            </div>

            <FormField
              label="Phone Number"
              type="tel"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              placeholder="Enter Business Phone Number"
              required
              disabled={busy}
            />

            <div>
              <span className="block text-sm font-medium text-white">
                Delivery methods<span className="ml-1 text-accent-amber">*</span>
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {DELIVERY_METHOD_OPTIONS.map((option) => {
                  const active = deliveryMethods.includes(option.value)
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setDeliveryMethods((prev) =>
                          active
                            ? prev.filter((v) => v !== option.value)
                            : [...prev, option.value],
                        )
                      }
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                        active
                          ? 'border-brand bg-brand/15 text-white ring-1 ring-brand/40'
                          : 'border-surface-border text-gray-400 hover:border-brand/40 hover:text-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
              <p className="mt-1.5 text-xs text-gray-500">Select at least one option.</p>
            </div>

            <FormField
              label="Address"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="Enter business address"
              disabled={busy}
            />

            <div>
              <span className="block text-sm font-medium text-white">Location</span>
              <div className="mt-2">
                <GoogleMapLocationPicker
                  ref={locationPickerRef}
                  value={{
                    locationName: businessLocation,
                    latitude,
                    longitude,
                  }}
                  onChange={(value) => {
                    setBusinessLocation(value.locationName)
                    setLatitude(value.latitude)
                    setLongitude(value.longitude)
                  }}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-3">
              <ImageUploader
                label="Upload Logo"
                value={businessLogo}
                onChange={setBusinessLogo}
                autoUpload
                heightClass="h-[120px]"
                disabled={busy}
              />
              <ImageUploader
                label="Upload Cover Photo"
                value={coverImage}
                onChange={setCoverImage}
                autoUpload
                heightClass="h-[120px]"
                disabled={busy}
              />
            </div>

            {error ? <p className="text-xs text-accent-danger">{error}</p> : null}

            <PrimaryButton type="submit" disabled={busy}>
              {savingInfo ? 'Saving…' : 'Continue'}
            </PrimaryButton>
          </form>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard title="Verification" bordered>
        <form onSubmit={submitVerification} className="space-y-4">
          <p className="text-sm text-gray-400">
            Upload your business proof and a government ID to verify your account.
          </p>

          <FormSelect
            label="Document type"
            optionItems={DOC_TYPE_OPTIONS}
            value={verificationDocumentType}
            onChange={(e) => setVerificationDocumentType(e.target.value)}
            disabled={busy}
          />

          <ImageUploader
            label="Business proof"
            value={businessProof}
            onChange={setBusinessProof}
            autoUpload
            heightClass="h-36"
            disabled={busy}
            hint="Business registration or proof of ownership"
          />

          <ImageUploader
            label="Verification document"
            value={verificationDocument}
            onChange={setVerificationDocument}
            autoUpload
            heightClass="h-36"
            disabled={busy}
            hint="Passport, national ID, or driving license"
          />

          {error ? <p className="text-xs text-accent-danger">{error}</p> : null}

          <PrimaryButton type="submit" disabled={busy}>
            {verifying ? 'Submitting…' : 'Complete registration'}
          </PrimaryButton>

          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="h-11 w-full rounded-md text-sm font-medium text-gray-400 hover:text-white"
            disabled={busy}
          >
            Skip for now — log in later
          </button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
