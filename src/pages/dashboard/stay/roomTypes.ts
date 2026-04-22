export type RoomOperationalStatus =
  | 'available'
  | 'occupied'
  | 'cleaning'
  | 'maintenance'
  | 'out_of_service'

export type RoomPublishStatus = 'active' | 'draft' | 'archived'

export type BedType =
  | 'single'
  | 'double'
  | 'queen'
  | 'king'
  | 'twin'
  | 'bunk'
  | 'sofa_bed'

export type ViewType =
  | 'city'
  | 'sea'
  | 'garden'
  | 'pool'
  | 'mountain'
  | 'courtyard'
  | 'none'

export type Room = {
  id: string
  image: string
  roomNumber: string
  name: string
  code: string
  roomType: string
  description: string

  floor: number
  sizeSqm: number | null

  bedType: BedType
  bedCount: number
  maxAdults: number
  maxChildren: number
  extraBedAvailable: boolean

  basePrice: number
  weekendPrice: number | null
  extraBedPrice: number | null

  hasAc: boolean
  hasWifi: boolean
  breakfastIncluded: boolean
  viewType: ViewType
  smokingAllowed: boolean
  petsAllowed: boolean
  amenities: string[]

  minNights: number
  maxNights: number | null
  cancellationPolicy: string

  status: RoomOperationalStatus
  publishStatus: RoomPublishStatus
  hidden: boolean
  featured: boolean
  createdAt: string
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

export const BED_TYPE_OPTIONS: { value: BedType; label: string }[] = [
  { value: 'single', label: 'Single bed' },
  { value: 'double', label: 'Double bed' },
  { value: 'queen', label: 'Queen bed' },
  { value: 'king', label: 'King bed' },
  { value: 'twin', label: 'Twin beds' },
  { value: 'bunk', label: 'Bunk beds' },
  { value: 'sofa_bed', label: 'Sofa bed' },
]

export const VIEW_TYPE_OPTIONS: { value: ViewType; label: string }[] = [
  { value: 'none', label: 'No view' },
  { value: 'city', label: 'City view' },
  { value: 'sea', label: 'Sea / Ocean view' },
  { value: 'garden', label: 'Garden view' },
  { value: 'pool', label: 'Pool view' },
  { value: 'mountain', label: 'Mountain view' },
  { value: 'courtyard', label: 'Courtyard' },
]

export const ROOM_OPERATIONAL_STATUS_OPTIONS: {
  value: RoomOperationalStatus
  label: string
}[] = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'out_of_service', label: 'Out of service' },
]

export const ROOM_PUBLISH_STATUS_OPTIONS: {
  value: RoomPublishStatus
  label: string
}[] = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
]

