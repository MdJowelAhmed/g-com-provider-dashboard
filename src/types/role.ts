export type Role = 'service' | 'stay' | 'dine' | 'shops' | 'events'

export const ROLES: Role[] = ['service', 'stay', 'dine', 'shops', 'events']

export const ROLE_LABELS: Record<Role, string> = {
  service: 'Service Panel',
  stay: 'Stay',
  dine: 'Dine',
  shops: 'Shops',
  events: 'Events',
}
