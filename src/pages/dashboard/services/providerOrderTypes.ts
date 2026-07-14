import type { ProviderOrderApiDoc, OrderProductLineItem, OrderStayLineItem } from '../../../redux/api/myBookingApi'
import {
  BUSINESS_MAIN_CATEGORIES,
  type BusinessMainCategory,
} from '../../../types/businessCategory'

export type ProviderOrderStatus = string
export type ProviderPaymentStatus = string

export type ProviderOrderCustomer = {
  id: string
  name: string
  email: string
  phone: string
  profileImage?: string
}

export type ProviderOrderProductLine = {
  id: string
  name: string
  image?: string
  price: number
  quantity: number
  totalAmount: number
}

export type ProviderOrderStayDetails = {
  lineId: string
  roomName: string
  roomNumber: string
  roomImage?: string
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  children: number
  pricePerNight: number
  serviceFee?: number
  lineStatus?: string
}

export type ProviderOrderServiceDetails = {
  lineId: string
  serviceName: string
  serviceImage?: string
  quantity: number
  totalAmount: number
  startTime?: string
}

export type ProviderOrderEventDetails = {
  lineId: string
  eventName: string
  eventImage?: string
  quantity: number
  totalAmount: number
  eventDate?: string
}

export type ProviderOrderFulfillment = {
  method: string
  locationName?: string
  latitude?: number
  longitude?: number
  distanceKm?: number
}

export type ProviderOrderReview = {
  rating: number
  text: string
  createdAt: string
}

export type ProviderOrder = {
  id: string
  orderId: string
  category: BusinessMainCategory
  orderType: string
  status: ProviderOrderStatus
  paymentStatus: ProviderPaymentStatus
  paymentType?: string
  paymentMethod?: string
  clientReference?: string
  customer: ProviderOrderCustomer
  totalAmount: number
  subTotal: number
  customerFee: number
  providerFee: number
  deliveryFee: number
  providerAmount: number
  summaryLabel: string
  summaryMeta?: string
  productLines: ProviderOrderProductLine[]
  stayDetails?: ProviderOrderStayDetails
  serviceDetails?: ProviderOrderServiceDetails
  eventDetails?: ProviderOrderEventDetails
  fulfillment?: ProviderOrderFulfillment
  review: ProviderOrderReview | null
  hasReview: boolean
  paidAt?: string
  completedAt?: string
  deliveredAt?: string
  deliveryProof?: string
  createdAt: string
  updatedAt: string
}

export const ORDER_STATUS_OPTIONS = [
 
  // { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'refunded', label: 'Refunded' },
] as const

export const ORDER_PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
] as const

export function categoryFromProfile(raw?: string): BusinessMainCategory {
  const key = raw?.trim().toLowerCase()
  switch (key) {
    case BUSINESS_MAIN_CATEGORIES.STAY:
      return BUSINESS_MAIN_CATEGORIES.STAY
    case BUSINESS_MAIN_CATEGORIES.DINE:
    case 'restaurant':
      return BUSINESS_MAIN_CATEGORIES.DINE
    case BUSINESS_MAIN_CATEGORIES.SHOP:
    case 'shops':
      return BUSINESS_MAIN_CATEGORIES.SHOP
    case BUSINESS_MAIN_CATEGORIES.EVENT:
    case 'events':
      return BUSINESS_MAIN_CATEGORIES.EVENT
    case BUSINESS_MAIN_CATEGORIES.SERVICES:
    case 'service':
    default:
      return BUSINESS_MAIN_CATEGORIES.SERVICES
  }
}

