import { Modal } from 'antd'
import { Clock } from 'lucide-react'
import type { Post } from '../types'
import { getPostDisplayRow } from '../utils/postDisplay'
import CampaignStatusBadge from './CampaignStatusBadge'

type Props = {
  open: boolean
  post: Post | null
  onClose: () => void
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

function fmtLocalDateTime(local: string) {
  const t = local?.trim()
  if (!t) return '—'
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PostDetailModal({ open, post, onClose }: Props) {
  if (!post) {
    return null
  }

  const row = getPostDisplayRow(post)

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      title={
        <div className="pr-8">
          <div className="text-base font-semibold text-gray-100">{row.productName || 'Post'}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <CampaignStatusBadge status={row.campaignStatus} />
          </div>
        </div>
      }
      destroyOnHidden
      centered
    >
      <div className="max-h-[70vh] space-y-4 overflow-y-auto messaging-scrollbar pr-1 text-sm text-gray-200">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-surface-border bg-surface-elevated/60 p-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Shop</div>
            <div className="mt-1 text-gray-100">{row.shopName || '—'}</div>
          </div>
          <div className="rounded-lg border border-surface-border bg-surface-elevated/60 p-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Amount</div>
            <div className="mt-1 font-medium tabular-nums text-gray-100">{row.amount || '—'}</div>
          </div>
          <div className="rounded-lg border border-surface-border bg-surface-elevated/60 p-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Start</div>
            <div className="mt-1 text-gray-200">{fmtLocalDateTime(row.startLocal)}</div>
          </div>
          <div className="rounded-lg border border-surface-border bg-surface-elevated/60 p-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">End</div>
            <div className="mt-1 text-gray-200">{fmtLocalDateTime(row.endLocal)}</div>
          </div>
          <div className="rounded-lg border border-surface-border bg-surface-elevated/60 p-3 sm:col-span-2">
            <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Updated</div>
            <div className="mt-1 flex items-center gap-1.5 text-gray-200">
              <Clock size={14} className="text-gray-500" />
              {fmt(post.updatedAt)}
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">About this product</div>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed text-gray-300">{row.about || '—'}</p>
        </div>

        {row.media.length > 0 ? (
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500">Media</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {row.media.map((m) => (
                <div
                  key={m.id}
                  className="overflow-hidden rounded-lg border border-surface-border bg-black/30"
                >
                  {m.kind === 'video' ? (
                    <video src={m.url} controls className="aspect-video w-full object-cover" />
                  ) : (
                    <img src={m.url} alt="" className="aspect-video w-full object-cover" />
                  )}
                  <div className="truncate px-2 py-1 text-[11px] text-gray-500">{m.name}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
