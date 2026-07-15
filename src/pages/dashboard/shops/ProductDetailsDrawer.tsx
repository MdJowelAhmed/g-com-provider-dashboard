import { Drawer, Button, Space, Tag, Divider } from 'antd'
import {
  Package,
  ImageOff,
  Tag as TagIcon,
  Store,
  Layers,
  Calendar,
} from 'lucide-react'
import {
  DELIVERY_METHOD_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  type Product,
} from './productTypes'

type Props = {
  open: boolean
  product: Product | null
  onClose: () => void
  onEdit?: (product: Product) => void
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

function labelFor<T extends string>(value: T, options: { value: T; label: string }[]) {
  return options.find((o) => o.value === value)?.label ?? value
}

export default function ProductDetailsDrawer({ open, product, onClose, onEdit }: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={620}
      destroyOnHidden
      title={<span className="text-base font-semibold">Product details</span>}
      footer={
        product ? (
          <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={onClose}>Close</Button>
            {onEdit ? (
              <Button
                type="primary"
                onClick={() => {
                  onEdit(product)
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
      {!product ? null : (
        <div className="space-y-6 text-sm">
          <header className="flex items-start gap-4">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-20 w-20 rounded-lg border border-surface-border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-surface-elevated text-gray-500">
                <ImageOff size={22} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-gray-100">{product.name}</span>
                <Tag>{labelFor(product.status, PRODUCT_STATUS_OPTIONS)}</Tag>
                {product.featured ? <Tag color="blue">Featured</Tag> : null}
                {product.hidden ? <Tag color="default">Hidden</Tag> : null}
              </div>
              <div className="mt-1 font-mono text-xs text-gray-500">SKU · {product.sku}</div>
              {product.description ? (
                <p className="mt-2 text-gray-300">{product.description}</p>
              ) : null}
            </div>
          </header>

          <section>
            <SectionTitle icon={<Package size={14} />}>Pricing & delivery</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Price" value={formatMoney(product.price)} />
              <KV
                label="Sale price"
                value={product.salePrice != null ? formatMoney(product.salePrice) : '—'}
              />
              <KV label="Delivery fee" value={formatMoney(product.deliveryFee)} />
              <KV
                label="Delivery time"
                value={
                  product.deliveryTime
                    ? `${product.deliveryTime} day${product.deliveryTime === '1' ? '' : 's'}`
                    : '—'
                }
              />
              <KV
                label="Delivery method"
                value={labelFor(product.deliveryMethod, DELIVERY_METHOD_OPTIONS)}
              />
              <KV
                label="Weight"
                value={product.weight != null ? `${product.weight} g` : '—'}
              />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Layers size={14} />}>Classification</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Business category" value={product.businessCategoryName || '—'} />
              <KV label="Sub category" value={product.subCategoryName || '—'} />
              <KV label="Category" value={product.category || '—'} />
              <KV label="Brand" value={product.brand || '—'} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Store size={14} />}>Branch & inventory</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Branch" value={product.branchName || '—'} />
              <KV label="Stock" value={String(product.stock)} />
              <KV label="Low stock at" value={String(product.lowStockThreshold)} />
              <KV label="Variants" value={product.variants || '—'} />
            </div>
          </section>

          {product.tags ? (
            <section>
              <SectionTitle icon={<TagIcon size={14} />}>Tags</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {product.tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
              </div>
            </section>
          ) : null}

          <section>
            <Divider style={{ margin: '4px 0 12px' }} />
            <SectionTitle icon={<Calendar size={14} />}>Timeline</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Created" value={formatDateTime(product.createdAt)} />
              <KV label="Updated" value={formatDateTime(product.updatedAt)} />
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
