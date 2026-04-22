import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROLE_META } from '../../config/roleConfig'
import { ROLE_MOCK } from '../../data/mockData'
import { OVERVIEW_DATA } from '../../data/overviewData'
import PageHeader from '../../components/dashboard/PageHeader'
import StatCard from '../../components/dashboard/StatCard'

type RangeKey = '7d' | '30d' | '90d'

const RANGE_DAYS: Record<RangeKey, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

const RANGE_LABEL: Record<RangeKey, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
}

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `$${(n / 1000).toFixed(1)}K`
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function formatNum(n: number) {
  return n.toLocaleString()
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export default function Overview() {
  const { user } = useAuth()
  const [range, setRange] = useState<RangeKey>('30d')

  if (!user) return null

  const meta = ROLE_META[user.role]
  const mock = ROLE_MOCK[user.role]
  const overview = OVERVIEW_DATA[user.role]
  const RoleIcon = meta.icon

  const rangedTrend = useMemo(
    () => overview.trend.slice(-RANGE_DAYS[range]),
    [overview.trend, range],
  )

  const periodTotals = useMemo(() => {
    const prev = overview.trend.slice(
      -RANGE_DAYS[range] * 2,
      -RANGE_DAYS[range],
    )
    const revenue = rangedTrend.reduce((s, p) => s + p.revenue, 0)
    const orders = rangedTrend.reduce((s, p) => s + p.orders, 0)
    const prevRevenue = prev.reduce((s, p) => s + p.revenue, 0) || 1
    const prevOrders = prev.reduce((s, p) => s + p.orders, 0) || 1
    const revenueDelta = ((revenue - prevRevenue) / prevRevenue) * 100
    const orderDelta = ((orders - prevOrders) / prevOrders) * 100
    const aov = orders ? revenue / orders : 0
    return {
      revenue,
      orders,
      revenueDelta,
      orderDelta,
      aov,
    }
  }, [rangedTrend, overview.trend, range])

  const totalStatus = overview.statusBreakdown.reduce((s, x) => s + x.value, 0)

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user.businessName || user.ownerName}`}
        description={`${meta.label} dashboard — here's what's happening today.`}
        actions={<RangeToggle value={range} onChange={setRange} />}
      />

      {!user.stripeConnected && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-accent-amber/40 bg-accent-amber/10 p-4 text-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-amber/20 text-accent-amber">
            <RoleIcon size={16} />
          </div>
          <div className="flex-1 text-accent-amber">
            <div className="font-medium">Finish setting up payouts</div>
            <p className="mt-0.5 text-xs text-accent-amber/80">
              Connect Stripe to start receiving payments from customers.
            </p>
          </div>
          <Link
            to={`/dashboard/${user.role}/withdraw`}
            className="flex h-8 items-center rounded-md bg-accent-amber px-3 text-xs font-semibold text-gray-900 hover:bg-accent-amber/90"
          >
            Connect Stripe
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mock.stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            delta={s.delta}
            trend={s.trend}
            icon={s.icon}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-100">Revenue & orders</div>
              <div className="text-xs text-gray-400">{RANGE_LABEL[range]}</div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Metric
                label="Revenue"
                value={formatMoney(periodTotals.revenue)}
                delta={periodTotals.revenueDelta}
              />
              <Metric
                label="Orders"
                value={formatNum(periodTotals.orders)}
                delta={periodTotals.orderDelta}
              />
              <Metric label="AOV" value={formatMoney(periodTotals.aov)} />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={rangedTrend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a0522d" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#a0522d" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d9a441" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#d9a441" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2e2e34" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#2e2e34' }}
                  tickFormatter={(v: string) => shortDate(v)}
                  minTickGap={24}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => formatMoney(v)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#19191b',
                    border: '1px solid #2e2e34',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#e5e7eb' }}
                  labelFormatter={(v) => shortDate(String(v))}
                  formatter={(value, name) =>
                    name === 'revenue'
                      ? [formatMoney(Number(value)), 'Revenue']
                      : [formatNum(Number(value)), 'Orders']
                  }
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#a0522d"
                  strokeWidth={2}
                  fill="url(#gradRevenue)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#d9a441"
                  strokeWidth={2}
                  fill="url(#gradOrders)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <PayoutCard role={user.role} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-surface-border bg-surface-card p-5">
          <div className="mb-1 text-sm font-semibold text-gray-100">Status breakdown</div>
          <div className="mb-3 text-xs text-gray-400">{totalStatus} records this period</div>
          <div className="flex items-center gap-4">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview.statusBreakdown}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {overview.statusBreakdown.map((s) => (
                      <Cell key={s.label} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#19191b',
                      border: '1px solid #2e2e34',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    itemStyle={{ color: '#e5e7eb' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 text-sm">
              {overview.statusBreakdown.map((s) => {
                const pct = totalStatus ? Math.round((s.value / totalStatus) * 100) : 0
                return (
                  <div key={s.label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span className="text-gray-300">{s.label}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {s.value} · {pct}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-5">
          <div className="mb-1 text-sm font-semibold text-gray-100">Top performers</div>
          <div className="mb-4 text-xs text-gray-400">Revenue leaders this period</div>
          <ul className="space-y-3 text-sm">
            {overview.topItems.map((it, idx) => (
              <li key={it.name} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-elevated text-xs font-semibold text-gray-300">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-gray-100">{it.name}</div>
                  <div className="text-xs text-gray-500">{it.units} sold</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-100">{formatMoney(it.revenue)}</div>
                  <div
                    className={`text-xs ${it.change >= 0 ? 'text-accent-success' : 'text-accent-danger'}`}
                  >
                    {it.change >= 0 ? '+' : ''}
                    {it.change}%
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function RangeToggle({
  value,
  onChange,
}: {
  value: RangeKey
  onChange: (v: RangeKey) => void
}) {
  return (
    <div className="flex h-10 items-center rounded-md border border-surface-border bg-surface-card p-1">
      {(['7d', '30d', '90d'] as RangeKey[]).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`h-8 rounded px-3 text-xs font-medium transition ${
            value === r
              ? 'bg-surface-elevated text-gray-100'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  )
}

