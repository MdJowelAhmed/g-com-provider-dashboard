export type StayBookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'

export type StayPaymentStatus = 'unpaid' | 'deposit' | 'partial' | 'paid' | 'refunded'

export type StayPaymentMethod = 'card' | 'cash' | 'wallet' | 'bank_transfer'

export type BookingSource =
  | 'direct'
  | 'booking_com'
  | 'expedia'
  | 'airbnb'
  | 'walk_in'
  | 'phone'
  | 'agent'

export type GuestIdType = 'passport' | 'national_id' | 'driver_license' | 'other'

export type StayBookingGuest = {
  name: string
  phone: string
  email: string
  idType: GuestIdType
  idNumber: string
  country: string
  avatar?: string
}

export type StayBookingRoom = {
  id: string
  roomNumber: string
  name: string
  roomType: string
  nightlyRate: number
}

export type StayBookingReview = {
  rating: number
  comment: string
  createdAt: string
}

export type StayBooking = {
  id: string
  code: string
  guest: StayBookingGuest
  room: StayBookingRoom

  checkIn: string
  checkOut: string
  nights: number

  adults: number
  children: number

  addons: string
  baseAmount: number
  taxesFees: number
  addonAmount: number
  discount: number
  totalAmount: number
  paidAmount: number

  paymentStatus: StayPaymentStatus
  paymentMethod: StayPaymentMethod
  source: BookingSource

  specialRequests: string
  internalNotes: string
  arrivalEta: string

  status: StayBookingStatus
  review: StayBookingReview | null

  createdAt: string
  updatedAt: string
}

export const STAY_BOOKING_STATUS_OPTIONS: { value: StayBookingStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked in' },
  { value: 'checked_out', label: 'Checked out' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No-show' },
]

export const STAY_PAYMENT_STATUS_OPTIONS: { value: StayPaymentStatus; label: string }[] = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'deposit', label: 'Deposit paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid in full' },
  { value: 'refunded', label: 'Refunded' },
]

export const STAY_PAYMENT_METHOD_LABELS: Record<StayPaymentMethod, string> = {
  card: 'Card',
  cash: 'Cash',
  wallet: 'Wallet',
  bank_transfer: 'Bank transfer',
}

export const BOOKING_SOURCE_LABELS: Record<BookingSource, string> = {
  direct: 'Direct website',
  booking_com: 'Booking.com',
  expedia: 'Expedia',
  airbnb: 'Airbnb',
  walk_in: 'Walk-in',
  phone: 'Phone',
  agent: 'Travel agent',
}

export const GUEST_ID_TYPE_LABELS: Record<GuestIdType, string> = {
  passport: 'Passport',
  national_id: 'National ID',
  driver_license: 'Driver licence',
  other: 'Other',
}

