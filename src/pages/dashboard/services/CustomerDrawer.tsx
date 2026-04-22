import { useEffect, useState } from 'react'
import { Drawer, Button, Space, Input, Tag, Divider, message, Popconfirm } from 'antd'
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  User as UserIcon,
} from 'lucide-react'
import {
  type Customer,
  type CustomerRecentBookingStatus,
} from './customerTypes'

type Props = {
  open: boolean
  customer: Customer | null
  onClose: () => void
  onUpdate: (id: string, patch: Partial<Customer>) => void
  onDelete: (id: string) => void
}

const bookingStatusToneClass: Record<CustomerRecentBookingStatus, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  confirmed: 'bg-blue-500/15 text-blue-400',
  in_progress: 'bg-brand/20 text-brand-cream',
  completed: 'bg-accent-success/15 text-accent-success',
  cancelled: 'bg-accent-danger/15 text-accent-danger',
  no_show: 'bg-gray-500/20 text-gray-300',
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CustomerDrawer({ open, customer, onClose, onUpdate, onDelete }: Props) {
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')

  useEffect(() => {
    setNotes(customer?.notes ?? '')
    setTags(customer?.tags ?? '')
  }, [customer])

  if (!customer) {
    return <Drawer open={open} onClose={onClose} width={720} title="Customer" />
  }

  const saveMeta = () => {
    onUpdate(customer.id, { notes, tags })
    message.success('Customer updated')
  }

  const completionRate =
    customer.totalBookings > 0
      ? Math.round((customer.completedBookings / customer.totalBookings) * 100)
      : 0

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      placement="right"
      destroyOnHidden
      title={<span className="text-base font-semibold">Customer profile</span>}
      footer={
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Popconfirm
            title="Delete customer?"
            description="This will remove the customer record. Bookings won't be affected."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              onDelete(customer.id)
              onClose()
            }}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
          <Space>
            <Button onClick={onClose}>Close</Button>
            <Button type="primary" onClick={saveMeta}>
              Save changes
            </Button>
          </Space>
        </Space>
      }
    >
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-surface-border bg-surface-elevated p-3">
        {customer.avatar ? (
          <img
            src={customer.avatar}
            alt={customer.name}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-card text-gray-400">
            <UserIcon size={22} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold text-gray-100">{customer.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
            <a
              href={`tel:${customer.phone}`}
              className="inline-flex items-center gap-1 hover:text-brand-cream"
            >
              <Phone size={12} />
              {customer.phone}
            </a>
            <a
              href={`mailto:${customer.email}`}
              className="inline-flex items-center gap-1 hover:text-brand-cream"
            >
              <Mail size={12} />
              {customer.email}
            </a>
          </div>
          <div className="mt-1 flex items-start gap-1 text-xs text-gray-400">
            <MapPin size={12} className="mt-0.5 shrink-0" />
            <span>
              {customer.address}, {customer.city}
            </span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={11} /> Customer since {formatDate(customer.joinedAt)}
          </div>
        </div>
      </div>

      <SectionTitle>Lifetime stats</SectionTitle>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Bookings" value={customer.totalBookings} />
        <StatTile
          label="Completed"
          value={`${customer.completedBookings} · ${completionRate}%`}
          tone="success"
        />
        <StatTile label="Cancelled" value={customer.cancelledBookings} tone="danger" />
        <StatTile
          label="Total spent"
          value={`$${customer.totalSpent.toFixed(0)}`}
          tone="brand"
        />
        <StatTile
          label="Avg. rating"
          value={
            customer.averageRating != null ? (
              <span className="inline-flex items-center gap-1">
                <Star size={13} className="fill-accent-amber text-accent-amber" />
                {customer.averageRating.toFixed(1)}
              </span>
            ) : (
              '—'
            )
          }
        />
        <StatTile label="Preferred" value={customer.preferredService ?? '—'} compact />
        <StatTile label="Last visit" value={formatDate(customer.lastBookingAt)} compact />
        <StatTile
          label="Last service"
          value={customer.lastServiceName ?? '—'}
          compact
        />
      </div>

      <SectionTitle>Recent bookings</SectionTitle>
      <div className="mb-4 overflow-hidden rounded-lg border border-surface-border">
        {customer.recentBookings.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-500">No bookings yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Service</th>
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">Stage</th>
                <th className="px-3 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {customer.recentBookings.map((rb) => (
                <tr
                  key={rb.id}
                  className="border-t border-surface-border first:border-t-0"
                >
                  <td className="px-3 py-2 font-mono text-xs text-gray-300">{rb.code}</td>
                  <td className="px-3 py-2 text-gray-200">{rb.serviceName}</td>
                  <td className="px-3 py-2 text-gray-400">{formatDateTime(rb.scheduledAt)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        bookingStatusToneClass[rb.status]
                      }`}
                    >
                      {rb.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-gray-100">
                    ${rb.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Divider />

      <SectionTitle>Tags</SectionTitle>
      <Input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Comma separated — e.g. repeat, apartment"
        className="mb-3"
      />
      {tags ? (
        <div className="mb-4 flex flex-wrap gap-1">
          {tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
        </div>
      ) : null}

      <SectionTitle>Internal notes</SectionTitle>
      <Input.TextArea
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Only visible to your team"
      />
    </Drawer>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </div>
  )
}

function StatTile({
  label,
  value,
  tone = 'neutral',
  compact,
}: {
  label: string
  value: React.ReactNode
  tone?: 'neutral' | 'success' | 'danger' | 'brand'
  compact?: boolean
}) {
  const toneClass: Record<'neutral' | 'success' | 'danger' | 'brand', string> = {
    neutral: 'text-gray-100',
    success: 'text-accent-success',
    danger: 'text-accent-danger',
    brand: 'text-brand-cream',
  }
  return (
    <div className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div
        className={`mt-0.5 truncate font-semibold ${toneClass[tone]} ${
          compact ? 'text-sm' : 'text-base'
        }`}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </div>
    </div>
  )
}