export function pageCopyForCategory(category: BusinessMainCategory) {
  switch (category) {
    case BUSINESS_MAIN_CATEGORIES.STAY:
      return {
        title: 'Reservations',
        description: 'Room bookings from customers — arrivals, stays, and payments.',
        searchPlaceholder: 'Search by order ID, guest, email, or room',
        emptyLabel: 'No reservations match your filters.',
        itemColumn: 'Room',
        scheduleColumn: 'Stay',
      }
    case BUSINESS_MAIN_CATEGORIES.SHOP:
      return {
        title: 'Orders',
        description: 'Product orders from your shop — fulfillment and payments.',
        searchPlaceholder: 'Search by order ID, customer, email, or product',
        emptyLabel: 'No orders match your filters.',
        itemColumn: 'Products',
        scheduleColumn: 'Fulfillment',
      }
    case BUSINESS_MAIN_CATEGORIES.DINE:
      return {
        title: 'Orders',
        description: 'Menu orders from customers — pickup, delivery, and payments.',
        searchPlaceholder: 'Search by order ID, customer, email, or item',
        emptyLabel: 'No orders match your filters.',
        itemColumn: 'Items',
        scheduleColumn: 'Fulfillment',
      }
    case BUSINESS_MAIN_CATEGORIES.EVENT:
      return {
        title: 'Ticket orders',
        description: 'Event ticket purchases and attendee payments.',
        searchPlaceholder: 'Search by order ID, customer, email, or event',
        emptyLabel: 'No ticket orders match your filters.',
        itemColumn: 'Event',
        scheduleColumn: 'Event date',
      }
    case BUSINESS_MAIN_CATEGORIES.SERVICES:
    default:
      return {
        title: 'Bookings',
        description: 'Incoming service requests — schedule, payments, and job status.',
        searchPlaceholder: 'Search by order ID, customer, email, or service',
        emptyLabel: 'No bookings match your filters.',
        itemColumn: 'Service',
        scheduleColumn: 'Schedule',
      }
  }
}

function isProductLineArray(
  lineItems: ProviderOrderApiDoc['lineItems'],
): lineItems is OrderProductLineItem[] {
  return Array.isArray(lineItems)
}

