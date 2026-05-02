import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Role } from '../../../types/role'
import type {
  ChatMessage,
  Conversation,
  DeliveryMethod,
  MessageDeliveryState,
  Offer,
  OfferLineItem,
} from '../types'
import { getRoleMessagingConfig } from '../config/roleMessagingConfig'
import { seedMockMessagingState } from '../mock/seedMockState'
import { createNoopTransport } from '../transport/createNoopTransport'
import type { MessagingTransport } from '../transport/MessagingTransport'

export type CreateOfferInput = {
  title: string
  lineItems: OfferLineItem[]
  deliveryMethod: DeliveryMethod
  currency: string
  fees: number
}

function nextId(prefix: string) {
  return `${prefix}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`
}

function transitionDelivery(
  setMessagesByConv: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>,
  conversationId: string,
  messageId: string,
) {
  const steps: MessageDeliveryState[] = ['sent', 'delivered', 'seen']
  let step = 0
  const tick = () => {
    if (step >= steps.length) return
    const status = steps[step]
    step += 1
    setMessagesByConv((prev) => {
      const list = prev[conversationId] ?? []
      return {
        ...prev,
        [conversationId]: list.map((m) =>
          m.id === messageId ? { ...m, delivery: status } : m,
        ),
      }
    })
    window.setTimeout(tick, 520)
  }
  window.setTimeout(tick, 280)
}

