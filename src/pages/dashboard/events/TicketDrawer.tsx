import { useEffect, useState } from 'react'
import {
  Drawer,
  Button,
  Space,
  Divider,
  Input,
  Select,
  Popconfirm,
  message,
} from 'antd'
import {
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Building2,
  User as UserIcon,
  Hash,
  Ticket as TicketIcon,
  CheckCircle2,
  XCircle,
  Tag as TagIcon,
} from 'lucide-react'
import {
  TICKET_STATUS_OPTIONS,
  TICKET_PAYMENT_STATUS_OPTIONS,
  TICKET_PAYMENT_METHOD_LABELS,
  TICKET_CHANNEL_LABELS,
  type Ticket,
  type TicketStatus,
  type TicketPaymentStatus,
} from './ticketTypes'

type Props = {
  open: boolean
  ticket: Ticket | null
  onClose: () => void
  onUpdate: (id: string, patch: Partial<Ticket>) => void
  onDelete: (id: string) => void
}

const statusToneClass: Record<TicketStatus, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  confirmed: 'bg-accent-success/15 text-accent-success',
  cancelled: 'bg-accent-danger/15 text-accent-danger',
  refunded: 'bg-gray-500/20 text-gray-300',
}

const paymentToneClass: Record<TicketPaymentStatus, string> = {
  unpaid: 'bg-accent-danger/15 text-accent-danger',
  paid: 'bg-accent-success/15 text-accent-success',
  refunded: 'bg-gray-500/20 text-gray-300',
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

function statusLabel(s: TicketStatus) {
  return TICKET_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

function paymentLabel(s: TicketPaymentStatus) {
  return TICKET_PAYMENT_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
}

export default function TicketDrawer({
  open,
  ticket,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setNotes(ticket?.notes ?? '')
  }, [ticket])

  if (!ticket) {
    return <Drawer open={open} onClose={onClose} width={720} title="Ticket" />
  }

  const saveNotes = () => {
    onUpdate(ticket.id, { notes })
    message.success('Notes saved')
  }

  const changeStatus = (status: TicketStatus) => {
    onUpdate(ticket.id, { status })
  }

  const changePayment = (paymentStatus: TicketPaymentStatus) => {
    onUpdate(ticket.id, { paymentStatus })
  }

  const toggleCheckIn = () => {
    if (ticket.checkedIn) {
      onUpdate(ticket.id, { checkedIn: false, checkedInAt: null })
    } else {
      onUpdate(ticket.id, {
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
      })
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      placement="right"
      destroyOnHidden
      title={
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold">Ticket</span>
          <span className="rounded-md bg-surface-elevated px-2 py-0.5 font-mono text-xs text-gray-300">
            {ticket.code}
          </span>
        </div>
      }
      extra={
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            statusToneClass[ticket.status]
          }`}
        >
          {statusLabel(ticket.status)}
        </span>
      }
      footer={
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Popconfirm
            title="Delete ticket?"
            description="This will permanently remove the ticket record."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              onDelete(ticket.id)
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
      <SectionTitle>Event</SectionTitle>
      <div className="mb-4 rounded-lg border border-surface-border bg-surface-elevated p-3">
        <div className="font-medium text-gray-100">{ticket.event.name}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
          <span className="font-mono">{ticket.event.code}</span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} /> {formatDateTime(ticket.event.startAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {formatDateTime(ticket.event.endAt)}
          </span>
        </div>
        <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} /> {ticket.event.venueLabel}
        </div>
      </div>

      <SectionTitle>Buyer</SectionTitle>
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-surface-border bg-surface-elevated p-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-card text-gray-400">
          <UserIcon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-100">{ticket.buyer.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
            {ticket.buyer.phone ? (
              <a
                href={`tel:${ticket.buyer.phone}`}
                className="inline-flex items-center gap-1 hover:text-brand-cream"
              >
                <Phone size={12} />
                {ticket.buyer.phone}
              </a>
            ) : null}
            {ticket.buyer.email ? (
              <a
                href={`mailto:${ticket.buyer.email}`}
                className="inline-flex items-center gap-1 hover:text-brand-cream"
              >
                <Mail size={12} />
                {ticket.buyer.email}
              </a>
            ) : null}
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
            <Building2 size={11} />
            {TICKET_CHANNEL_LABELS[ticket.channel]} · Issued{' '}
            {formatDateTime(ticket.issuedAt)}
          </div>
        </div>
      </div>

      <SectionTitle>Ticket details</SectionTitle>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <InfoCard icon={<TicketIcon size={14} />} label="Tier">
          <div className="font-medium text-gray-100">{ticket.tier}</div>
        </InfoCard>
        <InfoCard icon={<Hash size={14} />} label="Quantity">
          <div className="font-medium text-gray-100">× {ticket.quantity}</div>
        </InfoCard>
        {ticket.seatLabel ? (
          <InfoCard icon={<MapPin size={14} />} label="Seat / section" span={2}>
            <div className="text-gray-200">{ticket.seatLabel}</div>
          </InfoCard>
        ) : null}
        {ticket.promoCode ? (
          <InfoCard icon={<TagIcon size={14} />} label="Promo code" span={2}>
            <div className="font-mono text-gray-200">{ticket.promoCode}</div>
          </InfoCard>
        ) : null}
      </div>

      <SectionTitle>Charges</SectionTitle>
      <div className="mb-4 overflow-hidden rounded-lg border border-surface-border">
        <table className="w-full text-sm">
          <tbody>
            <ChargeRow
              label={`${ticket.quantity} × $${ticket.unitPrice.toFixed(2)}`}
              amount={ticket.subtotal}
            />
            {ticket.discount > 0 ? (
              <ChargeRow label="Discount" amount={-ticket.discount} tone="success" />
            ) : null}
            <ChargeRow label="Total" amount={ticket.total} bold />
          </tbody>
        </table>
      </div>

      <SectionTitle>Payment</SectionTitle>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <InfoCard icon={<CreditCard size={14} />} label="Method">
          <div className="font-medium text-gray-100">
            {TICKET_PAYMENT_METHOD_LABELS[ticket.paymentMethod]}
          </div>
        </InfoCard>
        <InfoCard icon={<CreditCard size={14} />} label="Payment">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              paymentToneClass[ticket.paymentStatus]
            }`}
          >
            {paymentLabel(ticket.paymentStatus)}
          </span>
        </InfoCard>
      </div>

      <SectionTitle>Check-in</SectionTitle>
      <div className="mb-4 flex items-center justify-between rounded-lg border border-surface-border bg-surface-elevated p-3">
        <div className="flex items-center gap-2">
          {ticket.checkedIn ? (
            <CheckCircle2 size={16} className="text-accent-success" />
          ) : (
            <XCircle size={16} className="text-gray-500" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-100">
              {ticket.checkedIn ? 'Checked in' : 'Not yet checked in'}
            </div>
            {ticket.checkedIn && ticket.checkedInAt ? (
              <div className="text-xs text-gray-500">
                at {formatDateTime(ticket.checkedInAt)}
              </div>
            ) : null}
          </div>
        </div>
        <Button onClick={toggleCheckIn} disabled={ticket.status !== 'confirmed'}>
          {ticket.checkedIn ? 'Undo check-in' : 'Mark checked in'}
        </Button>
      </div>

      {ticket.notes ? <SectionTitle>Internal notes</SectionTitle> : null}
      <Input.TextArea
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Only visible to your team"
        className="mb-4"
      />

      <Divider />

      <SectionTitle>Manage</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
            Ticket status
          </div>
          <Select
            value={ticket.status}
            style={{ width: '100%' }}
            options={TICKET_STATUS_OPTIONS}
            onChange={(v) => changeStatus(v)}
          />
        </div>
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
            Payment status
          </div>
          <Select
            value={ticket.paymentStatus}
            style={{ width: '100%' }}
            options={TICKET_PAYMENT_STATUS_OPTIONS}
            onChange={(v) => changePayment(v)}
          />
        </div>
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
  span?: 1 | 2
}) {
  const cls = span === 2 ? 'col-span-2' : ''
  return (
    <div className={`rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 ${cls}`}>
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
  tone?: 'neutral' | 'success' | 'danger'
  bold?: boolean
}) {
  const toneClass: Record<'neutral' | 'success' | 'danger', string> = {
    neutral: 'text-gray-200',
    success: 'text-accent-success',
    danger: 'text-accent-danger',
  }
  const sign = amount < 0 ? '−' : ''
  return (
    <tr className="border-t border-surface-border first:border-t-0">
      <td className={`px-3 py-2 ${bold ? 'font-semibold text-gray-100' : 'text-gray-400'}`}>
        {label}
      </td>
      <td className={`px-3 py-2 text-right ${toneClass[tone]} ${bold ? 'font-semibold' : ''}`}>
        {sign}${Math.abs(amount).toFixed(2)}
      </td>
    </tr>
  )
}
