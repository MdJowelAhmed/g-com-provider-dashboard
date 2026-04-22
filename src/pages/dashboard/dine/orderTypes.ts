export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'

export type OrderType = 'dine_in' | 'takeout' | 'delivery'

export type OrderPaymentStatus = 'unpaid' | 'paid' | 'refunded'

export type OrderPaymentMethod = 'card' | 'cash' | 'wallet' | 'online'

export type OrderSource =
  | 'walk_in'
  | 'phone'
  | 'website'
  | 'uber_eats'
  | 'doordash'
  | 'foodpanda'
  | 'zomato'

export type OrderCustomer = {
  name: string
  phone: string
  email: string
}

export type OrderItem = {
  menuItemId: string
  name: string
  code: string
  quantity: number
  unitPrice: number
  lineTotal: number
  note: string
}

export type OrderDelivery = {
  address: string
  city: string
  latitude: number
  longitude: number
  eta: string
}

export type OrderReview = {
  rating: number
  comment: string
  createdAt: string
}

export type Order = {
  id: string
  code: string

  orderType: OrderType
  tableNumber: string
  customer: OrderCustomer
  delivery: OrderDelivery | null

  items: OrderItem[]

  subtotal: number
  taxesFees: number
  deliveryFee: number
  discount: number
  total: number

  paymentStatus: OrderPaymentStatus
  paymentMethod: OrderPaymentMethod
  source: OrderSource

  specialInstructions: string
  internalNotes: string

  status: OrderStatus
  review: OrderReview | null

  createdAt: string
  updatedAt: string
}

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const ORDER_TYPE_OPTIONS: { value: OrderType; label: string }[] = [
  { value: 'dine_in', label: 'Dine-in' },
  { value: 'takeout', label: 'Takeout' },
  { value: 'delivery', label: 'Delivery' },
]

export const ORDER_PAYMENT_STATUS_OPTIONS: {
  value: OrderPaymentStatus
  label: string
}[] = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' },
]

export const ORDER_PAYMENT_METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  card: 'Card',
  cash: 'Cash',
  wallet: 'Wallet',
  online: 'Online',
}