export function useMessaging(role: Role, businessLabel: string, transport?: MessagingTransport) {
  const config = useMemo(() => getRoleMessagingConfig(role), [role])
  const seed = useMemo(() => seedMockMessagingState(role, businessLabel), [role, businessLabel])

  const [conversations, setConversations] = useState<Conversation[]>(seed.conversations)
  const [messagesByConv, setMessagesByConv] = useState(seed.messages)
  const [offersByConv, setOffersByConv] = useState(seed.offers)
  const [selectedId, setSelectedId] = useState<string | null>(seed.conversations[0]?.id ?? null)
  const [search, setSearch] = useState('')
  const [convPage, setConvPage] = useState(1)
  const [loadingOlderConv, setLoadingOlderConv] = useState(false)
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const [errorBanner, setErrorBanner] = useState<string | null>(null)

  const tpRef = useRef(transport ?? createNoopTransport())

  useEffect(() => {
    const tp = tpRef.current
    tp.connect({
      onMessage: (m) => {
        setMessagesByConv((prev) => ({
          ...prev,
          [m.conversationId]: [...(prev[m.conversationId] ?? []), m],
        }))
      },
      onConversationUpdated: (c) => {
        setConversations((prev) => {
          const idx = prev.findIndex((x) => x.id === c.id)
          if (idx === -1) return [...prev, c]
          const next = [...prev]
          next[idx] = c
          return next
        })
      },
      onOfferUpdated: (o) => {
        setOffersByConv((prev) => {
          const list = prev[o.conversationId] ?? []
          const idx = list.findIndex((x) => x.id === o.id)
          const merged =
            idx === -1 ? [...list, o] : list.map((x) => (x.id === o.id ? o : x))
          return { ...prev, [o.conversationId]: merged }
        })
      },
    })
    return () => tp.disconnect()
  }, [])

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  )

  const messages = selectedId ? messagesByConv[selectedId] ?? [] : []

  const offers = selectedId ? offersByConv[selectedId] ?? [] : []

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.counterpartName.toLowerCase().includes(q) ||
        (c.contextRef?.toLowerCase().includes(q) ?? false) ||
        c.lastMessagePreview.toLowerCase().includes(q),
    )
  }, [conversations, search])

  const unreadTotal = useMemo(
    () => filteredConversations.reduce((s, c) => s + c.unreadCount, 0),
    [filteredConversations],
  )

  const visibleConversations = useMemo(() => {
    const pageSize = 15
    return filteredConversations.slice(0, convPage * pageSize)
  }, [filteredConversations, convPage])

  const hasMoreConversations = visibleConversations.length < filteredConversations.length

  const loadMoreConversations = useCallback(() => {
    setLoadingOlderConv(true)
    window.setTimeout(() => {
      setConvPage((p) => p + 1)
      setLoadingOlderConv(false)
    }, 450)
  }, [])

  const selectConversation = useCallback((id: string) => {
    setSelectedId(id)
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
    )
  }, [])

  const sendText = useCallback(
    (body: string) => {
      if (!selectedId || !body.trim()) return
      const id = nextId('msg')
      const msg: ChatMessage = {
        id,
        conversationId: selectedId,
        body: body.trim(),
        createdAt: new Date().toISOString(),
        author: 'local',
        delivery: 'sending',
      }
      setMessagesByConv((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), msg],
      }))
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                lastMessagePreview: body.trim().slice(0, 120),
                lastMessageAt: msg.createdAt,
              }
            : c,
        ),
      )
      transitionDelivery(setMessagesByConv, selectedId, id)
    },
    [selectedId],
  )

  const attachPlaceholder = useCallback(() => {
    if (!selectedId) return
    const id = nextId('msg')
    const msg: ChatMessage = {
      id,
      conversationId: selectedId,
      body: '',
      createdAt: new Date().toISOString(),
      author: 'local',
      delivery: 'sent',
      attachments: [
        {
          id: nextId('att'),
          type: 'file',
          name: 'document.pdf',
          url: '#',
          sizeBytes: 245_000,
        },
      ],
    }
    setMessagesByConv((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), msg],
    }))
    transitionDelivery(setMessagesByConv, selectedId, id)
  }, [selectedId])

  const createOffer = useCallback(
    (input: CreateOfferInput) => {
      if (!selectedId) return
      const id = nextId('offer')
      const now = new Date().toISOString()
      const subtotal = input.lineItems.reduce((s, l) => s + l.unitPrice * l.quantity, 0)
      const total = subtotal + input.fees
      const offer: Offer = {
        id,
        conversationId: selectedId,
        status: 'pending',
        title: input.title,
        lineItems: input.lineItems,
        deliveryMethod: input.deliveryMethod,
        currency: input.currency,
        subtotal,
        fees: input.fees,
        total,
        createdAt: now,
        updatedAt: now,
        createdBy: 'local',
      }
      setOffersByConv((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), offer],
      }))
      const mid = nextId('msg')
      const msg: ChatMessage = {
        id: mid,
        conversationId: selectedId,
        body: `Offer: ${input.title}`,
        createdAt: now,
        author: 'local',
        delivery: 'sent',
        offerId: id,
      }
      setMessagesByConv((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), msg],
      }))
      transitionDelivery(setMessagesByConv, selectedId, mid)
      setOfferModalOpen(false)
    },
    [selectedId],
  )

  const withdrawOffer = useCallback(
    (offerId: string) => {
      if (!selectedId) return
      setOffersByConv((prev) => {
        const list = prev[selectedId] ?? []
        return {
          ...prev,
          [selectedId]: list.map((o) =>
            o.id === offerId
              ? { ...o, status: 'withdrawn' as const, updatedAt: new Date().toISOString() }
              : o,
          ),
        }
      })
    },
    [selectedId],
  )

  const simulateError = useCallback(() => {
    setErrorBanner('Could not sync messages. Retry soon.')
    window.setTimeout(() => setErrorBanner(null), 4000)
  }, [])

  const dismissError = useCallback(() => setErrorBanner(null), [])

  return {
    config,
    conversations: visibleConversations,
    allConversations: filteredConversations,
    selectedConversation,
    selectedId,
    selectConversation,
    search,
    setSearch,
    messages,
    offers,
    sendText,
    attachPlaceholder,
    loadMoreConversations,
    hasMoreConversations,
    loadingOlderConv,
    offerModalOpen,
    setOfferModalOpen,
    createOffer,
    withdrawOffer,
    errorBanner,
    simulateError,
    dismissError,
    unreadTotal,
  }
}