function isStayLineItem(
  lineItems: ProviderOrderApiDoc['lineItems'],
): lineItems is OrderStayLineItem {
  return Boolean(lineItems && !Array.isArray(lineItems) && 'checkIn' in lineItems)
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function mapProductLines(lineItems: OrderProductLineItem[]): ProviderOrderProductLine[] {
  return lineItems.map((line) => ({
    id: line._id,
    name: line.product?.name ?? line.items?.[0]?.name ?? 'Product',
    image: line.product?.image,
    price: line.product?.price ?? line.items?.[0]?.price ?? 0,
    quantity: line.quantity,
    totalAmount: line.totalAmount,
  }))
}

function mapFulfillment(doc: ProviderOrderApiDoc): ProviderOrderFulfillment | undefined {
  const fulfillment = doc.fulfillment
  if (!fulfillment) return undefined

  if (fulfillment.method === 'pickup') {
    return {
      method: 'pickup',
      locationName: fulfillment.pickupLocation?.name,
      latitude: fulfillment.pickupLocation?.latitude,
      longitude: fulfillment.pickupLocation?.longitude,
    }
  }

  return {
    method: 'delivery',
    locationName: fulfillment.shippingAddress?.name,
    latitude: fulfillment.shippingAddress?.latitude,
    longitude: fulfillment.shippingAddress?.longitude,
    distanceKm: fulfillment.distanceKm,
  }
}

function resolveCategory(doc: ProviderOrderApiDoc, profileCategory: BusinessMainCategory) {
  const orderType = doc.orderType.toLowerCase()
  if (orderType === 'stay') return BUSINESS_MAIN_CATEGORIES.STAY
  if (orderType === 'event') return BUSINESS_MAIN_CATEGORIES.EVENT
  if (orderType === 'service') return BUSINESS_MAIN_CATEGORIES.SERVICES
  if (orderType === 'product') {
    if (profileCategory === BUSINESS_MAIN_CATEGORIES.DINE) return BUSINESS_MAIN_CATEGORIES.DINE
    return BUSINESS_MAIN_CATEGORIES.SHOP
  }
  return profileCategory
}

export function mapProviderOrderFromApi(
  doc: ProviderOrderApiDoc,
  profileCategory: BusinessMainCategory,
): ProviderOrder {
  const category = resolveCategory(doc, profileCategory)
  const productLines = isProductLineArray(doc.lineItems) ? mapProductLines(doc.lineItems) : []

  let stayDetails: ProviderOrderStayDetails | undefined
  let serviceDetails: ProviderOrderServiceDetails | undefined
  let eventDetails: ProviderOrderEventDetails | undefined
  let summaryLabel = doc.orderId
  let summaryMeta: string | undefined

  if (isStayLineItem(doc.lineItems)) {
    const line = doc.lineItems
    stayDetails = {
      lineId: line._id,
      roomName: line.room?.name ?? 'Room',
      roomNumber: line.roomNumber ?? '—',
      roomImage: line.room?.image,
      checkIn: line.checkIn,
      checkOut: line.checkOut,
      nights: line.night,
      adults: line.adult,
      children: line.children,
      pricePerNight: line.pricePerNight,
      serviceFee: line.serviceFee,
      lineStatus: line.status,
    }
    summaryLabel = line.room?.name ?? 'Room booking'
    summaryMeta = `${formatShortDate(line.checkIn)} → ${formatShortDate(line.checkOut)}`
  } else if (productLines.length > 0) {
    summaryLabel =
      productLines.length === 1
        ? productLines[0].name
        : `${productLines[0].name} +${productLines.length - 1}`
    const fulfillment = mapFulfillment(doc)
    summaryMeta = fulfillment
      ? `${fulfillment.method}${fulfillment.locationName ? ` · ${fulfillment.locationName}` : ''}`
      : undefined
  } else if (doc.lineItems && !Array.isArray(doc.lineItems)) {
    const line = doc.lineItems as {
      _id: string
      service?: { name?: string; image?: string; price?: number }
      event?: { name?: string; image?: string; price?: number }
      quantity?: number
      totalAmount?: number
      startTime?: string
      eventDate?: string
    }

    if (line.service) {
      serviceDetails = {
        lineId: line._id,
        serviceName: line.service.name ?? 'Service',
        serviceImage: line.service.image,
        quantity: line.quantity ?? 1,
        totalAmount: line.totalAmount ?? doc.totalAmount,
        startTime: line.startTime,
      }
      summaryLabel = serviceDetails.serviceName
      summaryMeta = line.startTime ? formatShortDate(line.startTime) : undefined
    } else if (line.event) {
      eventDetails = {
        lineId: line._id,
        eventName: line.event.name ?? 'Event',
        eventImage: line.event.image,
        quantity: line.quantity ?? 1,
        totalAmount: line.totalAmount ?? doc.totalAmount,
        eventDate: line.eventDate,
      }
      summaryLabel = eventDetails.eventName
      summaryMeta = line.eventDate ? formatShortDate(line.eventDate) : undefined
    }
  }

  return {
    id: doc._id,
    orderId: doc.orderId,
    category,
    orderType: doc.orderType,
    status: doc.status,
    paymentStatus: doc.paymentStatus,
    paymentType: doc.paymentType,
    paymentMethod: doc.paymentMethod,
    clientReference: doc.clientReference,
    customer: {
      id: doc.customer._id,
      name: doc.customer.name,
      email: doc.customer.email,
      phone: doc.customer.phone,
      profileImage: doc.customer.profileImage,
    },
    totalAmount: doc.totalAmount,
    subTotal: doc.subTotal,
    customerFee: doc.customerFee ?? 0,
    providerFee: doc.providerFee ?? 0,
    deliveryFee: doc.deliveryFee ?? 0,
    providerAmount: doc.providerAmount ?? 0,
    summaryLabel,
    summaryMeta,
    productLines,
    stayDetails,
    serviceDetails,
    eventDetails,
    fulfillment: mapFulfillment(doc),
    review: doc.review
      ? {
          rating: doc.review.rating,
          text: doc.review.text,
          createdAt: doc.review.createdAt,
        }
      : null,
    hasReview: doc.hasReview ?? Boolean(doc.review),
    paidAt: doc.paidAt,
    completedAt: doc.completedAt,
    deliveredAt: doc.deliveredAt,
    deliveryProof: doc.deliveryProof,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function mapProviderOrdersFromApi(
  docs: ProviderOrderApiDoc[],
  profileCategory: BusinessMainCategory,
) {
  return docs.map((doc) => mapProviderOrderFromApi(doc, profileCategory))
}

export function statusLabel(status: string) {
  return (
    ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status.replace(/_/g, ' ')
  )
}

export function paymentStatusLabel(status: string) {
  return (
    ORDER_PAYMENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status.replace(/_/g, ' ')
  )
}

export function formatMoney(amount: number) {
  return `₵${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
