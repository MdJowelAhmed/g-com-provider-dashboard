import { motion } from 'framer-motion'
import { Loader2, Search } from 'lucide-react'
import type { Conversation } from '../types'
import { formatMessageTime } from '../utils/formatTime'

type Props = {
  title: string
  unreadTotal: number
  search: string
  onSearchChange: (v: string) => void
  searchPlaceholder: string
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}

function presenceDot(status: Conversation['counterpartStatus']) {
  if (status === 'online') return 'bg-accent-success shadow-[0_0_0_2px_#19191b]'
  if (status === 'away') return 'bg-accent-amber shadow-[0_0_0_2px_#19191b]'
  return 'bg-gray-600 shadow-[0_0_0_2px_#19191b]'
}

export default function ConversationListPanel({
  title,
  unreadTotal,
  search,
  onSearchChange,
  searchPlaceholder,
  conversations,
  selectedId,
  onSelect,
  hasMore,
  loadingMore,
  onLoadMore,
}: Props) {
  return (
    <div className="flex h-full min-h-0 w-full max-w-[320px] shrink-0 flex-col border-r border-surface-border bg-surface-sidebar">
      <div className="shrink-0 border-b border-surface-border px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          {unreadTotal > 0 ? (
            <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">
              {unreadTotal > 99 ? '99+' : unreadTotal}
            </span>
          ) : null}
        </div>
        <div className="relative mt-3">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="messaging-input h-10 w-full rounded-lg border border-surface-border bg-surface-card pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </div>
      </div>

      <div className="messaging-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex flex-col gap-0.5 p-2">
          {conversations.map((c) => {
            const active = c.id === selectedId
            return (
              <motion.button
                key={c.id}
                type="button"
                layout
                onClick={() => onSelect(c.id)}
                whileHover={{ backgroundColor: 'rgba(42,42,48,0.9)' }}
                transition={{ duration: 0.15 }}
                className={`flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition ${
                  active ? 'bg-brand/20 ring-1 ring-brand/40' : 'hover:bg-surface-elevated'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="relative shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-xs font-semibold text-gray-200">
                      {c.counterpartName.slice(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${presenceDot(c.counterpartStatus)}`}
                      title={c.counterpartStatus}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-gray-100">{c.title}</span>
                      <span className="shrink-0 text-[10px] text-gray-500">
                        {formatMessageTime(c.lastMessageAt)}
                      </span>
                    </div>
                    <div className="truncate text-[11px] text-gray-500">
                      {c.subtitle ?? c.contextRef ?? 'Direct message'}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-gray-400">{c.lastMessagePreview}</span>
                      {c.unreadCount > 0 ? (
                        <span className="shrink-0 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                          {c.unreadCount > 99 ? '99+' : c.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {hasMore ? (
          <div className="p-3 pt-0">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-surface-border py-2 text-xs font-medium text-gray-400 transition hover:border-brand/50 hover:text-brand disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Loading…
                </>
              ) : (
                'Load earlier conversations'
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
