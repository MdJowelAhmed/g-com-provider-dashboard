import { baseApi, imageUrl } from './baseApi'

export interface ChatCustomerRef {
  _id: string
  name: string
  profileImage: string
}

export interface ChatLastMessageDoc {
  _id: string
  chat: string
  sender: string
  senderRole: string
  type: string
  text: string
  fileName?: string
  createdAt: string
  updatedAt: string
  seenBy?: string[]
}

export interface ChatBusinessRef {
  _id: string
  businessName?: string
  user?: ChatCustomerRef
}

export interface ChatApiDoc {
  _id: string
  chatType: string
  customer?: ChatCustomerRef | null
  business?: ChatBusinessRef | null
  participants: string[]
  searchText?: string
  createdAt: string
  updatedAt: string
  lastMessage?: ChatLastMessageDoc
}

export interface MessageSenderRef {
  _id: string
  name: string
  role: string
}

export interface MessageCustomOfferEmbedded {
  _id: string
  customer?: string
  business?: string
  branch?: string
  chat?: string
  itemType?: string
  itemId?: string
  title?: string
  description?: string
  deliveryFee?: number
  notes?: string
  price?: number
  quantity?: number
  totalAmount?: number
  status?: string
  meta?: CustomOfferMeta
  createdAt?: string
  updatedAt?: string
  message?: string
}

export interface MessageCustomOfferRef {
  offer?: string | MessageCustomOfferEmbedded
  offerType?: string
  itemRef?: string
  title?: string
  description?: string
  price?: number
  quantity?: number
  deliveryFee?: number
  notes?: string
  startDate?: string
  status?: string
}

export interface MessageApiDoc {
  _id: string
  chat: string
  sender: string | MessageSenderRef
  senderRole: string
  type: string
  text: string
  fileName?: string
  createdAt: string
  updatedAt: string
  seenBy?: string[]
  meta?: CustomOfferMeta
  customOffer?: MessageCustomOfferRef
}

export interface ChatsPagination {
  total: number
  limit: number
  page: number
  totalPage: number
}

export interface ChatsListResponse {
  success: boolean
  message: string
  pagination: ChatsPagination
  data: ChatApiDoc[]
}

export interface MessagesListResponse {
  success: boolean
  message: string
  pagination: ChatsPagination
  data: MessageApiDoc[]
}

export interface GetChatsParams {
  page?: number
  limit?: number
  searchTerm?: string
}

export interface GetChatMessagesParams {
  id: string
  page?: number
  limit?: number
}

export type MessageType = 'text' | 'image' | 'file'

export interface SendMessagePayload {
  chat: string
  type: MessageType
  text: string
  fileName?: string
}

export interface SendMessageResponse {
  success: boolean
  message: string
  data?: MessageApiDoc
}

export type CustomOfferItemType = 'Service' | 'Product' | 'MenuItem' | 'Event' | 'Room'

export interface CustomOfferMeta {
  startTime?: string
  deliveryMethod?: string
  checkIn?: string
  checkOut?: string
  adult?: number
  children?: number
  eventDate?: string
}

export interface CustomOfferCreatePayload {
  chat: string
  customer: string
  itemId: string
  title: string
  description: string
  notes: string
  price: number
  quantity: number
  deliveryFee?: number
  itemType: CustomOfferItemType | string
  expiresAt?: string
  meta?: CustomOfferMeta
}

export interface CustomOfferApiDoc {
  _id: string
  chat: string
  customer: string
  itemId: string
  title: string
  description: string
  notes: string
  price: number
  quantity: number
  deliveryFee: number
  itemType: string
  expiresAt?: string
  meta?: CustomOfferMeta
  createdAt: string
  updatedAt: string
}

export interface CustomOfferCreateResponse {
  success: boolean
  message: string
  data?: CustomOfferApiDoc
}

export interface CustomOfferWithdrawPayload {
  offerId: string
  chat: string
}

export interface CustomOfferWithdrawResponse {
  success: boolean
  message: string
  data?: CustomOfferApiDoc
}

export function resolveMediaUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${imageUrl}${path}`
}

const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<ChatsListResponse, GetChatsParams | undefined>({
      query: (params = {}) => ({
        url: '/chats/mine',
        method: 'GET',
        params,
      }),
      providesTags: ['Chats'],
    }),
    getChatMessages: builder.query<MessagesListResponse, GetChatMessagesParams>({
      query: ({ id, ...params }) => ({
        url: `/messages/${id}`,
        method: 'GET',
        params,
      }),
      providesTags: (_result, _error, { id }) => [
        { type: 'Chats', id: `messages-${id}` },
      ],
    }),
    sendMessage: builder.mutation<SendMessageResponse, SendMessagePayload>({
      query: (body) => ({
        url: '/messages',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { chat }) => [
        'Chats',
        { type: 'Chats', id: `messages-${chat}` },
      ],
    }),

    customOfferCreate: builder.mutation<CustomOfferCreateResponse, CustomOfferCreatePayload>({
      query: (body) => ({
        url: '/custom-offers',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { chat }) => [
        'Chats',
        { type: 'Chats', id: `messages-${chat}` },
      ],
    }),
    customOfferWithdraw: builder.mutation<CustomOfferWithdrawResponse, CustomOfferWithdrawPayload>({
      query: ({ offerId }) => ({
        url: `/custom-offers/${offerId}/withdraw`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { chat }) => [
        'Chats',
        { type: 'Chats', id: `messages-${chat}` },
      ],
    }),
  }),
})

export const {
  useGetChatsQuery,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useCustomOfferCreateMutation,
  useCustomOfferWithdrawMutation,
} = chatApi
