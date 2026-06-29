import type { Role } from '../../../types/role'

export type MessageDeliveryState = 'sending' | 'sent' | 'delivered' | 'seen'

export type ParticipantRole = 'provider' | 'customer' | 'organizer' | 'attendee' | 'guest'

export type OnlineStatus = 'online' | 'away' | 'offline'

export type AttachmentType = 'image' | 'file'

export type MessageAttachment = {
  id: string
  type: AttachmentType
  name: string
  url: string
  sizeBytes?: number
}

export type ChatMessage = {
  id: string
  conversationId: string
  body: string
  createdAt: string
  /** Provider dashboard user is always "local"; counterpart messages are remote */
  author: 'local' | 'remote'
  delivery: MessageDeliveryState
  attachments?: MessageAttachment[]
  /** Quick emoji-only messages */
  variant?: 'text' | 'emoji'
  /** Linked offer block */
  offerId?: string
}

export type Conversation = {
  id: string
  role: Role
  title: string
  subtitle?: string
  avatarUrl?: string
  /** Display label for counterpart */
  counterpartName: string
  counterpartId: string
  /** Customer id when chat has a customer participant */
  customerId?: string
  lastMessagePreview: string
  lastMessageAt: string
  unreadCount: number
  /** Remote participant presence */
  counterpartStatus: OnlineStatus
  /** Typing indicator from remote */
  isTyping: boolean
  /** Context codes e.g. order #, booking ref */
  contextRef?: string
}

export type OfferStatus =
  | 'draft'
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'withdrawn'
  | 'expired'

export type DeliveryMethod = 'pickup' | 'delivery' | 'digital' | 'on_site' | 'room_service'

export type OfferLineItem = {
  id: string
  label: string
  unitPrice: number
  quantity: number
}

export type Offer = {
  id: string
  conversationId: string
  status: OfferStatus
  title: string
  lineItems: OfferLineItem[]
  deliveryMethod: DeliveryMethod
  currency: string
  subtotal: number
  fees: number
  total: number
  createdAt: string
  updatedAt: string
  /** Who created (dashboard side = provider) */
  createdBy: 'local' | 'remote'
  description?: string
  notes?: string
  itemType?: string
  startDate?: string
  eventDate?: string
  checkIn?: string
  checkOut?: string
  adult?: number
  children?: number
  offerDeliveryMethod?: string
}

export type RoleMessagingLabels = {
  pageTitle: string
  pageDescription: string
  counterpartNoun: string
  selfNoun: string
  contextExamples: string
  searchPlaceholder: string
  emptyThreadTitle: string
  emptyThreadHint: string
  offerModalTitle: string
  quickReplies: string[]
}

export type CatalogItem = {
  id: string
  label: string
  subtitle?: string
  unitPrice: number
  currency: string
}

export type RoleMessagingConfig = {
  role: Role
  labels: RoleMessagingLabels
  deliveryMethods: { value: DeliveryMethod; label: string }[]
}
