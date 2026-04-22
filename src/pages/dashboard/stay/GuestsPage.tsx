import { useMemo, useState } from 'react'
import {
  Search,
  Eye,
  Phone,
  Mail,
  Globe,
  IdCard,
  BedDouble,
  User as UserIcon,
} from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import GuestDrawer from './GuestDrawer'
import {
  INITIAL_GUESTS,
  GUEST_ID_TYPE_LABELS,
  type Guest,
} from './guestTypes'

const allFilter = '__all__'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState<string>(allFilter)
  const [returningFilter, setReturningFilter] = useState<string>(allFilter)
  const [openId, setOpenId] = useState<string | null>(null)

  const countries = useMemo(
    () =>
      Array.from(new Set(guests.map((g) => g.country))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [guests],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return guests
      .filter((g) => {
        if (countryFilter !== allFilter && g.country !== countryFilter) return false
        if (returningFilter === 'returning' && g.totalStays <= 1) return false
        if (returningFilter === 'new' && g.totalStays > 1) return false
        if (!q) return true
        return (
          g.name.toLowerCase().includes(q) ||
          g.phone.toLowerCase().includes(q) ||
          g.email.toLowerCase().includes(q) ||
          g.country.toLowerCase().includes(q) ||
          g.idNumber.toLowerCase().includes(q) ||
          g.tags.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const ta = a.lastStayAt ? new Date(a.lastStayAt).getTime() : 0
        const tb = b.lastStayAt ? new Date(b.lastStayAt).getTime() : 0
        return tb - ta
      })
  }, [guests, search, countryFilter, returningFilter])

  const totals = useMemo(() => {
    const returning = guests.filter((g) => g.totalStays > 1).length
    const newThisMonth = guests.filter((g) => {
      const d = new Date(g.firstStayAt)
      const now = new Date()
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
    const totalNights = guests.reduce((sum, g) => sum + g.totalNights, 0)
    const totalRevenue = guests.reduce((sum, g) => sum + g.totalSpent, 0)
    const completedStays = guests.reduce((sum, g) => sum + g.completedStays, 0)
    const avgStay =
      completedStays > 0 ? (totalNights / completedStays).toFixed(1) : '—'
    return {
      total: guests.length,
      returning,
      newThisMonth,
      totalNights,
      avgStay,
      totalRevenue,
    }
  }, [guests])

  const selected = openId ? guests.find((g) => g.id === openId) ?? null : null

  const handleUpdate = (id: string, patch: Partial<Guest>) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }

  const handleDelete = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <div>
      <PageHeader
        title="Guests"
        description="Everyone who has stayed — profiles, stay history, and preferences."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <SummaryTile label="Total" value={totals.total} tone="neutral" />
        <SummaryTile label="Returning" value={totals.returning} tone="success" />
        <SummaryTile label="New this month" value={totals.newThisMonth} tone="info" />
        <SummaryTile label="Total nights" value={totals.totalNights} tone="brand" />
        <SummaryTile
          label="Avg. stay"
          value={totals.avgStay === '—' ? '—' : `${totals.avgStay}n`}
          tone="neutral"
          compact
        />
        <SummaryTile
          label="Lifetime revenue"
          value={`$${totals.totalRevenue.toFixed(0)}`}
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
            placeholder="Search by name, email, phone, ID, country, or tag"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-surface-border bg-surface-card pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={returningFilter}
          onChange={(e) => setReturningFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All guests</option>
          <option value="returning">Returning (2+ stays)</option>
          <option value="new">First-time</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">ID document</th>
                <th className="px-4 py-3 text-right font-medium">Stays</th>
                <th className="px-4 py-3 text-right font-medium">Nights</th>
                <th className="px-4 py-3 text-right font-medium">Total spent</th>
                <th className="px-4 py-3 font-medium">Last stay</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    No guests match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((g) => {
                  const completionRate =
                    g.totalStays > 0
                      ? Math.round((g.completedStays / g.totalStays) * 100)
                      : 0
                  return (
                    <tr
                      key={g.id}
                      className="cursor-pointer border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                      onClick={() => setOpenId(g.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={g.avatar} alt={g.name} />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-gray-100">
                              {g.name}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-gray-500">
                              <Globe size={10} />
                              {g.country}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-300">
                          <Phone size={11} className="text-gray-500" />
                          <span className="text-sm">{g.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Mail size={11} />
                          <span className="truncate text-xs">{g.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-300">
                          <IdCard size={12} className="text-gray-500" />
                          <span className="text-sm">{GUEST_ID_TYPE_LABELS[g.idType]}</span>
                        </div>
                        <div
                          className="max-w-[160px] truncate font-mono text-[11px] text-gray-500"
                          title={g.idNumber}
                        >
                          {g.idNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-medium text-gray-100">{g.totalStays}</div>
                        <div className="text-[11px] text-gray-500">
                          {g.completedStays} done · {completionRate}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-medium text-gray-100">{g.totalNights}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-gray-100">
                          ${g.totalSpent.toFixed(0)}
                        </div>
                        {g.preferredRoomType ? (
                          <div className="flex items-center justify-end gap-1 text-[11px] text-gray-500">
                            <BedDouble size={10} />
                            {g.preferredRoomType}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-200">{formatDate(g.lastStayAt)}</div>
                        {g.lastRoomName ? (
                          <div
                            className="max-w-[160px] truncate text-[11px] text-gray-500"
                            title={g.lastRoomName}
                          >
                            {g.lastRoomName}
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
                              setOpenId(g.id)
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

      <GuestDrawer
        open={openId !== null}
        guest={selected}
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