export const ROOM_AMENITIES = [
  'TV',
  'Minibar',
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
  'Room service',
  'Soundproofing',
  'Blackout curtains',
  'Wheelchair accessible',
]

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'r_1001',
    image:
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=400&q=80',
    roomNumber: '101',
    name: 'Standard Single — City',
    code: 'STD-SGL-101',
    roomType: 'Standard',
    description: 'Compact single room perfect for solo travelers. Quiet, facing the city street.',
    floor: 1,
    sizeSqm: 16,
    bedType: 'single',
    bedCount: 1,
    maxAdults: 1,
    maxChildren: 0,
    extraBedAvailable: false,
    basePrice: 65,
    weekendPrice: 75,
    extraBedPrice: null,
    hasAc: true,
    hasWifi: true,
    breakfastIncluded: true,
    viewType: 'city',
    smokingAllowed: false,
    petsAllowed: false,
    amenities: ['TV', 'Work desk', 'Hair dryer', 'Shower'],
    minNights: 1,
    maxNights: 30,
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    status: 'available',
    publishStatus: 'active',
    hidden: false,
    featured: false,
    createdAt: '2026-01-14T09:00:00.000Z',
  },
  {
    id: 'r_1002',
    image:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80',
    roomNumber: '102',
    name: 'Budget Double — Non-AC',
    code: 'BDG-DBL-102',
    roomType: 'Standard',
    description: 'Affordable double room without AC. Ceiling fan, window for cross ventilation.',
    floor: 1,
    sizeSqm: 18,
    bedType: 'double',
    bedCount: 1,
    maxAdults: 2,
    maxChildren: 1,
    extraBedAvailable: true,
    basePrice: 45,
    weekendPrice: 55,
    extraBedPrice: 15,
    hasAc: false,
    hasWifi: true,
    breakfastIncluded: false,
    viewType: 'city',
    smokingAllowed: false,
    petsAllowed: false,
    amenities: ['TV', 'Shower'],
    minNights: 1,
    maxNights: null,
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    status: 'cleaning',
    publishStatus: 'active',
    hidden: false,
    featured: false,
    createdAt: '2026-01-14T09:05:00.000Z',
  },
  {
    id: 'r_1003',
    image:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80',
    roomNumber: '205',
    name: 'Deluxe Double — Sea View',
    code: 'DLX-DBL-OV-205',
    roomType: 'Deluxe',
    description: 'Spacious deluxe room with king bed and floor-to-ceiling sea-view windows.',
    floor: 2,
    sizeSqm: 32,
    bedType: 'king',
    bedCount: 1,
    maxAdults: 2,
    maxChildren: 2,
    extraBedAvailable: true,
    basePrice: 140,
    weekendPrice: 170,
    extraBedPrice: 25,
    hasAc: true,
    hasWifi: true,
    breakfastIncluded: true,
    viewType: 'sea',
    smokingAllowed: false,
    petsAllowed: false,
    amenities: [
      'TV',
      'Minibar',
      'Balcony',
      'Safe',
      'Bathtub',
      'Hair dryer',
      'Coffee maker',
      'Blackout curtains',
    ],
    minNights: 1,
    maxNights: null,
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    status: 'occupied',
    publishStatus: 'active',
    hidden: false,
    featured: true,
    createdAt: '2026-01-14T09:10:00.000Z',
  },
  {
    id: 'r_1004',
    image:
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=400&q=80',
    roomNumber: '206',
    name: 'Deluxe Twin — Pool View',
    code: 'DLX-TWN-PV-206',
    roomType: 'Deluxe',
    description: 'Two twin beds, pool-facing balcony. Ideal for friends traveling together.',
    floor: 2,
    sizeSqm: 30,
    bedType: 'twin',
    bedCount: 2,
    maxAdults: 2,
    maxChildren: 2,
    extraBedAvailable: false,
    basePrice: 150,
    weekendPrice: 180,
    extraBedPrice: null,
    hasAc: true,
    hasWifi: true,
    breakfastIncluded: true,
    viewType: 'pool',
    smokingAllowed: false,
    petsAllowed: false,
    amenities: [
      'TV',
      'Minibar',
      'Balcony',
      'Safe',
      'Hair dryer',
      'Coffee maker',
      'Iron',
    ],
    minNights: 1,
    maxNights: null,
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    status: 'available',
    publishStatus: 'active',
    hidden: false,
    featured: false,
    createdAt: '2026-01-14T09:12:00.000Z',
  },
  {
    id: 'r_1005',
    image:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80',
    roomNumber: '301',
    name: 'Family Suite — Garden',
    code: 'SUT-FAM-GV-301',
    roomType: 'Family',
    description: 'Two-bedroom suite with living area. Sleeps 4 adults + 2 children comfortably.',
    floor: 3,
    sizeSqm: 55,
    bedType: 'queen',
    bedCount: 2,
    maxAdults: 4,
    maxChildren: 2,
    extraBedAvailable: true,
    basePrice: 220,
    weekendPrice: 260,
    extraBedPrice: 30,
    hasAc: true,
    hasWifi: true,
    breakfastIncluded: true,
    viewType: 'garden',
    smokingAllowed: false,
    petsAllowed: true,
    amenities: [
      'TV',
      'Minibar',
      'Balcony',
      'Safe',
      'Bathtub',
      'Kitchenette',
      'Refrigerator',
      'Coffee maker',
      'Room service',
      'Blackout curtains',
    ],
    minNights: 2,
    maxNights: null,
    cancellationPolicy: 'Free cancellation up to 72 hours before check-in.',
    status: 'available',
    publishStatus: 'active',
    hidden: false,
    featured: true,
    createdAt: '2026-01-14T09:18:00.000Z',
  },
  {
    id: 'r_1006',
    image:
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=400&q=80',
    roomNumber: '501',
    name: 'Presidential Suite — Panoramic',
    code: 'SUT-PRE-501',
    roomType: 'Presidential',
    description: 'Top-floor flagship suite with panoramic sea view, private terrace, and butler service.',
    floor: 5,
    sizeSqm: 110,
    bedType: 'king',
    bedCount: 1,
    maxAdults: 2,
    maxChildren: 2,
    extraBedAvailable: true,
    basePrice: 450,
    weekendPrice: 550,
    extraBedPrice: 60,
    hasAc: true,
    hasWifi: true,
    breakfastIncluded: true,
    viewType: 'sea',
    smokingAllowed: false,
    petsAllowed: true,
    amenities: [
      'TV',
      'Minibar',
      'Balcony',
      'Safe',
      'Bathtub',
      'Kitchenette',
      'Refrigerator',
      'Coffee maker',
      'Room service',
      'Soundproofing',
      'Blackout curtains',
      'Work desk',
    ],
    minNights: 2,
    maxNights: null,
    cancellationPolicy: 'Non-refundable within 7 days of check-in.',
    status: 'maintenance',
    publishStatus: 'active',
    hidden: false,
    featured: true,
    createdAt: '2026-01-14T09:22:00.000Z',
  },
]
