import { Drawer, Button, Space, Tag, Divider } from 'antd'
import {
  BedDouble,
  ImageOff,
  Users,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { ROOM_STATUS_OPTIONS, type Room } from './roomTypes'

type Props = {
  open: boolean
  room: Room | null
  onClose: () => void
  onEdit?: (room: Room) => void
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
  return ROOM_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status
}

export default function RoomDetailsDrawer({ open, room, onClose, onEdit }: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={620}
      destroyOnHidden
      title={<span className="text-base font-semibold">Room details</span>}
      footer={
        room ? (
          <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={onClose}>Close</Button>
            {onEdit ? (
              <Button
                type="primary"
                onClick={() => {
                  onEdit(room)
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
      {!room ? null : (
        <div className="space-y-6 text-sm">
          <header className="flex items-start gap-4">
            {room.image ? (
              <img
                src={room.image}
                alt={room.name}
                className="h-20 w-20 rounded-lg border border-surface-border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-surface-elevated text-gray-500">
                <ImageOff size={22} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-gray-100">{room.name}</span>
                <Tag>{statusLabel(room.status)}</Tag>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                #{room.roomNumber || '—'} · {room.roomCode || '—'}
              </div>
              {room.description ? (
                <p className="mt-2 text-gray-300">{room.description}</p>
              ) : null}
            </div>
          </header>

          <section>
            <SectionTitle icon={<BedDouble size={14} />}>Room specs</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Type" value={room.roomType || '—'} />
              <KV
                label="Bed"
                value={
                  room.bedCount > 1
                    ? `${room.bedCount} × ${room.bedType}`
                    : room.bedType || '—'
                }
              />
              <KV label="Size" value={room.size || '—'} />
              <KV label="Price / night" value={formatMoney(room.basePrice)} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Users size={14} />}>Capacity</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KV label="Adults" value={String(room.maxAdult)} />
              <KV label="Children" value={String(room.maxChildren)} />
              <KV label="Total guests" value={String(room.totalGuest)} />
              <KV label="Beds" value={String(room.bedCount)} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Layers size={14} />}>Classification</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Business category" value={room.businessCategoryName || '—'} />
              <KV label="Sub category" value={room.subCategoryName || '—'} />
              <KV label="Branch" value={room.branchName || '—'} />
              <KV label="Main category" value={room.mainCategory || '—'} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Sparkles size={14} />}>Amenities</SectionTitle>
            {room.otherAmenities.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {room.otherAmenities.map((a) => (
                  <Tag key={a}>{a}</Tag>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">No amenities listed</span>
            )}
          </section>

          <section>
            <Divider style={{ margin: '4px 0 12px' }} />
            <SectionTitle icon={<Calendar size={14} />}>Timeline</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <KV label="Created" value={formatDateTime(room.createdAt)} />
              <KV label="Updated" value={formatDateTime(room.updatedAt)} />
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
