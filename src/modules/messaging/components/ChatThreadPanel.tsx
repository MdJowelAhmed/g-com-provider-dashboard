import { useVirtualizer } from '@tanstack/react-virtual'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import type { ChatMessage, Conversation, Offer } from '../types'
import { buildThreadRows } from '../utils/groupMessages'
import ChatInputBar from './ChatInputBar'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

type Props = {
  conversation: Conversation | null
  messages: ChatMessage[]
  offers: Offer[]
  quickReplies: string[]
  remoteTyping?: boolean
  errorBanner?: string | null
  onDismissError?: () => void
  onSend: (text: string) => void
  onAttach: () => void
  onOpenOffer: () => void
  onWithdrawOffer: (id: string) => void
  labels: {
    emptyTitle: string
    emptyHint: string
  }
}

const VIRTUAL_THRESHOLD = 48

export default function ChatThreadPanel({
  conversation,
  messages,
  offers,
  quickReplies,
  remoteTyping,
  errorBanner,
  onDismissError,
  onSend,
  onAttach,
  onOpenOffer,
  onWithdrawOffer,
  labels,
}: Props) {
  const rows = useMemo(() => buildThreadRows(messages), [messages])
  const offerById = useMemo(() => Object.fromEntries(offers.map((o) => [o.id, o])), [offers])

  const scrollRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const virtualize = rows.length >= VIRTUAL_THRESHOLD

  /* TanStack Virtual — scroll virtualization for long threads */
  // eslint-disable-next-line react-hooks/incompatible-library -- virtualizer instance is local to this view
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => (rows[i]?.kind === 'day' ? 38 : 92),
    overscan: 10,
  })

  useEffect(() => {
    if (!conversation || rows.length === 0) return
    if (virtualize) {
      virtualizer.scrollToIndex(rows.length - 1, { align: 'end' })
    } else {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scroll after thread updates
  }, [conversation?.id, messages.length, rows.length, virtualize])

  const presenceLabel =
    conversation?.counterpartStatus === 'online'
      ? 'Online'
      : conversation?.counterpartStatus === 'away'
        ? 'Away'
        : 'Offline'

  const presenceColor =
    conversation?.counterpartStatus === 'online'
      ? 'text-accent-success'
      : conversation?.counterpartStatus === 'away'
        ? 'text-accent-amber'
        : 'text-gray-500'

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface-page">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-surface-border px-5 py-4">
        {conversation ? (
          <>
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-card text-sm font-semibold text-gray-100">
                {conversation.counterpartName.slice(0, 2).toUpperCase()}
                <span
                  className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface-page ${
                    conversation.counterpartStatus === 'online'
                      ? 'bg-accent-success'
                      : conversation.counterpartStatus === 'away'
                        ? 'bg-accent-amber'
                        : 'bg-gray-600'
                  }`}
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">{conversation.title}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${presenceLabel === 'Online' ? 'bg-accent-success' : presenceLabel === 'Away' ? 'bg-accent-amber' : 'bg-gray-600'}`} />
                    <span className={presenceColor}>{presenceLabel}</span>
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-500">No conversation selected</div>
        )}
      </div>

      {errorBanner ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center justify-between gap-2 border-b border-accent-danger/30 bg-accent-danger/10 px-4 py-2 text-xs text-accent-danger"
        >
          <span className="flex items-center gap-2">
            <AlertCircle size={14} /> {errorBanner}
          </span>
          <button type="button" className="underline" onClick={onDismissError}>
            Dismiss
          </button>
        </motion.div>
      ) : null}

      {!conversation ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <div className="text-sm font-medium text-gray-300">{labels.emptyTitle}</div>
          <p className="max-w-sm text-xs text-gray-500">{labels.emptyHint}</p>
        </div>
      ) : virtualize ? (
        <div ref={scrollRef} className="messaging-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div
            className="relative w-full px-4 pb-2 pt-4"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((vi) => {
              const row = rows[vi.index]
              return (
                <div
                  key={vi.key}
                  className="absolute left-0 top-0 w-full"
                  style={{
                    transform: `translateY(${vi.start}px)`,
                  }}
                >
                  <RowView row={row} offerById={offerById} onWithdrawOffer={onWithdrawOffer} />
                </div>
              )
            })}
          </div>
          <div ref={endRef} className="h-px w-full shrink-0" />
        </div>
      ) : (
        <div ref={scrollRef} className="messaging-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-2 pt-4">
          {rows.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-sm text-gray-500">
              No messages yet. Say hello.
            </div>
          ) : (
            rows.map((row) => (
              <RowView key={row.id} row={row} offerById={offerById} onWithdrawOffer={onWithdrawOffer} />
            ))
          )}
          <div ref={endRef} className="h-px w-full shrink-0" />
        </div>
      )}

      {conversation && remoteTyping ? (
        <div className="shrink-0 border-t border-white/[0.05] bg-surface-card/70 px-5 py-1.5 backdrop-blur-md">
          <TypingIndicator label={conversation.counterpartName.split(' ')[0]} />
        </div>
      ) : null}

      <ChatInputBar
        disabled={!conversation}
        quickReplies={quickReplies}
        onSend={onSend}
        onAttach={onAttach}
        onOpenOffer={onOpenOffer}
      />
    </div>
  )
}

function RowView({
  row,
  offerById,
  onWithdrawOffer,
}: {
  row: ReturnType<typeof buildThreadRows>[number]
  offerById: Record<string, Offer | undefined>
  onWithdrawOffer: (id: string) => void
}) {
  if (row.kind === 'day') {
    return (
      <div className="flex justify-center py-2">
        <span className="rounded-full bg-surface-elevated px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
          {row.label}
        </span>
      </div>
    )
  }

  const offer = row.message.offerId ? offerById[row.message.offerId] : undefined

  return (
    <MessageBubble
      message={row.message}
      offer={offer}
      clusterTop={row.clusterTop}
      onWithdrawOffer={onWithdrawOffer}
    />
  )
}
