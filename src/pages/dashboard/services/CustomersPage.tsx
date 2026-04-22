import { useMemo, useState } from 'react'
import { Search, Eye, Phone, Mail, MapPin, User as UserIcon } from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import CustomerDrawer from './CustomerDrawer'
import {
  INITIAL_CUSTOMERS,
  CUSTOMER_STATUS_OPTIONS,
  type Customer,
} from './customerTypes'

const allFilter = '__all__'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return customers
      .filter((c) => {
        if (statusFilter !== allFilter && c.status !== statusFilter) return false
        if (!q) return true
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.tags.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const ta = a.lastBookingAt ? new Date(a.lastBookingAt).getTime() : 0
        const tb = b.lastBookingAt ? new Date(b.lastBookingAt).getTime() : 0
        return tb - ta
      })
  }, [customers, search, statusFilter])

  const totals = useMemo(() => {
    const vip = customers.filter((c) => c.status === 'vip').length
    const active = customers.filter((c) => c.status === 'active').length
    const inactive = customers.filter((c) => c.status === 'inactive').length
    const blocked = customers.filter((c) => c.status === 'blocked').length
    const newThisMonth = customers.filter((c) => {
      const d = new Date(c.joinedAt)
      const now = new Date()
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
    const lifetimeRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
    return {
      total: customers.length,
      vip,
      active,
      inactive,
      blocked,
      newThisMonth,
      lifetimeRevenue,
    }
  }, [customers])

  const selected = openId ? customers.find((c) => c.id === openId) ?? null : null

  const handleUpdate = (id: string, patch: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  const handleDelete = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Everyone who has booked a service — contact info, history, and value."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <SummaryTile label="Total" value={totals.total} tone="neutral" />
        <SummaryTile label="Active" value={totals.active} tone="success" />
        <SummaryTile label="VIP" value={totals.vip} tone="warning" />
        <SummaryTile label="New this month" value={totals.newThisMonth} tone="info" />
        <SummaryTile label="Blocked" value={totals.blocked} tone="danger" />
        <SummaryTile
          label="Lifetime revenue"
          value={`$${totals.lifetimeRevenue.toFixed(0)}`}
          tone="brand"
          compact
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by name, phone, email, city, or tag"
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
          <table className="w-full min-w-[1120px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 text-right font-medium">Bookings</th>
                <th className="px-4 py-3 text-right font-medium">Total spent</th>
                <th className="px-4 py-3 font-medium">Last visit</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No customers match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const completionRate =
                    c.totalBookings > 0
                      ? Math.round((c.completedBookings / c.totalBookings) * 100)
                      : 0
                  return (
                    <tr
                      key={c.id}
                      className={`cursor-pointer border-b border-surface-border last:border-b-0 hover:bg-surface-elevated ${
                        c.status === 'blocked' ? 'opacity-75' : ''
                      }`}
                      onClick={() => setOpenId(c.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={c.avatar} alt={c.name} />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-gray-100">{c.name}</div>
                            <div className="text-[11px] text-gray-500">
                              Since {formatDate(c.joinedAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-300">
                          <Phone size={11} className="text-gray-500" />
                          <span className="text-sm">{c.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Mail size={11} />
                          <span className="truncate text-xs">{c.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-1 text-gray-300">
                          <MapPin size={12} className="mt-0.5 shrink-0 text-gray-500" />
                          <div className="min-w-0">
                            <div
                              className="max-w-[160px] truncate text-sm"
                              title={c.address}
                            >
                              {c.address}
                            </div>
                            <div className="text-xs text-gray-500">{c.city}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-medium text-gray-100">{c.totalBookings}</div>
                        <div className="text-[11px] text-gray-500">
                          {c.completedBookings} done · {completionRate}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-gray-100">
                          ${c.totalSpent.toFixed(0)}
                        </div>
                        {c.preferredService ? (
                          <div
                            className="max-w-[140px] truncate text-[11px] text-gray-500"
                            title={c.preferredService}
                          >
                            {c.preferredService}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-200">{formatDate(c.lastBookingAt)}</div>
                        {c.lastServiceName ? (
                          <div
                            className="max-w-[150px] truncate text-[11px] text-gray-500"
                            title={c.lastServiceName}
                          >
                            {c.lastServiceName}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            title="View profile"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenId(c.id)
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-gray-300 hover:border-surface-border hover:bg-surface-card hover:text-white"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerDrawer
        open={openId !== null}
        customer={selected}
        onClose={() => setOpenId(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  )
}

function Avatar({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-gray-400">
        <UserIcon size={16} />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-10 w-10 shrink-0 rounded-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
    />
  )
}

function SummaryTile({
  label,
  value,
  tone,
  compact,
}: {
  label: string
  value: number | string
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'muted' | 'info' | 'brand'
  compact?: boolean
}) {
  const toneClass: Record<typeof tone, string> = {
    neutral: 'text-gray-100',
    success: 'text-accent-success',
    warning: 'text-accent-amber',
    danger: 'text-accent-danger',
    muted: 'text-gray-400',
    info: 'text-blue-400',
    brand: 'text-brand-cream',
  }
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div
        className={`mt-1 font-semibold ${toneClass[tone]} ${
          compact ? 'text-lg' : 'text-xl'
        }`}
      >
        {value}
      </div>
    </div>
  )
}
