export const BUSINESS_MAIN_CATEGORIES = {
  SERVICES: 'services',
  STAY: 'stay',
  DINE: 'dine',
  SHOP: 'shop',
  EVENT: 'event',
} as const

export type BusinessMainCategory =
  (typeof BUSINESS_MAIN_CATEGORIES)[keyof typeof BUSINESS_MAIN_CATEGORIES]
