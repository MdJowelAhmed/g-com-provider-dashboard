import { message } from 'antd'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ImageUploader from '../../../../components/common/ImageUploader'
import GoogleMapLocationPicker, {
  type GoogleMapLocationPickerRef,
} from '../../../../components/common/GoogleMapLocationPicker'
import {
  supportInputClass,
  supportLabelClass,
  supportTextareaClass,
} from '../../../../components/dashboard/support/supportFieldClasses'
import { mapUserProfileToUser } from '../../../../auth/userProfile'
import { useAuth } from '../../../../context/AuthContext'
import { resolveMediaUrl } from '../../../../redux/api/chatApi'
import {
  DELIVERY_METHOD_OPTIONS,
  type DeliveryMethodValue,
  useBusinessInformationMutation,
  useGetMyProfileQuery,
  useLazyGetMyProfileQuery,
} from '../../../../redux/api/authApi'
import { BUSINESS_MAIN_CATEGORIES } from '../../../../types/businessCategory'
import SettingsCard from '../SettingsCard'
import SettingsPrimaryButton from '../SettingsPrimaryButton'

type Props = {
  onDirty: () => void
  onSaved: () => void
}

function mediaDisplayUrl(url: string) {
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

function supportsDeliveryMethods(category?: string) {
  const key = category?.toLowerCase()
  return (
    key === BUSINESS_MAIN_CATEGORIES.SHOP ||
    key === 'shops' ||
    key === BUSINESS_MAIN_CATEGORIES.DINE
  )
}

export default function BusinessPanel({ onDirty, onSaved }: Props) {
  const { setUserFromProfile } = useAuth()
  const { data: profileResponse, isLoading } = useGetMyProfileQuery()
  const [fetchProfile] = useLazyGetMyProfileQuery()
  const [businessInformation, { isLoading: saving }] = useBusinessInformationMutation()
  const locationPickerRef = useRef<GoogleMapLocationPickerRef>(null)

  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [businessLocation, setBusinessLocation] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [businessLogo, setBusinessLogo] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodValue[]>([])
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [ok, setOk] = useState(false)

  const profile = profileResponse?.data
  const business = profile?.business
  const showDeliveryMethods = supportsDeliveryMethods(category)

  useEffect(() => {
    if (!business) return
    const coords = business.location?.coordinates
    setBusinessName(business.businessName ?? '')
    setDescription(business.description ?? '')
    setCategory(business.category ?? '')
    setBusinessPhone(business.businessPhone ?? '')
    setBusinessAddress(business.businessAddress ?? '')
    setBusinessLocation(business.businessLocation ?? '')
    setLatitude(coords?.[1] ?? null)
    setLongitude(coords?.[0] ?? null)
    setBusinessLogo(business.businessLogo ?? '')
    setCoverImage(business.coverImage ?? '')
    setDeliveryMethods((business.deliveryMethods ?? []) as DeliveryMethodValue[])
    setFacebook(business.socialLinks?.facebook ?? '')
    setInstagram(business.socialLinks?.instagram ?? '')
    setLinkedin(business.socialLinks?.linkedin ?? '')
  }, [business])

  const markDirty = () => onDirty()

  const save = async () => {
    if (!businessName.trim()) {
      message.warning('Business name is required.')
      return
    }
    if (!businessPhone.trim()) {
      message.warning('Business phone is required.')
      return
    }
    if (showDeliveryMethods && deliveryMethods.length === 0) {
      message.warning('Select at least one delivery method.')
      return
    }
    if (!businessLogo.trim() || !coverImage.trim()) {
      message.warning('Please upload both a logo and a cover image.')
      return
    }

    let resolvedLocation = businessLocation.trim()
    let lat = latitude
    let lng = longitude

    if (!resolvedLocation || lat == null || lng == null) {
      const resolved = await locationPickerRef.current?.resolveLocation()
      if (!resolved) {
        message.warning('Please enter a valid business location on the map.')
        return
      }
      resolvedLocation = resolved.locationName
      lat = resolved.latitude
      lng = resolved.longitude
      setBusinessLocation(resolvedLocation)
      setLatitude(lat)
      setLongitude(lng)
    }

    setOk(false)
    try {
      const result = await businessInformation({
        businessName: businessName.trim(),
        description: description.trim() || businessName.trim(),
        category: category.trim(),
        socialLinks: {
          facebook: facebook.trim() || undefined,
          instagram: instagram.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
        },
        coverImage: coverImage.trim(),
        businessLogo: businessLogo.trim(),
        businessAddress: businessAddress.trim() || resolvedLocation,
        businessLocation: resolvedLocation,
        deliveryMethods: showDeliveryMethods ? deliveryMethods : [],
        latitude: lat,
        longitude: lng,
        businessPhone: businessPhone.trim(),
      }).unwrap()

      const profileRes = await fetchProfile().unwrap()
      if (profileRes.success && profileRes.data) {
        setUserFromProfile(mapUserProfileToUser(profileRes.data))
      }

      onSaved()
      setOk(true)
      message.success(result.message || 'Business profile saved.')
      window.setTimeout(() => setOk(false), 2800)
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to update business profile.'))
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-16 text-sm text-gray-500">
        <Loader2 size={18} className="animate-spin" />
        Loading business profile…
      </div>
    )
  }

  if (!business) {
    return (
      <div className="rounded-xl border border-surface-border bg-surface-card px-4 py-16 text-center text-sm text-gray-500">
        No business profile found for this account.
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
          Business profile saved.
        </motion.p>
      ) : null}

      <SettingsCard
        title="Business profile"
        description="Your public listing details, branding, location, and social links."
        footer={
          <SettingsPrimaryButton onClick={save} loading={saving}>
            Save changes
          </SettingsPrimaryButton>
        }
      >
        <div className="space-y-8">
          <section className="grid gap-5 ">
            <div className='grid gap-5 grid-cols-1 md:grid-cols-2  lg:grid-cols-3'>
              <div className=" space-y-2">
                <label htmlFor="set-biz-name" className={supportLabelClass}>
                  Business name
                </label>
                <input
                  id="set-biz-name"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value)
                    markDirty()
                  }}
                  className={supportInputClass}
                  placeholder="Business or venue name"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="set-biz-category" className={supportLabelClass}>
                  Category
                </label>
                <input
                  id="set-biz-category"
                  value={category}
                  readOnly
                  className={`${supportInputClass} cursor-not-allowed capitalize opacity-70`}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="set-biz-phone" className={supportLabelClass}>
                  Business phone
                </label>
                <input
                  id="set-biz-phone"
                  type="tel"
                  value={businessPhone}
                  onChange={(e) => {
                    setBusinessPhone(e.target.value)
                    markDirty()
                  }}
                  className={supportInputClass}
                  placeholder="+233 24 123 4567"
                  disabled={saving}
                />
              </div>
            </div>


          </section>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="set-biz-desc" className={supportLabelClass}>
              Description
            </label>
            <textarea
              id="set-biz-desc"
              value={description}
              maxLength={500}
              onChange={(e) => {
                setDescription(e.target.value)
                markDirty()
              }}
              className={supportTextareaClass}
              placeholder="What customers should know about your business."
              rows={4}
              disabled={saving}
            />
            <p className="text-right text-[11px] text-gray-600">{description.length} / 500</p>
          </div>
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Branding
            </h3>
            <div className="grid gap-20 sm:grid-cols-2">
              <ImageUploader
                label="Business logo"
                required
                value={mediaDisplayUrl(businessLogo)}
                onChange={(url) => {
                  setBusinessLogo(url)
                  markDirty()
                }}
                autoUpload
                heightClass="h-80"
                hint="Square logo for your listing"
                disabled={saving}
              />
              <ImageUploader
                label="Cover image"
                required
                value={mediaDisplayUrl(coverImage)}
                onChange={(url) => {
                  setCoverImage(url)
                  markDirty()
                }}
                autoUpload
                heightClass="h-80"
                hint="Wide banner for your profile"
                disabled={saving}
              />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Location
            </h3>
            <div className="grid gap-5">
              <div className="space-y-2">
                <label htmlFor="set-biz-addr" className={supportLabelClass}>
                  Business address
                </label>
                <input
                  id="set-biz-addr"
                  value={businessAddress}
                  onChange={(e) => {
                    setBusinessAddress(e.target.value)
                    markDirty()
                  }}
                  className={supportInputClass}
                  placeholder="Street, city, region"
                  disabled={saving}
                />
              </div>
              <GoogleMapLocationPicker
                ref={locationPickerRef}
                value={{
                  locationName: businessLocation,
                  latitude,
                  longitude,
                }}
                onChange={(next) => {
                  setBusinessLocation(next.locationName)
                  setLatitude(next.latitude)
                  setLongitude(next.longitude)
                  markDirty()
                }}
                disabled={saving}
              />
            </div>
          </section>

          {showDeliveryMethods ? (
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Delivery methods
              </h3>
              <div className="flex flex-wrap gap-2">
                {DELIVERY_METHOD_OPTIONS.map((option) => {
                  const active = deliveryMethods.includes(option.value)
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setDeliveryMethods((prev) =>
                          active
                            ? prev.filter((value) => value !== option.value)
                            : [...prev, option.value],
                        )
                        markDirty()
                      }}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${active
                        ? 'border-brand bg-brand/15 text-white ring-1 ring-brand/40'
                        : 'border-surface-border text-gray-400 hover:border-brand/40 hover:text-gray-100'
                        }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Social links
            </h3>
            <div className="grid gap-5 md:gap-10 lg:gap-20 grid-cols-1 md:grid-cols-2  lg:grid-cols-3">
              <SocialField
                id="soc-fb"
                label="Facebook"
                value={facebook}
                onChange={setFacebook}
                placeholder="https://www.facebook.com/yourbusiness"
                disabled={saving}
                onDirty={markDirty}
              />
              <SocialField
                id="soc-ig"
                label="Instagram"
                value={instagram}
                onChange={setInstagram}
                placeholder="https://www.instagram.com/yourbusiness"
                disabled={saving}
                onDirty={markDirty}
              />
              <SocialField
                id="soc-li"
                label="LinkedIn"
                value={linkedin}
                onChange={setLinkedin}
                placeholder="https://www.linkedin.com/company/..."
                disabled={saving}
                onDirty={markDirty}
              />
            </div>
          </section>
        </div>
      </SettingsCard>
    </motion.div>
  )
}

function SocialField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  onDirty,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
  onDirty: () => void
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={supportLabelClass}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          onDirty()
        }}
        className={supportInputClass}
        placeholder={placeholder}
        inputMode="url"
        disabled={disabled}
      />
    </div>
  )
}
