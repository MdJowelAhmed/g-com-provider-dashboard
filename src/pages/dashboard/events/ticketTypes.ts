export type TicketStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded'

export type TicketPaymentStatus = 'unpaid' | 'paid' | 'refunded'

export type TicketPaymentMethod = 'card' | 'cash' | 'wallet' | 'online'

export type TicketChannel =
  | 'direct'
  | 'walk_in'
  | 'phone'
  | 'promoter'
  | 'eventbrite'
  | 'comp'

export type TicketBuyer = {
  name: string
  phone: string
  email: string
}

export type TicketEvent = {
  id: string
  name: string
  code: string
  startAt: string
  endAt: string
  venueLabel: string
}

export type Ticket = {
  id: string
  code: string
  event: TicketEvent
  buyer: TicketBuyer

  tier: string
  quantity: number
  unitPrice: number
  subtotal: number
  discount: number
  total: number
  promoCode: string

  seatLabel: string

  status: TicketStatus
  paymentStatus: TicketPaymentStatus
  paymentMethod: TicketPaymentMethod
  channel: TicketChannel

  checkedIn: boolean
  checkedInAt: string | null

  issuedAt: string
  notes: string
}

export const TICKET_STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

export const TICKET_PAYMENT_STATUS_OPTIONS: {
  value: TicketPaymentStatus
  label: string
}[] = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' },
]

export const TICKET_PAYMENT_METHOD_LABELS: Record<TicketPaymentMethod, string> = {
  card: 'Card',
  cash: 'Cash',
  wallet: 'Wallet',
  online: 'Online',
}

export const TICKET_CHANNEL_LABELS: Record<TicketChannel, string> = {
  direct: 'Direct website',
  walk_in: 'Walk-in',
  phone: 'Phone',
  promoter: 'Promoter',
  eventbrite: 'Eventbrite',
  comp: 'Comp',
}

