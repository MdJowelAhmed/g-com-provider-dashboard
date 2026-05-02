import { CheckCheck } from 'lucide-react'
import type { MessageDeliveryState } from '../types'

export default function MessageDeliveryTicks({
  state,
}: {
  state: MessageDeliveryState
}) {
  if (state === 'sending') {
    return (
      <span className="inline-flex gap-0.5" title="Sending">
        <span className="sr-only">Sending</span>
        <span className="h-1 w-1 animate-pulse rounded-full bg-gray-500" />
        <span
          className="h-1 w-1 animate-pulse rounded-full bg-gray-500"
          style={{ animationDelay: '120ms' }}
        />
        <span
          className="h-1 w-1 animate-pulse rounded-full bg-gray-500"
          style={{ animationDelay: '240ms' }}
        />
      </span>
    )
  }
  const seen = state === 'seen'
  const delivered = state === 'delivered' || seen
  const tip = seen ? 'Seen' : delivered ? 'Delivered' : 'Sent'
  return (
    <span
      className={`inline-flex items-center ${seen ? 'text-brand' : delivered ? 'text-gray-400' : 'text-gray-500'}`}
      title={tip}
    >
      <CheckCheck size={13} strokeWidth={2.5} />
    </span>
  )
}
