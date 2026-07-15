import { Drawer, Button, Space, Tag, Divider } from 'antd'
import {
  ImageOff,
  Layers,
  Calendar,
  CircleDollarSign,
} from 'lucide-react'
import { PRICING_TYPE_OPTIONS, type Service } from './serviceTypes'

type Props = {
  open: boolean
  service: Service | null
  onClose: () => void
  onEdit?: (service: Service) => void
}

function formatMoney(n: number) {
  return `GH₵ ${n.toFixed(2)}`
}

function formatDateTime(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function pricingLabel(value: string) {
  return PRICING_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value
}

export default function ServiceDetailsDrawer({ open, service, onClose, onEdit }: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={620}
      destroyOnHidden
      title={<span className="text-base font-semibold">Service details</span>}
      footer={
        service ? (
          <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={onClose}>Close</Button>
            {onEdit ? (
              <Button
                type="primary"
                onClick={() => {
                  onEdit(service)
                  onClose()
                }}
              >
                Edit
              </Button>
            ) : null}
          </Space>
        ) : null
      }
    >
      {!service ? null : (
        <div className="space-y-6 text-sm">
          <header className="flex items-start gap-4">
            {service.image ? (
              <img
                src={service.image}
                alt={service.name}
                className="h-20 w-20 rounded-lg border border-surface-border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-surface-elevated text-gray-500">
                <ImageOff size={22} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-gray-100">{service.name}</span>
                <Tag className="capitalize">{service.status || '—'}</Tag>
              </div>
              <div className="mt-1 font-mono text-xs text-gray-500">
                Code · {service.serviceCode || '—'}
              </div>
              {service.description ? (
                <p className="mt-2 text-gray-300">{service.description}</p>
              ) : null}
            </div>
          </header>

          <section>
            <SectionTitle icon={<CircleDollarSign size={14} />}>Pricing</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Price" value={formatMoney(service.price)} />
              <KV label="Pricing type" value={pricingLabel(service.pricingType)} />
              <KV label="Duration" value={service.duration || '—'} />
              <KV label="Max bookings / day" value={String(service.maxBookingPerDay)} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Layers size={14} />}>Classification</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Business category" value={service.businessCategoryName || '—'} />
              <KV label="Sub category" value={service.subCategoryName || '—'} />
              <KV
                label="Platform category"
                value={service.platformCategory || '—'}
              />
              <KV label="Branch" value={service.branchName || '—'} />
            </div>
          </section>

          <section>
            <Divider style={{ margin: '4px 0 12px' }} />
            <SectionTitle icon={<Calendar size={14} />}>Timeline</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Created" value={formatDateTime(service.createdAt)} />
              <KV label="Updated" value={formatDateTime(service.updatedAt)} />
            </div>
          </section>
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
