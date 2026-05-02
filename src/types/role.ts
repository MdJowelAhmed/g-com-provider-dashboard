export type Role = 'services' | 'stay' | 'dine' | 'shops' | 'events'

export const ROLES: Role[] = ['services', 'stay', 'dine', 'shops', 'events']

export const ROLE_LABELS: Record<Role, string> = {
  services: 'Service Provider',
  stay: 'Stay',
  dine: 'Dine',
  shops: 'Shops',
  events: 'Events',
}
