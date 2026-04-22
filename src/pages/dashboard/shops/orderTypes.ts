export type PaymentMethod =
  | 'card'
  | 'cod'
  | 'paypal'
  | 'stripe'
  | 'bank_transfer'

export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed'

export type FulfillmentStatus =
  | 'unfulfilled'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export type OrderItem = {
  id: string
  name: string
  sku: string
  variant?: string
  quantity: number
  unitPrice: number
  image?: string
}

export type Address = {
  line1: string
  city: string
  state?: string
  country: string
  postalCode: string
}

export type OrderReview = {
  rating: number
  comment: string
  createdAt: string
}

export type Order = {
  id: string
  createdAt: string
  customer: {
    name: string
    email: string
    phone: string
  }
  shippingAddress: Address
  billingSameAsShipping: boolean
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  shippingMethod: string
  courier?: string
  trackingNumber?: string
  notes?: string
  review?: OrderReview | null
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  card: 'Credit card',
  cod: 'Cash on delivery',
  paypal: 'PayPal',
  stripe: 'Stripe',
  bank_transfer: 'Bank transfer',
}

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' },
]

export const FULFILLMENT_STATUS_OPTIONS: {
  value: FulfillmentStatus
  label: string
}[] = [
  { value: 'unfulfilled', label: 'Unfulfilled' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
]

export const INITIAL_ORDERS: Order[] = [
  {
    id: '#SH-5501',
    createdAt: '2026-04-19T10:12:00.000Z',
    customer: {
      name: 'Jahid Islam',
      email: 'jahid@example.com',
      phone: '+880 1711 234 567',
    },
    shippingAddress: {
      line1: 'House 12, Road 5, Dhanmondi',
      city: 'Dhaka',
      state: 'Dhaka',
      country: 'Bangladesh',
      postalCode: '1205',
    },
    billingSameAsShipping: true,
    items: [
      {
        id: 'li_1',
        name: 'Classic Denim Jacket',
        sku: 'DJ-001',
        variant: 'Size: L',
        quantity: 1,
        unitPrice: 49,
      },
      {
        id: 'li_2',
        name: 'Leather Wallet',
        sku: 'LW-045',
        variant: 'Color: Brown',
        quantity: 2,
        unitPrice: 35,
      },
      {
        id: 'li_3',
        name: 'Ceramic Coffee Mug',
        sku: 'CM-088',
        variant: 'Color: Sage',
        quantity: 4,
        unitPrice: 18,
      },
    ],
    subtotal: 191,
    shipping: 12,
    tax: 17,
    discount: 5,
    total: 215,
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    fulfillmentStatus: 'shipped',
    shippingMethod: 'Express (2–3 days)',
    courier: 'DHL',
    trackingNumber: 'DHL-8821-4472',
    notes: 'Leave with security guard if not home.',
  },
  {
    id: '#SH-5500',
    createdAt: '2026-04-20T14:45:00.000Z',
    customer: {
      name: 'Fariha Akter',
      email: 'fariha@example.com',
      phone: '+880 1922 876 100',
    },
    shippingAddress: {
      line1: 'Flat 4B, Lake View Apartments',
      city: 'Chattogram',
      country: 'Bangladesh',
      postalCode: '4000',
    },
    billingSameAsShipping: true,
    items: [
      {
        id: 'li_1',
        name: 'Classic Denim Jacket',
        sku: 'DJ-001',
        variant: 'Size: M',
        quantity: 1,
        unitPrice: 65,
      },
    ],
    subtotal: 65,
    shipping: 8,
    tax: 6,
    discount: 0,
    total: 79,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    fulfillmentStatus: 'processing',
    shippingMethod: 'Standard (4–6 days)',
  },
  {
    id: '#SH-5499',
    createdAt: '2026-04-17T09:30:00.000Z',
    customer: {
      name: 'Rayhan Khan',
      email: 'rayhan@example.com',
      phone: '+880 1611 445 328',
    },
    shippingAddress: {
      line1: '45 Baker Street',
      city: 'Sylhet',
      country: 'Bangladesh',
      postalCode: '3100',
    },
    billingSameAsShipping: false,
    items: [
      {
        id: 'li_1',
        name: 'Wireless Headphones',
        sku: 'WH-210',
        variant: 'Color: Black',
        quantity: 1,
        unitPrice: 120,
      },
      {
        id: 'li_2',
        name: 'Running Shoes',
        sku: 'RS-114',
        variant: 'Size: 42',
        quantity: 1,
        unitPrice: 69,
      },
    ],
    subtotal: 189,
    shipping: 15,
    tax: 18,
    discount: 10,
    total: 212,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    fulfillmentStatus: 'delivered',
    shippingMethod: 'Express (2–3 days)',
    courier: 'FedEx',
    trackingNumber: 'FDX-99412-AB',
    review: {
      rating: 5,
      comment:
        'Headphones sound fantastic and battery life is as advertised. Shoes fit perfectly — quick delivery too.',
      createdAt: '2026-04-19T15:45:00.000Z',
    },
  },
  {
    id: '#SH-5498',
    createdAt: '2026-04-15T18:05:00.000Z',
    customer: {
      name: 'Mim Rahman',
      email: 'mim@example.com',
      phone: '+880 1777 889 010',
    },
    shippingAddress: {
      line1: 'Plot 22, Sector 11, Uttara',
      city: 'Dhaka',
      country: 'Bangladesh',
      postalCode: '1230',
    },
    billingSameAsShipping: true,
    items: [
      {
        id: 'li_1',
        name: 'Ceramic Coffee Mug',
        sku: 'CM-088',
        variant: 'Color: Ivory',
        quantity: 6,
        unitPrice: 18,
      },
      {
        id: 'li_2',
        name: 'Leather Wallet',
        sku: 'LW-045',
        variant: 'Color: Black',
        quantity: 1,
        unitPrice: 35,
      },
    ],
    subtotal: 143,
    shipping: 10,
    tax: 12,
    discount: 25,
    total: 140,
    paymentMethod: 'paypal',
    paymentStatus: 'paid',
    fulfillmentStatus: 'delivered',
    shippingMethod: 'Standard (4–6 days)',
    courier: 'Pathao',
    trackingNumber: 'PTH-55-22183',
    review: {
      rating: 4,
      comment:
        'Mugs are beautiful and well-packed. Wallet leather feels premium. One mug had a tiny chip but still usable.',
      createdAt: '2026-04-18T10:20:00.000Z',
    },
  },
  {
    id: '#SH-5497',
    createdAt: '2026-04-21T07:22:00.000Z',
    customer: {
      name: 'Sadia Hossain',
      email: 'sadia@example.com',
      phone: '+880 1511 990 224',
    },
    shippingAddress: {
      line1: '9/B Green Road',
      city: 'Dhaka',
      country: 'Bangladesh',
      postalCode: '1215',
    },
    billingSameAsShipping: true,
    items: [
      {
        id: 'li_1',
        name: 'Running Shoes',
        sku: 'RS-114',
        variant: 'Size: 40',
        quantity: 1,
        unitPrice: 89,
      },
    ],
    subtotal: 89,
    shipping: 0,
    tax: 7,
    discount: 0,
    total: 96,
    paymentMethod: 'stripe',
    paymentStatus: 'failed',
    fulfillmentStatus: 'unfulfilled',
    shippingMethod: 'Standard (4–6 days)',
    notes: 'Payment declined — awaiting customer retry.',
  },
  {
    id: '#SH-5496',
    createdAt: '2026-04-14T12:40:00.000Z',
    customer: {
      name: 'Tanvir Hasan',
      email: 'tanvir@example.com',
      phone: '+880 1888 776 433',
    },
    shippingAddress: {
      line1: '77 Mirpur Road',
      city: 'Dhaka',
      country: 'Bangladesh',
      postalCode: '1216',
    },
    billingSameAsShipping: true,
    items: [
      {
        id: 'li_1',
        name: 'Wireless Headphones',
        sku: 'WH-210',
        variant: 'Color: White',
        quantity: 1,
        unitPrice: 120,
      },
    ],
    subtotal: 120,
    shipping: 10,
    tax: 10,
    discount: 0,
    total: 140,
    paymentMethod: 'card',
    paymentStatus: 'refunded',
    fulfillmentStatus: 'returned',
    shippingMethod: 'Express (2–3 days)',
    courier: 'DHL',
    trackingNumber: 'DHL-5521-7781',
    notes: 'Customer reported a defective unit. Full refund issued.',
  },
]
