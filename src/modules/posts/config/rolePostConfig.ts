import type { Role } from '../../../types/role'

export type PostTypeOption = { value: string; label: string }

export type RolePostConfig = {
  role: Role
  pageTitle: string
  pageDescription: string
  postTypeOptions: PostTypeOption[]
  /** Short hints under filters */
  filterHint: string
}

export const ROLE_POST_CONFIG: Record<Role, RolePostConfig> = {
  dine: {
    role: 'dine',
    pageTitle: 'Posts',
    pageDescription: 'Promotions, limited offers, and announcements for diners.',
    filterHint: 'Food promos, menu highlights, discounts',
    postTypeOptions: [
      { value: 'food_promo', label: 'Food promotion' },
      { value: 'menu_offer', label: 'Special menu offer' },
      { value: 'announcement', label: 'Restaurant announcement' },
      { value: 'limited_discount', label: 'Limited-time discount' },
    ],
  },
  events: {
    role: 'events',
    pageTitle: 'Posts',
    pageDescription: 'Event buzz, ticket pushes, and featured campaigns.',
    filterHint: 'Announcements, ticket promos, featured events',
    postTypeOptions: [
      { value: 'event_announcement', label: 'Event announcement' },
      { value: 'ticket_promo', label: 'Ticket promotion' },
      { value: 'campaign', label: 'Upcoming campaign' },
      { value: 'featured_event', label: 'Featured event' },
    ],
  },
  services: {
    role: 'services',
    pageTitle: 'Posts',
    pageDescription: 'Service offers, booking pushes, and provider updates.',
    filterHint: 'Offers, campaigns, booking CTAs',
    postTypeOptions: [
      { value: 'service_offer', label: 'Service offer' },
      { value: 'provider_promo', label: 'Provider promotion' },
      { value: 'booking_campaign', label: 'Booking campaign' },
      { value: 'service_update', label: 'Service update' },
    ],
  },
  shops: {
    role: 'shops',
    pageTitle: 'Posts',
    pageDescription: 'Product drops, flash windows, and storefront campaigns.',
    filterHint: 'Product promos, flash sales, featured SKUs',
    postTypeOptions: [
      { value: 'product_promo', label: 'Product promotion' },
      { value: 'discount_campaign', label: 'Discount campaign' },
      { value: 'featured_product', label: 'Featured product' },
      { value: 'flash_sale', label: 'Flash sale' },
    ],
  },
  stay: {
    role: 'stay',
    pageTitle: 'Posts',
    pageDescription: 'Room deals, seasonal rates, and guest-facing updates.',
    filterHint: 'Room offers, seasonal savings, property news',
    postTypeOptions: [
      { value: 'room_promo', label: 'Room promotion' },
      { value: 'hotel_offer', label: 'Hotel offer' },
      { value: 'seasonal', label: 'Seasonal discount' },
      { value: 'accommodation_update', label: 'Accommodation update' },
    ],
  },
}

export function getRolePostConfig(role: Role): RolePostConfig {
  return ROLE_POST_CONFIG[role]
}
