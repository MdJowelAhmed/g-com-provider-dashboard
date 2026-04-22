export type WithdrawalStatus =
  | 'pending'
  | 'in_transit'
  | 'paid'
  | 'failed'
  | 'canceled'

export type WithdrawalSpeed = 'standard' | 'instant'

export type Withdrawal = {
  id: string
  reference: string
  amount: number
  fee: number
  net: number
  speed: WithdrawalSpeed
  status: WithdrawalStatus
  destinationLast4: string
  destinationBank: string
  requestedAt: string
  expectedArrival: string
  completedAt?: string
  failureReason?: string
}

export type Balance = {
  currency: 'USD'
  available: number
  pending: number
  inTransit: number
  lifetimeEarnings: number
  lifetimeWithdrawn: number
}

export type StripeAccount = {
  accountId: string
  bankName: string
  last4: string
  accountHolder: string
  country: string
  currency: string
  verified: boolean
  payoutsEnabled: boolean
  chargesEnabled: boolean
  defaultSpeed: WithdrawalSpeed
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly'
  nextAutoPayoutDate?: string
}

export const MINIMUM_WITHDRAWAL = 1
export const MAXIMUM_WITHDRAWAL = 10000
export const INSTANT_FEE_RATE = 0.015
export const INSTANT_FEE_MIN = 0.5

export const INITIAL_BALANCE: Balance = {
  currency: 'USD',
  available: 3480.52,
  pending: 642.0,
  inTransit: 215.0,
  lifetimeEarnings: 24870.12,
  lifetimeWithdrawn: 20532.6,
}

export const INITIAL_STRIPE_ACCOUNT: StripeAccount = {
  accountId: 'acct_1QHgT9KxLm2aB0d8',
  bankName: 'Chase Bank',
  last4: '6421',
  accountHolder: 'Grand Plaza Ltd.',
  country: 'US',
  currency: 'USD',
  verified: true,
  payoutsEnabled: true,
  chargesEnabled: true,
  defaultSpeed: 'standard',
  schedule: 'manual',
  nextAutoPayoutDate: undefined,
}

export const INITIAL_WITHDRAWALS: Withdrawal[] = [
  {
    id: 'wd_1',
    reference: 'WD-78213',
    amount: 500,
    fee: 0,
    net: 500,
    speed: 'standard',
    status: 'paid',
    destinationLast4: '6421',
    destinationBank: 'Chase Bank',
    requestedAt: '2026-04-12T09:24:00.000Z',
    expectedArrival: '2026-04-14T00:00:00.000Z',
    completedAt: '2026-04-14T11:30:00.000Z',
  },
  {
    id: 'wd_2',
    reference: 'WD-78204',
    amount: 1200,
    fee: 18,
    net: 1182,
    speed: 'instant',
    status: 'paid',
    destinationLast4: '6421',
    destinationBank: 'Chase Bank',
    requestedAt: '2026-04-05T13:02:00.000Z',
    expectedArrival: '2026-04-05T13:32:00.000Z',
    completedAt: '2026-04-05T13:29:00.000Z',
  },
  {
    id: 'wd_3',
    reference: 'WD-78190',
    amount: 215,
    fee: 0,
    net: 215,
    speed: 'standard',
    status: 'in_transit',
    destinationLast4: '6421',
    destinationBank: 'Chase Bank',
    requestedAt: '2026-04-19T17:41:00.000Z',
    expectedArrival: '2026-04-22T00:00:00.000Z',
  },
  {
    id: 'wd_4',
    reference: 'WD-78142',
    amount: 80,
    fee: 0,
    net: 80,
    speed: 'standard',
    status: 'failed',
    destinationLast4: '6421',
    destinationBank: 'Chase Bank',
    requestedAt: '2026-03-21T10:12:00.000Z',
    expectedArrival: '2026-03-23T00:00:00.000Z',
    failureReason: 'Destination bank account temporarily unavailable.',
  },
  {
    id: 'wd_5',
    reference: 'WD-78099',
    amount: 2000,
    fee: 30,
    net: 1970,
    speed: 'instant',
    status: 'paid',
    destinationLast4: '6421',
    destinationBank: 'Chase Bank',
    requestedAt: '2026-03-08T08:55:00.000Z',
    expectedArrival: '2026-03-08T09:25:00.000Z',
    completedAt: '2026-03-08T09:18:00.000Z',
  },
]

export function calculateFee(amount: number, speed: WithdrawalSpeed): number {
  if (speed === 'standard') return 0
  const fee = amount * INSTANT_FEE_RATE
  return Math.max(fee, INSTANT_FEE_MIN)
}

export function expectedArrivalISO(speed: WithdrawalSpeed): string {
  const now = new Date()
  if (speed === 'instant') {
    now.setMinutes(now.getMinutes() + 30)
  } else {
    let added = 0
    while (added < 2) {
      now.setDate(now.getDate() + 1)
      const day = now.getDay()
      if (day !== 0 && day !== 6) added += 1
    }
  }
  return now.toISOString()
}
