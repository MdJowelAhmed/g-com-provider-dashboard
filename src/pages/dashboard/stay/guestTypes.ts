export type GuestIdType = 'passport' | 'national_id' | 'driver_license' | 'other'

export type GuestRecentStayStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'

export type GuestRecentStay = {
  id: string
  code: string
  roomNumber: string
  roomName: string
  checkIn: string
  checkOut: string
  nights: number
  amount: number
  status: GuestRecentStayStatus
}

export type Guest = {
  id: string
  name: string
  avatar?: string
  phone: string
  email: string
  country: string
  idType: GuestIdType
  idNumber: string

  firstStayAt: string
  lastStayAt: string | null
  lastRoomName: string | null
  preferredRoomType: string | null

  totalStays: number
  completedStays: number
  cancelledStays: number
  totalNights: number
  totalSpent: number
  averageRating: number | null

  languages: string
  preferences: string
  tags: string
  notes: string

  recentStays: GuestRecentStay[]
}

export const GUEST_ID_TYPE_LABELS: Record<GuestIdType, string> = {
  passport: 'Passport',
  national_id: 'National ID',
  driver_license: 'Driver licence',
  other: 'Other',
}

export const INITIAL_GUESTS: Guest[] = [
  {
    id: 'g_3001',
    name: 'Mateus Silva',
    avatar: 'https://i.pravatar.cc/80?img=14',
    phone: '+55 11 9876 5432',
    email: 'mateus.s@example.com',
    country: 'Brazil',
    idType: 'passport',
    idNumber: 'BR8821451',
    firstStayAt: '2026-04-20T00:00:00.000Z',
    lastStayAt: '2026-04-20T00:00:00.000Z',
    lastRoomName: 'Deluxe Double — Sea View',
    preferredRoomType: 'Deluxe',
    totalStays: 1,
    completedStays: 0,
    cancelledStays: 0,
    totalNights: 5,
    totalSpent: 859,
    averageRating: null,
    languages: 'Portuguese, English',
    preferences: 'High floor, quiet room, late check-out preferred.',
    tags: 'honeymoon, first-time',
    notes: 'Currently in-house. Anniversary gifts placed on arrival.',
    recentStays: [
      {
        id: 'sb_2003',
        code: 'RSV-2026-0420-007',
        roomNumber: '205',
        roomName: 'Deluxe Double — Sea View',
        checkIn: '2026-04-20',
        checkOut: '2026-04-25',
        nights: 5,
        amount: 859,
        status: 'checked_in',
      },
    ],
  },
  {
    id: 'g_3002',
    name: 'Emma Wallace',
    avatar: 'https://i.pravatar.cc/80?img=48',
    phone: '+44 20 7946 0321',
    email: 'emma.w@example.com',
    country: 'United Kingdom',
    idType: 'passport',
    idNumber: 'GB2298745',
    firstStayAt: '2025-11-12T00:00:00.000Z',
    lastStayAt: '2026-04-28T00:00:00.000Z',
    lastRoomName: 'Family Suite — Garden',
    preferredRoomType: 'Family',
    totalStays: 3,
    completedStays: 2,
    cancelledStays: 0,
    totalNights: 12,
    totalSpent: 2580,
    averageRating: 4.7,
    languages: 'English',
    preferences: 'Garden-view, crib for infant, hypoallergenic bedding.',
    tags: 'returning, family',
    notes: 'Second stay of the year. Prefers the same garden-view suite.',
    recentStays: [
      {
        id: 'sb_2002',
        code: 'RSV-2026-0428-011',
        roomNumber: '301',
        roomName: 'Family Suite — Garden',
        checkIn: '2026-04-28',
        checkOut: '2026-05-02',
        nights: 4,
        amount: 995,
        status: 'confirmed',
      },
      {
        id: 'sb_1990',
        code: 'RSV-2025-1112-003',
        roomNumber: '301',
        roomName: 'Family Suite — Garden',
        checkIn: '2025-11-12',
        checkOut: '2025-11-17',
        nights: 5,
        amount: 1120,
        status: 'checked_out',
      },
    ],
  },
  {
    id: 'g_3003',
    name: 'Priya Kapoor',
    avatar: 'https://i.pravatar.cc/80?img=32',
    phone: '+1 555 661 0049',
    email: 'priya.k@example.com',
    country: 'India',
    idType: 'passport',
    idNumber: 'IN4512089',
    firstStayAt: '2026-04-10T00:00:00.000Z',
    lastStayAt: '2026-04-10T00:00:00.000Z',
    lastRoomName: 'Deluxe Double — Sea View',
    preferredRoomType: 'Deluxe',
    totalStays: 1,
    completedStays: 1,
    cancelledStays: 0,
    totalNights: 4,
    totalSpent: 627,
    averageRating: 5,
    languages: 'English, Hindi',
    preferences: 'Vegetarian breakfast, extra towels.',
    tags: 'family, high-rating',
    notes: '5★ review. Explicitly mentioned staff warmth.',
    recentStays: [
      {
        id: 'sb_2004',
        code: 'RSV-2026-0410-003',
        roomNumber: '205',
        roomName: 'Deluxe Double — Sea View',
        checkIn: '2026-04-10',
        checkOut: '2026-04-14',
        nights: 4,
        amount: 627,
        status: 'checked_out',
      },
    ],
  },
  {
    id: 'g_3004',
    name: 'Hiroshi Tanaka',
    avatar: 'https://i.pravatar.cc/80?img=52',
    phone: '+81 90 1234 5678',
    email: 'hiroshi.t@example.com',
    country: 'Japan',
    idType: 'passport',
    idNumber: 'TK5521893',
    firstStayAt: '2026-04-18T00:00:00.000Z',
    lastStayAt: '2026-05-15T00:00:00.000Z',
    lastRoomName: 'Deluxe Twin — Pool View',
    preferredRoomType: 'Deluxe',
    totalStays: 1,
    completedStays: 0,
    cancelledStays: 0,
    totalNights: 3,
    totalSpent: 544,
    averageRating: null,
    languages: 'Japanese, basic English',
    preferences: 'Non-smoking floor, airport transfer at 22:00.',
    tags: 'new',
    notes: '',
    recentStays: [
      {
        id: 'sb_2001',
        code: 'RSV-2026-0515-004',
        roomNumber: '206',
        roomName: 'Deluxe Twin — Pool View',
        checkIn: '2026-05-15',
        checkOut: '2026-05-18',
        nights: 3,
        amount: 544,
        status: 'pending',
      },
    ],
  },
  {
    id: 'g_3005',
    name: 'Lucas Moreau',
    avatar: 'https://i.pravatar.cc/80?img=33',
    phone: '+33 6 12 34 56 78',
    email: 'lucas.m@example.com',
    country: 'France',
    idType: 'national_id',
    idNumber: 'FR-882145',
    firstStayAt: '2026-03-20T00:00:00.000Z',
    lastStayAt: '2026-03-20T00:00:00.000Z',
    lastRoomName: 'Standard Single — City',
    preferredRoomType: 'Standard',
    totalStays: 1,
    completedStays: 1,
    cancelledStays: 0,
    totalNights: 2,
    totalSpent: 146,
    averageRating: 4,
    languages: 'French, English',
    preferences: '',
    tags: 'walk-in, budget',
    notes: 'Paid cash on arrival. Noted shower pressure feedback.',
    recentStays: [
      {
        id: 'sb_2005',
        code: 'RSV-2026-0320-015',
        roomNumber: '101',
        roomName: 'Standard Single — City',
        checkIn: '2026-03-20',
        checkOut: '2026-03-22',
        nights: 2,
        amount: 146,
        status: 'checked_out',
      },
    ],
  },
  {
    id: 'g_3006',
    name: 'Sebastian Keller',
    avatar: 'https://i.pravatar.cc/80?img=15',
    phone: '+49 151 2345 6789',
    email: 'sebastian.k@example.com',
    country: 'Germany',
    idType: 'passport',
    idNumber: 'DE9823441',
    firstStayAt: '2025-08-02T00:00:00.000Z',
    lastStayAt: '2026-05-01T00:00:00.000Z',
    lastRoomName: 'Presidential Suite — Panoramic',
    preferredRoomType: 'Presidential',
    totalStays: 2,
    completedStays: 1,
    cancelledStays: 1,
    totalNights: 3,
    totalSpent: 1680,
    averageRating: 5,
    languages: 'German, English',
    preferences: 'Rose petals and champagne on anniversary trips.',
    tags: 'anniversary, premium',
    notes: 'Cancelled recent trip due to family emergency; no penalty.',
    recentStays: [
      {
        id: 'sb_2006',
        code: 'RSV-2026-0501-021',
        roomNumber: '501',
        roomName: 'Presidential Suite — Panoramic',
        checkIn: '2026-05-01',
        checkOut: '2026-05-05',
        nights: 4,
        amount: 2166,
        status: 'cancelled',
      },
      {
        id: 'sb_1870',
        code: 'RSV-2025-0802-019',
        roomNumber: '501',
        roomName: 'Presidential Suite — Panoramic',
        checkIn: '2025-08-02',
        checkOut: '2025-08-05',
        nights: 3,
        amount: 1680,
        status: 'checked_out',
      },
    ],
  },
  {
    id: 'g_3007',
    name: 'Nora Johansen',
    phone: '+47 412 34 567',
    email: 'nora.j@example.com',
    country: 'Norway',
    idType: 'passport',
    idNumber: 'NO5521118',
    firstStayAt: '2026-04-08T00:00:00.000Z',
    lastStayAt: '2026-04-15T00:00:00.000Z',
    lastRoomName: 'Budget Double — Non-AC',
    preferredRoomType: 'Standard',
    totalStays: 1,
    completedStays: 0,
    cancelledStays: 0,
    totalNights: 0,
    totalSpent: 30,
    averageRating: null,
    languages: 'Norwegian, English',
    preferences: '',
    tags: 'no-show',
    notes: 'Did not arrive. Deposit retained per policy.',
    recentStays: [
      {
        id: 'sb_2007',
        code: 'RSV-2026-0415-009',
        roomNumber: '102',
        roomName: 'Budget Double — Non-AC',
        checkIn: '2026-04-15',
        checkOut: '2026-04-17',
        nights: 2,
        amount: 101,
        status: 'no_show',
      },
    ],
  },
  {
    id: 'g_3008',
    name: 'Olivia Park',
    avatar: 'https://i.pravatar.cc/80?img=44',
    phone: '+82 10 8888 1122',
    email: 'olivia.p@example.com',
    country: 'South Korea',
    idType: 'passport',
    idNumber: 'KR7712498',
    firstStayAt: '2025-02-14T00:00:00.000Z',
    lastStayAt: '2026-03-11T00:00:00.000Z',
    lastRoomName: 'Deluxe Double — Sea View',
    preferredRoomType: 'Deluxe',
    totalStays: 8,
    completedStays: 8,
    cancelledStays: 0,
    totalNights: 21,
    totalSpent: 4680,
    averageRating: 4.8,
    languages: 'Korean, English',
    preferences: 'Early check-in (needs room by 11am), soft pillows, oat milk for coffee.',
    tags: 'corporate, repeat, early-checkin',
    notes: 'Monthly business traveler. Flag early check-in with housekeeping.',
    recentStays: [
      {
        id: 'sb_1921',
        code: 'RSV-2026-0311-001',
        roomNumber: '205',
        roomName: 'Deluxe Double — Sea View',
        checkIn: '2026-03-11',
        checkOut: '2026-03-14',
        nights: 3,
        amount: 540,
        status: 'checked_out',
      },
      {
        id: 'sb_1880',
        code: 'RSV-2026-0218-006',
        roomNumber: '205',
        roomName: 'Deluxe Double — Sea View',
        checkIn: '2026-02-18',
        checkOut: '2026-02-21',
        nights: 3,
        amount: 540,
        status: 'checked_out',
      },
    ],
  },
  {
    id: 'g_3009',
    name: 'Ahmed Yusuf',
    avatar: 'https://i.pravatar.cc/80?img=11',
    phone: '+971 50 123 4567',
    email: 'ahmed.y@example.com',
    country: 'United Arab Emirates',
    idType: 'passport',
    idNumber: 'AE1109228',
    firstStayAt: '2024-12-05T00:00:00.000Z',
    lastStayAt: '2026-02-01T00:00:00.000Z',
    lastRoomName: 'Presidential Suite — Panoramic',
    preferredRoomType: 'Presidential',
    totalStays: 5,
    completedStays: 5,
    cancelledStays: 0,
    totalNights: 18,
    totalSpent: 9720,
    averageRating: 5,
    languages: 'Arabic, English',
    preferences: 'Halal meals, prayer mat, bottled Evian, butler service.',
    tags: 'vip, premium, halal',
    notes: 'High-value guest. Always requests Presidential Suite and butler.',
    recentStays: [
      {
        id: 'sb_1850',
        code: 'RSV-2026-0201-002',
        roomNumber: '501',
        roomName: 'Presidential Suite — Panoramic',
        checkIn: '2026-02-01',
        checkOut: '2026-02-05',
        nights: 4,
        amount: 2166,
        status: 'checked_out',
      },
    ],
  },
]