export const ORDER_SOURCE_LABELS: Record<OrderSource, string> = {
  walk_in: 'Walk-in',
  phone: 'Phone',
  website: 'Website',
  uber_eats: 'Uber Eats',
  doordash: 'DoorDash',
  foodpanda: 'Foodpanda',
  zomato: 'Zomato',
}

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'o_5001',
    code: 'OD-2026-0422-1104',
    orderType: 'dine_in',
    tableNumber: 'T4',
    customer: { name: 'Walk-in · T4', phone: '', email: '' },
    delivery: null,
    items: [
      {
        menuItemId: 'm_4002',
        name: 'Chicken Biryani',
        code: 'MAI-CB',
        quantity: 2,
        unitPrice: 11.5,
        lineTotal: 23.0,
        note: 'Extra spicy please',
      },
      {
        menuItemId: 'm_4003',
        name: 'Butter Naan',
        code: 'BRD-BN',
        quantity: 3,
        unitPrice: 2.5,
        lineTotal: 7.5,
        note: '',
      },
      {
        menuItemId: 'm_4004',
        name: 'Mango Lassi',
        code: 'BEV-ML',
        quantity: 2,
        unitPrice: 4.25,
        lineTotal: 8.5,
        note: '',
      },
    ],
    subtotal: 39.0,
    taxesFees: 4.68,
    deliveryFee: 0,
    discount: 0,
    total: 43.68,
    paymentStatus: 'unpaid',
    paymentMethod: 'cash',
    source: 'walk_in',
    specialInstructions: 'Serving for 2 adults, no onions in the biryani.',
    internalNotes: '',
    status: 'preparing',
    review: null,
    createdAt: '2026-04-22T11:04:00.000Z',
    updatedAt: '2026-04-22T11:10:00.000Z',
  },
  {
    id: 'o_5002',
    code: 'OD-2026-0422-1138',
    orderType: 'delivery',
    tableNumber: '',
    customer: {
      name: 'Alex Carter',
      phone: '+1 555 220 1188',
      email: 'alex.c@example.com',
    },
    delivery: {
      address: '250 W 57th St, Apt 12B',
      city: 'New York, NY',
      latitude: 40.7649,
      longitude: -73.9841,
      eta: '15 min',
    },
    items: [
      {
        menuItemId: 'm_4008',
        name: 'Margherita Pizza',
        code: 'MAI-PZ-MG',
        quantity: 1,
        unitPrice: 12.0,
        lineTotal: 12.0,
        note: '',
      },
      {
        menuItemId: 'm_4005',
        name: 'Caesar Salad',
        code: 'SLD-CS',
        quantity: 1,
        unitPrice: 8.0,
        lineTotal: 8.0,
        note: 'Without anchovies',
      },
      {
        menuItemId: 'm_4004',
        name: 'Mango Lassi',
        code: 'BEV-ML',
        quantity: 1,
        unitPrice: 4.25,
        lineTotal: 4.25,
        note: '',
      },
    ],
    subtotal: 24.25,
    taxesFees: 2.91,
    deliveryFee: 4.99,
    discount: 0,
    total: 32.15,
    paymentStatus: 'paid',
    paymentMethod: 'card',
    source: 'uber_eats',
    specialInstructions: 'Leave at door, do not ring bell — sleeping baby.',
    internalNotes: '',
    status: 'out_for_delivery',
    review: null,
    createdAt: '2026-04-22T11:38:00.000Z',
    updatedAt: '2026-04-22T12:05:00.000Z',
  },
  {
    id: 'o_5003',
    code: 'OD-2026-0422-1122',
    orderType: 'takeout',
    tableNumber: '',
    customer: {
      name: 'Sarah Williams',
      phone: '+1 555 330 7712',
      email: 'sarah.w@example.com',
    },
    delivery: null,
    items: [
      {
        menuItemId: 'm_4001',
        name: 'Paneer Tikka',
        code: 'APP-PT',
        quantity: 1,
        unitPrice: 9.5,
        lineTotal: 9.5,
        note: '',
      },
      {
        menuItemId: 'm_4006',
        name: 'Dal Makhani',
        code: 'MAI-DM',
        quantity: 1,
        unitPrice: 10.5,
        lineTotal: 10.5,
        note: '',
      },
      {
        menuItemId: 'm_4003',
        name: 'Butter Naan',
        code: 'BRD-BN',
        quantity: 2,
        unitPrice: 2.5,
        lineTotal: 5.0,
        note: '',
      },
    ],
    subtotal: 25.0,
    taxesFees: 3.0,
    deliveryFee: 0,
    discount: 0,
    total: 28.0,
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    source: 'phone',
    specialInstructions: 'Pickup at 12:30 PM.',
    internalNotes: 'Regular customer.',
    status: 'ready',
    review: null,
    createdAt: '2026-04-22T11:22:00.000Z',
    updatedAt: '2026-04-22T12:15:00.000Z',
  },
  {
    id: 'o_5004',
    code: 'OD-2026-0421-2018',
    orderType: 'dine_in',
    tableNumber: 'T2',
    customer: {
      name: 'Emily Zhang',
      phone: '+1 555 440 8899',
      email: 'emily.z@example.com',
    },
    delivery: null,
    items: [
      {
        menuItemId: 'm_4002',
        name: 'Chicken Biryani',
        code: 'MAI-CB',
        quantity: 1,
        unitPrice: 11.5,
        lineTotal: 11.5,
        note: '',
      },
      {
        menuItemId: 'm_4003',
        name: 'Butter Naan',
        code: 'BRD-BN',
        quantity: 2,
        unitPrice: 2.5,
        lineTotal: 5.0,
        note: '',
      },
      {
        menuItemId: 'm_4007',
        name: 'Gulab Jamun',
        code: 'DES-GJ',
        quantity: 1,
        unitPrice: 4.5,
        lineTotal: 4.5,
        note: 'Warm please',
      },
    ],
    subtotal: 21.0,
    taxesFees: 2.52,
    deliveryFee: 0,
    discount: 0,
    total: 23.52,
    paymentStatus: 'paid',
    paymentMethod: 'card',
    source: 'walk_in',
    specialInstructions: '',
    internalNotes: 'Tipped 18%.',
    status: 'completed',
    review: {
      rating: 5,
      comment: 'Biryani was perfect and service was quick. Will be back.',
      createdAt: '2026-04-21T21:10:00.000Z',
    },
    createdAt: '2026-04-21T20:18:00.000Z',
    updatedAt: '2026-04-21T21:10:00.000Z',
  },
  {
    id: 'o_5005',
    code: 'OD-2026-0420-1945',
    orderType: 'delivery',
    tableNumber: '',
    customer: {
      name: 'David Park',
      phone: '+1 555 550 3344',
      email: 'david.p@example.com',
    },
    delivery: {
      address: '300 W 23rd St, Apt 7F',
      city: 'New York, NY',
      latitude: 40.7444,
      longitude: -73.9998,
      eta: 'Delivered',
    },
    items: [
      {
        menuItemId: 'm_4008',
        name: 'Margherita Pizza',
        code: 'MAI-PZ-MG',
        quantity: 1,
        unitPrice: 12.0,
        lineTotal: 12.0,
        note: '',
      },
      {
        menuItemId: 'm_4005',
        name: 'Caesar Salad',
        code: 'SLD-CS',
        quantity: 1,
        unitPrice: 8.0,
        lineTotal: 8.0,
        note: '',
      },
    ],
    subtotal: 20.0,
    taxesFees: 2.4,
    deliveryFee: 4.99,
    discount: 0,
    total: 27.39,
    paymentStatus: 'paid',
    paymentMethod: 'card',
    source: 'website',
    specialInstructions: '',
    internalNotes: '',
    status: 'completed',
    review: {
      rating: 4,
      comment: 'Food arrived hot and fresh. Driver was slightly late but friendly.',
      createdAt: '2026-04-20T20:45:00.000Z',
    },
    createdAt: '2026-04-20T19:45:00.000Z',
    updatedAt: '2026-04-20T20:45:00.000Z',
  },
  {
    id: 'o_5006',
    code: 'OD-2026-0419-1805',
    orderType: 'takeout',
    tableNumber: '',
    customer: {
      name: 'Chris Lee',
      phone: '+1 555 660 9911',
      email: 'chris.l@example.com',
    },
    delivery: null,
    items: [
      {
        menuItemId: 'm_4009',
        name: 'Fish Amritsari',
        code: 'APP-FA',
        quantity: 2,
        unitPrice: 11.5,
        lineTotal: 23.0,
        note: '',
      },
    ],
    subtotal: 23.0,
    taxesFees: 2.76,
    deliveryFee: 0,
    discount: 0,
    total: 25.76,
    paymentStatus: 'refunded',
    paymentMethod: 'card',
    source: 'phone',
    specialInstructions: '',
    internalNotes: 'Cancelled — Fish Amritsari out of stock. Refunded in full.',
    status: 'cancelled',
    review: null,
    createdAt: '2026-04-19T18:05:00.000Z',
    updatedAt: '2026-04-19T18:12:00.000Z',
  },
  {
    id: 'o_5007',
    code: 'OD-2026-0422-1212',
    orderType: 'dine_in',
    tableNumber: 'T6',
    customer: { name: 'Walk-in · T6', phone: '', email: '' },
    delivery: null,
    items: [
      {
        menuItemId: 'm_4001',
        name: 'Paneer Tikka',
        code: 'APP-PT',
        quantity: 1,
        unitPrice: 9.5,
        lineTotal: 9.5,
        note: '',
      },
      {
        menuItemId: 'm_4006',
        name: 'Dal Makhani',
        code: 'MAI-DM',
        quantity: 1,
        unitPrice: 10.5,
        lineTotal: 10.5,
        note: 'Less butter',
      },
      {
        menuItemId: 'm_4003',
        name: 'Butter Naan',
        code: 'BRD-BN',
        quantity: 2,
        unitPrice: 2.5,
        lineTotal: 5.0,
        note: '',
      },
      {
        menuItemId: 'm_4004',
        name: 'Mango Lassi',
        code: 'BEV-ML',
        quantity: 2,
        unitPrice: 4.25,
        lineTotal: 8.5,
        note: '',
      },
    ],
    subtotal: 33.5,
    taxesFees: 4.02,
    deliveryFee: 0,
    discount: 0,
    total: 37.52,
    paymentStatus: 'unpaid',
    paymentMethod: 'cash',
    source: 'walk_in',
    specialInstructions: '',
    internalNotes: '',
    status: 'pending',
    review: null,
    createdAt: '2026-04-22T12:12:00.000Z',
    updatedAt: '2026-04-22T12:12:00.000Z',
  },
  {
    id: 'o_5008',
    code: 'OD-2026-0422-1130',
    orderType: 'delivery',
    tableNumber: '',
    customer: {
      name: 'Maya Patel',
      phone: '+1 555 770 2284',
      email: 'maya.p@example.com',
    },
    delivery: {
      address: '1200 Broadway, Apt 9A',
      city: 'New York, NY',
      latitude: 40.7455,
      longitude: -73.9887,
      eta: '35 min',
    },
    items: [
      {
        menuItemId: 'm_4002',
        name: 'Chicken Biryani',
        code: 'MAI-CB',
        quantity: 2,
        unitPrice: 11.5,
        lineTotal: 23.0,
        note: '',
      },
      {
        menuItemId: 'm_4007',
        name: 'Gulab Jamun',
        code: 'DES-GJ',
        quantity: 2,
        unitPrice: 4.5,
        lineTotal: 9.0,
        note: '',
      },
    ],
    subtotal: 32.0,
    taxesFees: 3.84,
    deliveryFee: 4.99,
    discount: 0,
    total: 40.83,
    paymentStatus: 'paid',
    paymentMethod: 'online',
    source: 'foodpanda',
    specialInstructions: 'Ring apartment 9A intercom on arrival.',
    internalNotes: '',
    status: 'confirmed',
    review: null,
    createdAt: '2026-04-22T11:30:00.000Z',
    updatedAt: '2026-04-22T11:33:00.000Z',
  },
]
