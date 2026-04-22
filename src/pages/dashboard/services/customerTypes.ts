export type CustomerStatus = 'active' | 'inactive' | 'vip' | 'blocked'

export type CustomerRecentBookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type CustomerRecentBooking = {
  id: string
  code: string
  serviceName: string
  scheduledAt: string
  status: CustomerRecentBookingStatus
  amount: number
}

export type Customer = {
  id: string
  name: string
  avatar?: string
  phone: string
  email: string
  address: string
  city: string
  joinedAt: string
  lastBookingAt: string | null
  lastServiceName: string | null
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  totalSpent: number
  averageRating: number | null
  preferredService: string | null
  status: CustomerStatus
  tags: string
  notes: string
  recentBookings: CustomerRecentBooking[]
}

export const CUSTOMER_STATUS_OPTIONS: { value: CustomerStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'vip', label: 'VIP' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blocked', label: 'Blocked' },
]

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c_1001',
    name: 'Amina Rahman',
    avatar: 'https://i.pravatar.cc/80?img=47',
    phone: '+1 555 120 4417',
    email: 'amina.r@example.com',
    address: '350 5th Ave, Apt 3B',
    city: 'New York, NY',
    joinedAt: '2025-09-14T11:00:00.000Z',
    lastBookingAt: '2026-04-23T10:00:00.000Z',
    lastServiceName: 'Deep home cleaning',
    totalBookings: 7,
    completedBookings: 5,
    cancelledBookings: 1,
    totalSpent: 820,
    averageRating: 4.8,
    preferredService: 'Deep home cleaning',
    status: 'vip',
    tags: 'repeat, apartment, pet-friendly',
    notes: 'Two cats at home. Prefers eco-friendly products.',
    recentBookings: [
      {
        id: 'b_1001',
        code: 'BK-2026-0422-001',
        serviceName: 'Deep home cleaning',
        scheduledAt: '2026-04-23T10:00:00.000Z',
        status: 'confirmed',
        amount: 165,
      },
      {
        id: 'b_0998',
        code: 'BK-2026-0301-014',
        serviceName: 'Deep home cleaning',
        scheduledAt: '2026-03-01T10:00:00.000Z',
        status: 'completed',
        amount: 120,
      },
      {
        id: 'b_0982',
        code: 'BK-2026-0125-006',
        serviceName: 'AC servicing & gas refill',
        scheduledAt: '2026-01-25T14:00:00.000Z',
        status: 'completed',
        amount: 85,
      },
    ],
  },
  {
    id: 'c_1002',
    name: 'Jonah Miller',
    avatar: 'https://i.pravatar.cc/80?img=13',
    phone: '+1 555 203 8821',
    email: 'jonah.m@example.com',
    address: '200 West St, Floor 14',
    city: 'New York, NY',
    joinedAt: '2026-02-03T08:20:00.000Z',
    lastBookingAt: '2026-04-22T14:30:00.000Z',
    lastServiceName: 'AC servicing & gas refill',
    totalBookings: 2,
    completedBookings: 1,
    cancelledBookings: 0,
    totalSpent: 134,
    averageRating: 4.5,
    preferredService: 'AC servicing & gas refill',
    status: 'active',
    tags: 'office',
    notes: '',
    recentBookings: [
      {
        id: 'b_1002',
        code: 'BK-2026-0422-002',
        serviceName: 'AC servicing & gas refill',
        scheduledAt: '2026-04-22T14:30:00.000Z',
        status: 'in_progress',
        amount: 134,
      },
    ],
  },
  {
    id: 'c_1003',
    name: 'Sofia Alvarez',
    avatar: 'https://i.pravatar.cc/80?img=31',
    phone: '+1 555 411 0092',
    email: 'sofia.a@example.com',
    address: '1035 Park Ave',
    city: 'New York, NY',
    joinedAt: '2025-06-10T09:15:00.000Z',
    lastBookingAt: '2026-04-21T09:00:00.000Z',
    lastServiceName: 'Deep home cleaning',
    totalBookings: 12,
    completedBookings: 11,
    cancelledBookings: 0,
    totalSpent: 1540,
    averageRating: 5,
    preferredService: 'Deep home cleaning',
    status: 'vip',
    tags: 'repeat, generous-tipper',
    notes: 'Tips 15% consistently. Likes same staff (Rafi & Priya).',
    recentBookings: [
      {
        id: 'b_1003',
        code: 'BK-2026-0421-014',
        serviceName: 'Deep home cleaning',
        scheduledAt: '2026-04-21T09:00:00.000Z',
        status: 'completed',
        amount: 120,
      },
    ],
  },
  {
    id: 'c_1004',
    name: 'Daniel Oduya',
    phone: '+1 555 772 3341',
    email: 'daniel.o@example.com',
    address: '88 Leonard St, Apt 7F',
    city: 'New York, NY',
    joinedAt: '2026-04-22T06:30:00.000Z',
    lastBookingAt: '2026-04-24T11:00:00.000Z',
    lastServiceName: 'AC servicing & gas refill',
    totalBookings: 1,
    completedBookings: 0,
    cancelledBookings: 0,
    totalSpent: 0,
    averageRating: null,
    preferredService: null,
    status: 'active',
    tags: 'new',
    notes: '',
    recentBookings: [
      {
        id: 'b_1004',
        code: 'BK-2026-0424-003',
        serviceName: 'AC servicing & gas refill',
        scheduledAt: '2026-04-24T11:00:00.000Z',
        status: 'pending',
        amount: 99,
      },
    ],
  },
  {
    id: 'c_1005',
    name: 'Mei-Ling Chen',
    avatar: 'https://i.pravatar.cc/80?img=45',
    phone: '+1 555 908 1120',
    email: 'mei.c@example.com',
    address: '25 Columbus Cir',
    city: 'New York, NY',
    joinedAt: '2025-11-22T15:40:00.000Z',
    lastBookingAt: '2026-04-19T16:00:00.000Z',
    lastServiceName: 'Deep home cleaning',
    totalBookings: 4,
    completedBookings: 2,
    cancelledBookings: 2,
    totalSpent: 240,
    averageRating: 3.8,
    preferredService: 'Deep home cleaning',
    status: 'inactive',
    tags: 'cancel-prone',
    notes: 'Cancelled last 2 bookings — consider requiring deposit.',
    recentBookings: [
      {
        id: 'b_1005',
        code: 'BK-2026-0419-027',
        serviceName: 'Deep home cleaning',
        scheduledAt: '2026-04-19T16:00:00.000Z',
        status: 'cancelled',
        amount: 120,
      },
    ],
  },
  {
    id: 'c_1006',
    name: 'Omar Siddique',
    avatar: 'https://i.pravatar.cc/80?img=12',
    phone: '+1 555 330 7766',
    email: 'omar.s@example.com',
    address: '456 W 42nd St, Apt 21A',
    city: 'New York, NY',
    joinedAt: '2026-01-05T10:00:00.000Z',
    lastBookingAt: '2026-04-20T13:00:00.000Z',
    lastServiceName: 'AC servicing & gas refill',
    totalBookings: 3,
    completedBookings: 1,
    cancelledBookings: 1,
    totalSpent: 75,
    averageRating: 2.5,
    preferredService: null,
    status: 'blocked',
    tags: 'no-show',
    notes: 'Multiple no-shows without notice. Blocked from booking.',
    recentBookings: [
      {
        id: 'b_1006',
        code: 'BK-2026-0420-009',
        serviceName: 'AC servicing & gas refill',
        scheduledAt: '2026-04-20T13:00:00.000Z',
        status: 'no_show',
        amount: 75,
      },
    ],
  },
  {
    id: 'c_1007',
    name: 'Priya Kapoor',
    avatar: 'https://i.pravatar.cc/80?img=32',
    phone: '+1 555 661 0049',
    email: 'priya.k@example.com',
    address: '540 W 28th St, Apt 9C',
    city: 'New York, NY',
    joinedAt: '2025-12-18T19:22:00.000Z',
    lastBookingAt: '2026-03-28T11:30:00.000Z',
    lastServiceName: 'Deep home cleaning',
    totalBookings: 5,
    completedBookings: 5,
    cancelledBookings: 0,
    totalSpent: 600,
    averageRating: 4.9,
    preferredService: 'Deep home cleaning',
    status: 'active',
    tags: 'repeat, weekend-only',
    notes: 'Only books on weekends.',
    recentBookings: [
      {
        id: 'b_0994',
        code: 'BK-2026-0328-011',
        serviceName: 'Deep home cleaning',
        scheduledAt: '2026-03-28T11:30:00.000Z',
        status: 'completed',
        amount: 120,
      },
    ],
  },
]
