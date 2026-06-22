import type { ShopApiDoc, ShopDay } from '../../../redux/api/shopManagementApi'

export type ShopBranch = {
  id: string
  branchName: string
  contact: string
  locationName: string
  latitude: number
  longitude: number
  openTime: string
  closeTime: string
  availableDay: ShopDay[]
  description: string
  timeZone: string
  createdAt: string
  updatedAt: string
}

export const WEEKDAY_OPTIONS: { value: ShopDay; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

export function weekdayLabel(day: ShopDay) {
  return WEEKDAY_OPTIONS.find((o) => o.value === day)?.label ?? day
}

export function mapShopFromApi(doc: ShopApiDoc): ShopBranch {
  const [longitude, latitude] = doc.location.coordinates

  return {
    id: doc._id,
    branchName: doc.branchName,
    contact: doc.contact,
    locationName: doc.locationName ?? '',
    latitude,
    longitude,
    openTime: doc.openTime ?? '08:00',
    closeTime: doc.closeTime ?? '22:00',
    availableDay: doc.availableDay ?? [],
    description: doc.description ?? '',
    timeZone: doc.timeZone,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}
