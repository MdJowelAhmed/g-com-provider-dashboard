import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { IconType } from 'react-icons'
import { FaFacebook, FaInstagram, FaLinkedinIn } from 'react-icons/fa'
import FormField from './FormField'
import FormSelect from './FormSelect'
import FormTextarea from './FormTextarea'
import PrimaryButton from './PrimaryButton'
import ImageUploader from '../common/ImageUploader'
import GoogleMapLocationPicker, {
  type GoogleMapLocationPickerRef,
} from '../common/GoogleMapLocationPicker'
import { mapUserProfileToUser } from '../../auth/userProfile'
import { useAuth } from '../../context/AuthContext'
import { getDashboardPath } from '../../routing/roleRedirect'
import {
  DELIVERY_METHOD,
  DELIVERY_METHOD_OPTIONS,
  type DeliveryMethodValue,
  useBusinessInformationMutation,
  useLazyGetMyProfileQuery,
  type BusinessProfile,
} from '../../redux/api/authApi'

type SocialKey = 'instagram' | 'facebook' | 'linkedin'

const CATEGORY_OPTIONS = [
  { value: 'services', label: 'Services' },
  { value: 'stay', label: 'Stay' },
  { value: 'dine', label: 'Dine' },
  { value: 'shop', label: 'Shop' },
  { value: 'event', label: 'Events' },
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

export type BusinessOnboardingFormProps = {
  initialValues?: BusinessProfile | null
  submitLabel?: string
  onSuccess?: () => void
}

export default function BusinessOnboardingForm({
  initialValues,
  submitLabel = 'Complete registration',
  onSuccess,
}: BusinessOnboardingFormProps) {
  const navigate = useNavigate()
  const { setUserFromProfile } = useAuth()
  const [businessInformation, { isLoading: savingInfo }] = useBusinessInformationMutation()
  const [fetchProfile] = useLazyGetMyProfileQuery()

  const locationPickerRef = useRef<GoogleMapLocationPickerRef>(null)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!initialValues) return
    const coords = initialValues.location?.coordinates
    if (initialValues.businessName) setBusinessName(initialValues.businessName)
    if (initialValues.category) setCategory(initialValues.category)
    if (initialValues.description) setDescription(initialValues.description)
    if (initialValues.businessPhone) setBusinessPhone(initialValues.businessPhone)
    if (initialValues.businessAddress) setBusinessAddress(initialValues.businessAddress)
    if (initialValues.businessLocation) setBusinessLocation(initialValues.businessLocation)
    if (coords?.[1] != null) setLatitude(coords[1])
    if (coords?.[0] != null) setLongitude(coords[0])
    if (initialValues.businessLogo) setBusinessLogo(initialValues.businessLogo)
    if (initialValues.coverImage) setCoverImage(initialValues.coverImage)
    if (initialValues.deliveryMethods?.length) {
      setDeliveryMethods(initialValues.deliveryMethods as DeliveryMethodValue[])
    }
    if (initialValues.socialLinks) {
      setSocialLinks({
        instagram: initialValues.socialLinks.instagram ?? '',
        facebook: initialValues.socialLinks.facebook ?? '',
        linkedin: initialValues.socialLinks.linkedin ?? '',
      })
    }
  }, [initialValues])

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

      const freshProfileResponse = await fetchProfile().unwrap()
      if (freshProfileResponse.success && freshProfileResponse.data) {
        const mappedUser = mapUserProfileToUser(freshProfileResponse.data)
        setUserFromProfile(mappedUser)
        if (onSuccess) {
          onSuccess()
        } else {
          navigate(getDashboardPath(mappedUser.role), { replace: true })
        }
        return
      }

      navigate('/login', { replace: true })
    } catch (err) {
      setError(getAuthApiErrorMessage(err, 'Failed to save business information.'))
    }
  }

  const ActiveSocialIcon = SOCIAL_META[activeSocial].icon

  return (
    <form onSubmit={submitBusinessInfo} className="space-y-5">
      {/* 2-Column Responsive Grid for inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          label="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Enter your Business name"
          required
          disabled={savingInfo}
        />

        <FormSelect
          label="Category"
          optionItems={CATEGORY_OPTIONS}
          placeholderOption="Select a category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          disabled={savingInfo}
        />

        <div className="md:col-span-2">
          <FormTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your business"
            disabled={savingInfo}
          />
        </div>

        <FormField
          label="Phone Number"
          type="tel"
          value={businessPhone}
          onChange={(e) => setBusinessPhone(e.target.value)}
          placeholder="Enter Business Phone Number"
          required
          disabled={savingInfo}
        />

        <FormField
          label="Address"
          value={businessAddress}
          onChange={(e) => setBusinessAddress(e.target.value)}
          placeholder="Enter business address"
          disabled={savingInfo}
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
              disabled={savingInfo}
              className="h-11 w-full rounded-md bg-white py-2 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand-ring"
            />
          </div>
        </div>

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
                  disabled={savingInfo}
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

        <div className="md:col-span-2">
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
              disabled={savingInfo}
            />
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ImageUploader
            label="Upload Logo"
            value={businessLogo}
            onChange={setBusinessLogo}
            autoUpload
            heightClass="h-[130px]"
            disabled={savingInfo}
          />
          <ImageUploader
            label="Upload Cover Photo"
            value={coverImage}
            onChange={setCoverImage}
            autoUpload
            heightClass="h-[130px]"
            disabled={savingInfo}
          />
        </div>
      </div>

      {error ? <p className="text-xs text-accent-danger">{error}</p> : null}

      <div className="pt-2">
        <PrimaryButton type="submit" disabled={savingInfo}>
          {savingInfo ? 'Saving…' : submitLabel}
        </PrimaryButton>
      </div>
    </form>
  )
}
