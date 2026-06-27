import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { Role } from '../../../types/role'
import {
  useCustomOfferCreateMutation,
  useGetChatMessagesQuery,
  useGetChatsQuery,
  useSendMessageMutation,
} from '../../../redux/api/chatApi'
import { getRoleMessagingConfig } from '../config/roleMessagingConfig'
import type { Offer } from '../types'
import { itemTypeForRole } from '../utils/offerHelpers'
import { mapChatFromApi, mapThreadFromApi } from '../utils/chatMapping'

export type CreateOfferInput = {
  itemId: string
  title: string
  description: string
  notes: string
  price: number
  quantity: number
  deliveryFee: number
  itemType: string
  startTime?: string
}

const CHAT_FETCH_LIMIT = 100
const MESSAGE_FETCH_LIMIT = 100
const CONV_PAGE_SIZE = 15

export function getChatApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as FetchBaseQueryError).data
    if (data && typeof data === 'object') {
      const payload = data as { message?: unknown; errorMessages?: { message?: string }[] }
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message
      }
      const first = payload.errorMessages?.[0]?.message
      if (first?.trim()) return first
    }
  }
  return fallback
}

export function useMessaging(role: Role, currentUserId: string) {
  const config = useMemo(() => getRoleMessagingConfig(role), [role])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [convPage, setConvPage] = useState(1)
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const [errorBanner, setErrorBanner] = useState<string | null>(null)
  const [withdrawnOfferIds, setWithdrawnOfferIds] = useState<string[]>([])

  const {
    data: chatsData,
    isLoading: chatsLoading,
    isFetching: chatsFetching,
    isError: chatsError,
  } = useGetChatsQuery({ page: 1, limit: CHAT_FETCH_LIMIT })

  const conversations = useMemo(
    () => (chatsData?.data ?? []).map((doc) => mapChatFromApi(doc, role)),
    [chatsData?.data, role],
  )

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id)
    }
  }, [conversations, selectedId])

  const {
    data: messagesData,
    isLoading: messagesLoading,
    isFetching: messagesFetching,
    isError: messagesError,
  } = useGetChatMessagesQuery(
    { id: selectedId!, page: 1, limit: MESSAGE_FETCH_LIMIT },
    { skip: !selectedId },
  )

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()
  const [customOfferCreate, { isLoading: isCreatingOffer }] = useCustomOfferCreateMutation()

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  )

  const { messages, offers } = useMemo(() => {
    if (!selectedId) return { messages: [], offers: [] as Offer[] }
    const thread = mapThreadFromApi(
      messagesData?.data ?? [],
      selectedId,
      currentUserId,
    )
    const mergedOffers = thread.offers.map((offer) =>
      withdrawnOfferIds.includes(offer.id)
        ? { ...offer, status: 'withdrawn' as const, updatedAt: new Date().toISOString() }
        : offer,
    )
    return { messages: thread.messages, offers: mergedOffers }
  }, [messagesData?.data, selectedId, currentUserId, withdrawnOfferIds])

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
    return filteredConversations.slice(0, convPage * CONV_PAGE_SIZE)
  }, [filteredConversations, convPage])

  const hasMoreConversations = visibleConversations.length < filteredConversations.length

  const loadMoreConversations = useCallback(() => {
    setConvPage((p) => p + 1)
  }, [])

  const selectConversation = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const sendText = useCallback(
    async (body: string) => {
      if (!selectedId || !body.trim()) return
      try {
        await sendMessage({
          chat: selectedId,
          type: 'text',
          text: body.trim(),
        }).unwrap()
      } catch (error) {
        setErrorBanner(getChatApiErrorMessage(error, 'Failed to send message'))
      }
    },
    [selectedId, sendMessage],
  )

  const attachPlaceholder = useCallback(() => {
    setErrorBanner('File attachments are not available yet.')
    window.setTimeout(() => setErrorBanner(null), 3500)
  }, [])

  const createOffer = useCallback(
    async (input: CreateOfferInput) => {
      if (!selectedId || !selectedConversation) return
      const customerId =
        selectedConversation.customerId ?? selectedConversation.counterpartId
      try {
        await customOfferCreate({
          chat: selectedId,
          customer: customerId,
          itemId: input.itemId,
          title: input.title,
          description: input.description,
          notes: input.notes,
          price: input.price,
          quantity: input.quantity,
          deliveryFee: input.deliveryFee,
          itemType: input.itemType || itemTypeForRole(role),
          ...(input.startTime ? { meta: { startTime: input.startTime } } : {}),
        }).unwrap()
        setOfferModalOpen(false)
      } catch (error) {
        setErrorBanner(getChatApiErrorMessage(error, 'Failed to send offer'))
        throw error
      }
    },
    [selectedId, selectedConversation, customOfferCreate, role],
  )

  const withdrawOffer = useCallback((offerId: string) => {
    setWithdrawnOfferIds((prev) =>
      prev.includes(offerId) ? prev : [...prev, offerId],
    )
  }, [])

  const dismissError = useCallback(() => setErrorBanner(null), [])

  const listError =
    chatsError && !chatsLoading
      ? 'Failed to load conversations. Please refresh and try again.'
      : null

  const threadError =
    messagesError && !messagesLoading
      ? 'Failed to load messages for this conversation.'
      : null

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
    loadingOlderConv: false,
    offerModalOpen,
    setOfferModalOpen,
    createOffer,
    withdrawOffer,
    errorBanner: errorBanner ?? threadError ?? listError,
    dismissError,
    unreadTotal,
    initialLoading: chatsLoading,
    listFetching: chatsFetching,
    messagesLoading: messagesLoading || messagesFetching,
    isSending,
    isCreatingOffer,
  }
}
