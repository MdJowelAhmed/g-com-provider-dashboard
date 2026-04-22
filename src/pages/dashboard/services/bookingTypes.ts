export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded'

export type PaymentMethod = 'card' | 'cash' | 'wallet' | 'bank_transfer'

export type BookingCustomer = {
  name: string
  phone: string
  email: string
  avatar?: string
}

export type BookingService = {
  id: string
  name: string
  code: string
  category: string
}

export type BookingLocation = {
  address: string
  city: string
  latitude: number
  longitude: number
  accessNotes?: string
}

export type BookingReview = {
  rating: number
  comment: string
  createdAt: string
}

export type Booking = {
  id: string
  code: string
  customer: BookingCustomer
  service: BookingService
  scheduledAt: string
  durationMinutes: number
  staffAssigned: string[]
  location: BookingLocation
  addons: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  amount: number
  paidAmount: number
  customerNotes: string
  internalNotes: string
  review: BookingReview | null
  createdAt: string
  updatedAt: string
}

export const BOOKING_STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No-show' },
]

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' },
]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'Card',
  cash: 'Cash',
  wallet: 'Wallet',
  bank_transfer: 'Bank transfer',
}

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b_1001',
    code: 'BK-2026-0422-001',
    customer: {
      name: 'Amina Rahman',
      phone: '+1 555 120 4417',
      email: 'amina.r@example.com',
      avatar: 'https://i.pravatar.cc/80?img=47',
    },
    service: {
      id: 's_1001',
      name: 'Deep home cleaning',
      code: 'CLN-DEEP',
      category: 'Cleaning',
    },
    scheduledAt: '2026-04-23T10:00:00.000Z',
    durationMinutes: 180,
    staffAssigned: ['Rafi Ahmed', 'Priya Das'],
    location: {
      address: '350 5th Ave, Apt 3B',
      city: 'New York, NY',
      latitude: 40.7484,
      longitude: -73.9857,
      accessNotes: 'Ring top buzzer, doorman has a key.',
    },
    addons: 'Window cleaning, Fridge interior',
    status: 'confirmed',
    paymentStatus: 'partial',
    paymentMethod: 'card',
    amount: 165,
    paidAmount: 50,
    customerNotes: 'Please focus on the kitchen and bathrooms. Two cats at home.',
    internalNotes: '',
    review: null,
    createdAt: '2026-04-20T13:22:00.000Z',
    updatedAt: '2026-04-21T09:10:00.000Z',
  },
  {
    id: 'b_1002',
    code: 'BK-2026-0422-002',
    customer: {
      name: 'Jonah Miller',
      phone: '+1 555 203 8821',
      email: 'jonah.m@example.com',
      avatar: 'https://i.pravatar.cc/80?img=13',
    },
    service: {
      id: 's_1002',
      name: 'AC servicing & gas refill',
      code: 'AC-SVC',
      category: 'HVAC',
    },
    scheduledAt: '2026-04-22T14:30:00.000Z',
    durationMinutes: 60,
    staffAssigned: ['Karim Bhuiyan'],
    location: {
      address: '200 West St, Floor 14',
      city: 'New York, NY',
      latitude: 40.7146,
      longitude: -74.0134,
      accessNotes: 'Reception on 14th floor will guide to unit.',
    },
    addons: 'Gas refill (R32)',
    status: 'in_progress',
    paymentStatus: 'unpaid',
    paymentMethod: 'cash',
    amount: 134,
    paidAmount: 0,
    customerNotes: 'Office unit, AC is leaking water.',
    internalNotes: 'Bring extra drain pipe.',
    review: null,
    createdAt: '2026-04-21T10:02:00.000Z',
    updatedAt: '2026-04-22T14:05:00.000Z',
  },
  {
    id: 'b_1003',
    code: 'BK-2026-0421-014',
    customer: {
      name: 'Sofia Alvarez',
      phone: '+1 555 411 0092',
      email: 'sofia.a@example.com',
      avatar: 'https://i.pravatar.cc/80?img=31',
    },
    service: {
      id: 's_1001',
      name: 'Deep home cleaning',
      code: 'CLN-DEEP',
      category: 'Cleaning',
    },
    scheduledAt: '2026-04-21T09:00:00.000Z',
    durationMinutes: 180,
    staffAssigned: ['Rafi Ahmed', 'Priya Das'],
    location: {
      address: '1035 Park Ave',
      city: 'New York, NY',
      latitude: 40.7794,
      longitude: -73.9591,
    },
    addons: '',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    amount: 120,
    paidAmount: 120,
    customerNotes: '',
    internalNotes: 'Customer tipped 15%. Repeat customer.',
    review: {
      rating: 5,
      comment:
        'Rafi and Priya did an amazing job — place has never looked better. They were on time and respectful of the space. Will definitely book again.',
      createdAt: '2026-04-21T14:02:00.000Z',
    },
    createdAt: '2026-04-18T08:40:00.000Z',
    updatedAt: '2026-04-21T14:02:00.000Z',
  },
  {
    id: 'b_1004',
    code: 'BK-2026-0424-003',
    customer: {
      name: 'Daniel Oduya',
      phone: '+1 555 772 3341',
      email: 'daniel.o@example.com',
    },
    service: {
      id: 's_1002',
      name: 'AC servicing & gas refill',
      code: 'AC-SVC',
      category: 'HVAC',
    },
    scheduledAt: '2026-04-24T11:00:00.000Z',
    durationMinutes: 60,
    staffAssigned: [],
    location: {
      address: '88 Leonard St, Apt 7F',
      city: 'New York, NY',
      latitude: 40.7179,
      longitude: -74.0048,
      accessNotes: 'Intercom apartment 7F.',
    },
    addons: 'Deep coil wash',
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'card',
    amount: 99,
    paidAmount: 0,
    customerNotes: 'First-time customer. AC not cooling well.',
    internalNotes: '',
    review: null,
    createdAt: '2026-04-22T06:30:00.000Z',
    updatedAt: '2026-04-22T06:30:00.000Z',
  },
  {
    id: 'b_1005',
    code: 'BK-2026-0419-027',
    customer: {
      name: 'Mei-Ling Chen',
      phone: '+1 555 908 1120',
      email: 'mei.c@example.com',
      avatar: 'https://i.pravatar.cc/80?img=45',
    },
    service: {
      id: 's_1001',
      name: 'Deep home cleaning',
      code: 'CLN-DEEP',
      category: 'Cleaning',
    },
    scheduledAt: '2026-04-19T16:00:00.000Z',
    durationMinutes: 180,
    staffAssigned: ['Priya Das'],
    location: {
      address: '25 Columbus Cir',
      city: 'New York, NY',
      latitude: 40.7681,
      longitude: -73.9819,
    },
    addons: '',
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'card',
    amount: 120,
    paidAmount: 0,
    customerNotes: 'Had to travel suddenly, sorry.',
    internalNotes: 'Full refund processed.',
    review: null,
    createdAt: '2026-04-17T14:22:00.000Z',
    updatedAt: '2026-04-19T08:00:00.000Z',
  },
  {
    id: 'b_1006',
    code: 'BK-2026-0420-009',
    customer: {
      name: 'Omar Siddique',
      phone: '+1 555 330 7766',
      email: 'omar.s@example.com',
      avatar: 'https://i.pravatar.cc/80?img=12',
    },
    service: {
      id: 's_1002',
      name: 'AC servicing & gas refill',
      code: 'AC-SVC',
      category: 'HVAC',
    },
    scheduledAt: '2026-04-20T13:00:00.000Z',
    durationMinutes: 60,
    staffAssigned: ['Karim Bhuiyan'],
    location: {
      address: '456 W 42nd St, Apt 21A',
      city: 'New York, NY',
      latitude: 40.7589,
      longitude: -73.9922,
    },
    addons: '',
    status: 'no_show',
    paymentStatus: 'unpaid',
    paymentMethod: 'cash',
    amount: 75,
    paidAmount: 0,
    customerNotes: '',
    internalNotes: 'Technician arrived but nobody at home. Called twice — no response.',
    review: null,
    createdAt: '2026-04-19T11:10:00.000Z',
    updatedAt: '2026-04-20T13:40:00.000Z',
  },
  {
    id: 'b_0995',
    code: 'BK-2026-0328-011',
    customer: {
      name: 'Priya Kapoor',
      phone: '+1 555 661 0049',
      email: 'priya.k@example.com',
      avatar: 'https://i.pravatar.cc/80?img=32',
    },
    service: {
      id: 's_1001',
      name: 'Deep home cleaning',
      code: 'CLN-DEEP',
      category: 'Cleaning',
    },
    scheduledAt: '2026-03-28T11:30:00.000Z',
    durationMinutes: 180,
    staffAssigned: ['Rafi Ahmed', 'Priya Das'],
    location: {
      address: '540 W 28th St, Apt 9C',
      city: 'New York, NY',
      latitude: 40.7505,
      longitude: -74.0025,
    },
    addons: '',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    amount: 120,
    paidAmount: 120,
    customerNotes: 'Weekend booking, please arrive after 11am.',
    internalNotes: 'Regular weekend customer.',
    review: {
      rating: 5,
      comment: 'Fantastic as always. Very thorough and trustworthy team.',
      createdAt: '2026-03-28T16:20:00.000Z',
    },
    createdAt: '2026-03-25T09:00:00.000Z',
    updatedAt: '2026-03-28T16:20:00.000Z',
  },
  {
    id: 'b_0990',
    code: 'BK-2026-0203-005',
    customer: {
      name: 'Jonah Miller',
      phone: '+1 555 203 8821',
      email: 'jonah.m@example.com',
      avatar: 'https://i.pravatar.cc/80?img=13',
    },
    service: {
      id: 's_1002',
      name: 'AC servicing & gas refill',
      code: 'AC-SVC',
      category: 'HVAC',
    },
    scheduledAt: '2026-02-03T10:00:00.000Z',
    durationMinutes: 60,
    staffAssigned: ['Karim Bhuiyan'],
    location: {
      address: '200 West St, Floor 14',
      city: 'New York, NY',
      latitude: 40.7146,
      longitude: -74.0134,
    },
    addons: '',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    amount: 75,
    paidAmount: 75,
    customerNotes: '',
    internalNotes: '',
    review: {
      rating: 4,
      comment: 'Good work and explained the issue clearly. Arrived about 15 min late though.',
      createdAt: '2026-02-03T13:40:00.000Z',
    },
    createdAt: '2026-02-01T11:22:00.000Z',
    updatedAt: '2026-02-03T13:40:00.000Z',
  },
  {
    id: 'b_0988',
    code: 'BK-2026-0125-006',
    customer: {
      name: 'Amina Rahman',
      phone: '+1 555 120 4417',
      email: 'amina.r@example.com',
      avatar: 'https://i.pravatar.cc/80?img=47',
    },
    service: {
      id: 's_1002',
      name: 'AC servicing & gas refill',
      code: 'AC-SVC',
      category: 'HVAC',
    },
    scheduledAt: '2026-01-25T14:00:00.000Z',
    durationMinutes: 60,
    staffAssigned: ['Karim Bhuiyan'],
    location: {
      address: '350 5th Ave, Apt 3B',
      city: 'New York, NY',
      latitude: 40.7484,
      longitude: -73.9857,
    },
    addons: 'Gas refill (R32)',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    amount: 85,
    paidAmount: 85,
    customerNotes: '',
    internalNotes: '',
    review: {
      rating: 5,
      comment: 'Quick, professional, and reasonable price. Highly recommend.',
      createdAt: '2026-01-25T16:30:00.000Z',
    },
    createdAt: '2026-01-22T08:15:00.000Z',
    updatedAt: '2026-01-25T16:30:00.000Z',
  },
]
