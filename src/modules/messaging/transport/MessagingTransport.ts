import type { ChatMessage, Conversation, Offer } from '../types'

/** Socket/API abstraction — implement with WebSocket or REST polling */
export type MessagingEvents = {
  onConversationUpdated?: (c: Conversation) => void
  onMessage?: (m: ChatMessage) => void
  onOfferUpdated?: (o: Offer) => void
  onTyping?: (payload: { conversationId: string; userId: string; typing: boolean }) => void
  onPresence?: (payload: { userId: string; status: import('../types').OnlineStatus }) => void
}

export type MessagingTransport = {
  connect: (handlers: MessagingEvents) => void
  disconnect: () => void
  /** Future: emit typing, read receipts, send payload to server */
  emitTyping?: (conversationId: string, typing: boolean) => void
  emitRead?: (conversationId: string, messageIds: string[]) => void
}
