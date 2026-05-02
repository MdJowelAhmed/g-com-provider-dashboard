import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ArrowUpDown, ImageOff } from 'lucide-react'
import type { Post, SortKey } from '../types'
import { getPostDisplayRow } from '../utils/postDisplay'
import CampaignStatusBadge from './CampaignStatusBadge'
import PostRowActions from './PostRowActions'
import PostsTableSkeleton from './PostsTableSkeleton'

type Props = {
  posts: Post[]
  loading?: boolean
  sortKey: SortKey
  sortDir: 'asc' | 'desc'
  onSort: (key: SortKey) => void
  selectedIds: string[]
  onToggleRow: (id: string) => void
  onSelectAllPage: () => void
  allOnPageSelected: boolean
  someOnPageSelected: boolean
  onView: (post: Post) => void
  onEdit: (post: Post) => void
  onDelete: (post: Post) => void
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

function SortTh({
  label,
  active,
  dir,
  onClick,
  className = '',
}: {
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onClick: () => void
  className?: string
}) {
  return (
    <th className={`px-3 py-3.5 first:pl-4 last:pr-4 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 text-left text-xs font-medium uppercase tracking-wide text-gray-400 transition hover:text-gray-200"
      >
        {label}
        {active ? (
          dir === 'asc' ? (
            <ArrowUp size={13} className="shrink-0 text-brand" />
          ) : (
            <ArrowDown size={13} className="shrink-0 text-brand" />
          )
        ) : (
          <ArrowUpDown size={13} className="shrink-0 opacity-40" />
        )}
      </button>
    </th>
  )
}

export default function PostTable({
  posts,
  loading,
  sortKey,
  sortDir,
  onSort,
  selectedIds,
  onToggleRow,
  onSelectAllPage,
  allOnPageSelected,
  someOnPageSelected,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const colCount = 10

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card/95 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] backdrop-blur-sm">
      <div className="max-h-[min(640px,calc(100vh-16rem))] overflow-auto messaging-scrollbar">
        <table className="w-full min-w-[1180px] text-sm">
          <thead className="sticky top-0 z-20 border-b border-surface-border bg-surface-elevated/95 text-left text-xs uppercase tracking-wide text-gray-400 shadow-sm backdrop-blur-md">
            <tr>
              <th className="w-10 px-4 py-3.5">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-surface-border bg-surface-card text-brand focus:ring-brand"
                  checked={allOnPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected
                  }}
                  onChange={onSelectAllPage}
                  aria-label="Select all on page"
                />
              </th>
              <th className="px-3 py-3.5 font-medium normal-case tracking-normal text-gray-400 first:pl-4">
                Media
              </th>
              <SortTh
                label="Shop"
                active={sortKey === 'shopName'}
                dir={sortDir}
                onClick={() => onSort('shopName')}
              />
              <SortTh
                label="Product"
                active={sortKey === 'productName'}
                dir={sortDir}
                onClick={() => onSort('productName')}
              />
              <SortTh
                label="About"
                active={sortKey === 'about'}
                dir={sortDir}
                onClick={() => onSort('about')}
                className="min-w-[180px]"
              />
              <SortTh
                label="Amount"
                active={sortKey === 'amount'}
                dir={sortDir}
                onClick={() => onSort('amount')}
              />
              <SortTh
                label="Start"
                active={sortKey === 'startAt'}
                dir={sortDir}
                onClick={() => onSort('startAt')}
              />
              <SortTh
                label="End"
                active={sortKey === 'endAt'}
                dir={sortDir}
                onClick={() => onSort('endAt')}
              />
              <SortTh
                label="Status"
                active={sortKey === 'campaignStatus'}
                dir={sortDir}
                onClick={() => onSort('campaignStatus')}
              />
              <th className="px-3 py-3.5 pr-4 text-right font-medium normal-case tracking-normal text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <PostsTableSkeleton cols={colCount} />
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-16 text-center">
                  <div className="mx-auto max-w-sm">
                    <div className="text-sm font-medium text-gray-300">No posts match your filters</div>
                    <p className="mt-1 text-xs text-gray-500">Try a different search or status, or create a new post.</p>
                  </div>
                </td>
              </tr>
            ) : (
              posts.map((post) => {
                const row = getPostDisplayRow(post)
                const thumb = row.media[0]
                const selected = selectedIds.includes(post.id)
                const labelForA11y = row.productName || 'post'
                return (
                  <motion.tr
                    layout
                    key={post.id}
                    className={`group border-b border-surface-border transition-colors last:border-b-0 ${
                      selected ? 'bg-brand/10' : 'hover:bg-surface-elevated/80'
                    }`}
                  >
                    <td className="px-4 py-3.5 align-middle">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-surface-border bg-surface-card text-brand focus:ring-brand"
                        checked={selected}
                        onChange={() => onToggleRow(post.id)}
                        aria-label={`Select ${labelForA11y}`}
                      />
                    </td>
                    <td className="px-3 py-3.5 align-middle">
                      <Thumb thumb={thumb} />
                    </td>
                    <td className="max-w-[140px] px-3 py-3.5 align-middle">
                      <div className="truncate font-medium text-gray-100" title={row.shopName || undefined}>
                        {row.shopName || '—'}
                      </div>
                    </td>
                    <td className="max-w-[160px] px-3 py-3.5 align-middle">
                      <div className="truncate text-gray-200" title={row.productName || undefined}>
                        {row.productName || '—'}
                      </div>
                    </td>
                    <td className="max-w-[220px] px-3 py-3.5 align-middle">
                      <p
                        className="line-clamp-2 text-gray-400"
                        title={row.about || undefined}
                      >
                        {row.about || '—'}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 align-middle font-medium tabular-nums text-gray-200">
                      {row.amount ? row.amount : '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 align-middle text-xs tabular-nums text-gray-400">
                      {fmtLocalDateTime(row.startLocal)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 align-middle text-xs tabular-nums text-gray-400">
                      {fmtLocalDateTime(row.endLocal)}
                    </td>
                    <td className="px-3 py-3.5 align-middle">
                      <CampaignStatusBadge status={row.campaignStatus} />
                    </td>
                    <td className="px-3 py-3.5 pr-4 align-middle text-right">
                      <PostRowActions
                        onView={() => onView(post)}
                        onEdit={() => onEdit(post)}
                        onDelete={() => onDelete(post)}
                      />
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Thumb({ thumb }: { thumb: Post['media'][number] | undefined }) {
  if (!thumb) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-surface-elevated text-gray-500 shadow-inner transition group-hover:border-white/[0.1]">
        <ImageOff size={18} />
      </div>
    )
  }
  if (thumb.kind === 'video') {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-black shadow-sm ring-1 ring-white/[0.04] transition group-hover:border-brand/35">
        <video src={thumb.url} className="h-full w-full object-cover" muted playsInline />
      </div>
    )
  }
  return (
    <img
      src={thumb.url}
      alt=""
      className="h-14 w-14 shrink-0 rounded-lg border border-white/[0.06] object-cover shadow-sm ring-1 ring-white/[0.04] transition group-hover:border-brand/35"
      onError={(e) => {
        e.currentTarget.style.opacity = '0'
      }}
    />
  )
}
