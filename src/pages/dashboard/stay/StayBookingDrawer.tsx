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
  Calendar,
  BedDouble,
  Users,
  CreditCard,
  FileText,
  User as UserIcon,
  Globe,
  Clock,
  Star,
  IdCard,
  Building2,
} from 'lucide-react'
import {
  STAY_BOOKING_STATUS_OPTIONS,
  STAY_PAYMENT_STATUS_OPTIONS,
  STAY_PAYMENT_METHOD_LABELS,
  BOOKING_SOURCE_LABELS,
  GUEST_ID_TYPE_LABELS,
  type StayBooking,
  type StayBookingStatus,
  type StayPaymentStatus,
} from './stayBookingTypes'

type Props = {
  open: boolean
  booking: StayBooking | null
  onClose: () => void
  onUpdate: (id: string, patch: Partial<StayBooking>) => void
  onDelete: (id: string) => void
}

const statusToneClass: Record<StayBookingStatus, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  confirmed: 'bg-blue-500/15 text-blue-400',
  checked_in: 'bg-brand/20 text-brand-cream',
  checked_out: 'bg-accent-success/15 text-accent-success',
  cancelled: 'bg-accent-danger/15 text-accent-danger',
  no_show: 'bg-gray-500/20 text-gray-300',
}

const paymentToneClass: Record<StayPaymentStatus, string> = {
  unpaid: 'bg-accent-danger/15 text-accent-danger',
  deposit: 'bg-blue-500/15 text-blue-400',
  partial: 'bg-accent-amber/15 text-accent-amber',
  paid: 'bg-accent-success/15 text-accent-success',
  refunded: 'bg-gray-500/20 text-gray-300',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
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

function statusLabel(s: StayBookingStatus) {
  return STAY_BOOKING_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function paymentLabel(s: StayPaymentStatus) {
  return STAY_PAYMENT_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

export default function StayBookingDrawer({
  open,
  booking,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const [internalNotes, setInternalNotes] = useState('')

  useEffect(() => {
    setInternalNotes(booking?.internalNotes ?? '')
  }, [booking])

  const outstanding = useMemo(
    () => (booking ? Math.max(0, booking.totalAmount - booking.paidAmount) : 0),
    [booking],
  )

  if (!booking) {
    return <Drawer open={open} onClose={onClose} width={760} title="Reservation" />
  }

  const saveNotes = () => {
    onUpdate(booking.id, {
      internalNotes,
      updatedAt: new Date().toISOString(),
    })
    message.success('Notes saved')
  }

  const changeStatus = (status: StayBookingStatus) => {
    onUpdate(booking.id, { status, updatedAt: new Date().toISOString() })
  }

  const changePayment = (paymentStatus: StayPaymentStatus) => {
    const patch: Partial<StayBooking> = {
      paymentStatus,
      updatedAt: new Date().toISOString(),
    }
    if (paymentStatus === 'paid') patch.paidAmount = booking.totalAmount
    if (paymentStatus === 'unpaid' || paymentStatus === 'refunded') patch.paidAmount = 0
    onUpdate(booking.id, patch)
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={780}
      placement="right"
      destroyOnHidden
      title={
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold">Reservation</span>
          <span className="rounded-md bg-surface-elevated px-2 py-0.5 font-mono text-xs text-gray-300">
            {booking.code}
          </span>
        </div>
      }
      extra={
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            statusToneClass[booking.status]
          }`}
        >
          {statusLabel(booking.status)}
        </span>
      }
      footer={
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Popconfirm
            title="Delete reservation?"
            description="This will permanently remove the reservation record."
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
      <SectionTitle>Guest</SectionTitle>
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-surface-border bg-surface-elevated p-3">
        {booking.guest.avatar ? (
          <img
            src={booking.guest.avatar}
            alt={booking.guest.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-card text-gray-400">
            <UserIcon size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-100">{booking.guest.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
            <a
              href={`tel:${booking.guest.phone}`}
              className="inline-flex items-center gap-1 hover:text-brand-cream"
            >
              <Phone size={12} />
              {booking.guest.phone}
            </a>
            <a
              href={`mailto:${booking.guest.email}`}
              className="inline-flex items-center gap-1 hover:text-brand-cream"
            >
              <Mail size={12} />
              {booking.guest.email}
            </a>
            <span className="inline-flex items-center gap-1">
              <Globe size={12} />
              {booking.guest.country}
            </span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
            <IdCard size={12} />
            {GUEST_ID_TYPE_LABELS[booking.guest.idType]} · {booking.guest.idNumber}
          </div>
        </div>
      </div>

      <SectionTitle>Room & stay</SectionTitle>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <InfoCard icon={<BedDouble size={14} />} label="Room" span={2}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium text-gray-100">
                #{booking.room.roomNumber} · {booking.room.name}
              </div>
              <div className="text-xs text-gray-500">{booking.room.roomType}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs text-gray-500">Rate / night</div>
              <div className="font-medium text-gray-100">
                ${booking.room.nightlyRate.toFixed(2)}
              </div>
            </div>
          </div>
        </InfoCard>
        <InfoCard icon={<Calendar size={14} />} label="Check-in">
          <div className="font-medium text-gray-100">{formatDate(booking.checkIn)}</div>
        </InfoCard>
        <InfoCard icon={<Calendar size={14} />} label="Check-out">
          <div className="font-medium text-gray-100">{formatDate(booking.checkOut)}</div>
        </InfoCard>
        <InfoCard icon={<Clock size={14} />} label="Nights">
          <div className="font-medium text-gray-100">{booking.nights}</div>
        </InfoCard>
        <InfoCard icon={<Users size={14} />} label="Guests">
          <div className="font-medium text-gray-100">
            {booking.adults} adult{booking.adults === 1 ? '' : 's'}
            {booking.children > 0
              ? ` · ${booking.children} ${booking.children === 1 ? 'child' : 'children'}`
              : ''}
          </div>
        </InfoCard>
        {booking.arrivalEta ? (
          <InfoCard icon={<Clock size={14} />} label="Arrival ETA" span={2}>
            <div className="text-gray-200">{booking.arrivalEta}</div>
          </InfoCard>
        ) : null}
        {booking.addons ? (
          <InfoCard icon={<FileText size={14} />} label="Add-ons" span={2}>
            <div className="text-gray-200">{booking.addons}</div>
          </InfoCard>
        ) : null}
      </div>

      <SectionTitle>Charges</SectionTitle>
      <div className="mb-4 overflow-hidden rounded-lg border border-surface-border">
        <table className="w-full text-sm">
          <tbody>
            <ChargeRow
              label={`Room (${booking.nights} × $${booking.room.nightlyRate.toFixed(2)})`}
              amount={booking.baseAmount}
            />
            <ChargeRow label="Taxes & fees" amount={booking.taxesFees} />
            {booking.addonAmount > 0 ? (
              <ChargeRow label="Add-ons" amount={booking.addonAmount} />
            ) : null}
            {booking.discount > 0 ? (
              <ChargeRow label="Discount" amount={-booking.discount} tone="success" />
            ) : null}
            <ChargeRow label="Total" amount={booking.totalAmount} bold />
            <ChargeRow label="Paid" amount={booking.paidAmount} tone="muted" />
            {outstanding > 0 ? (
              <ChargeRow label="Outstanding" amount={outstanding} tone="danger" bold />
            ) : null}
          </tbody>
        </table>
      </div>

      <SectionTitle>Payment & source</SectionTitle>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <InfoCard icon={<CreditCard size={14} />} label="Method">
          <div className="font-medium text-gray-100">
            {STAY_PAYMENT_METHOD_LABELS[booking.paymentMethod]}
          </div>
        </InfoCard>
        <InfoCard icon={<CreditCard size={14} />} label="Payment">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              paymentToneClass[booking.paymentStatus]
            }`}
          >
            {paymentLabel(booking.paymentStatus)}
          </span>
        </InfoCard>
        <InfoCard icon={<Building2 size={14} />} label="Source">
          <div className="font-medium text-gray-100">
            {BOOKING_SOURCE_LABELS[booking.source]}
          </div>
        </InfoCard>
      </div>

      {booking.review ? (
        <>
          <SectionTitle>Guest review</SectionTitle>
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
      ) : booking.status === 'checked_out' ? (
        <>
          <SectionTitle>Guest review</SectionTitle>
          <div className="mb-4 rounded-lg border border-dashed border-surface-border bg-surface-elevated p-3 text-sm text-gray-500">
            No review submitted yet.
          </div>
        </>
      ) : null}

      {booking.specialRequests ? (
        <>
          <SectionTitle>Special requests</SectionTitle>
          <div className="mb-4 rounded-lg border border-surface-border bg-surface-elevated p-3 text-sm text-gray-200">
            {booking.specialRequests}
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
          <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
            Reservation status
          </div>
          <Select
            value={booking.status}
            style={{ width: '100%' }}
            options={STAY_BOOKING_STATUS_OPTIONS}
            onChange={(v) => changeStatus(v)}
          />
        </div>
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
            Payment status
          </div>
          <Select
            value={booking.paymentStatus}
            style={{ width: '100%' }}
            options={STAY_PAYMENT_STATUS_OPTIONS}
            onChange={(v) => changePayment(v)}
          />
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Created {formatDateTime(booking.createdAt)} · Updated{' '}
        {formatDateTime(booking.updatedAt)}
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
  const cls = span === 3 ? 'col-span-3' : span === 2 ? 'col-span-2' : ''
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

function ChargeRow({
  label,
  amount,
  tone = 'neutral',
  bold,
}: {
  label: string
  amount: number
  tone?: 'neutral' | 'muted' | 'success' | 'danger'
  bold?: boolean
}) {
  const toneClass: Record<'neutral' | 'muted' | 'success' | 'danger', string> = {
    neutral: 'text-gray-200',
    muted: 'text-gray-400',
    success: 'text-accent-success',
    danger: 'text-accent-danger',
  }
  const sign = amount < 0 ? '−' : ''
  return (
    <tr className="border-t border-surface-border first:border-t-0">
      <td
        className={`px-3 py-2 ${bold ? 'font-semibold text-gray-100' : 'text-gray-400'}`}
      >
        {label}
      </td>
      <td
        className={`px-3 py-2 text-right ${toneClass[tone]} ${bold ? 'font-semibold' : ''}`}
      >
        {sign}${Math.abs(amount).toFixed(2)}
      </td>
    </tr>
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
