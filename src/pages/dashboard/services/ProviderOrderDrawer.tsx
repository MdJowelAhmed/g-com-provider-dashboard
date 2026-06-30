import { Drawer } from 'antd'
import {
  BedDouble,
  Calendar,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  Star,
  Truck,
  User as UserIcon,
} from 'lucide-react'
import { resolveMediaUrl } from '../../../redux/api/chatApi'
import { BUSINESS_MAIN_CATEGORIES } from '../../../types/businessCategory'
import {
  formatDateTime,
  formatMoney,
  paymentStatusLabel,
  statusLabel,
  type ProviderOrder,
} from './providerOrderTypes'

type Props = {
  open: boolean
  order: ProviderOrder | null
  onClose: () => void
  onShip?: () => void
  onDeliver?: () => void
  onComplete?: () => void
  busy?: boolean
  busyType?: 'ship' | 'deliver' | 'complete' | null
}

const statusTone: Record<string, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  payment_created: 'bg-blue-500/15 text-blue-400',
  paid: 'bg-accent-success/15 text-accent-success',
  confirmed: 'bg-blue-500/15 text-blue-400',
  completed: 'bg-accent-success/15 text-accent-success',
  cancelled: 'bg-accent-danger/15 text-accent-danger',
}

const paymentTone: Record<string, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  paid: 'bg-accent-success/15 text-accent-success',
  failed: 'bg-accent-danger/15 text-accent-danger',
  refunded: 'bg-gray-500/20 text-gray-300',
}

