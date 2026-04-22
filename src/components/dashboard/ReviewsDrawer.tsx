import { Drawer } from 'antd'
import { Star, User as UserIcon } from 'lucide-react'

export type ReviewEntry = {
  id: string
  customerName: string
  referenceCode: string
  referenceLabel?: string
  rating: number
  comment: string
  createdAt: string
}

type Props = {
  open: boolean
  title?: string
  subject: string | null
  subjectCode: string | null
  reviews: ReviewEntry[]
  onClose: () => void
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

export default function ReviewsDrawer({
  open,
  title = 'Reviews',
  subject,
  subjectCode,
  reviews,
  onClose,
}: Props) {
  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      placement="right"
      destroyOnHidden
      title={
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">{title}</span>
          {subject ? (
            <span className="truncate text-sm text-gray-400">· {subject}</span>
          ) : null}
        </div>
      }
      extra={
        reviews.length > 0 ? (
          <div className="flex items-center gap-2">
            <StarRating rating={avg} />
            <span className="text-xs text-gray-500">
              {reviews.length} review{reviews.length === 1 ? '' : 's'}
            </span>
          </div>
        ) : null
      }
    >
      {subjectCode ? (
        <div className="mb-4 inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2 py-0.5 font-mono text-xs text-gray-400">
          {subjectCode}
        </div>
      ) : null}

      {reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-surface-border bg-surface-elevated p-6 text-center text-sm text-gray-500">
          No reviews yet for this item.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {[...reviews]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
            .map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-surface-border bg-surface-elevated p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-card text-gray-400">
                      <UserIcon size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-gray-100">
                        {r.customerName}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <span className="font-mono">{r.referenceCode}</span>
                        {r.referenceLabel ? (
                          <>
                            <span>·</span>
                            <span>{r.referenceLabel}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <StarRating rating={r.rating} />
                    <div className="mt-0.5 text-[11px] text-gray-500">
                      {formatDateTime(r.createdAt)}
                    </div>
                  </div>
                </div>
                {r.comment ? (
                  <div className="mt-2 text-sm text-gray-200">{r.comment}</div>
                ) : null}
              </div>
            ))}
        </div>
      )}
    </Drawer>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={13}
            className={
              i <= Math.round(rating)
                ? 'fill-accent-amber text-accent-amber'
                : 'text-gray-600'
            }
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-100">{rating.toFixed(1)}</span>
    </div>
  )
}
