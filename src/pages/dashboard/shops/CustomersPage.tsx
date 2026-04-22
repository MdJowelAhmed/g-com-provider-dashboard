import { useMemo, useState } from 'react'
import { Search, Eye, Mail, Phone, ShieldCheck } from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import CustomerDetailsDrawer from './CustomerDetailsDrawer'
import {
  CUSTOMER_STATUS_OPTIONS,
  INITIAL_CUSTOMERS,
  type Customer,
  type CustomerStatus,
} from './customerTypes'

const allFilter = '__all__'

const STATUS_STYLE: Record<CustomerStatus, string> = {
  active: 'bg-accent-success/15 text-accent-success',
  inactive: 'bg-gray-500/15 text-gray-300',
  vip: 'bg-purple-500/15 text-purple-300',
  blocked: 'bg-accent-danger/15 text-accent-danger',
}

function labelFor<T extends string>(
  value: T,
  options: { value: T; label: string }[],
) {
  return options.find((o) => o.value === value)?.label ?? value
}

function formatMoney(n: number) {
  return `$${n.toFixed(2)}`
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function defaultAddressSummary(c: Customer) {
  const a = c.addresses.find((x) => x.isDefault) ?? c.addresses[0]
  if (!a) return '—'
  return `${a.city}, ${a.country}`
}

export default function CustomersPage() {
  const [customers] = useState<Customer[]>(INITIAL_CUSTOMERS)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return customers.filter((c) => {
      if (statusFilter !== allFilter && c.status !== statusFilter) return false
      if (!q) return true
      const haystack =
        `${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.tags}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [customers, search, statusFilter])

  const detailsCustomer = useMemo(
    () => customers.find((c) => c.id === detailsId) ?? null,
    [customers, detailsId],
  )

  const summary = useMemo(() => {
    const totalSpend = customers.reduce((s, c) => s + c.totalSpend, 0)
    const active = customers.filter((c) => c.status === 'active' || c.status === 'vip').length
    const vip = customers.filter((c) => c.status === 'vip').length
    const blocked = customers.filter((c) => c.status === 'blocked').length
    const thirtyDaysAgo = Date.now() - 30 * 86_400_000
    const newCount = customers.filter(
      (c) => new Date(c.createdAt).getTime() >= thirtyDaysAgo,
    ).length
    return {
      total: customers.length,
      active,
      vip,
      blocked,
      newCount,
      totalSpend,
    }
  }, [customers])

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Profiles, loyalty tiers, lifetime value, and engagement across your store."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <SummaryTile label="Total" value={summary.total.toString()} tone="neutral" />
        <SummaryTile label="Active" value={summary.active.toString()} tone="success" />
        <SummaryTile label="VIP" value={summary.vip.toString()} tone="info" />
        <SummaryTile label="Blocked" value={summary.blocked.toString()} tone="danger" />
        <SummaryTile label="New (30d)" value={summary.newCount.toString()} tone="warning" />
        <SummaryTile
          label="Lifetime revenue"
          value={formatMoney(summary.totalSpend)}
          tone="success"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by name, email, phone, or tag"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-surface-border bg-surface-card pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All statuses</option>
          {CUSTOMER_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 text-right font-medium">Orders</th>
                <th className="px-4 py-3 text-right font-medium">Spend</th>
                <th className="px-4 py-3 text-right font-medium">AOV</th>
                <th className="px-4 py-3 font-medium">Last order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                    No customers match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            alt=""
                            className="h-9 w-9 rounded-full border border-surface-border object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-xs font-semibold text-gray-300">
                            {c.firstName[0]}
                            {c.lastName[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-medium text-gray-100">
                            {c.firstName} {c.lastName}
                            {c.emailVerified && c.phoneVerified && (
                              <ShieldCheck
                                size={12}
                                className="shrink-0 text-accent-success"
                              />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {c.loyaltyPoints.toLocaleString()} pts
                            {c.segment ? ` · ${c.segment}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-200">
                        <Mail size={12} className="text-gray-500" />
                        {c.email}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={12} />
                        {c.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{defaultAddressSummary(c)}</td>
                    <td className="px-4 py-3 text-right text-gray-200">{c.totalOrders}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-100">
                      {formatMoney(c.totalSpend)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {formatMoney(c.averageOrderValue)}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{formatDate(c.lastOrderDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[c.status]}`}
                      >
                        {labelFor(c.status, CUSTOMER_STATUS_OPTIONS)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton title="View profile" onClick={() => setDetailsId(c.id)}>
                          <Eye size={15} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerDetailsDrawer
        customer={detailsCustomer}
        open={detailsCustomer != null}
        onClose={() => setDetailsId(null)}
      />
    </div>
  )
}

function IconButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-gray-300 hover:border-surface-border hover:bg-surface-elevated hover:text-white"
    >
      {children}
    </button>
  )
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}) {
  const toneClass: Record<typeof tone, string> = {
    neutral: 'text-gray-100',
    success: 'text-accent-success',
    warning: 'text-accent-amber',
    danger: 'text-accent-danger',
    info: 'text-purple-300',
  }
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${toneClass[tone]}`}>{value}</div>
    </div>
  )
}