export default function ProviderOrderDrawer({
  open,
  order,
  onClose,
  onShip,
  onDeliver,
  onComplete,
  busy,
  busyType,
}: Props) {
  if (!order) {
    return <Drawer open={open} onClose={onClose} width={760} title="Order details" />
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
          <span className="text-base font-semibold">Order details</span>
          <span className="rounded-md bg-surface-elevated px-2 py-0.5 font-mono text-xs text-gray-300">
            {order.orderId}
          </span>
        </div>
      }
      extra={
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
            statusTone[order.status] ?? 'bg-gray-500/20 text-gray-300'
          }`}
        >
          {statusLabel(order.status)}
        </span>
      }
    >
      <SectionTitle>Customer</SectionTitle>
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-surface-border bg-surface-elevated p-3">
        {order.customer.profileImage ? (
          <img
            src={resolveMediaUrl(order.customer.profileImage)}
            alt={order.customer.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-card text-gray-400">
            <UserIcon size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-100">{order.customer.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
            {order.customer.phone ? (
              <a
                href={`tel:${order.customer.phone}`}
                className="inline-flex items-center gap-1 hover:text-brand-cream"
              >
                <Phone size={12} />
                {order.customer.phone}
              </a>
            ) : null}
            <a
              href={`mailto:${order.customer.email}`}
              className="inline-flex items-center gap-1 hover:text-brand-cream"
            >
              <Mail size={12} />
              {order.customer.email}
            </a>
          </div>
        </div>
      </div>

      <CategoryDetails order={order} />

      <SectionTitle>Payment</SectionTitle>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <InfoCard icon={<CreditCard size={14} />} label="Total">
          <div className="font-semibold text-gray-100">{formatMoney(order.totalAmount)}</div>
        </InfoCard>
        <InfoCard icon={<CreditCard size={14} />} label="Subtotal">
          <div className="font-semibold text-gray-100">{formatMoney(order.subTotal)}</div>
        </InfoCard>
        <InfoCard icon={<CreditCard size={14} />} label="Provider receives">
          <div className="font-semibold text-gray-100">{formatMoney(order.providerAmount)}</div>
        </InfoCard>
        <InfoCard icon={<CreditCard size={14} />} label="Payment">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              paymentTone[order.paymentStatus] ?? 'bg-gray-500/20 text-gray-300'
            }`}
          >
            {paymentStatusLabel(order.paymentStatus)}
          </span>
        </InfoCard>
        {order.deliveryFee > 0 ? (
          <InfoCard icon={<Truck size={14} />} label="Delivery fee">
            <div className="font-medium text-gray-100">{formatMoney(order.deliveryFee)}</div>
          </InfoCard>
        ) : null}
        {order.paymentMethod ? (
          <InfoCard icon={<CreditCard size={14} />} label="Method">
            <div className="font-medium capitalize text-gray-100">{order.paymentMethod}</div>
          </InfoCard>
        ) : null}
        {order.paymentType ? (
          <InfoCard icon={<CreditCard size={14} />} label="Payment type">
            <div className="font-medium capitalize text-gray-100">{order.paymentType}</div>
          </InfoCard>
        ) : null}
        {order.clientReference ? (
          <InfoCard icon={<CreditCard size={14} />} label="Reference" span={2}>
            <div className="font-mono text-xs text-gray-300">{order.clientReference}</div>
          </InfoCard>
        ) : null}
      </div>

      {order.review ? (
        <>
          <SectionTitle>Customer review</SectionTitle>
          <div className="mb-4 rounded-lg border border-surface-border bg-surface-elevated p-3">
            <div className="mb-1 flex items-center justify-between">
              <StarRating rating={order.review.rating} />
              <span className="text-xs text-gray-500">{formatDateTime(order.review.createdAt)}</span>
            </div>
            {order.review.text ? (
              <div className="mt-1 text-sm text-gray-200">{order.review.text}</div>
            ) : null}
          </div>
        </>
      ) : null}

      {order.deliveryProof ? (
        <>
          <SectionTitle>Delivery proof</SectionTitle>
          <div className="mb-4 rounded-lg border border-surface-border bg-surface-elevated p-3 text-sm text-gray-200">
            <a
              href={order.deliveryProof}
              target="_blank"
              rel="noreferrer"
              className="text-brand-cream hover:underline"
            >
              View delivery proof
            </a>
            {order.deliveredAt ? (
              <div className="mt-1 text-xs text-gray-500">
                Delivered {formatDateTime(order.deliveredAt)}
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      <div className="text-xs text-gray-500">
        Created {formatDateTime(order.createdAt)}
        {order.paidAt ? ` · Paid ${formatDateTime(order.paidAt)}` : ''}
        {order.completedAt ? ` · Completed ${formatDateTime(order.completedAt)}` : ''}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-surface-border pt-4">
        {(order.category === BUSINESS_MAIN_CATEGORIES.SHOP ||
          order.category === BUSINESS_MAIN_CATEGORIES.DINE) &&
        onShip &&
        onDeliver ? (
          <>
            <button
              type="button"
              onClick={onShip}
              disabled={busy}
              className="rounded-md border border-surface-border px-3 py-1.5 text-xs text-gray-200 hover:bg-surface-elevated disabled:opacity-60"
            >
              {busy && busyType === 'ship' ? 'Shipping...' : 'Mark as shipped'}
            </button>
            <button
              type="button"
              onClick={onDeliver}
              disabled={busy}
              className="rounded-md border border-surface-border px-3 py-1.5 text-xs text-gray-200 hover:bg-surface-elevated disabled:opacity-60"
            >
              {busy && busyType === 'deliver' ? 'Delivering...' : 'Mark as delivered'}
            </button>
          </>
        ) : null}
        {order.category === BUSINESS_MAIN_CATEGORIES.SERVICES && onComplete ? (
          <button
            type="button"
            onClick={onComplete}
            disabled={busy}
            className="rounded-md border border-surface-border px-3 py-1.5 text-xs text-gray-200 hover:bg-surface-elevated disabled:opacity-60"
          >
            {busy && busyType === 'complete' ? 'Completing...' : 'Mark as complete'}
          </button>
        ) : null}
      </div>
    </Drawer>
  )
}

function CategoryDetails({ order }: { order: ProviderOrder }) {
  if (order.category === BUSINESS_MAIN_CATEGORIES.STAY && order.stayDetails) {
    const stay = order.stayDetails
    return (
      <>
        <SectionTitle>Stay details</SectionTitle>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <InfoCard icon={<BedDouble size={14} />} label="Room" span={2}>
            <div className="font-medium text-gray-100">{stay.roomName}</div>
            <div className="text-xs text-gray-500">Room #{stay.roomNumber}</div>
          </InfoCard>
          <InfoCard icon={<Calendar size={14} />} label="Check-in">
            <div className="font-medium text-gray-100">{formatDateTime(stay.checkIn)}</div>
          </InfoCard>
          <InfoCard icon={<Calendar size={14} />} label="Check-out">
            <div className="font-medium text-gray-100">{formatDateTime(stay.checkOut)}</div>
          </InfoCard>
          <InfoCard icon={<UserIcon size={14} />} label="Guests">
            <div className="font-medium text-gray-100">
              {stay.adults} adult{stay.adults === 1 ? '' : 's'}
              {stay.children > 0 ? `, ${stay.children} child${stay.children === 1 ? '' : 'ren'}` : ''}
            </div>
          </InfoCard>
          <InfoCard icon={<Calendar size={14} />} label="Nights">
            <div className="font-medium text-gray-100">{stay.nights}</div>
          </InfoCard>
          <InfoCard icon={<CreditCard size={14} />} label="Price / night">
            <div className="font-medium text-gray-100">{formatMoney(stay.pricePerNight)}</div>
          </InfoCard>
          {stay.serviceFee ? (
            <InfoCard icon={<CreditCard size={14} />} label="Service fee">
              <div className="font-medium text-gray-100">{formatMoney(stay.serviceFee)}</div>
            </InfoCard>
          ) : null}
        </div>
      </>
    )
  }

  if (
    (order.category === BUSINESS_MAIN_CATEGORIES.SHOP ||
      order.category === BUSINESS_MAIN_CATEGORIES.DINE) &&
    order.productLines.length > 0
  ) {
    return (
      <>
        <SectionTitle>{order.category === BUSINESS_MAIN_CATEGORIES.DINE ? 'Order items' : 'Products'}</SectionTitle>
        <div className="mb-4 space-y-2">
          {order.productLines.map((line) => (
            <div
              key={line.id}
              className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface-elevated p-3"
            >
              {line.image ? (
                <img
                  src={resolveMediaUrl(line.image)}
                  alt={line.name}
                  className="h-12 w-12 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-card text-gray-500">
                  <Package size={18} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-100">{line.name}</div>
                <div className="text-xs text-gray-500">
                  Qty {line.quantity} · {formatMoney(line.price)} each
                </div>
              </div>
              <div className="font-medium text-gray-100">{formatMoney(line.totalAmount)}</div>
            </div>
          ))}
        </div>
        {order.fulfillment ? <FulfillmentBlock fulfillment={order.fulfillment} /> : null}
      </>
    )
  }

  if (order.category === BUSINESS_MAIN_CATEGORIES.SERVICES && order.serviceDetails) {
    const service = order.serviceDetails
    return (
      <>
        <SectionTitle>Service details</SectionTitle>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <InfoCard icon={<Package size={14} />} label="Service" span={2}>
            <div className="font-medium text-gray-100">{service.serviceName}</div>
          </InfoCard>
          <InfoCard icon={<Package size={14} />} label="Quantity">
            <div className="font-medium text-gray-100">{service.quantity}</div>
          </InfoCard>
          {service.startTime ? (
            <InfoCard icon={<Calendar size={14} />} label="Start time">
              <div className="font-medium text-gray-100">{formatDateTime(service.startTime)}</div>
            </InfoCard>
          ) : null}
        </div>
      </>
    )
  }

  if (order.category === BUSINESS_MAIN_CATEGORIES.EVENT && order.eventDetails) {
    const event = order.eventDetails
    return (
      <>
        <SectionTitle>Event details</SectionTitle>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <InfoCard icon={<Calendar size={14} />} label="Event" span={2}>
            <div className="font-medium text-gray-100">{event.eventName}</div>
          </InfoCard>
          <InfoCard icon={<Package size={14} />} label="Tickets">
            <div className="font-medium text-gray-100">{event.quantity}</div>
          </InfoCard>
          {event.eventDate ? (
            <InfoCard icon={<Calendar size={14} />} label="Event date">
              <div className="font-medium text-gray-100">{formatDateTime(event.eventDate)}</div>
            </InfoCard>
          ) : null}
        </div>
      </>
    )
  }

  return null
}

function FulfillmentBlock({
  fulfillment,
}: {
  fulfillment: NonNullable<ProviderOrder['fulfillment']>
}) {
  return (
    <>
      <SectionTitle>Fulfillment</SectionTitle>
      <div className="mb-4 rounded-lg border border-surface-border bg-surface-elevated p-3">
        <div className="flex items-start gap-2 text-sm text-gray-200">
          {fulfillment.method === 'delivery' ? <Truck size={14} /> : <MapPin size={14} />}
          <div>
            <div className="font-medium capitalize">{fulfillment.method}</div>
            {fulfillment.locationName ? (
              <div className="mt-1 text-xs text-gray-500">{fulfillment.locationName}</div>
            ) : null}
            {fulfillment.distanceKm !== undefined ? (
              <div className="mt-1 text-xs text-gray-500">{fulfillment.distanceKm} km</div>
            ) : null}
          </div>
        </div>
      </div>
    </>
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
              i <= Math.round(rating) ? 'fill-accent-amber text-accent-amber' : 'text-gray-600'
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
  const cls = span === 3 ? 'col-span-3' : span === 2 ? 'col-span-2' : ''
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
