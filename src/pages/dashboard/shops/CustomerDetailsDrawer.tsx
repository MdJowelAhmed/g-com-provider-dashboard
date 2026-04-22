import { Drawer, Tag, Divider } from 'antd'
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  ShoppingBag,
  CreditCard,
  Star,
  Heart,
  CircleDollarSign,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Sparkles,
} from 'lucide-react'
import {
  ACQUISITION_CHANNEL_OPTIONS,
  CUSTOMER_STATUS_OPTIONS,
  CUSTOMER_TIER_OPTIONS,
  GENDER_OPTIONS,
  type Customer,
  type CustomerTier,
} from './customerTypes'

type Props = {
  customer: Customer | null
  open: boolean
  onClose: () => void
}

const TIER_STYLE: Record<CustomerTier, string> = {
  bronze: 'bg-amber-700/20 text-amber-400',
  silver: 'bg-gray-400/15 text-gray-200',
  gold: 'bg-accent-amber/20 text-accent-amber',
  platinum: 'bg-purple-500/15 text-purple-300',
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

function formatDateTime(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function daysBetween(iso?: string) {
  if (!iso) return null
  const ms = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}

export default function CustomerDetailsDrawer({ customer, open, onClose }: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={620}
      title={customer ? `${customer.firstName} ${customer.lastName}` : 'Customer'}
      destroyOnHidden
    >
      {customer && (
        <div className="space-y-6 text-sm">
          <header className="flex items-start gap-4">
            {customer.avatar ? (
              <img
                src={customer.avatar}
                alt=""
                className="h-16 w-16 rounded-full border border-surface-border object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated text-lg font-semibold text-gray-300">
                {customer.firstName[0]}
                {customer.lastName[0]}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-gray-100">
                  {customer.firstName} {customer.lastName}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TIER_STYLE[customer.tier]}`}
                >
                  {labelFor(customer.tier, CUSTOMER_TIER_OPTIONS)}
                </span>
                <Tag>{labelFor(customer.status, CUSTOMER_STATUS_OPTIONS)}</Tag>
                {customer.segment && <Tag color="blue">{customer.segment}</Tag>}
              </div>
              <div className="mt-1 text-xs text-gray-500">Customer ID · {customer.id}</div>
              <div className="mt-2 space-y-1 text-sm text-gray-300">
                <div className="flex items-center gap-1.5">
                  <Mail size={12} /> {customer.email}
                  {customer.emailVerified ? (
                    <ShieldCheck size={12} className="text-accent-success" />
                  ) : (
                    <ShieldAlert size={12} className="text-accent-amber" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={12} /> {customer.phone}
                  {customer.phoneVerified ? (
                    <ShieldCheck size={12} className="text-accent-success" />
                  ) : (
                    <ShieldAlert size={12} className="text-accent-amber" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Globe size={12} /> {customer.language}
                </div>
              </div>
            </div>
          </header>

          <section>
            <SectionTitle icon={<CircleDollarSign size={14} />}>Lifetime value</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBlock label="Total spend" value={formatMoney(customer.totalSpend)} emphasis />
              <StatBlock label="Orders" value={customer.totalOrders.toString()} />
              <StatBlock label="Avg order" value={formatMoney(customer.averageOrderValue)} />
              <StatBlock label="Points" value={customer.loyaltyPoints.toLocaleString()} />
              <StatBlock label="Last 30d orders" value={customer.ordersLast30Days.toString()} />
              <StatBlock label="Abandoned carts" value={customer.abandonedCarts.toString()} />
              <StatBlock label="Refunds" value={customer.refundCount.toString()} />
              <StatBlock label="Refunded $" value={formatMoney(customer.refundAmount)} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Calendar size={14} />}>Timeline</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Signed up" value={formatDate(customer.createdAt)} />
              <KV label="First order" value={formatDate(customer.firstOrderDate)} />
              <KV label="Last order" value={formatDate(customer.lastOrderDate)} />
              <KV
                label="Last active"
                value={
                  customer.lastActiveAt
                    ? `${formatDateTime(customer.lastActiveAt)}${
                        daysBetween(customer.lastActiveAt) != null
                          ? ` · ${daysBetween(customer.lastActiveAt)}d ago`
                          : ''
                      }`
                    : '—'
                }
              />
              <KV label="Date of birth" value={formatDate(customer.dateOfBirth)} />
              <KV
                label="Gender"
                value={
                  customer.gender ? labelFor(customer.gender, GENDER_OPTIONS) : '—'
                }
              />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Sparkles size={14} />}>Acquisition</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV
                label="Channel"
                value={labelFor(customer.acquisitionChannel, ACQUISITION_CHANNEL_OPTIONS)}
              />
              <KV label="Referrer / campaign" value={customer.referrer || '—'} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<ShoppingBag size={14} />}>Engagement</SectionTitle>
            <div className="grid grid-cols-3 gap-3">
              <StatBlock
                label="Wishlist"
                value={customer.wishlistCount.toString()}
                icon={<Heart size={12} />}
              />
              <StatBlock
                label="Reviews"
                value={customer.reviewsCount.toString()}
                icon={<Star size={12} />}
              />
              <StatBlock
                label="Avg rating"
                value={
                  customer.averageRatingGiven != null
                    ? customer.averageRatingGiven.toFixed(1)
                    : '—'
                }
              />
            </div>
          </section>

          <section>
            <SectionTitle icon={<CreditCard size={14} />}>Billing</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Default payment" value={customer.defaultPaymentMethod || '—'} />
              <KV label="Tax exempt" value={customer.taxExempt ? 'Yes' : 'No'} />
              <KV
                label="Email marketing"
                value={customer.marketingOptInEmail ? 'Opted in' : 'Opted out'}
              />
              <KV
                label="SMS marketing"
                value={customer.marketingOptInSms ? 'Opted in' : 'Opted out'}
              />
            </div>
          </section>

          <section>
            <SectionTitle icon={<MapPin size={14} />}>
              Addresses ({customer.addresses.length})
            </SectionTitle>
            <div className="space-y-2">
              {customer.addresses.length === 0 && (
                <div className="rounded-lg border border-dashed border-surface-border p-3 text-gray-500">
                  No addresses on file.
                </div>
              )}
              {customer.addresses.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-surface-border bg-surface-card p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-100">{a.label}</span>
                    {a.isDefault && <Tag color="blue">Default</Tag>}
                  </div>
                  <div className="mt-1 text-gray-300">
                    <div>{a.line1}</div>
                    {a.line2 && <div>{a.line2}</div>}
                    <div>
                      {a.city}
                      {a.state ? `, ${a.state}` : ''} {a.postalCode}
                    </div>
                    <div>{a.country}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {customer.tags && (
            <section>
              <SectionTitle>Tags</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {customer.tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
              </div>
            </section>
          )}

          {customer.notes && (
            <section>
              <Divider style={{ margin: '8px 0' }} />
              <SectionTitle>Internal note</SectionTitle>
              <div className="rounded-lg border border-surface-border bg-surface-card p-3 text-gray-300">
                {customer.notes}
              </div>
            </section>
          )}
        </div>
      )}
    </Drawer>
  )
}

function SectionTitle({
  children,
  icon,
}: {
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-400">
      {icon}
      {children}
    </div>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-gray-200">{value}</div>
    </div>
  )
}

function StatBlock({
  label,
  value,
  icon,
  emphasis,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  emphasis?: boolean
}) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-500">
        {icon}
        {label}
      </div>
      <div className={`mt-1 ${emphasis ? 'text-lg font-semibold text-gray-100' : 'text-gray-200'}`}>
        {value}
      </div>
    </div>
  )
}
