import type { ChatApiDoc, MessageApiDoc } from '../../../redux/api/chatApi'
import { resolveMediaUrl } from '../../../redux/api/chatApi'
import type { Role } from '../../../types/role'
import type { ChatMessage, Conversation, Offer, OfferStatus } from '../types'

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?background=1e293b&color=fff&name=U'

const LOCAL_SENDER_ROLES = new Set([
  'business',
  'business_owner',
  'provider',
  'admin',
  'super_admin',
])

function isLocalSenderRole(role: string) {
  return LOCAL_SENDER_ROLES.has(role)
}

function resolveSenderId(sender: string | { _id: string }) {
  return typeof sender === 'string' ? sender : sender._id
}

function normalizeAttachmentType(type: string): 'image' | 'file' {
  if (type === 'image') return 'image'
  return 'file'
}

function fileNameFromUrl(url: string) {
  try {
    const name = url.split('/').pop()?.split('?')[0] ?? 'Document.pdf'
    return decodeURIComponent(name)
  } catch {
    return 'Document.pdf'
  }
}

function resolveFileName(doc: { text: string; fileName?: string }) {
  return doc.fileName ?? fileNameFromUrl(doc.text)
}

function getChatContact(doc: ChatApiDoc) {
  if (doc.customer?.name) {
    return {
      id: doc.customer._id,
      name: doc.customer.name,
      profileImage: doc.customer.profileImage ?? '',
    }
  }

  if (doc.business) {
    const user = doc.business.user
    return {
      id: user?._id ?? doc.business._id,
      name:
        doc.business.businessName ??
        user?.name ??
        doc.searchText ??
        'Unknown contact',
      profileImage: user?.profileImage ?? '',
    }
  }

  const nameFromSearch = doc.searchText?.replace(/\s+Admin$/i, '').trim()

  return {
    id: doc.participants?.[0] ?? doc._id,
    name: nameFromSearch || 'Unknown contact',
    profileImage: '',
  }
}

function lastMessagePreview(doc: ChatApiDoc) {
  const last = doc.lastMessage
  if (!last) return 'No messages yet'
  if (last.type === 'image') return 'Image'
  if (last.type === 'custom_offer') {
    return last.text ? `Offer: ${last.text}` : 'Custom offer'
  }
  if (last.type === 'file' || last.type === 'document' || last.type === 'pdf') {
    return resolveFileName(last)
  }
  return last.text?.slice(0, 120) || 'No messages yet'
}

export function mapChatFromApi(doc: ChatApiDoc, role: Role): Conversation {
  const contact = getChatContact(doc)
  const avatar = resolveMediaUrl(contact.profileImage)

  return {
    id: doc._id,
    role,
    title: contact.name,
    subtitle: doc.searchText?.replace(/\s+Admin$/i, '').trim() || undefined,
    avatarUrl:
      avatar ||
      `${DEFAULT_AVATAR}&name=${encodeURIComponent(contact.name)}`,
    counterpartName: contact.name,
    counterpartId: contact.id,
    customerId: doc.customer?._id,
    lastMessagePreview: lastMessagePreview(doc),
    lastMessageAt: doc.lastMessage?.createdAt ?? doc.updatedAt,
    unreadCount: 0,
    counterpartStatus: 'offline',
    isTyping: false,
    contextRef: doc.searchText,
  }
}

function normalizeOfferStatus(status: string): OfferStatus {
  const normalized = status.toLowerCase()
  if (
    normalized === 'draft' ||
    normalized === 'pending' ||
    normalized === 'accepted' ||
    normalized === 'declined' ||
    normalized === 'withdrawn' ||
    normalized === 'expired'
  ) {
    return normalized
  }
  return 'pending'
}

function isLocalMessage(
  doc: MessageApiDoc,
  currentUserId: string,
) {
  const senderId = resolveSenderId(doc.sender)
  return senderId === currentUserId || isLocalSenderRole(doc.senderRole)
}

function mapCustomOfferFromMessage(
  doc: MessageApiDoc,
  conversationId: string,
  currentUserId: string,
): Offer | null {
  const co = doc.customOffer
  if (doc.type !== 'custom_offer' || !co?.offer) return null

  const subtotal = co.price * co.quantity
  const fees = co.deliveryFee ?? 0

  return {
    id: co.offer,
    conversationId,
    status: normalizeOfferStatus(co.status),
    title: co.title,
    description: co.description,
    notes: co.notes,
    itemType: co.offerType,
    startDate: co.startDate ?? doc.meta?.startTime,
    lineItems: [
      {
        id: co.itemRef,
        label: co.title,
        unitPrice: co.price,
        quantity: co.quantity,
      },
    ],
    deliveryMethod: 'delivery',
    currency: 'USD',
    subtotal,
    fees,
    total: subtotal + fees,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: isLocalMessage(doc, currentUserId) ? 'local' : 'remote',
  }
}

export function mapOffersFromApi(
  docs: MessageApiDoc[],
  conversationId: string,
  currentUserId: string,
): Offer[] {
  const byId = new Map<string, Offer>()
  for (const doc of docs) {
    const offer = mapCustomOfferFromMessage(doc, conversationId, currentUserId)
    if (offer) byId.set(offer.id, offer)
  }
  return [...byId.values()]
}

export function mapMessageFromApi(
  doc: MessageApiDoc,
  conversationId: string,
  currentUserId: string,
): ChatMessage {
  const isLocal = isLocalMessage(doc, currentUserId)
  const isCustomOffer = doc.type === 'custom_offer' && doc.customOffer?.offer

  if (isCustomOffer) {
    return {
      id: doc._id,
      conversationId,
      body: '',
      createdAt: doc.createdAt,
      author: isLocal ? 'local' : 'remote',
      delivery: (doc.seenBy?.length ?? 0) > 0 ? 'seen' : 'delivered',
      offerId: doc.customOffer!.offer,
    }
  }

  const attachmentType = normalizeAttachmentType(doc.type)
  const isAttachment = doc.type === 'image' || doc.type === 'file' || doc.type === 'document' || doc.type === 'pdf'

  const message: ChatMessage = {
    id: doc._id,
    conversationId,
    body: isAttachment ? '' : doc.text,
    createdAt: doc.createdAt,
    author: isLocal ? 'local' : 'remote',
    delivery: (doc.seenBy?.length ?? 0) > 0 ? 'seen' : 'delivered',
  }

  if (isAttachment) {
    message.attachments = [
      {
        id: doc._id,
        type: attachmentType,
        name: resolveFileName(doc),
        url: resolveMediaUrl(doc.text),
      },
    ]
  }

  return message
}

export function mapThreadFromApi(
  docs: MessageApiDoc[],
  conversationId: string,
  currentUserId: string,
): { messages: ChatMessage[]; offers: Offer[] } {
  return {
    messages: mapMessagesFromApi(docs, conversationId, currentUserId),
    offers: mapOffersFromApi(docs, conversationId, currentUserId),
  }
}

export function mapMessagesFromApi(
  docs: MessageApiDoc[],
  conversationId: string,
  currentUserId: string,
): ChatMessage[] {
  return docs
    .map((doc) => mapMessageFromApi(doc, conversationId, currentUserId))
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
}
