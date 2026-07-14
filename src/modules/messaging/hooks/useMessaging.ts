import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { useSearchField } from '../../../hooks/useSearchField'
import type { Role } from '../../../types/role'
import {
  useCustomOfferCreateMutation,
  useCustomOfferWithdrawMutation,
  useGetChatMessagesQuery,
  useGetChatsQuery,
  useSendMessageMutation,
  type CustomOfferMeta,
} from '../../../redux/api/chatApi'
import { getRoleMessagingConfig } from '../config/roleMessagingConfig'
import type { Offer } from '../types'
import { mapChatFromApi, mapThreadFromApi } from '../utils/chatMapping'

export type CreateOfferInput = {
  itemId: string
  title: string
  description: string
  notes: string
  price: number
  quantity: number
  deliveryFee?: number
  itemType: string
  meta?: CustomOfferMeta
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

  const {
    inputValue,
    setInputValue,
    searchTerm,
    clear: clearSearch,
    flush,
    isDebouncing,
  } = useSearchField({ minChars: 2, syncUrl: false })

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [convPage, setConvPage] = useState(1)
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const [errorBanner, setErrorBanner] = useState<string | null>(null)
  const [withdrawingOfferId, setWithdrawingOfferId] = useState<string | null>(null)

  const {
    data: chatsData,
    isLoading: chatsLoading,
    isFetching: chatsFetching,
    isError: chatsError,
  } = useGetChatsQuery({
    page: 1,
    limit: CHAT_FETCH_LIMIT,
    ...(searchTerm ? { searchTerm } : {}),
  })

  const conversations = useMemo(
    () => (chatsData?.data ?? []).map((doc) => mapChatFromApi(doc, role)),
    [chatsData?.data, role],
  )

  useEffect(() => {
    setConvPage(1)
  }, [searchTerm])

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
  const [customOfferWithdraw] = useCustomOfferWithdrawMutation()

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
    return { messages: thread.messages, offers: thread.offers }
  }, [messagesData?.data, selectedId, currentUserId])

  const unreadTotal = useMemo(
    () => conversations.reduce((s, c) => s + c.unreadCount, 0),
    [conversations],
  )

  const visibleConversations = useMemo(() => {
    return conversations.slice(0, convPage * CONV_PAGE_SIZE)
  }, [conversations, convPage])

  const hasMoreConversations = visibleConversations.length < conversations.length

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
          itemType: input.itemType,
          ...(input.deliveryFee !== undefined ? { deliveryFee: input.deliveryFee } : {}),
          ...(input.meta && Object.keys(input.meta).length > 0 ? { meta: input.meta } : {}),
        }).unwrap()
        setOfferModalOpen(false)
      } catch (error) {
        setErrorBanner(getChatApiErrorMessage(error, 'Failed to send offer'))
        throw error
      }
    },
    [selectedId, selectedConversation, customOfferCreate],
  )

  const withdrawOffer = useCallback(
    async (offerId: string) => {
      if (!selectedId || withdrawingOfferId) return
      setWithdrawingOfferId(offerId)
      try {
        await customOfferWithdraw({ offerId, chat: selectedId }).unwrap()
      } catch (error) {
        setErrorBanner(getChatApiErrorMessage(error, 'Failed to withdraw offer'))
      } finally {
        setWithdrawingOfferId(null)
      }
    },
    [selectedId, withdrawingOfferId, customOfferWithdraw],
  )

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
    allConversations: conversations,
    selectedConversation,
    selectedId,
    selectConversation,
    inputValue,
    setInputValue,
    searchTerm,
    clearSearch,
    flush,
    isDebouncing,
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
    withdrawingOfferId,
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
