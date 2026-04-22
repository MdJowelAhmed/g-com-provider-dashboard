export type CustomerStatus = 'active' | 'inactive' | 'blocked' | 'vip'
export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type AcquisitionChannel =
  | 'organic'
  | 'paid_ads'
  | 'social'
  | 'referral'
  | 'direct'
  | 'email'

export type CustomerAddress = {
  id: string
  label: string
  line1: string
  line2?: string
  city: string
  state?: string
  country: string
  postalCode: string
  isDefault: boolean
}

export type Customer = {
  id: string
  avatar?: string
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  phone: string
  phoneVerified: boolean
  gender?: Gender
  dateOfBirth?: string
  language: string
  status: CustomerStatus
  tier: CustomerTier
  tags: string
  segment?: string
  loyaltyPoints: number
  marketingOptInEmail: boolean
  marketingOptInSms: boolean
  addresses: CustomerAddress[]
  totalOrders: number
  totalSpend: number
  averageOrderValue: number
  firstOrderDate?: string
  lastOrderDate?: string
  ordersLast30Days: number
  abandonedCarts: number
  refundCount: number
  refundAmount: number
  acquisitionChannel: AcquisitionChannel
  referrer?: string
  createdAt: string
  lastActiveAt?: string
  lastLoginAt?: string
  wishlistCount: number
  reviewsCount: number
  averageRatingGiven?: number
  defaultPaymentMethod?: string
  taxExempt: boolean
  notes?: string
}

export const CUSTOMER_STATUS_OPTIONS: { value: CustomerStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'vip', label: 'VIP' },
  { value: 'blocked', label: 'Blocked' },
]

export const CUSTOMER_TIER_OPTIONS: { value: CustomerTier; label: string }[] = [
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'platinum', label: 'Platinum' },
]

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export const ACQUISITION_CHANNEL_OPTIONS: {
  value: AcquisitionChannel
  label: string
}[] = [
  { value: 'organic', label: 'Organic search' },
  { value: 'paid_ads', label: 'Paid ads' },
  { value: 'social', label: 'Social' },
  { value: 'referral', label: 'Referral' },
  { value: 'direct', label: 'Direct' },
  { value: 'email', label: 'Email campaign' },
]

