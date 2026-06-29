export type RoomFormValues = {
  name: string
  roomNumber: string
  roomCode: string
  roomType: string
  bedType: string
  size: string
  basePrice: number
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
  'Balcony',
  'Safe',
  'Bathtub',
  'Shower',
  'Hair dryer',
  'Iron',
  'Work desk',
  'Kitchenette',
  'Coffee maker',
  'Refrigerator',
  'Soundproofing',
  'Blackout curtains',
  'Wheelchair accessible',
]

export const ROOM_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]