export const INITIAL_STAY_BOOKINGS: StayBooking[] = [
  {
    id: 'sb_2001',
    code: 'RSV-2026-0515-004',
    guest: {
      name: 'Hiroshi Tanaka',
      phone: '+81 90 1234 5678',
      email: 'hiroshi.t@example.com',
      idType: 'passport',
      idNumber: 'TK5521893',
      country: 'Japan',
      avatar: 'https://i.pravatar.cc/80?img=52',
    },
    room: {
      id: 'r_1004',
      roomNumber: '206',
      name: 'Deluxe Twin — Pool View',
      roomType: 'Deluxe',
      nightlyRate: 150,
    },
    checkIn: '2026-05-15',
    checkOut: '2026-05-18',
    nights: 3,
    adults: 2,
    children: 0,
    addons: 'Airport transfer',
    baseAmount: 450,
    taxesFees: 54,
    addonAmount: 40,
    discount: 0,
    totalAmount: 544,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    paymentMethod: 'card',
    source: 'booking_com',
    specialRequests: 'Non-smoking floor. Late check-in around 22:00.',
    internalNotes: '',
    arrivalEta: '22:00',
    status: 'pending',
    review: null,
    createdAt: '2026-04-18T09:40:00.000Z',
    updatedAt: '2026-04-18T09:40:00.000Z',
  },
  {
    id: 'sb_2002',
    code: 'RSV-2026-0428-011',
    guest: {
      name: 'Emma Wallace',
      phone: '+44 20 7946 0321',
      email: 'emma.w@example.com',
      idType: 'passport',
      idNumber: 'GB2298745',
      country: 'United Kingdom',
      avatar: 'https://i.pravatar.cc/80?img=48',
    },
    room: {
      id: 'r_1005',
      roomNumber: '301',
      name: 'Family Suite — Garden',
      roomType: 'Family',
      nightlyRate: 220,
    },
    checkIn: '2026-04-28',
    checkOut: '2026-05-02',
    nights: 4,
    adults: 2,
    children: 2,
    addons: 'Crib, Breakfast upgrade',
    baseAmount: 880,
    taxesFees: 105,
    addonAmount: 60,
    discount: 50,
    totalAmount: 995,
    paidAmount: 300,
    paymentStatus: 'deposit',
    paymentMethod: 'card',
    source: 'direct',
    specialRequests: 'Need a crib for a 1-year-old. Garden-view preferred, confirmed.',
    internalNotes: 'Returning guest — second stay this year.',
    arrivalEta: '14:30',
    status: 'confirmed',
    review: null,
    createdAt: '2026-04-10T11:22:00.000Z',
    updatedAt: '2026-04-15T08:00:00.000Z',
  },
  {
    id: 'sb_2003',
    code: 'RSV-2026-0420-007',
    guest: {
      name: 'Mateus Silva',
      phone: '+55 11 9876 5432',
      email: 'mateus.s@example.com',
      idType: 'passport',
      idNumber: 'BR8821451',
      country: 'Brazil',
      avatar: 'https://i.pravatar.cc/80?img=14',
    },
    room: {
      id: 'r_1003',
      roomNumber: '205',
      name: 'Deluxe Double — Sea View',
      roomType: 'Deluxe',
      nightlyRate: 140,
    },
    checkIn: '2026-04-20',
    checkOut: '2026-04-25',
    nights: 5,
    adults: 2,
    children: 0,
    addons: 'Airport transfer, Late checkout',
    baseAmount: 700,
    taxesFees: 84,
    addonAmount: 75,
    discount: 0,
    totalAmount: 859,
    paidAmount: 859,
    paymentStatus: 'paid',
    paymentMethod: 'card',
    source: 'expedia',
    specialRequests: 'High floor, quiet room if possible.',
    internalNotes: 'Honeymoon trip — complimentary flowers & bottle placed on arrival.',
    arrivalEta: '13:00',
    status: 'checked_in',
    review: null,
    createdAt: '2026-03-28T16:10:00.000Z',
    updatedAt: '2026-04-20T13:22:00.000Z',
  },
  {
    id: 'sb_2004',
    code: 'RSV-2026-0410-003',
    guest: {
      name: 'Priya Kapoor',
      phone: '+1 555 661 0049',
      email: 'priya.k@example.com',
      idType: 'passport',
      idNumber: 'IN4512089',
      country: 'India',
      avatar: 'https://i.pravatar.cc/80?img=32',
    },
    room: {
      id: 'r_1003',
      roomNumber: '205',
      name: 'Deluxe Double — Sea View',
      roomType: 'Deluxe',
      nightlyRate: 140,
    },
    checkIn: '2026-04-10',
    checkOut: '2026-04-14',
    nights: 4,
    adults: 2,
    children: 1,
    addons: '',
    baseAmount: 560,
    taxesFees: 67,
    addonAmount: 0,
    discount: 0,
    totalAmount: 627,
    paidAmount: 627,
    paymentStatus: 'paid',
    paymentMethod: 'card',
    source: 'booking_com',
    specialRequests: '',
    internalNotes: 'Quiet guests, no issues.',
    arrivalEta: '16:00',
    status: 'checked_out',
    review: {
      rating: 5,
      comment:
        'Spectacular sea view and genuinely warm staff. Breakfast selection was excellent. Will book again.',
      createdAt: '2026-04-14T11:30:00.000Z',
    },
    createdAt: '2026-03-20T10:05:00.000Z',
    updatedAt: '2026-04-14T11:30:00.000Z',
  },
  {
    id: 'sb_2005',
    code: 'RSV-2026-0320-015',
    guest: {
      name: 'Lucas Moreau',
      phone: '+33 6 12 34 56 78',
      email: 'lucas.m@example.com',
      idType: 'national_id',
      idNumber: 'FR-882145',
      country: 'France',
      avatar: 'https://i.pravatar.cc/80?img=33',
    },
    room: {
      id: 'r_1001',
      roomNumber: '101',
      name: 'Standard Single — City',
      roomType: 'Standard',
      nightlyRate: 65,
    },
    checkIn: '2026-03-20',
    checkOut: '2026-03-22',
    nights: 2,
    adults: 1,
    children: 0,
    addons: '',
    baseAmount: 130,
    taxesFees: 16,
    addonAmount: 0,
    discount: 0,
    totalAmount: 146,
    paidAmount: 146,
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    source: 'walk_in',
    specialRequests: '',
    internalNotes: '',
    arrivalEta: '',
    status: 'checked_out',
    review: {
      rating: 4,
      comment: 'Clean, quiet and good value. Shower pressure could be better.',
      createdAt: '2026-03-22T10:50:00.000Z',
    },
    createdAt: '2026-03-20T14:02:00.000Z',
    updatedAt: '2026-03-22T10:50:00.000Z',
  },
  {
    id: 'sb_2006',
    code: 'RSV-2026-0501-021',
    guest: {
      name: 'Sebastian Keller',
      phone: '+49 151 2345 6789',
      email: 'sebastian.k@example.com',
      idType: 'passport',
      idNumber: 'DE9823441',
      country: 'Germany',
      avatar: 'https://i.pravatar.cc/80?img=15',
    },
    room: {
      id: 'r_1006',
      roomNumber: '501',
      name: 'Presidential Suite — Panoramic',
      roomType: 'Presidential',
      nightlyRate: 450,
    },
    checkIn: '2026-05-01',
    checkOut: '2026-05-05',
    nights: 4,
    adults: 2,
    children: 0,
    addons: 'Airport transfer, Spa package',
    baseAmount: 1800,
    taxesFees: 216,
    addonAmount: 250,
    discount: 100,
    totalAmount: 2166,
    paidAmount: 0,
    paymentStatus: 'refunded',
    paymentMethod: 'card',
    source: 'agent',
    specialRequests: 'Anniversary trip — rose petals and champagne on arrival.',
    internalNotes: 'Cancelled due to family emergency. Full deposit refunded.',
    arrivalEta: '',
    status: 'cancelled',
    review: null,
    createdAt: '2026-04-02T09:15:00.000Z',
    updatedAt: '2026-04-19T11:40:00.000Z',
  },
  {
    id: 'sb_2007',
    code: 'RSV-2026-0415-009',
    guest: {
      name: 'Nora Johansen',
      phone: '+47 412 34 567',
      email: 'nora.j@example.com',
      idType: 'passport',
      idNumber: 'NO5521118',
      country: 'Norway',
    },
    room: {
      id: 'r_1002',
      roomNumber: '102',
      name: 'Budget Double — Non-AC',
      roomType: 'Standard',
      nightlyRate: 45,
    },
    checkIn: '2026-04-15',
    checkOut: '2026-04-17',
    nights: 2,
    adults: 2,
    children: 0,
    addons: '',
    baseAmount: 90,
    taxesFees: 11,
    addonAmount: 0,
    discount: 0,
    totalAmount: 101,
    paidAmount: 30,
    paymentStatus: 'deposit',
    paymentMethod: 'card',
    source: 'airbnb',
    specialRequests: '',
    internalNotes: 'Guest did not arrive. Deposit retained per policy.',
    arrivalEta: '',
    status: 'no_show',
    review: null,
    createdAt: '2026-04-08T12:30:00.000Z',
    updatedAt: '2026-04-16T09:00:00.000Z',
  },
]