export const LANGUAGE_OPTIONS = ['English', 'Bengali', 'Hindi', 'Spanish', 'Arabic', 'French']

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c_9001',
    avatar: 'https://i.pravatar.cc/96?img=12',
    firstName: 'Jahid',
    lastName: 'Islam',
    email: 'jahid@example.com',
    emailVerified: true,
    phone: '+880 1711 234 567',
    phoneVerified: true,
    gender: 'male',
    dateOfBirth: '1992-07-15',
    language: 'Bengali',
    status: 'vip',
    tier: 'platinum',
    tags: 'loyal, high-ltv, newsletter',
    segment: 'Repeat buyers',
    loyaltyPoints: 4280,
    marketingOptInEmail: true,
    marketingOptInSms: true,
    addresses: [
      {
        id: 'a_1',
        label: 'Home',
        line1: 'House 12, Road 5',
        line2: 'Dhanmondi',
        city: 'Dhaka',
        state: 'Dhaka',
        country: 'Bangladesh',
        postalCode: '1205',
        isDefault: true,
      },
      {
        id: 'a_2',
        label: 'Office',
        line1: 'Level 7, Gulshan Trade Center',
        city: 'Dhaka',
        country: 'Bangladesh',
        postalCode: '1212',
        isDefault: false,
      },
    ],
    totalOrders: 12,
    totalSpend: 1820,
    averageOrderValue: 151.67,
    firstOrderDate: '2025-02-10T10:00:00.000Z',
    lastOrderDate: '2026-04-19T10:12:00.000Z',
    ordersLast30Days: 3,
    abandonedCarts: 1,
    refundCount: 0,
    refundAmount: 0,
    acquisitionChannel: 'referral',
    referrer: 'Fariha Akter',
    createdAt: '2025-02-08T09:15:00.000Z',
    lastActiveAt: '2026-04-20T18:42:00.000Z',
    lastLoginAt: '2026-04-20T18:42:00.000Z',
    wishlistCount: 6,
    reviewsCount: 4,
    averageRatingGiven: 4.8,
    defaultPaymentMethod: 'Visa •• 4242',
    taxExempt: false,
    notes: 'VIP customer — prefers express shipping. Birthday reward sent.',
  },
  {
    id: 'c_9002',
    avatar: 'https://i.pravatar.cc/96?img=47',
    firstName: 'Fariha',
    lastName: 'Akter',
    email: 'fariha@example.com',
    emailVerified: true,
    phone: '+880 1922 876 100',
    phoneVerified: false,
    gender: 'female',
    dateOfBirth: '1996-11-02',
    language: 'Bengali',
    status: 'active',
    tier: 'gold',
    tags: 'fashion, newsletter',
    segment: 'Seasonal shoppers',
    loyaltyPoints: 1290,
    marketingOptInEmail: true,
    marketingOptInSms: false,
    addresses: [
      {
        id: 'a_1',
        label: 'Home',
        line1: 'Flat 4B, Lake View Apartments',
        city: 'Chattogram',
        country: 'Bangladesh',
        postalCode: '4000',
        isDefault: true,
      },
    ],
    totalOrders: 5,
    totalSpend: 420,
    averageOrderValue: 84,
    firstOrderDate: '2025-09-04T14:10:00.000Z',
    lastOrderDate: '2026-04-20T14:45:00.000Z',
    ordersLast30Days: 1,
    abandonedCarts: 2,
    refundCount: 0,
    refundAmount: 0,
    acquisitionChannel: 'social',
    referrer: 'Instagram campaign',
    createdAt: '2025-08-30T11:05:00.000Z',
    lastActiveAt: '2026-04-21T09:10:00.000Z',
    lastLoginAt: '2026-04-21T09:10:00.000Z',
    wishlistCount: 14,
    reviewsCount: 2,
    averageRatingGiven: 4.5,
    defaultPaymentMethod: 'Cash on delivery',
    taxExempt: false,
  },
  {
    id: 'c_9003',
    avatar: 'https://i.pravatar.cc/96?img=33',
    firstName: 'Rayhan',
    lastName: 'Khan',
    email: 'rayhan@example.com',
    emailVerified: true,
    phone: '+880 1611 445 328',
    phoneVerified: true,
    gender: 'male',
    dateOfBirth: '1988-03-21',
    language: 'English',
    status: 'active',
    tier: 'silver',
    tags: 'electronics',
    segment: 'Tech enthusiasts',
    loyaltyPoints: 540,
    marketingOptInEmail: true,
    marketingOptInSms: true,
    addresses: [
      {
        id: 'a_1',
        label: 'Home',
        line1: '45 Baker Street',
        city: 'Sylhet',
        country: 'Bangladesh',
        postalCode: '3100',
        isDefault: true,
      },
    ],
    totalOrders: 3,
    totalSpend: 290,
    averageOrderValue: 96.67,
    firstOrderDate: '2025-11-12T08:30:00.000Z',
    lastOrderDate: '2026-04-17T09:30:00.000Z',
    ordersLast30Days: 1,
    abandonedCarts: 0,
    refundCount: 0,
    refundAmount: 0,
    acquisitionChannel: 'paid_ads',
    referrer: 'Google Ads — Spring',
    createdAt: '2025-11-10T13:22:00.000Z',
    lastActiveAt: '2026-04-18T10:30:00.000Z',
    lastLoginAt: '2026-04-18T10:30:00.000Z',
    wishlistCount: 3,
    reviewsCount: 1,
    averageRatingGiven: 5,
    defaultPaymentMethod: 'Mastercard •• 8820',
    taxExempt: false,
  },
  {
    id: 'c_9004',
    avatar: 'https://i.pravatar.cc/96?img=5',
    firstName: 'Mim',
    lastName: 'Rahman',
    email: 'mim@example.com',
    emailVerified: true,
    phone: '+880 1777 889 010',
    phoneVerified: true,
    gender: 'female',
    dateOfBirth: '1999-06-18',
    language: 'Bengali',
    status: 'active',
    tier: 'silver',
    tags: 'home, gifts',
    loyaltyPoints: 780,
    marketingOptInEmail: false,
    marketingOptInSms: false,
    addresses: [
      {
        id: 'a_1',
        label: 'Home',
        line1: 'Plot 22, Sector 11',
        line2: 'Uttara',
        city: 'Dhaka',
        country: 'Bangladesh',
        postalCode: '1230',
        isDefault: true,
      },
    ],
    totalOrders: 4,
    totalSpend: 560,
    averageOrderValue: 140,
    firstOrderDate: '2025-12-01T12:00:00.000Z',
    lastOrderDate: '2026-04-15T18:05:00.000Z',
    ordersLast30Days: 1,
    abandonedCarts: 0,
    refundCount: 0,
    refundAmount: 0,
    acquisitionChannel: 'organic',
    createdAt: '2025-11-28T10:05:00.000Z',
    lastActiveAt: '2026-04-16T20:12:00.000Z',
    lastLoginAt: '2026-04-16T20:12:00.000Z',
    wishlistCount: 7,
    reviewsCount: 3,
    averageRatingGiven: 4.3,
    defaultPaymentMethod: 'PayPal',
    taxExempt: false,
  },
  {
    id: 'c_9005',
    avatar: 'https://i.pravatar.cc/96?img=18',
    firstName: 'Sadia',
    lastName: 'Hossain',
    email: 'sadia@example.com',
    emailVerified: false,
    phone: '+880 1511 990 224',
    phoneVerified: false,
    gender: 'female',
    language: 'English',
    status: 'inactive',
    tier: 'bronze',
    tags: 'new-signup',
    loyaltyPoints: 50,
    marketingOptInEmail: true,
    marketingOptInSms: false,
    addresses: [
      {
        id: 'a_1',
        label: 'Home',
        line1: '9/B Green Road',
        city: 'Dhaka',
        country: 'Bangladesh',
        postalCode: '1215',
        isDefault: true,
      },
    ],
    totalOrders: 0,
    totalSpend: 0,
    averageOrderValue: 0,
    ordersLast30Days: 0,
    abandonedCarts: 3,
    refundCount: 0,
    refundAmount: 0,
    acquisitionChannel: 'direct',
    createdAt: '2026-04-18T07:00:00.000Z',
    lastActiveAt: '2026-04-21T07:22:00.000Z',
    lastLoginAt: '2026-04-21T07:22:00.000Z',
    wishlistCount: 2,
    reviewsCount: 0,
    taxExempt: false,
    notes: 'Payment failed on first checkout — sent a recovery email.',
  },
  {
    id: 'c_9006',
    avatar: 'https://i.pravatar.cc/96?img=60',
    firstName: 'Tanvir',
    lastName: 'Hasan',
    email: 'tanvir@example.com',
    emailVerified: true,
    phone: '+880 1888 776 433',
    phoneVerified: true,
    gender: 'male',
    dateOfBirth: '1985-01-09',
    language: 'English',
    status: 'blocked',
    tier: 'bronze',
    tags: 'chargeback, watchlist',
    loyaltyPoints: 0,
    marketingOptInEmail: false,
    marketingOptInSms: false,
    addresses: [
      {
        id: 'a_1',
        label: 'Home',
        line1: '77 Mirpur Road',
        city: 'Dhaka',
        country: 'Bangladesh',
        postalCode: '1216',
        isDefault: true,
      },
    ],
    totalOrders: 2,
    totalSpend: 260,
    averageOrderValue: 130,
    firstOrderDate: '2025-10-08T13:00:00.000Z',
    lastOrderDate: '2026-04-14T12:40:00.000Z',
    ordersLast30Days: 1,
    abandonedCarts: 0,
    refundCount: 1,
    refundAmount: 140,
    acquisitionChannel: 'email',
    referrer: 'October newsletter',
    createdAt: '2025-10-05T09:42:00.000Z',
    lastActiveAt: '2026-04-15T11:00:00.000Z',
    lastLoginAt: '2026-04-15T11:00:00.000Z',
    wishlistCount: 0,
    reviewsCount: 1,
    averageRatingGiven: 2,
    defaultPaymentMethod: 'Visa •• 1111',
    taxExempt: false,
    notes: 'Blocked after filing a chargeback — under fraud review.',
  },
  {
    id: 'c_9007',
    avatar: 'https://i.pravatar.cc/96?img=52',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya@example.com',
    emailVerified: true,
    phone: '+91 98104 55221',
    phoneVerified: true,
    gender: 'female',
    dateOfBirth: '1993-04-30',
    language: 'Hindi',
    status: 'active',
    tier: 'gold',
    tags: 'international, wholesale',
    segment: 'B2B',
    loyaltyPoints: 2100,
    marketingOptInEmail: true,
    marketingOptInSms: false,
    addresses: [
      {
        id: 'a_1',
        label: 'Warehouse',
        line1: 'Plot 14, Sector 45',
        city: 'Gurgaon',
        state: 'Haryana',
        country: 'India',
        postalCode: '122003',
        isDefault: true,
      },
    ],
    totalOrders: 8,
    totalSpend: 3120,
    averageOrderValue: 390,
    firstOrderDate: '2025-06-01T10:00:00.000Z',
    lastOrderDate: '2026-04-05T11:20:00.000Z',
    ordersLast30Days: 2,
    abandonedCarts: 0,
    refundCount: 0,
    refundAmount: 0,
    acquisitionChannel: 'referral',
    referrer: 'Trade partner',
    createdAt: '2025-05-28T08:30:00.000Z',
    lastActiveAt: '2026-04-19T17:00:00.000Z',
    lastLoginAt: '2026-04-19T17:00:00.000Z',
    wishlistCount: 22,
    reviewsCount: 6,
    averageRatingGiven: 4.7,
    defaultPaymentMethod: 'Bank transfer',
    taxExempt: true,
    notes: 'Wholesale account — tax exempt, net-30 terms.',
  },
]
