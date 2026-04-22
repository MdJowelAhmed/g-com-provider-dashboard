import { useEffect, useMemo, useState } from 'react'
import {
  Drawer,
  Button,
  Space,
  Divider,
  Tag,
  Input,
  Select,
  Popconfirm,
  message,
} from 'antd'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Users,
  CreditCard,
  FileText,
  User as UserIcon,
  ExternalLink,
  Star,
} from 'lucide-react'
import {
  BOOKING_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_METHOD_LABELS,
  type Booking,
  type BookingStatus,
  type PaymentStatus,
} from './bookingTypes'

type Props = {
  open: boolean
  booking: Booking | null
  onClose: () => void
  onUpdate: (id: string, patch: Partial<Booking>) => void
  onDelete: (id: string) => void
}

const statusToneClass: Record<BookingStatus, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  confirmed: 'bg-blue-500/15 text-blue-400',
  in_progress: 'bg-brand/20 text-brand-cream',
  completed: 'bg-accent-success/15 text-accent-success',
  cancelled: 'bg-accent-danger/15 text-accent-danger',
  no_show: 'bg-gray-500/20 text-gray-300',
}

const paymentToneClass: Record<PaymentStatus, string> = {
  unpaid: 'bg-accent-danger/15 text-accent-danger',
  partial: 'bg-accent-amber/15 text-accent-amber',
  paid: 'bg-accent-success/15 text-accent-success',
  refunded: 'bg-gray-500/20 text-gray-300',
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(mins: number) {
  if (!mins) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

function statusLabel(s: BookingStatus) {
  return BOOKING_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function paymentLabel(s: PaymentStatus) {
  return PAYMENT_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function mapSrc(lat: number, lon: number) {
  const latDelta = 0.003
  const lonDelta = 0.005
  const minLon = lon - lonDelta
  const minLat = lat - latDelta
  const maxLon = lon + lonDelta
  const maxLat = lat + latDelta
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lon}`
}

function mapLink(lat: number, lon: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`
}

export default function BookingDrawer({ open, booking, onClose, onUpdate, onDelete }: Props) {
  const [internalNotes, setInternalNotes] = useState('')

  useEffect(() => {
    setInternalNotes(booking?.internalNotes ?? '')
  }, [booking])

  const src = useMemo(
    () => (booking ? mapSrc(booking.location.latitude, booking.location.longitude) : ''),
    [booking],
  )

  if (!booking) {
    return <Drawer open={open} onClose={onClose} width={720} title="Booking" />
  }

  const saveNotes = () => {
    onUpdate(booking.id, { internalNotes, updatedAt: new Date().toISOString() })
    message.success('Notes saved')
  }

  const changeStatus = (status: BookingStatus) => {
    onUpdate(booking.id, { status, updatedAt: new Date().toISOString() })
  }

  const changePayment = (paymentStatus: PaymentStatus) => {
    const patch: Partial<Booking> = { paymentStatus, updatedAt: new Date().toISOString() }
    if (paymentStatus === 'paid') patch.paidAmount = booking.amount
    if (paymentStatus === 'unpaid' || paymentStatus === 'refunded') patch.paidAmount = 0
    onUpdate(booking.id, patch)
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={760}
      placement="right"
      destroyOnHidden
      title={
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold">Booking</span>
          <span className="rounded-md bg-surface-elevated px-2 py-0.5 font-mono text-xs text-gray-300">
            {booking.code}
          </span>
        </div>
      }
      extra={
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
            statusToneClass[booking.status]
          }`}
        >
          {statusLabel(booking.status)}
        </span>
      }
      footer={
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Popconfirm
            title="Delete booking?"
            description="This will permanently remove the booking record."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              onDelete(booking.id)
              onClose()
            }}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
          <Space>
            <Button onClick={onClose}>Close</Button>
            <Button type="primary" onClick={saveNotes}>
              Save notes
            </Button>
          </Space>
        </Space>
      }
    >
      <SectionTitle>Customer</SectionTitle>
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-surface-border bg-surface-elevated p-3">
        {booking.customer.avatar ? (
          <img
            src={booking.customer.avatar}
            alt={booking.customer.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-card text-gray-400">
            <UserIcon size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-100">{booking.customer.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
            <a
              href={`tel:${booking.customer.phone}`}
              className="inline-flex items-center gap-1 hover:text-brand-cream"
            >
              <Phone size={12} />
              {booking.customer.phone}
            </a>
            <a
              href={`mailto:${booking.customer.email}`}
              className="inline-flex items-center gap-1 hover:text-brand-cream"
            >
              <Mail size={12} />
              {booking.customer.email}
            </a>
          </div>
        </div>
      </div>

      <SectionTitle>Service & schedule</SectionTitle>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <InfoCard icon={<FileText size={14} />} label="Service">
          <div className="font-medium text-gray-100">{booking.service.name}</div>
          <div className="text-xs text-gray-500">
            {booking.service.category} · {booking.service.code}
          </div>
        </InfoCard>
        <InfoCard icon={<Calendar size={14} />} label="Scheduled at">
          <div className="font-medium text-gray-100">{formatDateTime(booking.scheduledAt)}</div>
        </InfoCard>
        <InfoCard icon={<Clock size={14} />} label="Duration">
          <div className="font-medium text-gray-100">{formatDuration(booking.durationMinutes)}</div>
        </InfoCard>
        <InfoCard icon={<Users size={14} />} label="Staff assigned">
          {booking.staffAssigned.length ? (
            <div className="flex flex-wrap gap-1">
              {booking.staffAssigned.map((s) => (
                <Tag key={s} color="default">
                  {s}
                </Tag>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">Unassigned</span>
          )}
        </InfoCard>
        {booking.addons ? (
          <InfoCard icon={<FileText size={14} />} label="Add-ons" span={2}>
            <div className="text-gray-200">{booking.addons}</div>
          </InfoCard>
        ) : null}
      </div>

      <SectionTitle>Customer location</SectionTitle>
      <div className="mb-4 overflow-hidden rounded-lg border border-surface-border">
        <div className="bg-surface-elevated px-3 py-2">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-100">{booking.location.address}</div>
              <div className="text-xs text-gray-500">{booking.location.city}</div>
              {booking.location.accessNotes ? (
                <div className="mt-1 text-xs text-gray-400">
                  <span className="font-medium text-gray-300">Access: </span>
                  {booking.location.accessNotes}
                </div>
              ) : null}
            </div>
            <a
              href={mapLink(booking.location.latitude, booking.location.longitude)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1 text-xs text-brand-cream hover:underline"
            >
              Open map <ExternalLink size={11} />
            </a>
          </div>
        </div>
        <iframe
          title="Customer location"
          src={src}
          className="block h-56 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <SectionTitle>Payment</SectionTitle>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <InfoCard icon={<CreditCard size={14} />} label="Total">
          <div className="font-semibold text-gray-100">${booking.amount.toFixed(2)}</div>
        </InfoCard>
        <InfoCard icon={<CreditCard size={14} />} label="Paid">
          <div className="font-semibold text-gray-100">${booking.paidAmount.toFixed(2)}</div>
        </InfoCard>
        <InfoCard icon={<CreditCard size={14} />} label="Method">
          <div className="font-medium text-gray-100">
            {PAYMENT_METHOD_LABELS[booking.paymentMethod]}
          </div>
        </InfoCard>
        <div className="col-span-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
              paymentToneClass[booking.paymentStatus]
            }`}
          >
            {paymentLabel(booking.paymentStatus)}
          </span>
        </div>
      </div>

      {booking.review ? (
        <>
          <SectionTitle>Customer review</SectionTitle>
          <div className="mb-4 rounded-lg border border-surface-border bg-surface-elevated p-3">
            <div className="mb-1 flex items-center justify-between">
              <StarRating rating={booking.review.rating} />
              <span className="text-xs text-gray-500">
                {formatDateTime(booking.review.createdAt)}
              </span>
            </div>
            {booking.review.comment ? (
              <div className="mt-1 text-sm text-gray-200">{booking.review.comment}</div>
            ) : null}
          </div>
        </>
      ) : booking.status === 'completed' ? (
        <>
          <SectionTitle>Customer review</SectionTitle>
          <div className="mb-4 rounded-lg border border-dashed border-surface-border bg-surface-elevated p-3 text-sm text-gray-500">
            No review submitted yet.
          </div>
        </>
      ) : null}

      {booking.customerNotes ? (
        <>
          <SectionTitle>Customer notes</SectionTitle>
          <div className="mb-4 rounded-lg border border-surface-border bg-surface-elevated p-3 text-sm text-gray-200">
            {booking.customerNotes}
          </div>
        </>
      ) : null}

      <SectionTitle>Internal notes</SectionTitle>
      <Input.TextArea
        rows={3}
        value={internalNotes}
        onChange={(e) => setInternalNotes(e.target.value)}
        placeholder="Only visible to your team"
        className="mb-4"
      />

      <Divider />

      <SectionTitle>Manage</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">Booking status</div>
          <Select
            value={booking.status}
            style={{ width: '100%' }}
            options={BOOKING_STATUS_OPTIONS}
            onChange={(v) => changeStatus(v)}
          />
        </div>
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">Payment status</div>
          <Select
            value={booking.paymentStatus}
            style={{ width: '100%' }}
            options={PAYMENT_STATUS_OPTIONS}
            onChange={(v) => changePayment(v)}
          />
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Created {formatDateTime(booking.createdAt)} · Updated {formatDateTime(booking.updatedAt)}
      </div>
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={15}
            className={
              i <= Math.round(rating)
                ? 'fill-accent-amber text-accent-amber'
                : 'text-gray-600'
            }
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-100">{rating.toFixed(1)}</span>
    </div>
  )
}

function InfoCard({
  icon,
  label,
  children,
  span = 1,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  span?: 1 | 2 | 3
}) {
  const cls =
    span === 3 ? 'col-span-3' : span === 2 ? 'col-span-2' : ''
  return (
    <div
      className={`rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 ${cls}`}
    >
      <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-500">
        {icon}
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  )
}
