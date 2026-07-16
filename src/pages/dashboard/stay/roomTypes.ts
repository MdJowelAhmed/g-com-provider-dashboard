import type { PlatformCategory } from '../services/serviceTypes'

export type RoomFormValues = {
  name: string
  roomNumber: string
  roomCode: string
  roomType: string
  bedType: string
  size: string
  basePrice: number
  category: PlatformCategory | ''
  subCategory: string
  businessCategory: string
  branch: string
  description: string
  bedCount: number
  maxAdult: number
  maxChildren: number
  totalGuest: number
  otherAmenities: string[]
  image: string
}

export type Room = {
  id: string
  name: string
  roomNumber: string
  roomCode: string
  roomType: string
  bedType: string
  size: string
  basePrice: number
  subCategoryId: string
  subCategoryName?: string
  businessCategoryId: string
  businessCategoryName?: string
  branchId: string
  branchName?: string
  description: string
  bedCount: number
  maxAdult: number
  maxChildren: number
  totalGuest: number
  otherAmenities: string[]
  image: string
  status: string
  mainCategory?: string
  createdAt: string
  updatedAt: string
}

export const ROOM_TYPE_OPTIONS = [
  'Standard',
  'Deluxe',
  'Suite',
  'Family',
  'Executive',
  'Presidential',
  'Dormitory',
]

export const BED_TYPE_OPTIONS = [
  'Single',
  'Double',
  'Queen',
  'King',
  'Twin',
  'Bunk',
  'Sofa bed',
]

export const ROOM_AMENITIES = [
  'Free WiFi',
  'Air Conditioning',
  'Smart TV',
  'Mini Bar',
  'Breakfast Included',
  'Room Service',
]

export const ROOM_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]
