import { Drawer, Button, Space, Tag, Divider } from 'antd'
import {
  Calendar,
  ImageOff,
  MapPin,
  Users,
  Layers,
  CircleDollarSign,
} from 'lucide-react'
import { EVENT_STATUS_OPTIONS, type Event } from './eventTypes'

type Props = {
  open: boolean
  event: Event | null
  onClose: () => void
  onEdit?: (event: Event) => void
}

function formatMoney(n: number) {
  return `GH₵ ${n.toFixed(0)}`
}

function formatDateTime(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function statusLabel(status: string) {
  return EVENT_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status
}

export default function EventDetailsDrawer({ open, event, onClose, onEdit }: Props) {
  const coords =
    event?.location?.coordinates != null
      ? `${event.location.coordinates[1].toFixed(4)}, ${event.location.coordinates[0].toFixed(4)}`
      : '—'

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={620}
      destroyOnHidden
      title={<span className="text-base font-semibold">Event details</span>}
      footer={
        event ? (
          <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={onClose}>Close</Button>
            {onEdit ? (
              <Button
                type="primary"
                onClick={() => {
                  onEdit(event)
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
      {!event ? null : (
        <div className="space-y-6 text-sm">
          <header className="flex items-start gap-4">
            {event.image ? (
              <img
                src={event.image}
                alt={event.name}
                className="h-20 w-20 rounded-lg border border-surface-border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-surface-elevated text-gray-500">
                <ImageOff size={22} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-gray-100">{event.name}</span>
                <Tag>{statusLabel(event.status)}</Tag>
              </div>
              {event.description ? (
                <p className="mt-2 text-gray-300">{event.description}</p>
              ) : null}
            </div>
          </header>

          <section>
            <SectionTitle icon={<Calendar size={14} />}>Schedule</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <KV label="Starts" value={formatDateTime(event.startTime)} />
              <KV label="Ends" value={formatDateTime(event.endTime)} />
              <KV
                label="Registration deadline"
                value={formatDateTime(event.registrationDeadline)}
              />
            </div>
          </section>

          <section>
            <SectionTitle icon={<MapPin size={14} />}>Location</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <KV label="Coordinates" value={coords} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Users size={14} />}>Tickets & capacity</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <KV label="Ticket price" value={formatMoney(event.ticketPrice)} />
              <KV label="Max capacity" value={String(event.maxCapacity)} />
              <KV label="Booked" value={String(event.bookedCapacity)} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Layers size={14} />}>Classification</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Business category" value={event.businessCategoryName || '—'} />
              <KV label="Sub category" value={event.subCategoryName || '—'} />
              <KV label="Branch" value={event.branchName || '—'} />
              <KV label="Organizer" value={event.organizerName || '—'} />
            </div>
          </section>

          <section>
            <Divider style={{ margin: '4px 0 12px' }} />
            <SectionTitle icon={<Calendar size={14} />}>Timeline</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Created" value={formatDateTime(event.createdAt)} />
              <KV label="Updated" value={formatDateTime(event.updatedAt)} />
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
