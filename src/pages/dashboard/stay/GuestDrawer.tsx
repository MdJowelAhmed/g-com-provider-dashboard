import { useEffect, useState } from 'react'
import { Drawer, Button, Space, Input, Tag, Divider, message, Popconfirm } from 'antd'
import {
  Phone,
  Mail,
  Globe,
  Calendar,
  Star,
  IdCard,
  BedDouble,
  Languages,
  User as UserIcon,
} from 'lucide-react'
import {
  GUEST_ID_TYPE_LABELS,
  type Guest,
  type GuestRecentStayStatus,
} from './guestTypes'

type Props = {
  open: boolean
  guest: Guest | null
  onClose: () => void
  onUpdate: (id: string, patch: Partial<Guest>) => void
  onDelete: (id: string) => void
}

const stageToneClass: Record<GuestRecentStayStatus, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  confirmed: 'bg-blue-500/15 text-blue-400',
  checked_in: 'bg-brand/20 text-brand-cream',
  checked_out: 'bg-accent-success/15 text-accent-success',
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

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function GuestDrawer({ open, guest, onClose, onUpdate, onDelete }: Props) {
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [preferences, setPreferences] = useState('')

  useEffect(() => {
    setNotes(guest?.notes ?? '')
    setTags(guest?.tags ?? '')
    setPreferences(guest?.preferences ?? '')
  }, [guest])

  if (!guest) {
    return <Drawer open={open} onClose={onClose} width={760} title="Guest" />
  }

  const saveMeta = () => {
    onUpdate(guest.id, { notes, tags, preferences })
    message.success('Guest updated')
  }

  const completionRate =
    guest.totalStays > 0
      ? Math.round((guest.completedStays / guest.totalStays) * 100)
      : 0
  const avgNights =
    guest.completedStays > 0
      ? Math.round((guest.totalNights / guest.completedStays) * 10) / 10
      : null

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={760}
      placement="right"
      destroyOnHidden
      title={<span className="text-base font-semibold">Guest profile</span>}
      footer={
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Popconfirm
            title="Delete guest record?"
            description="This will remove the guest profile. Reservations won't be affected."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              onDelete(guest.id)
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
        {guest.avatar ? (
          <img
            src={guest.avatar}
            alt={guest.name}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-card text-gray-400">
            <UserIcon size={22} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold text-gray-100">{guest.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
            <a
              href={`tel:${guest.phone}`}
              className="inline-flex items-center gap-1 hover:text-brand-cream"
            >
              <Phone size={12} />
              {guest.phone}
            </a>
            <a
              href={`mailto:${guest.email}`}
              className="inline-flex items-center gap-1 hover:text-brand-cream"
            >
              <Mail size={12} />
              {guest.email}
            </a>
            <span className="inline-flex items-center gap-1">
              <Globe size={12} />
              {guest.country}
            </span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
            <IdCard size={11} />
            {GUEST_ID_TYPE_LABELS[guest.idType]} · {guest.idNumber}
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={11} /> First stay {formatDate(guest.firstStayAt)}
          </div>
        </div>
      </div>

      <SectionTitle>Lifetime stats</SectionTitle>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Stays" value={guest.totalStays} />
        <StatTile
          label="Completed"
          value={`${guest.completedStays} · ${completionRate}%`}
          tone="success"
        />
        <StatTile label="Nights" value={guest.totalNights} tone="brand" />
        <StatTile
          label="Avg. length"
          value={avgNights != null ? `${avgNights}n` : '—'}
          compact
        />
        <StatTile
          label="Total spent"
          value={`$${guest.totalSpent.toFixed(0)}`}
          tone="brand"
        />
        <StatTile label="Cancelled" value={guest.cancelledStays} tone="danger" />
        <StatTile
          label="Avg. rating"
          value={
            guest.averageRating != null ? (
              <span className="inline-flex items-center gap-1">
                <Star size={13} className="fill-accent-amber text-accent-amber" />
                {guest.averageRating.toFixed(1)}
              </span>
            ) : (
              '—'
            )
          }
        />
        <StatTile
          label="Last stay"
          value={formatDate(guest.lastStayAt)}
          compact
        />
      </div>

      <SectionTitle>Preferences</SectionTitle>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2">
          <div className="mb-1 inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-500">
            <BedDouble size={13} /> Preferred room
          </div>
          <div className="text-sm text-gray-100">{guest.preferredRoomType ?? '—'}</div>
        </div>
        <div className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2">
          <div className="mb-1 inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-500">
            <Languages size={13} /> Languages
          </div>
          <div className="text-sm text-gray-100">{guest.languages || '—'}</div>
        </div>
      </div>
      <Input.TextArea
        rows={2}
        value={preferences}
        onChange={(e) => setPreferences(e.target.value)}
        placeholder="Dietary, accessibility, room-setup preferences…"
        className="mb-4"
      />

      <SectionTitle>Recent stays</SectionTitle>
      <div className="mb-4 overflow-hidden rounded-lg border border-surface-border">
        {guest.recentStays.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-500">No stays yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Room</th>
                <th className="px-3 py-2 font-medium">Dates</th>
                <th className="px-3 py-2 font-medium">Nights</th>
                <th className="px-3 py-2 font-medium">Stage</th>
                <th className="px-3 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {guest.recentStays.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-surface-border first:border-t-0"
                >
                  <td className="px-3 py-2 font-mono text-xs text-gray-300">{s.code}</td>
                  <td className="px-3 py-2">
                    <div className="text-gray-200">#{s.roomNumber}</div>
                    <div
                      className="max-w-[180px] truncate text-[11px] text-gray-500"
                      title={s.roomName}
                    >
                      {s.roomName}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-400">
                    {formatShortDate(s.checkIn)} → {formatShortDate(s.checkOut)}
                  </td>
                  <td className="px-3 py-2 text-gray-300">{s.nights}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        stageToneClass[s.status]
                      }`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-gray-100">
                    ${s.amount.toFixed(2)}
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
        placeholder="Comma separated — e.g. corporate, repeat, vip"
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
