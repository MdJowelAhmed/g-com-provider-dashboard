export type EventLocation = {
  type: 'Point'
  coordinates: [number, number]
}

import type { PlatformCategory } from '../services/serviceTypes'

export type EventFormValues = {
  name: string
  description: string
  startTime: string
  endTime: string
  registrationDeadline: string
  locationName: string
  latitude: number | null
  longitude: number | null
  maxCapacity: number
  ticketPrice: number
  image: string
  category: PlatformCategory | ''
  subCategory: string
  businessCategory: string
  organizerName: string
  branch: string
}

export type Event = {
  id: string
  name: string
  description: string
  startTime: string
  endTime: string
  registrationDeadline: string
  location: EventLocation | null
  maxCapacity: number
  bookedCapacity: number
  ticketPrice: number
  image: string
  status: string
  mainCategory?: string
  organizerName?: string
  branchId?: string
  branchName?: string
  subCategoryId?: string
  subCategoryName?: string
  businessCategoryId?: string
  businessCategoryName?: string
  createdAt: string
  updatedAt: string
}

export const EVENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]
