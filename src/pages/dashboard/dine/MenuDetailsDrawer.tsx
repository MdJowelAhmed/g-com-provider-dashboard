import { Drawer, Button, Space, Tag, Divider } from 'antd'
import { ImageOff, Layers, Calendar, CircleDollarSign } from 'lucide-react'
import { MENU_STATUS_OPTIONS, type MenuItem } from './menuTypes'

type Props = {
  open: boolean
  item: MenuItem | null
  onClose: () => void
  onEdit?: (item: MenuItem) => void
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

function labelFor(status: MenuItem['status']) {
  return MENU_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status
}

export default function MenuDetailsDrawer({ open, item, onClose, onEdit }: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      destroyOnHidden
      title={<span className="text-base font-semibold">Menu item details</span>}
      footer={
        item ? (
          <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={onClose}>Close</Button>
            {onEdit ? (
              <Button
                type="primary"
                onClick={() => {
                  onEdit(item)
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
      {!item ? null : (
        <div className="space-y-6 text-sm">
          <header className="flex items-start gap-4">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-20 w-20 rounded-lg border border-surface-border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-surface-elevated text-gray-500">
                <ImageOff size={22} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-gray-100">{item.name}</span>
                <Tag>{labelFor(item.status)}</Tag>
              </div>
              {item.description ? (
                <p className="mt-2 text-gray-300">{item.description}</p>
              ) : null}
            </div>
          </header>

          <section>
            <SectionTitle icon={<CircleDollarSign size={14} />}>Pricing & delivery</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Price" value={formatMoney(item.price)} />
              <KV label="Delivery fee" value={formatMoney(item.deliveryFee)} />
              <KV
                label="Delivery time"
                value={
                  item.deliveryTime
                    ? `${item.deliveryTime} day${item.deliveryTime === '1' ? '' : 's'}`
                    : '—'
                }
              />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Layers size={14} />}>Classification</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Business category" value={item.businessCategoryName || '—'} />
              <KV label="Sub category" value={item.subCategoryName || '—'} />
              <KV label="Branch" value={item.branchName || '—'} />
            </div>
          </section>

          <section>
            <Divider style={{ margin: '4px 0 12px' }} />
            <SectionTitle icon={<Calendar size={14} />}>Timeline</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Created" value={formatDateTime(item.createdAt)} />
              <KV label="Updated" value={formatDateTime(item.updatedAt)} />
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
