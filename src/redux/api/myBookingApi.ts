import { baseApi } from './baseApi'
import type { CustomOfferMeta } from './chatApi'

export interface OrderCustomerRef {
  _id: string
  name: string
  email: string
  phone: string
  profileImage?: string
}

export interface OrderProductRef {
  _id: string
  name: string
  image?: string
  price: number
}

export interface OrderRoomRef {
  _id: string
  name: string
  basePrice: number
  image?: string
}

export interface OrderProductLineItem {
  _id: string
  order: string
  product?: OrderProductRef
  quantity: number
  totalAmount: number
  items?: Array<{
    name: string
    price: number
    quantity: number
    hubPost?: string | null
  }>
}

export interface OrderStayLineItem {
  _id: string
  order: string
  room?: OrderRoomRef
  roomNumber?: string
  checkIn: string
  checkOut: string
  adult: number
  children: number
  night: number
  pricePerNight: number
  serviceFee?: number
  totalAmount: number
  status?: string
}

export interface OrderServiceLineItem {
  _id: string
  order: string
  service?: {
    _id: string
    name: string
    price?: number
    image?: string
  }
  quantity?: number
  totalAmount?: number
  startTime?: string
  meta?: CustomOfferMeta
}

export interface OrderEventLineItem {
  _id: string
  order: string
  event?: {
    _id: string
    name: string
    price?: number
    image?: string
  }
  quantity?: number
  totalAmount?: number
  eventDate?: string
}

export type OrderLineItems =
  | OrderProductLineItem[]
  | OrderStayLineItem
  | OrderServiceLineItem
  | OrderEventLineItem
  | OrderProductLineItem
  | null
  | undefined

export interface OrderFulfillmentPickup {
  method: 'pickup'
  pickupLocation?: {
    name: string
    latitude: number
    longitude: number
  }
}

export interface OrderFulfillmentDelivery {
  method: 'delivery'
  shippingAddress?: {
    name: string
    latitude: number
    longitude: number
  }
  distanceKm?: number
}

export type OrderFulfillment = OrderFulfillmentPickup | OrderFulfillmentDelivery

export interface OrderReviewRef {
  _id: string
  rating: number
  text: string
  createdAt: string
}

export interface ProviderOrderApiDoc {
  _id: string
  orderId: string
  customer: OrderCustomerRef
  business: string
  branch?: string | null
  orderType: string
  status: string
  paymentStatus: string
  paymentType?: string
  paymentMethod?: string
  clientReference?: string
  totalAmount: number
  subTotal: number
  customerFee?: number
  providerFee?: number
  deliveryFee?: number
  providerAmount?: number
  fulfillment?: OrderFulfillment
  milestones?: unknown[]
  lineItems?: OrderLineItems
  review?: OrderReviewRef | null
  hasReview?: boolean
  canReview?: boolean
  paidAt?: string
  completedAt?: string
  deliveredAt?: string
  deliveryProof?: string
  deliveryProofSubmittedAt?: string
  holdReleasedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ProviderOrdersPagination {
  total: number
  limit: number
  page: number
  totalPage: number
}

export interface ProviderOrdersListResponse {
  success: boolean
  message: string
  pagination: ProviderOrdersPagination
  data: ProviderOrderApiDoc[]
}

export interface GetProviderOrdersParams {
  page?: number
  limit?: number
}

export interface BookingShippedPayload {
  id: string
}

export interface BookingDeliveredPayload {
  id: string
  deliveryProof: string
}

export interface BookingCompletedPayload {
  id: string
  reason?: string
}

export interface BookingShippedResponse {
  success: boolean
  message: string
}

export interface BookingDeliveredResponse {
  success: boolean
  message: string
}

export interface BookingCompletedResponse {
  success: boolean
  message: string
}

const myBookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProviderOrders: builder.query<ProviderOrdersListResponse, GetProviderOrdersParams | undefined>({
      query: (params = {}) => ({
        url: '/orders/provider',
        method: 'GET',
        params,
      }),
      providesTags: ['ProviderOrders'],
    }),
    bookingShipped: builder.mutation<BookingShippedResponse, BookingShippedPayload>({
      query: ({ id }) => ({
        url: `/orders/${id}/ship`,
        method: 'PATCH',
      }),
      invalidatesTags: ['ProviderOrders'],
    }),
    bookingDelivered: builder.mutation<BookingDeliveredResponse, BookingDeliveredPayload>({
      query: ({ id, deliveryProof }) => ({
        url: `/orders/${id}/deliver`,
        method: 'PATCH',
        body: { deliveryProof },
      }),
      invalidatesTags: ['ProviderOrders'],
    }),
    bookingCompleted: builder.mutation<BookingCompletedResponse, BookingCompletedPayload>({
      query: ({ id, reason }) => ({
        url: `/service-bookings/orders/${id}/complete`,
        method: 'PATCH',
        ...(reason ? { body: { reason } } : {}),
      }),
      invalidatesTags: ['ProviderOrders'],
    }),
  }),
})

export const { useGetProviderOrdersQuery, useBookingShippedMutation, useBookingDeliveredMutation, useBookingCompletedMutation } = myBookingApi
