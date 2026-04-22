import type { Role } from '../types/role'

export type TrendPoint = { date: string; revenue: number; orders: number }

export type StatusSlice = {
  label: string
  value: number
  color: string
}

export type TopItem = {
  name: string
  units: number
  revenue: number
  change: number
}

export type PayoutSnapshot = {
  available: number
  pending: number
  nextAutoDate?: string
  lastPayout: number
  lastPayoutDate: string
}

export type OverviewData = {
  trend: TrendPoint[]
  statusBreakdown: StatusSlice[]
  topItems: TopItem[]
  payout: PayoutSnapshot
}

const DAY = 86_400_000

function trend(
  seed: number,
  baseRevenue: number,
  revenueVariance: number,
  baseOrders: number,
  orderVariance: number,
): TrendPoint[] {
  const now = Date.now()
  const days = 90
  const data: TrendPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * DAY)
    const d = date.getDay()
    const weekdayBoost = [0.7, 0.95, 1.05, 1, 1.08, 1.22, 1.2][d]
    const wave =
      0.5 +
      0.5 *
        (Math.sin((days - i) * (0.25 + seed * 0.03)) +
          Math.sin((days - i) * (0.11 + seed * 0.017)) * 0.5) /
        1.5
    const revenue = Math.max(
      0,
      Math.round(
        baseRevenue * weekdayBoost * (1 - revenueVariance + 2 * revenueVariance * wave),
      ),
    )
    const orders = Math.max(
      0,
      Math.round(
        baseOrders * weekdayBoost * (1 - orderVariance + 2 * orderVariance * wave),
      ),
    )
    data.push({ date: date.toISOString().slice(0, 10), revenue, orders })
  }
  return data
}

export const OVERVIEW_DATA: Record<Role, OverviewData> = {
  service: {
    trend: trend(1, 220, 0.35, 3, 0.4),
    statusBreakdown: [
      { label: 'Confirmed', value: 14, color: '#22c55e' },
      { label: 'In progress', value: 6, color: '#d9a441' },
      { label: 'Completed', value: 32, color: '#3b82f6' },
      { label: 'Cancelled', value: 3, color: '#ef4444' },
    ],
    topItems: [
      { name: 'Deep home cleaning', units: 42, revenue: 5040, change: 14 },
      { name: 'AC servicing', units: 31, revenue: 2325, change: 6 },
      { name: 'Plumbing repair', units: 22, revenue: 1320, change: -3 },
      { name: 'Bridal makeup', units: 4, revenue: 1000, change: 22 },
    ],
    payout: {
      available: 3480.52,
      pending: 642,
      lastPayout: 500,
      lastPayoutDate: '2026-04-14',
    },
  },

  stay: {
    trend: trend(2, 680, 0.25, 4, 0.3),
    statusBreakdown: [
      { label: 'In-house', value: 18, color: '#22c55e' },
      { label: 'Confirmed', value: 22, color: '#3b82f6' },
      { label: 'Checked out', value: 24, color: '#a78bfa' },
      { label: 'Cancelled', value: 2, color: '#ef4444' },
    ],
    topItems: [
      { name: 'Deluxe King 101', units: 26, revenue: 4680, change: 8 },
      { name: 'Family Suite 201', units: 14, revenue: 4480, change: 18 },
      { name: 'Presidential 301', units: 6, revenue: 3720, change: 32 },
      { name: 'Twin 202', units: 20, revenue: 2800, change: -4 },
    ],
    payout: {
      available: 5840,
      pending: 1150,
      nextAutoDate: '2026-04-24',
      lastPayout: 1200,
      lastPayoutDate: '2026-04-05',
    },
  },

  dine: {
    trend: trend(3, 420, 0.3, 14, 0.35),
    statusBreakdown: [
      { label: 'Preparing', value: 9, color: '#d9a441' },
      { label: 'Ready', value: 4, color: '#3b82f6' },
      { label: 'Out for delivery', value: 7, color: '#a78bfa' },
      { label: 'Served', value: 38, color: '#22c55e' },
      { label: 'Cancelled', value: 2, color: '#ef4444' },
    ],
    topItems: [
      { name: 'Chicken Biryani', units: 184, revenue: 2208, change: 12 },
      { name: 'Margherita Pizza', units: 132, revenue: 1848, change: 6 },
      { name: 'Caesar Salad', units: 96, revenue: 864, change: -2 },
      { name: 'Chocolate Lava Cake', units: 72, revenue: 504, change: 18 },
    ],
    payout: {
      available: 2140.3,
      pending: 480.5,
      nextAutoDate: '2026-04-22',
      lastPayout: 1800,
      lastPayoutDate: '2026-04-15',
    },
  },

  shops: {
    trend: trend(4, 340, 0.4, 7, 0.45),
    statusBreakdown: [
      { label: 'Processing', value: 12, color: '#d9a441' },
      { label: 'Shipped', value: 18, color: '#3b82f6' },
      { label: 'Delivered', value: 48, color: '#22c55e' },
      { label: 'Returned', value: 3, color: '#ef4444' },
      { label: 'Cancelled', value: 4, color: '#9ca3af' },
    ],
    topItems: [
      { name: 'Classic Denim Jacket', units: 48, revenue: 2352, change: 22 },
      { name: 'Wireless Headphones', units: 28, revenue: 3360, change: 8 },
      { name: 'Running Shoes', units: 36, revenue: 2484, change: -6 },
      { name: 'Leather Wallet', units: 52, revenue: 1820, change: 4 },
    ],
    payout: {
      available: 3480.52,
      pending: 642,
      nextAutoDate: '2026-04-23',
      lastPayout: 500,
      lastPayoutDate: '2026-04-14',
    },
  },

  events: {
    trend: trend(5, 820, 0.5, 18, 0.6),
    statusBreakdown: [
      { label: 'On sale', value: 3, color: '#22c55e' },
      { label: 'Sold out', value: 1, color: '#d9a441' },
      { label: 'Upcoming', value: 2, color: '#3b82f6' },
      { label: 'Completed', value: 4, color: '#a78bfa' },
    ],
    topItems: [
      { name: 'Summer Beats 2026', units: 696, revenue: 55680, change: 42 },
      { name: 'Startup Pitch Night', units: 210, revenue: 5250, change: 18 },
      { name: 'Street Food Fest', units: 500, revenue: 5000, change: 0 },
      { name: 'React Workshop', units: 48, revenue: 2400, change: -12 },
    ],
    payout: {
      available: 12450,
      pending: 2840,
      nextAutoDate: '2026-04-25',
      lastPayout: 2000,
      lastPayoutDate: '2026-03-08',
    },
  },
}