export const TICKET_TIERS = [
  'General',
  'Early-bird',
  'VIP',
  'Student',
  'Group',
  'Comp',
  'Free',
]

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 't_7001',
    code: 'TKT-JNL-0001',
    event: {
      id: 'e_6001',
      name: 'Jazz Night Live',
      code: 'EVT-JNL-001',
      startAt: '2026-05-15T19:30:00.000Z',
      endAt: '2026-05-15T23:30:00.000Z',
      venueLabel: 'Blue Harbor Lounge · New York, NY',
    },
    buyer: {
      name: 'Amira Fontaine',
      phone: '+1 555 220 7714',
      email: 'amira.f@example.com',
    },
    tier: 'Early-bird',
    quantity: 2,
    unitPrice: 35,
    subtotal: 70,
    discount: 0,
    total: 70,
    promoCode: '',
    seatLabel: 'GA — Floor',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    channel: 'direct',
    checkedIn: false,
    checkedInAt: null,
    issuedAt: '2026-04-12T14:22:00.000Z',
    notes: '',
  },
  {
    id: 't_7002',
    code: 'TKT-JNL-0002',
    event: {
      id: 'e_6001',
      name: 'Jazz Night Live',
      code: 'EVT-JNL-001',
      startAt: '2026-05-15T19:30:00.000Z',
      endAt: '2026-05-15T23:30:00.000Z',
      venueLabel: 'Blue Harbor Lounge · New York, NY',
    },
    buyer: {
      name: 'Marcus Chen',
      phone: '+1 555 330 1102',
      email: 'marcus.c@example.com',
    },
    tier: 'VIP',
    quantity: 2,
    unitPrice: 85,
    subtotal: 170,
    discount: 0,
    total: 170,
    promoCode: '',
    seatLabel: 'Table T3, Seats 1–2',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    channel: 'direct',
    checkedIn: false,
    checkedInAt: null,
    issuedAt: '2026-04-20T10:48:00.000Z',
    notes: 'Birthday celebration — flagged for staff.',
  },
  {
    id: 't_7003',
    code: 'TKT-RN-0001',
    event: {
      id: 'e_6002',
      name: 'React Next — Advanced Patterns',
      code: 'EVT-RN-002',
      startAt: '2026-05-20T14:00:00.000Z',
      endAt: '2026-05-20T18:00:00.000Z',
      venueLabel: 'Online · Zoom',
    },
    buyer: {
      name: 'Leila Patel',
      phone: '+1 555 441 5523',
      email: 'leila.p@example.com',
    },
    tier: 'Early-bird',
    quantity: 1,
    unitPrice: 79,
    subtotal: 79,
    discount: 0,
    total: 79,
    promoCode: '',
    seatLabel: '',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    channel: 'direct',
    checkedIn: false,
    checkedInAt: null,
    issuedAt: '2026-04-18T09:10:00.000Z',
    notes: '',
  },
  {
    id: 't_7004',
    code: 'TKT-CFF-0001',
    event: {
      id: 'e_6003',
      name: 'City Food Festival 2026',
      code: 'EVT-CFF-003',
      startAt: '2026-06-05T11:00:00.000Z',
      endAt: '2026-06-05T21:00:00.000Z',
      venueLabel: 'Pier 17 Rooftop · New York, NY',
    },
    buyer: {
      name: 'Janet Lee',
      phone: '+1 555 778 3301',
      email: 'janet.l@example.com',
    },
    tier: 'Free',
    quantity: 4,
    unitPrice: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
    promoCode: '',
    seatLabel: 'GA',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    channel: 'direct',
    checkedIn: false,
    checkedInAt: null,
    issuedAt: '2026-04-15T20:00:00.000Z',
    notes: 'Family of 4 — 2 adults + 2 kids.',
  },
  {
    id: 't_7005',
    code: 'TKT-RCM-0001',
    event: {
      id: 'e_6004',
      name: 'Riverside City Marathon',
      code: 'EVT-RCM-004',
      startAt: '2026-05-28T06:30:00.000Z',
      endAt: '2026-05-28T12:30:00.000Z',
      venueLabel: 'Riverside Park · 72nd St',
    },
    buyer: {
      name: 'John Kim',
      phone: '+1 555 110 9090',
      email: 'john.k@example.com',
    },
    tier: 'General',
    quantity: 1,
    unitPrice: 25,
    subtotal: 25,
    discount: 0,
    total: 25,
    promoCode: 'EARLY25',
    seatLabel: 'Half Marathon · Bib #4412',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    channel: 'direct',
    checkedIn: false,
    checkedInAt: null,
    issuedAt: '2026-04-02T11:30:00.000Z',
    notes: '',
  },
  {
    id: 't_7006',
    code: 'TKT-SPN-0001',
    event: {
      id: 'e_6005',
      name: 'Startup Pitch Night',
      code: 'EVT-SPN-005',
      startAt: '2026-05-10T18:00:00.000Z',
      endAt: '2026-05-10T22:00:00.000Z',
      venueLabel: 'Catalyst Loft · 8th Floor',
    },
    buyer: {
      name: 'David Martinez',
      phone: '+1 555 220 4488',
      email: 'david.m@example.com',
    },
    tier: 'General',
    quantity: 1,
    unitPrice: 25,
    subtotal: 25,
    discount: 0,
    total: 25,
    promoCode: '',
    seatLabel: 'GA',
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'cash',
    channel: 'walk_in',
    checkedIn: false,
    checkedInAt: null,
    issuedAt: '2026-04-22T12:00:00.000Z',
    notes: 'Will pay cash at the door.',
  },
  {
    id: 't_7007',
    code: 'TKT-IFP-0001',
    event: {
      id: 'e_6006',
      name: 'Indie Film Premiere — "Northlight"',
      code: 'EVT-IFP-006',
      startAt: '2026-04-20T19:00:00.000Z',
      endAt: '2026-04-20T22:00:00.000Z',
      venueLabel: 'Arthouse Cinema',
    },
    buyer: {
      name: 'Rachel Green',
      phone: '+1 555 900 2233',
      email: 'rachel.g@example.com',
    },
    tier: 'General',
    quantity: 2,
    unitPrice: 15,
    subtotal: 30,
    discount: 0,
    total: 30,
    promoCode: '',
    seatLabel: 'Row C, Seats 8–9',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    channel: 'direct',
    checkedIn: true,
    checkedInAt: '2026-04-20T18:52:00.000Z',
    issuedAt: '2026-04-10T14:18:00.000Z',
    notes: '',
  },
  {
    id: 't_7008',
    code: 'TKT-IFP-0002',
    event: {
      id: 'e_6006',
      name: 'Indie Film Premiere — "Northlight"',
      code: 'EVT-IFP-006',
      startAt: '2026-04-20T19:00:00.000Z',
      endAt: '2026-04-20T22:00:00.000Z',
      venueLabel: 'Arthouse Cinema',
    },
    buyer: {
      name: 'Tom Hayes',
      phone: '+1 555 880 1122',
      email: 'tom.h@example.com',
    },
    tier: 'General',
    quantity: 1,
    unitPrice: 15,
    subtotal: 15,
    discount: 0,
    total: 15,
    promoCode: '',
    seatLabel: 'Row D, Seat 5',
    status: 'refunded',
    paymentStatus: 'refunded',
    paymentMethod: 'card',
    channel: 'direct',
    checkedIn: false,
    checkedInAt: null,
    issuedAt: '2026-04-12T09:40:00.000Z',
    notes: 'Requested refund 2 days before — processed in full.',
  },
  {
    id: 't_7009',
    code: 'TKT-JNL-0003',
    event: {
      id: 'e_6001',
      name: 'Jazz Night Live',
      code: 'EVT-JNL-001',
      startAt: '2026-05-15T19:30:00.000Z',
      endAt: '2026-05-15T23:30:00.000Z',
      venueLabel: 'Blue Harbor Lounge · New York, NY',
    },
    buyer: {
      name: 'Priya Kapoor',
      phone: '+1 555 661 0049',
      email: 'priya.k@example.com',
    },
    tier: 'Comp',
    quantity: 2,
    unitPrice: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
    promoCode: 'PRESS',
    seatLabel: 'Press table',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    channel: 'comp',
    checkedIn: false,
    checkedInAt: null,
    issuedAt: '2026-04-21T15:00:00.000Z',
    notes: 'Press comp — Harbor Magazine review.',
  },
]
