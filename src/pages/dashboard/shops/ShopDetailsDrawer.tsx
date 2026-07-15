import { Drawer, Button, Space, Divider } from 'antd'
import { MapPin, Phone, Clock, Calendar, Building2 } from 'lucide-react'
import { weekdayLabel, type ShopBranch } from './shopTypes'

type Props = {
  open: boolean
  shop: ShopBranch | null
  onClose: () => void
  onEdit?: (shop: ShopBranch) => void
}

function formatDateTime(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function ShopDetailsDrawer({ open, shop, onClose, onEdit }: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      destroyOnHidden
      title={<span className="text-base font-semibold">Branch details</span>}
      footer={
        shop ? (
          <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={onClose}>Close</Button>
            {onEdit ? (
              <Button
                type="primary"
                onClick={() => {
                  onEdit(shop)
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
      {!shop ? null : (
        <div className="space-y-6 text-sm">
          <header className="rounded-lg border border-surface-border bg-surface-elevated p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand-cream">
                <Building2 size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-semibold text-gray-100">{shop.branchName}</div>
                <div className="mt-0.5 text-xs text-gray-500">ID · {shop.id}</div>
                {shop.description ? (
                  <p className="mt-2 text-gray-300">{shop.description}</p>
                ) : null}
              </div>
            </div>
          </header>

          <section>
            <SectionTitle icon={<Phone size={14} />}>Contact</SectionTitle>
            <div className="grid grid-cols-1 gap-3">
              <KV label="Phone" value={shop.contact || '—'} />
              <KV label="Timezone" value={shop.timeZone || '—'} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<MapPin size={14} />}>Location</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <KV label="Address" value={shop.locationName || '—'} />
              <KV
                label="Coordinates"
                value={`${shop.latitude.toFixed(4)}, ${shop.longitude.toFixed(4)}`}
              />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Clock size={14} />}>Hours</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <KV label="Open" value={shop.openTime || '—'} />
              <KV label="Close" value={shop.closeTime || '—'} />
            </div>
            <div className="mt-3">
              <div className="mb-1.5 text-xs text-gray-500">Open days</div>
              {shop.availableDay.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {shop.availableDay.map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-xs text-gray-300"
                    >
                      {weekdayLabel(d)}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </div>
          </section>

          <section>
            <Divider style={{ margin: '4px 0 12px' }} />
            <SectionTitle icon={<Calendar size={14} />}>Timeline</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Created" value={formatDateTime(shop.createdAt)} />
              <KV label="Updated" value={formatDateTime(shop.updatedAt)} />
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
