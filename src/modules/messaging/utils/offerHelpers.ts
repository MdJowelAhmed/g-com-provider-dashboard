import type { CustomOfferItemType } from '../../../redux/api/chatApi'
import type { Role } from '../../../types/role'

export function itemTypeForRole(role: Role): CustomOfferItemType {
  switch (role) {
    case 'shops':
      return 'Product'
    case 'dine':
      return 'MenuItem'
    case 'events':
      return 'Event'
    case 'stay':
      return 'Room'
    case 'services':
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
