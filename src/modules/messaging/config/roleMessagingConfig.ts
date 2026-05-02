import type { Role } from '../../../types/role'
import type { RoleMessagingConfig } from '../types'

const commonDelivery = [
  { value: 'pickup' as const, label: 'Pickup' },
  { value: 'delivery' as const, label: 'Delivery' },
  { value: 'digital' as const, label: 'Digital' },
] satisfies RoleMessagingConfig['deliveryMethods']

export const ROLE_MESSAGING_CONFIG: Record<Role, RoleMessagingConfig> = {
  dine: {
    role: 'dine',
    labels: {
      pageTitle: 'Messages',
      pageDescription: 'Chat with customers about orders, delivery, and custom food offers.',
      counterpartNoun: 'Customer',
      selfNoun: 'Restaurant',
      contextExamples: 'Order #, delivery ETA, dietary notes',
      searchPlaceholder: 'Search customers or orders…',
      emptyThreadTitle: 'Select a conversation',
      emptyThreadHint: 'Choose a customer thread to view messages and offers.',
      offerModalTitle: 'Create food offer',
      quickReplies: ["We'll prepare it in ~15 min", 'Out for delivery', 'Any allergies we should know?'],
    },
    deliveryMethods: [
      { value: 'pickup', label: 'Pickup' },
      { value: 'delivery', label: 'Delivery' },
      { value: 'room_service', label: 'Table / room service' },
    ],
  },
  events: {
    role: 'events',
    labels: {
      pageTitle: 'Messages',
      pageDescription: 'Support attendees and ticket holders; send event-related offers.',
      counterpartNoun: 'Attendee',
      selfNoun: 'Organizer',
      contextExamples: 'Ticket tier, event access, refunds',
      searchPlaceholder: 'Search attendees or events…',
      emptyThreadTitle: 'Select a conversation',
      emptyThreadHint: 'Pick a thread for ticket and event support.',
      offerModalTitle: 'Create event offer',
      quickReplies: ['Check-in opens 1h before', 'Your QR is in the email', 'See you at the venue!'],
    },
    deliveryMethods: [
      { value: 'digital', label: 'Digital / ticket' },
      { value: 'pickup', label: 'Will-call pickup' },
      { value: 'on_site', label: 'On-site service' },
    ],
  },
  services: {
    role: 'services',
    labels: {
      pageTitle: 'Messages',
      pageDescription: 'Discuss bookings, scope, and custom service offers with customers.',
      counterpartNoun: 'Customer',
      selfNoun: 'Provider',
      contextExamples: 'Booking ref, address, time window',
      searchPlaceholder: 'Search customers or bookings…',
      emptyThreadTitle: 'Select a conversation',
      emptyThreadHint: 'Open a thread to negotiate services and send offers.',
      offerModalTitle: 'Create service offer',
      quickReplies: ['On my way', 'Can we reschedule?', 'Quote attached — please confirm'],
    },
    deliveryMethods: [
      { value: 'on_site', label: 'On-site visit' },
      { value: 'delivery', label: 'Deliverable / remote' },
      { value: 'pickup', label: 'Drop-off / pickup' },
    ],
  },
  shops: {
    role: 'shops',
    labels: {
      pageTitle: 'Messages',
      pageDescription: 'Product questions, order updates, and seller offers.',
      counterpartNoun: 'Buyer',
      selfNoun: 'Seller',
      contextExamples: 'SKU, shipping, returns',
      searchPlaceholder: 'Search buyers or orders…',
      emptyThreadTitle: 'Select a conversation',
      emptyThreadHint: 'Choose a buyer to continue the conversation.',
      offerModalTitle: 'Create product offer',
      quickReplies: ['Shipped today', 'Restocking next week', 'Bundle discount possible'],
    },
    deliveryMethods: commonDelivery,
  },
  stay: {
    role: 'stay',
    labels: {
      pageTitle: 'Messages',
      pageDescription: 'Guest communication, reservations, and room or package offers.',
      counterpartNoun: 'Guest',
      selfNoun: 'Property',
      contextExamples: 'Reservation #, check-in, preferences',
      searchPlaceholder: 'Search guests or reservations…',
      emptyThreadTitle: 'Select a conversation',
      emptyThreadHint: 'Select a guest thread for concierge messaging.',
      offerModalTitle: 'Create stay offer',
      quickReplies: ['Early check-in noted', 'Airport pickup arranged', 'Enjoy your stay!'],
    },
    deliveryMethods: [
      { value: 'on_site', label: 'On property' },
      { value: 'digital', label: 'Digital add-on' },
      { value: 'pickup', label: 'Concierge pickup' },
    ],
  },
}

export function getRoleMessagingConfig(role: Role): RoleMessagingConfig {
  return ROLE_MESSAGING_CONFIG[role]
}