function Metric({
  label,
  value,
  delta,
}: {
  label: string
  value: string
  delta?: number
}) {
  const up = (delta ?? 0) >= 0
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-gray-100">{value}</div>
      {delta != null && (
        <div
          className={`flex items-center gap-1 text-xs ${up ? 'text-accent-success' : 'text-accent-danger'}`}
        >
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {up ? '+' : ''}
          {delta.toFixed(1)}%
        </div>
      )}
    </div>
  )
}

function PayoutCard({ role }: { role: string }) {
  const payout = OVERVIEW_DATA[role as keyof typeof OVERVIEW_DATA].payout
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-100">Payout snapshot</div>
        <Wallet size={14} className="text-gray-500" />
      </div>
      <div className="mb-5 text-xs text-gray-400">Balance ready for withdrawal</div>

      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500">Available</div>
        <div className="text-3xl font-semibold text-accent-success">
          {new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: 'USD',
          }).format(payout.available)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2">
          <div className="text-xs text-gray-500">Pending</div>
          <div className="text-gray-100">{formatMoney(payout.pending)}</div>
        </div>
        <div className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2">
          <div className="text-xs text-gray-500">Last payout</div>
          <div className="text-gray-100">
            {formatMoney(payout.lastPayout)}
            <span className="ml-1 text-xs text-gray-500">
              · {shortDate(payout.lastPayoutDate)}
            </span>
          </div>
        </div>
      </div>

      {payout.nextAutoDate && (
        <div className="mt-3 text-xs text-gray-400">
          Next auto-payout on{' '}
          <span className="text-gray-200">{shortDate(payout.nextAutoDate)}</span>
        </div>
      )}

      <Link
        to={`/dashboard/${role}/withdraw`}
        className="mt-5 flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-brand text-sm font-medium text-white hover:bg-brand-hover"
      >
        <ArrowUpRight size={14} /> Withdraw funds
      </Link>
    </div>
  )
}

