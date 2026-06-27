import type { ServicePricingType } from '../../../redux/api/serviceApi'

export type PricingType = ServicePricingType

/** Platform category slug for sub-categories API (`?category=`). */
export type PlatformCategory = 'services' | 'stay' | 'dine' | 'shop' | 'event'

export const PLATFORM_CATEGORIES: PlatformCategory[] = [
  'services',
  'stay',
  'dine',
  'shop',
  'event',
]

export const PLATFORM_CATEGORY_OPTIONS: { value: PlatformCategory; label: string }[] = [
  { value: 'services', label: 'Services' },
  { value: 'stay', label: 'Stay' },
  { value: 'dine', label: 'Dine' },
  { value: 'shop', label: 'Shop' },
  { value: 'event', label: 'Event' },
]

export function dashboardRoleToPlatformCategory(role: string): PlatformCategory {
  const key = role.trim().toLowerCase()
  const map: Record<string, PlatformCategory> = {
    services: 'services',
    service: 'services',
    stay: 'stay',
    hotel: 'stay',
    dine: 'dine',
    restaurant: 'dine',
    shops: 'shop',
    shop: 'shop',
    events: 'event',
    event: 'event',
  }
  return map[key] ?? 'services'
}

export function businessCategoryToPlatformCategory(category: string | undefined): PlatformCategory {
  if (!category?.trim()) return 'services'
  return dashboardRoleToPlatformCategory(category)
}

export type Service = {
  id: string
  name: string
  serviceCode: string
  platformCategory: PlatformCategory | ''
  subCategoryId: string
  subCategoryName?: string
  businessCategoryId: string
  businessCategoryName?: string
  branchId: string
  branchName?: string
  description: string
  pricingType: PricingType
  price: number
  duration: string
  maxBookingPerDay: number
  image: string
  status: string
  createdAt: string
  updatedAt: string
}

export type ServiceFormValues = {
  name: string
  serviceCode: string
  platformCategory: PlatformCategory | ''
  subCategory: string
  businessCategory: string
  description: string
  pricingType: PricingType
  price: number
  duration: string
  maxBookingPerDay: number
  branch: string
  image: string
}

export const PRICING_TYPE_OPTIONS: { value: PricingType; label: string }[] = [
  { value: 'fixed', label: 'Fixed price' },
  { value: 'per_hour', label: 'Per hour' },
  { value: 'request_a_quote', label: 'Request a quote' },
]
