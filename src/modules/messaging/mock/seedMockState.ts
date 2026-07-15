import type { Role } from '../../../types/role'
import type { ChatMessage, Conversation, Offer } from '../types'

function iso(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString()
}

export type MockMessagingSeed = {
  conversations: Conversation[]
  messages: Record<string, ChatMessage[]>
  offers: Record<string, Offer[]>
}

export function seedMockMessagingState(role: Role, businessLabel: string): MockMessagingSeed {
  const c1: Conversation = {
    id: `${role}-c1`,
    role,
    title: role === 'events' ? 'Alex Morgan' : 'Jordan Lee',
    subtitle: role === 'dine' ? 'Order #1042' : role === 'stay' ? 'Res. #8821' : undefined,
    counterpartName: role === 'events' ? 'Alex Morgan' : 'Jordan Lee',
    counterpartId: 'u1',
    lastMessagePreview: 'Sounds good — thanks!',
    lastMessageAt: iso(3),
    unreadCount: 2,
    counterpartStatus: 'online',
    isTyping: false,
    contextRef: role === 'shops' ? 'ORD-9031' : undefined,
  }

  const c2: Conversation = {
    id: `${role}-c2`,
    role,
    title: role === 'events' ? 'Sam Rivera' : 'Casey Kim',
    subtitle: role === 'services' ? 'Booking BK-221' : undefined,
    counterpartName: role === 'events' ? 'Sam Rivera' : 'Casey Kim',
    counterpartId: 'u2',
    lastMessagePreview: 'Can we adjust the time?',
    lastMessageAt: iso(90),
    unreadCount: 0,
    counterpartStatus: 'away',
    isTyping: true,
    contextRef: role === 'events' ? 'TKT-441' : undefined,
  }

  const offerId = `${role}-o1`
  const offers: Record<string, Offer[]> = {
    [c1.id]: [
      {
        id: offerId,
        conversationId: c1.id,
        status: 'pending',
        title: 'Custom bundle',
        lineItems: [
          { id: 'l1', label: 'Primary item', unitPrice: 48, quantity: 1 },
          { id: 'l2', label: 'Add-on', unitPrice: 12, quantity: 2 },
        ],
        deliveryMethod: 'delivery',
        currency: 'GH₵',
        subtotal: 72,
        fees: 4,
        total: 76,
        createdAt: iso(200),
        updatedAt: iso(200),
        createdBy: 'local',
      },
    ],
  }

  const messages: Record<string, ChatMessage[]> = {
    [c1.id]: [
      {
        id: `${role}-m1`,
        conversationId: c1.id,
        body: `Hi — quick question about ${role === 'stay' ? 'my reservation' : 'my request'}.`,
        createdAt: iso(400),
        author: 'remote',
        delivery: 'seen',
      },
      {
        id: `${role}-m2`,
        conversationId: c1.id,
        body: `Hello! This is ${businessLabel}. How can we help?`,
        createdAt: iso(398),
        author: 'local',
        delivery: 'seen',
      },
      {
        id: `${role}-m3`,
        conversationId: c1.id,
        body: "Here's a tailored offer for you.",
        createdAt: iso(220),
        author: 'local',
        delivery: 'seen',
        offerId,
      },
      {
        id: `${role}-m4`,
        conversationId: c1.id,
        body: 'Sounds good — thanks!',
        createdAt: iso(3),
        author: 'remote',
        delivery: 'delivered',
      },
    ],
    [c2.id]: [
      {
        id: `${role}-m5`,
        conversationId: c2.id,
        body: 'Following up on our last discussion.',
        createdAt: iso(120),
        author: 'remote',
        delivery: 'seen',
      },
    ],
  }

  return {
    conversations: [c1, c2],
    messages,
    offers,
  }
}
