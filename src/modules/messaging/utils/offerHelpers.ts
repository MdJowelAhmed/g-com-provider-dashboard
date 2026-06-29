import type { CustomOfferItemType, CustomOfferMeta } from '../../../redux/api/chatApi'
import {
  BUSINESS_MAIN_CATEGORIES,
  type BusinessMainCategory,
} from '../../../types/businessCategory'

export type OfferMetaInput = {
  startTime?: string
  deliveryMethod?: string
  checkIn?: string
  checkOut?: string
  adult?: number
  children?: number
  eventDate?: string
}

export const OFFER_DELIVERY_METHOD_OPTIONS = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'in-house-delivery', label: 'In-house delivery' },
  { value: 'external-delivery', label: 'External delivery' },
] as const

export function normalizeBusinessCategory(raw?: string): BusinessMainCategory {
  const key = raw?.trim().toLowerCase()
  switch (key) {
    case BUSINESS_MAIN_CATEGORIES.STAY:
      return BUSINESS_MAIN_CATEGORIES.STAY
    case BUSINESS_MAIN_CATEGORIES.DINE:
      return BUSINESS_MAIN_CATEGORIES.DINE
    case BUSINESS_MAIN_CATEGORIES.SHOP:
    case 'shops':
      return BUSINESS_MAIN_CATEGORIES.SHOP
    case BUSINESS_MAIN_CATEGORIES.EVENT:
    case 'events':
      return BUSINESS_MAIN_CATEGORIES.EVENT
    case BUSINESS_MAIN_CATEGORIES.SERVICES:
    case 'service':
    default:
      return BUSINESS_MAIN_CATEGORIES.SERVICES
  }
}

export function itemTypeForCategory(category: BusinessMainCategory): CustomOfferItemType {
  switch (category) {
    case BUSINESS_MAIN_CATEGORIES.SHOP:
    case BUSINESS_MAIN_CATEGORIES.DINE:
      return 'Product'
    case BUSINESS_MAIN_CATEGORIES.EVENT:
      return 'Event'
    case BUSINESS_MAIN_CATEGORIES.STAY:
      return 'Room'
    case BUSINESS_MAIN_CATEGORIES.SERVICES:
    default:
      return 'Service'
  }
}

export function supportsDeliveryFee(category: BusinessMainCategory) {
  return (
    category === BUSINESS_MAIN_CATEGORIES.SHOP ||
    category === BUSINESS_MAIN_CATEGORIES.DINE
  )
}

export function catalogEmptyLabel(category: BusinessMainCategory) {
  switch (category) {
    case BUSINESS_MAIN_CATEGORIES.STAY:
      return 'No rooms found. Add a room first to send an offer.'
    case BUSINESS_MAIN_CATEGORIES.SHOP:
      return 'No products found. Add a product first to send an offer.'
    case BUSINESS_MAIN_CATEGORIES.DINE:
      return 'No menu items found. Add a menu item first to send an offer.'
    case BUSINESS_MAIN_CATEGORIES.EVENT:
      return 'No events found. Add an event first to send an offer.'
    case BUSINESS_MAIN_CATEGORIES.SERVICES:
    default:
      return 'No services found. Add a service first to send an offer.'
  }
}

export function catalogItemLabel(category: BusinessMainCategory) {
  switch (category) {
    case BUSINESS_MAIN_CATEGORIES.STAY:
      return 'Room'
    case BUSINESS_MAIN_CATEGORIES.SHOP:
      return 'Product'
    case BUSINESS_MAIN_CATEGORIES.DINE:
      return 'Menu item'
    case BUSINESS_MAIN_CATEGORIES.EVENT:
      return 'Event'
    case BUSINESS_MAIN_CATEGORIES.SERVICES:
    default:
      return 'Service'
  }
}

export function toIsoStartTime(localValue: string) {
  if (!localValue.trim()) return undefined
  const d = new Date(localValue)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

export function buildOfferMeta(
  category: BusinessMainCategory,
  input: OfferMetaInput,
): CustomOfferMeta | undefined {
  switch (category) {
    case BUSINESS_MAIN_CATEGORIES.SERVICES: {
      const startTime = toIsoStartTime(input.startTime ?? '')
      return startTime ? { startTime } : undefined
    }
    case BUSINESS_MAIN_CATEGORIES.SHOP:
    case BUSINESS_MAIN_CATEGORIES.DINE:
      return input.deliveryMethod ? { deliveryMethod: input.deliveryMethod } : undefined
    case BUSINESS_MAIN_CATEGORIES.STAY: {
      if (!input.checkIn && !input.checkOut) return undefined
      return {
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        adult: input.adult,
        children: input.children,
      }
    }
    case BUSINESS_MAIN_CATEGORIES.EVENT:
      return input.eventDate ? { eventDate: input.eventDate } : undefined
    default:
      return undefined
  }
}
