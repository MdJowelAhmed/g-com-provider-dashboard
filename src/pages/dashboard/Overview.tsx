import { useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ClipboardList,
  DollarSign,
  Loader2,
  Package,
  ShoppingBag,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDashboardRole } from '../../auth/useDashboardRole'
import { ROLE_META } from '../../config/roleConfig'
import { hasNavAccess, hasPermission } from '../../modules/permissions/resolver'
import { navItemToPermissionId } from '../../modules/permissions/navPermissionMap'
import { OVERVIEW_UI } from '../../config/overviewUiConfig'
import PageHeader from '../../components/dashboard/PageHeader'
import StatCard from '../../components/dashboard/StatCard'
import {
  useGetDashboardStatsQuery,
  useGetMonthlyRevenueQuery,
  useGetRecentOrdersQuery,
} from '../../redux/api/dashboardApi'
function formatMoney(n: number) {
  if (n >= 1_000_000) return `GH₵ ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `GH₵ ${(n / 1000).toFixed(1)}K`
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'GHS',
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

function statusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function Overview() {
  const { user } = useAuth()
  const dashboardRole = useDashboardRole()
  const year = new Date().getFullYear()
  const {
    data: statsRes,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetDashboardStatsQuery(undefined, { skip: !user })
  const {
    data: revenueRes,
    isLoading: revenueLoading,
    isError: revenueError,
  } = useGetMonthlyRevenueQuery({ year }, { skip: !user })
  const {
    data: recentRes,
    isLoading: recentLoading,
    isError: recentError,
  } = useGetRecentOrdersQuery(undefined, { skip: !user })
  const ui = OVERVIEW_UI[dashboardRole]
  const meta = ROLE_META[dashboardRole]
  const RoleIcon = meta.icon

  const stats = statsRes?.data
  const monthlyRevenue = revenueRes?.data?.data ?? []
  const recentOrders = recentRes?.data ?? []
  const chartData = useMemo(
    () =>
      monthlyRevenue.map((point) => ({
        month: point.monthName,
        revenue: point.revenue,
      })),
    [monthlyRevenue],
  )

  const isLoading = statsLoading || revenueLoading || recentLoading
  const isError = statsError || revenueError || recentError
  const statCards = [
    {
      label: ui.primaryMetricLabel,
      value: formatMoney(stats?.totalRevenueAmount ?? 0),
      icon: DollarSign,
    },
    {
      label: ui.secondaryMetricLabel,
      value: formatNum(stats?.totalOrders ?? 0),
      icon: ShoppingBag,
    },
    {
      label: 'Total sales',
      value: formatMoney(stats?.totalSalesAmount ?? 0),
      icon: ClipboardList,
    },
    {
      label: 'Products',
      value: formatNum(stats?.totalProducts ?? 0),
      icon: Package,
    },
  ]

  if (!user) return null

  if (!hasNavAccess(user, '')) {
    const fallback = meta.navItems.find((item) => hasPermission(user, navItemToPermissionId(item)))
    if (fallback && fallback.path !== '') {
      return <Navigate to={`/dashboard/${user.role}/${fallback.path}`} replace />
    }
  }

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user.businessName || user.ownerName}`}
        description={ui.subtitle}
      />
      {!user.stripeConnected && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-accent-amber/40 bg-accent-amber/10 p-4 text-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-amber/20 text-accent-amber">
            <RoleIcon size={16} />
          </div>
          <div className="flex-1 text-accent-amber">
            <div className="font-medium">Finish setting up payouts</div>
            <p className="mt-0.5 text-xs text-accent-amber/80">
              Connect Mobile Money to start receiving payments from customers.
            </p>
          </div>
          <Link
            to={`/dashboard/${user.role}/withdraw`}
            className="flex h-8 items-center rounded-md bg-accent-amber px-3 text-xs font-semibold text-gray-900 hover:bg-accent-amber/90"
          >
            Connect Mobile Money
          </Link>
        </div>
      )}

      {isError && (
        <div className="mb-6 rounded-xl border border-accent-danger/40 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger">
          Could not load dashboard analytics. Please try again.
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-surface-border bg-surface-card p-5 lg:col-span-3">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-100">{ui.chartTitle}</div>
                  <div className="text-xs text-gray-400">{year} monthly revenue</div>
                </div>
              </div>              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a0522d" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="#a0522d" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#2e2e34" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#2e2e34' }}
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => formatMoney(v)}
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
                      formatter={(value) => [
                        formatMoney(Number(value)),
                        ui.revenueSeriesName,
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#a0522d"
                      strokeWidth={2}
                      fill="url(#gradRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="rounded-xl border border-surface-border bg-surface-card p-5">              <div className="mb-1 text-sm font-semibold text-gray-100">Recent orders</div>
              <div className="mb-4 text-xs text-gray-400">Latest customer activity</div>
              {recentOrders.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">No recent orders</div>
              ) : (
                <ul className="space-y-3 text-sm">
                  {recentOrders.map((order) => (
                    <li key={order._id} className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-gray-100">
                          {order.orderId}
                        </div>
                        <div className="truncate text-xs text-gray-500">
                          {order.customer?.name ?? 'Customer'} · {shortDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-gray-200">
                          {statusLabel(order.status)}
                        </div>
                        {order.paymentStatus && (
                          <div className="text-xs text-gray-500">
                            {statusLabel(order.paymentStatus)}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}