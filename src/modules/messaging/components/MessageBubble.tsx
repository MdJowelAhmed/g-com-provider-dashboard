import { motion } from 'framer-motion'
import { ImageIcon, Paperclip } from 'lucide-react'
import type { ChatMessage, Offer } from '../types'
import { formatMessageTime } from '../utils/formatTime'
import MessageDeliveryTicks from './MessageDeliveryTicks'
import OfferCard from './OfferCard'

type Props = {
  message: ChatMessage
  offer?: Offer
  /** First message in a run — extra top spacing; consecutive same-author rows stay tighter */
  clusterTop: boolean
  onWithdrawOffer?: (id: string) => void
}

export default function MessageBubble({
  message,
  offer,
  clusterTop,
  onWithdrawOffer,
}: Props) {
  const isLocal = message.author === 'local'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex w-full ${isLocal ? 'justify-end' : 'justify-start'} ${clusterTop ? '' : '-mt-2'}`}
    >
      <div
        className={`flex max-w-[min(100%,520px)] flex-col gap-1 ${isLocal ? 'items-end' : 'items-start'}`}
      >
        {message.attachments?.length ? (
          <div
            className={`flex flex-wrap gap-2 rounded-xl border border-surface-border bg-surface-elevated px-3 py-2 text-xs ${
              isLocal ? 'rounded-br-md' : 'rounded-bl-md'
            }`}
          >
            {message.attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 rounded-lg bg-surface-card px-2 py-1.5 text-gray-200"
              >
                {a.type === 'image' ? <ImageIcon size={14} /> : <Paperclip size={14} />}
                <span className="truncate">{a.name}</span>
              </div>
            ))}
          </div>
        ) : null}

        {message.body ? (
          <div
            className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm transition ${
              isLocal
                ? 'rounded-br-md bg-brand text-white'
                : 'rounded-bl-md border border-surface-border bg-surface-elevated text-gray-100'
            }`}
          >
            {message.body}
          </div>
        ) : null}

        {message.offerId && offer ? (
          <OfferCard offer={offer} onWithdraw={onWithdrawOffer} />
        ) : null}

        <div
          className={`flex items-center gap-1.5 px-1 text-[11px] text-gray-500 ${
            isLocal ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span>{formatMessageTime(message.createdAt)}</span>
          {isLocal ? <MessageDeliveryTicks state={message.delivery} /> : null}
        </div>
      </div>
    </motion.div>
  )
}
